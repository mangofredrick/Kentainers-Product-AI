import { getPool } from "./db";
import type { AgentResult } from "./types";

export type CustomerDetails = {
  name?: string;
  email?: string;
  phone?: string;
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
      status TEXT NOT NULL DEFAULT 'open',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  initialized = true;
}

function newId() {
  return `ENQ-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function saveCustomerEnquiry(customer: CustomerDetails, question: string, result: AgentResult) {
  await ensureTable();
  const id = newId();
  const pool = getPool();
  await pool.query(
    `INSERT INTO customer_enquiries
      (id, customer_name, customer_email, customer_phone, question, answer, action, products, sources)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb)`,
    [
      id,
      customer.name?.trim() || null,
      customer.email?.trim() || null,
      customer.phone?.trim() || null,
      question,
      result.answer,
      result.action,
      JSON.stringify(result.products || []),
      JSON.stringify(result.sources || [])
    ]
  );
  return id;
}

export async function listCustomerEnquiries(limit = 50) {
  await ensureTable();
  const result = await getPool().query(
    `SELECT id, customer_name, customer_email, customer_phone, question, answer, action, status, created_at, updated_at
     FROM customer_enquiries ORDER BY created_at DESC LIMIT $1`,
    [Math.min(Math.max(limit, 1), 100)]
  );
  return result.rows;
}
