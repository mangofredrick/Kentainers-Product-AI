import { NextResponse } from "next/server";
import { z } from "zod";
import { runAgent } from "@/lib/ai/agent";
import { saveCustomerEnquiry, recordChatbotQuestion, findApprovedQuestionAnswer, type CustomerRequirements } from "@/lib/customer-enquiries";
import { sendCustomerEnquiryEmail } from "@/lib/customer-email";

const RequirementsSchema = z.object({
  product: z.string().max(200).optional().default(""),
  capacity: z.string().max(100).optional().default(""),
  application: z.string().max(200).optional().default(""),
  location: z.string().max(200).optional().default(""),
  quantity: z.string().max(50).optional().default(""),
  timeframe: z.string().max(100).optional().default("")
}).optional().default({ product: "", capacity: "", application: "", location: "", quantity: "", timeframe: "" });

const RequestSchema = z.object({
  message: z.string().min(1).max(4000),
  customer: z.object({
    name: z.string().max(200).optional().default(""),
    email: z.string().max(320).optional().default(""),
    phone: z.string().max(50).optional().default("")
  }).optional().default({ name: "", email: "", phone: "" }),
  requirements: RequirementsSchema,
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(4000) })).max(20).optional().default([])
});

export async function POST(req: Request) {
  try {
    const body = RequestSchema.parse(await req.json());
    const requirements: CustomerRequirements = body.requirements;
    const requirementContext = [
      `Product/capacity requested: ${requirements.product || "Not provided"}${requirements.capacity ? ` / ${requirements.capacity}` : ""}`,
      `Application: ${requirements.application || "Not provided"}`,
      `Location: ${requirements.location || "Not provided"}`,
      `Quantity: ${requirements.quantity || "Not provided"}`,
      `Timeframe: ${requirements.timeframe || "Not provided"}`
    ].join("\n");
    const customerContext = `Customer name: ${body.customer.name || "Not provided"}\nCustomer email: ${body.customer.email || "Not provided"}\nCustomer phone: ${body.customer.phone || "Not provided"}`;
    const conversationContext = body.history.length
      ? `\n\nRecent conversation:\n${body.history.map((m) => `${m.role === "user" ? "Customer" : "Chatbot"}: ${m.text}`).join("\n")}`
      : "";
    const lastAssistant = [...body.history].reverse().find((m) => m.role === "assistant")?.text || "";
    const priorUserMessages = body.history.filter((m) => m.role === "user").map((m) => m.text.trim());
    const currentMessage = body.message.trim();
    const currentLooksLikePhone = /^(?:\+?254|0)7\d{8}$/.test(currentMessage.replace(/[\s()-]/g, ""));
    const currentLooksLikeName = /^[A-Za-z][A-Za-z .'-]{1,59}$/.test(currentMessage);

    const awaitingContact =
      /provide (?:the customer(?:\'s)?|your|the)?\s*(?:name|phone)|leave your (?:phone|contact)|customer details|contact details|representative will contact/i.test(lastAssistant);
    const escalationInConversation = body.history.some((m) =>
      m.role === "assistant" &&
      /provide (?:the customer(?:\'s)?|your|the)?\s*(?:name|phone)|leave your (?:phone|contact)|customer details|contact details|representative will contact/i.test(m.text)
    );

    // Customers may complete mandatory contact details either in the
    // enquiry fields or conversationally. Never send a contact-only reply
    // back through product discovery.
    const inferredName =
      body.customer.name?.trim() ||
      (awaitingContact && currentLooksLikeName ? currentMessage : "") ||
      (awaitingContact ? [...priorUserMessages].reverse().find((m) => /^[A-Za-z][A-Za-z .'-]{1,59}$/.test(m)) || "" : "");

    const inferredPhone =
      body.customer.phone?.trim() ||
      (currentLooksLikePhone ? currentMessage.replace(/[\s()-]/g, "") : "");

    const hasName = Boolean(inferredName);
    const hasPhone = Boolean(inferredPhone);
    const hasMandatoryContact = hasName && hasPhone;

    const pendingEscalation = awaitingContact || escalationInConversation;
    const contactFollowUp = pendingEscalation && hasMandatoryContact;
    const needsPhoneForEscalation = pendingEscalation && hasName && !hasPhone;

    const effectiveCustomer = {
      ...body.customer,
      name: inferredName || body.customer.name,
      phone: inferredPhone || body.customer.phone
    };
    const effectiveCustomerContext = "Customer name: " + (effectiveCustomer.name || "Not provided") +
      "\nCustomer email: " + (effectiveCustomer.email || "Not provided") +
      "\nCustomer phone: " + (effectiveCustomer.phone || "Not provided");

    const normalizedCurrentQuestion = body.message.trim().toLowerCase().replace(/\s+/g, " ");
    let approvedMemoryAnswer: Awaited<ReturnType<typeof findApprovedQuestionAnswer>> = null;
    try {
      approvedMemoryAnswer = await findApprovedQuestionAnswer(body.message);
    } catch (memoryError) {
      console.error("KPIA approved question memory lookup error", memoryError);
    }

    const result = contactFollowUp
      ? {
          answer: "Thanks, " + inferredName + ". I have captured your enquiry. A Kentainers representative will contact you with the verified information.",
          sources: [],
          action: "escalate" as const,
          toolCalls: []
        }
      : needsPhoneForEscalation
        ? {
            answer: "Thanks, " + inferredName + ". Please provide the customer's phone number so the Kentainers team can follow up on this enquiry.",
            sources: [],
            action: "escalate" as const,
            toolCalls: []
          }
        : approvedMemoryAnswer
        ? {
            answer: approvedMemoryAnswer.approved_answer,
            sources: [],
            products: [],
            action: "details" as const,
            toolCalls: []
          }
        : await runAgent(effectiveCustomerContext + "\n" + requirementContext + "\n\nCurrent customer message: " + body.message, conversationContext);
    if (result.action === "escalate") {
      if (!hasMandatoryContact && !needsPhoneForEscalation) {
        result.answer =
          result.answer +
          " To help the Kentainers team follow up, please provide your name and phone number in the customer details above.";
      }
    }
    let enquiryId: string | undefined;
    try {
      enquiryId = await saveCustomerEnquiry(effectiveCustomer, body.message, result, requirements);
      await recordChatbotQuestion(body.message, result, requirements);
      if (process.env.RESEND_API_KEY && process.env.KPIA_FROM_EMAIL) {
        try {
          await sendCustomerEnquiryEmail(body.customer, body.message, result, enquiryId, requirements);
        } catch (emailError) {
          console.error("Kentainers office enquiry email error", emailError);
        }
      }
    } catch (storageError) {
      console.error("KPIA enquiry storage error", storageError);
    }
    return NextResponse.json({ ...result, enquiryId });
  } catch (error) {
    console.error("KPIA chat error", error);
    return NextResponse.json({
      answer: "I’m unable to process that request right now. Please try again or ask a Kentainers product representative for confirmation.",
      sources: [],
      action: "escalate"
    }, { status: 200 });
  }
}
