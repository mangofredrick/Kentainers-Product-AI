import { NextResponse } from "next/server";
import { listCustomerEnquiries } from "@/lib/customer-enquiries";

export async function GET() {
  try {
    const enquiries = await listCustomerEnquiries(50);
    return NextResponse.json({ enquiries });
  } catch (error) {
    console.error("KPIA enquiries error", error);
    return NextResponse.json({ error: "Customer enquiry storage is not available." }, { status: 503 });
  }
}
