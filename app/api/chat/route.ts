import { NextResponse } from "next/server";
import { z } from "zod";
import { runAgent } from "@/lib/ai/agent";
import { saveCustomerEnquiry } from "@/lib/customer-enquiries";

const RequestSchema = z.object({
  message: z.string().min(1).max(4000),
  customer: z.object({
    name: z.string().max(200).optional().default(""),
    email: z.string().max(320).optional().default(""),
    phone: z.string().max(50).optional().default("")
  }).optional().default({ name: "", email: "", phone: "" })
});

export async function POST(req: Request) {
  try {
    const body = RequestSchema.parse(await req.json());
    const result = await runAgent(body.message);
    let enquiryId: string | undefined;
    try {
      enquiryId = await saveCustomerEnquiry(body.customer, body.message, result);
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
