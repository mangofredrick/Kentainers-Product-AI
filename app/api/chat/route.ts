import { NextResponse } from "next/server";
import { z } from "zod";
import { runAgent } from "@/lib/ai/agent";
import { saveCustomerEnquiry, recordChatbotQuestion, type CustomerRequirements } from "@/lib/customer-enquiries";
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
    const result = await runAgent(`${customerContext}\n${requirementContext}\n\nCurrent customer message: ${body.message}`, conversationContext);
    let enquiryId: string | undefined;
    try {
      enquiryId = await saveCustomerEnquiry(body.customer, body.message, result, requirements);
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
