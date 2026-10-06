import { NextResponse } from "next/server";
import { listFollowUpEnquiries } from "@/lib/customer-enquiries";

function authorized(req: Request) {
  const token = process.env.KPIA_ADMIN_TOKEN;
  return !!token && req.headers.get("authorization") === `Bearer ${token}`;
}

export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit") || 50);
  return NextResponse.json({ enquiries: await listFollowUpEnquiries(limit) });
}
