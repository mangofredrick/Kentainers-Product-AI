import { NextResponse } from "next/server";
import { listQuestionMemory, markQuestionMemoryReviewed } from "@/lib/customer-enquiries";

function authorized(req: Request) {
  const token = process.env.KPIA_ADMIN_TOKEN;
  return !!token && req.headers.get("authorization") === `Bearer ${token}`;
}

export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit") || 100);
  const reviewOnly = url.searchParams.get("reviewOnly") !== "false";
  return NextResponse.json({ questions: await listQuestionMemory(limit, reviewOnly) });
}

export async function PATCH(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if (!Number.isInteger(body.id) || !["verified", "not_supported", "needs_review"].includes(body.status)) {
    return NextResponse.json({ error: "Invalid review request" }, { status: 400 });
  }
  await markQuestionMemoryReviewed(body.id, body.status, body.reviewReason);
  return NextResponse.json({ ok: true });
}
