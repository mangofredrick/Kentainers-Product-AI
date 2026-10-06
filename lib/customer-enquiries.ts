import { getPool } from "./db";
import type { AgentResult } from "./types";

export type CustomerDetails = { name?: string; email?: string; phone?: string };
export type CustomerRequirements = { product?: string; capacity?: string; application?: string; location?: string; quantity?: string; timeframe?: string };

let initialized = false;

export async function ensureCustomerEnquiriesTable() {
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
      sales_owner TEXT,
      sales_notes TEXT,
      next_follow_up_at TIMESTAMPTZ,
      converted_at TIMESTAMPTZ,
      updated_by TEXT,
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
  await pool.query(`ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS sales_owner TEXT`);
  await pool.query(`ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS sales_notes TEXT`);
  await pool.query(`ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS next_follow_up_at TIMESTAMPTZ`);
  await pool.query(`ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ`);
  await pool.query(`ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS updated_by TEXT`);
  initialized = true;
}

function newId() { return `ENQ-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`; }

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
  return { score, followUp: score >= 40 || result.action === "escalate", reason: reasons.join("; ") || "general information enquiry" };
}

export async function ensureQuestionMemoryTable() {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS chatbot_question_memory (
      id BIGSERIAL PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT,
      action TEXT,
      products JSONB,
      sources JSONB,
      product_interest TEXT,
      capacity TEXT,
      application TEXT,
      location TEXT,
      knowledge_status TEXT NOT NULL DEFAULT 'answered',
      approved_answer TEXT,
      needs_review BOOLEAN NOT NULL DEFAULT FALSE,
      review_reason TEXT,
      frequency INTEGER NOT NULL DEFAULT 1,
      first_asked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_asked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`ALTER TABLE chatbot_question_memory ADD COLUMN IF NOT EXISTS approved_answer TEXT`);
}

function normalizeQuestion(question: string) {
  return question.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 4000);
}

function memoryStatus(result: AgentResult) {
  if (result.action === "escalate") return { status: "unverified", review: true, reason: "Chatbot could not provide a verified answer." };
  if (result.action === "clarify") return { status: "needs_clarification", review: true, reason: "Customer question requires additional information or knowledge review." };
  return { status: "answered", review: false, reason: null };
}

export async function recordChatbotQuestion(question: string, result: AgentResult, requirements: CustomerRequirements = {}) {
  if (!question.trim()) return;
  await ensureQuestionMemoryTable();
  const normalized = normalizeQuestion(question);
  const status = memoryStatus(result);
  const pool = getPool();
  const existing = await pool.query(
    `SELECT id FROM chatbot_question_memory WHERE question = $1 LIMIT 1`,
    [normalized]
  );
  if (existing.rowCount) {
    await pool.query(
      `UPDATE chatbot_question_memory
       SET frequency = frequency + 1,
           last_asked_at = NOW(),
           answer = $2,
           action = $3,
           products = $4::jsonb,
           sources = $5::jsonb,
           product_interest = $6,
           capacity = $7,
           application = $8,
           location = $9,
           knowledge_status = $10,
           needs_review = $11,
           review_reason = $12,
           updated_at = NOW()
       WHERE id = $1`,
      [existing.rows[0].id, result.answer, result.action || null,
       JSON.stringify(result.products || []), JSON.stringify(result.sources || []),
       requirements.product?.trim() || result.products?.[0]?.product_name || null,
       requirements.capacity?.trim() || null, requirements.application?.trim() || null,
       requirements.location?.trim() || null, status.status, status.review, status.reason]
    );
  } else {
    await pool.query(
      `INSERT INTO chatbot_question_memory
       (question, answer, action, products, sources, product_interest, capacity, application, location,
        knowledge_status, needs_review, review_reason)
       VALUES ($1,$2,$3,$4::jsonb,$5::jsonb,$6,$7,$8,$9,$10,$11,$12)`,
      [normalized, result.answer, result.action || null,
       JSON.stringify(result.products || []), JSON.stringify(result.sources || []),
       requirements.product?.trim() || result.products?.[0]?.product_name || null,
       requirements.capacity?.trim() || null, requirements.application?.trim() || null,
       requirements.location?.trim() || null, status.status, status.review, status.reason]
    );
  }
}

