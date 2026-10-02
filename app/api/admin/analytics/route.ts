import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

function authorized(req: Request) {
  const expected = process.env.ADMIN_DASHBOARD_KEY;
  return Boolean(expected && req.headers.get("x-admin-key") === expected);
}

export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const pool = getPool();
    const [totals, actions, statuses, recent, followUps, daily] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours')::int AS last_24h,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS last_7d,
        COUNT(*) FILTER (WHERE customer_email IS NOT NULL OR customer_phone IS NOT NULL)::int AS identified,
        COUNT(*) FILTER (WHERE follow_up_required = TRUE AND status <> 'closed')::int AS follow_up_open
        FROM customer_enquiries`),
      pool.query(`SELECT COALESCE(action,'unknown') AS action, COUNT(*)::int AS count
        FROM customer_enquiries GROUP BY action ORDER BY count DESC`),
      pool.query(`SELECT status, COUNT(*)::int AS count
        FROM customer_enquiries GROUP BY status ORDER BY count DESC`),
      pool.query(`SELECT id, customer_name, customer_email, customer_phone, question, action, status,
        product_interest, capacity, application, location, quantity, timeframe,
        lead_score, follow_up_required, follow_up_reason, created_at
        FROM customer_enquiries ORDER BY created_at DESC LIMIT 50`),
      pool.query(`SELECT id, customer_name, customer_email, customer_phone, question, status,
        product_interest, capacity, application, location, quantity, timeframe,
        lead_score, follow_up_reason, created_at
        FROM customer_enquiries
        WHERE follow_up_required = TRUE AND status <> 'closed'
        ORDER BY lead_score DESC, created_at DESC LIMIT 25`),
      pool.query(`SELECT TO_CHAR(created_at AT TIME ZONE 'Africa/Nairobi','YYYY-MM-DD') AS day, COUNT(*)::int AS count
        FROM customer_enquiries WHERE created_at >= NOW() - INTERVAL '14 days'
        GROUP BY 1 ORDER BY 1`)
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
    if (!body.id || !["open", "contacted", "qualified", "converted", "closed"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid enquiry status" }, { status: 400 });
    }
    await getPool().query(`UPDATE customer_enquiries SET status=$1, updated_at=NOW() WHERE id=$2`, [body.status, body.id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Kentainers enquiry update error", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
