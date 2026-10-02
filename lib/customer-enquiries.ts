import { getPool } from "./db";
import type { AgentResult } from "./types";

export type CustomerDetails = {
  name?: string;
  email?: string;
  phone?: string;
};

export type CustomerRequirements = {
  product?: string;
  capacity?: string;
  application?: string;
  location?: string;
  quantity?: string;
  timeframe?: string;
};

let initialized = false;

async function ensureTable() {
  if (initialized) return;
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS customer_enquiries (
      id TEXT PRIMARY KEY,
      customer_name TEXT,
      customer_email TEXT,
      customer_phone TEXT,
      question TEXT NOT NULL,
      answer TEXT,
      action TEXT,
      products JSONB,
      sources JSONB,
      product_interest TEXT,
      capacity TEXT,
      application TEXT,
      location TEXT,
      quantity TEXT,
      timeframe TEXT,
      lead_score INTEGER NOT NULL DEFAULT 0,
      follow_up_required BOOLEAN NOT NULL DEFAULT FALSE,
      follow_up_reason TEXT,
      status TEXT NOT NULL DEFAULT 'open',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS product_interest TEXT`);
  await pool.query(`ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS capacity TEXT`);
  await pool.query(`ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS application TEXT`);
  await pool.query(`ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS location TEXT`);
  await pool.query(`ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS quantity TEXT`);
  await pool.query(`ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS timeframe TEXT`);
  await pool.query(`ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS lead_score INTEGER NOT NULL DEFAULT 0`);
  await pool.query(`ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS follow_up_required BOOLEAN NOT NULL DEFAULT FALSE`);
  await pool.query(`ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS follow_up_reason TEXT`);
  initialized = true;
}

function newId() {
  return `ENQ-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function leadSignals(customer: CustomerDetails, question: string, result: AgentResult, requirements: CustomerRequirements) {
  const text = `${question} ${requirements.product || ""} ${requirements.application || ""}`.toLowerCase();
  let score = 0;
  const reasons: string[] = [];
  if (customer.email?.trim() || customer.phone?.trim()) { score += 25; reasons.push("customer contact captured"); }
  if (requirements.product?.trim() || result.products?.length) { score += 15; reasons.push("product identified"); }
  if (requirements.capacity?.trim()) { score += 10; reasons.push("capacity requirement captured"); }
  if (requirements.application?.trim()) { score += 10; reasons.push("application captured"); }
  if (requirements.location?.trim()) { score += 10; reasons.push("delivery/location captured"); }
  if (requirements.quantity?.trim()) { score += 10; reasons.push("quantity captured"); }
  if (/(buy|purchase|order|quote|quotation|price|cost|delivery|deliver|available|availability|stock|supplier|sales|invoice)/i.test(text)) { score += 20; reasons.push("commercial intent detected"); }
  if (result.action === "escalate") { score += 15; reasons.push("sales/technical escalation indicated"); }
  score = Math.min(score, 100);
  const followUp = score >= 40 || result.action === "escalate";
  return { score, followUp, reason: reasons.join("; ") || "general information enquiry" };
}

export async function saveCustomerEnquiry(
  customer: CustomerDetails,
  question: string,
  result: AgentResult,
  requirements: CustomerRequirements = {}
) {
  await ensureTable();
  const id = newId();
  const pool = getPool();
  const lead = leadSignals(customer, question, result, requirements);
  await pool.query(
    `INSERT INTO customer_enquiries
      (id, customer_name, customer_email, customer_phone, question, answer, action, products, sources,
       product_interest, capacity, application, location, quantity, timeframe, lead_score, follow_up_required, follow_up_reason)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
    [
      id,
      customer.name?.trim() || null,
      customer.email?.trim() || null,
      customer.phone?.trim() || null,
      question,
      result.answer,
      result.action,
      JSON.stringify(result.products || []),
      JSON.stringify(result.sources || []),
      requirements.product?.trim() || result.products?.[0]?.product_name || null,
      requirements.capacity?.trim() || null,
      requirements.application?.trim() || null,
      requirements.location?.trim() || null,
      requirements.quantity?.trim() || null,
      requirements.timeframe?.trim() || null,
      lead.score,
      lead.followUp,
      lead.reason
    ]
  );
  return id;
}

export async function listCustomerEnquiries(limit = 50) {
  await ensureTable();
  const result = await getPool().query(
    `SELECT id, customer_name, customer_email, customer_phone, question, answer, action, status,
            product_interest, capacity, application, location, quantity, timeframe,
            lead_score, follow_up_required, follow_up_reason, created_at, updated_at
     FROM customer_enquiries ORDER BY created_at DESC LIMIT $1`,
    [Math.min(Math.max(limit, 1), 100)]
  );
  return result.rows;
}