export async function saveCustomerEnquiry(customer: CustomerDetails, question: string, result: AgentResult, requirements: CustomerRequirements = {}) {
  await ensureCustomerEnquiriesTable();
  const id = newId();
  const lead = leadSignals(customer, question, result, requirements);
  await getPool().query(
    `INSERT INTO customer_enquiries
      (id, customer_name, customer_email, customer_phone, question, answer, action, products, sources,
       product_interest, capacity, application, location, quantity, timeframe, lead_score, follow_up_required, follow_up_reason)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
    [id, customer.name?.trim() || null, customer.email?.trim() || null, customer.phone?.trim() || null, question,
      result.answer, result.action, JSON.stringify(result.products || []), JSON.stringify(result.sources || []),
      requirements.product?.trim() || result.products?.[0]?.product_name || null, requirements.capacity?.trim() || null,
      requirements.application?.trim() || null, requirements.location?.trim() || null, requirements.quantity?.trim() || null,
      requirements.timeframe?.trim() || null, lead.score, lead.followUp, lead.reason]
  );
  return id;
}

export async function listQuestionMemory(limit = 100, needsReviewOnly = true) {
  await ensureQuestionMemoryTable();
  const result = await getPool().query(
    `SELECT id, question, answer, action, products, sources, product_interest, capacity,
            application, location, knowledge_status, approved_answer, needs_review, review_reason,
            frequency, first_asked_at, last_asked_at, updated_at
     FROM chatbot_question_memory
     WHERE ($1 = FALSE OR needs_review = TRUE)
     ORDER BY frequency DESC, last_asked_at DESC
     LIMIT $2`,
    [needsReviewOnly, Math.min(Math.max(limit, 1), 200)]
  );
  return result.rows;
}

export async function markQuestionMemoryReviewed(id: number, status: "verified" | "not_supported" | "needs_review", reviewReason?: string, approvedAnswer?: string) {
  await ensureQuestionMemoryTable();
  await getPool().query(
    `UPDATE chatbot_question_memory
     SET knowledge_status = $2,
         needs_review = $3,
         review_reason = $4,
         approved_answer = $5,
         updated_at = NOW()
     WHERE id = $1`,
    [id, status, status !== "verified" && status !== "not_supported", reviewReason || null, status === "verified" ? (approvedAnswer || null) : null]
  );
}

export async function listFollowUpEnquiries(limit = 50) {
  await ensureCustomerEnquiriesTable();
  const result = await getPool().query(
    `SELECT id, customer_name, customer_email, customer_phone, question, answer, action, status,
            product_interest, capacity, application, location, quantity, timeframe,
            lead_score, follow_up_required, follow_up_reason, sales_owner, sales_notes,
            next_follow_up_at, converted_at, updated_by, created_at, updated_at
     FROM customer_enquiries
     WHERE follow_up_required = TRUE
       AND status NOT IN ('closed', 'converted')
     ORDER BY lead_score DESC, created_at DESC
     LIMIT $1`,
    [Math.min(Math.max(limit, 1), 100)]
  );
  return result.rows;
}

export async function listCustomerEnquiries(limit = 50) {
  await ensureCustomerEnquiriesTable();
  const result = await getPool().query(
    `SELECT id, customer_name, customer_email, customer_phone, question, answer, action, status,
            product_interest, capacity, application, location, quantity, timeframe,
            lead_score, follow_up_required, follow_up_reason, sales_owner, sales_notes,
            next_follow_up_at, converted_at, updated_by, created_at, updated_at
     FROM customer_enquiries ORDER BY created_at DESC LIMIT $1`,
    [Math.min(Math.max(limit, 1), 100)]
  );
  return result.rows;
}
