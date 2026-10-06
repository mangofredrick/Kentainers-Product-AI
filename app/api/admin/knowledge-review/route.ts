import { NextResponse } from "next/server";
import { listQuestionMemory, markQuestionMemoryReviewed } from "@/lib/customer-enquiries";

function authorized(req: Request) {
  const expected = process.env.ADMIN_DASHBOARD_KEY;
  return Boolean(expected && req.headers.get("x-admin-key") === expected);
}

export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit") || 100);
    const reviewOnly = url.searchParams.get("reviewOnly") !== "false";
    return NextResponse.json({ questions: await listQuestionMemory(limit, reviewOnly) });
  } catch (error) {
    console.error("Kentainers knowledge review GET error", error);
    return NextResponse.json({ error: "Knowledge review queue unavailable" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    if (!Number.isInteger(body.id) || !["verified", "not_supported", "needs_review"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid review request" }, { status: 400 });
    }
    if (body.status === "verified" && !String(body.approvedAnswer || "").trim()) {
      return NextResponse.json({ error: "An approved customer-facing answer is required before verification" }, { status: 400 });
    }
    await markQuestionMemoryReviewed(
      body.id,
      body.status,
      String(body.reviewReason || "").slice(0, 1000) || undefined,
      String(body.approvedAnswer || "").slice(0, 8000) || undefined
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Kentainers knowledge review PATCH error", error);
    return NextResponse.json({ error: "Review update failed" }, { status: 500 });
  }
}
