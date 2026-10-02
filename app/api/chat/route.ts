import { NextResponse } from "next/server";
import { z } from "zod";
import { runAgent } from "@/lib/ai/agent";

const RequestSchema = z.object({
  message: z.string().min(1).max(4000)
});

export async function POST(req: Request) {
  try {
    const body = RequestSchema.parse(await req.json());
    const result = await runAgent(body.message);
    return NextResponse.json(result);
  } catch (error) {
    console.error("KPIA chat error", error);
    return NextResponse.json({
      answer: "I’m unable to process that request right now. Please try again or ask a Kentainers product representative for confirmation.",
      sources: [],
      action: "escalate"
    }, { status: 200 });
  }
}
