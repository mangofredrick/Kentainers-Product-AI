import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { ensureCustomerEnquiriesTable } from "@/lib/customer-enquiries";

function authorized(req: Request) {
  const expected = process.env.ADMIN_DASHBOARD_KEY;
  return Boolean(expected && req.headers.get("x-admin-key") === expected);
}

const STATUSES = ["open", "contacted", "qualified", "converted", "closed"];

export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await ensureCustomerEnquiriesTable();
    const pool = getPool();
    const [totals, actions, statuses, recent, followUps, daily] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours')::int AS last_24h,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS last_7d,
        COUNT(*) FILTER (WHERE customer_email IS NOT NULL OR customer_phone IS NOT NULL)::int AS identified,
        COUNT(*) FILTER (WHERE follow_up_required = TRUE AND status NOT IN ('closed','converted'))::int AS follow_up_open,
        COUNT(*) FILTER (WHERE status = 'converted')::int AS converted,
        COUNT(*) FILTER (WHERE status = 'qualified')::int AS qualified,
        COUNT(*) FILTER (WHERE next_follow_up_at IS NOT NULL AND next_follow_up_at <= NOW() AND status NOT IN ('closed','converted'))::int AS follow_up_due
        FROM customer_enquiries`),
      pool.query(`SELECT COALESCE(action,'unknown') AS action, COUNT(*)::int AS count FROM customer_enquiries GROUP BY action ORDER BY count DESC`),
      pool.query(`SELECT status, COUNT(*)::int AS count FROM customer_enquiries GROUP BY status ORDER BY count DESC`),
      pool.query(`SELECT id, customer_name, customer_email, customer_phone, question, action, status,
        product_interest, capacity, application, location, quantity, timeframe,
        lead_score, follow_up_required, follow_up_reason, sales_owner, sales_notes,
        next_follow_up_at, converted_at, updated_by, created_at, updated_at
        FROM customer_enquiries ORDER BY created_at DESC LIMIT 50`),
      pool.query(`SELECT id, customer_name, customer_email, customer_phone, question, status,
        product_interest, capacity, application, location, quantity, timeframe,
        lead_score, follow_up_reason, sales_owner, sales_notes, next_follow_up_at, created_at
        FROM customer_enquiries
        WHERE follow_up_required = TRUE AND status NOT IN ('closed','converted')
        ORDER BY lead_score DESC, COALESCE(next_follow_up_at, created_at) ASC LIMIT 25`),
      pool.query(`SELECT TO_CHAR(created_at AT TIME ZONE 'Africa/Nairobi','YYYY-MM-DD') AS day, COUNT(*)::int AS count
        FROM customer_enquiries WHERE created_at >= NOW() - INTERVAL '14 days' GROUP BY 1 ORDER BY 1`)
    ]);
    return NextResponse.json({ totals: totals.rows[0], actions: actions.rows, statuses: statuses.rows, recent: recent.rows, followUps: followUps.rows, daily: daily.rows });
  } catch (error) {
    console.error("Kentainers analytics error", error);
    return NextResponse.json({ error: "Analytics unavailable" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: "Enquiry ID is required" }, { status: 400 });
    if (body.status && !STATUSES.includes(body.status)) return NextResponse.json({ error: "Invalid enquiry status" }, { status: 400 });
    await ensureCustomerEnquiriesTable();
    const fields: string[] = [];
    const values: unknown[] = [];
    const add = (sql: string, value: unknown) => { values.push(value); fields.push(`${sql}=$${values.length}`); };

    if (body.status) {
      add("status", body.status);
      if (body.status === "converted") fields.push("converted_at=COALESCE(converted_at,NOW())");
      if (body.status !== "converted") fields.push("converted_at=NULL");
    }
    if (body.salesOwner !== undefined) add("sales_owner", String(body.salesOwner).slice(0, 120) || null);
    if (body.salesNotes !== undefined) add("sales_notes", String(body.salesNotes).slice(0, 4000) || null);
    if (body.nextFollowUpAt !== undefined) add("next_follow_up_at", body.nextFollowUpAt ? new Date(body.nextFollowUpAt).toISOString() : null);
    if (body.updatedBy !== undefined) add("updated_by", String(body.updatedBy).slice(0, 120) || null);
    if (!fields.length) return NextResponse.json({ error: "No changes supplied" }, { status: 400 });
    fields.push("updated_at=NOW()");
    const idParam = values.length + 1;
    values.push(body.id);
    await getPool().query(`UPDATE customer_enquiries SET ${fields.join(", ")} WHERE id=$${idParam}`, values);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Kentainers enquiry update error", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
