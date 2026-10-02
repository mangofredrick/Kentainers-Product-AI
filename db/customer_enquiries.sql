-- Customer enquiry and sales lead storage.
-- The application also creates/migrates this table automatically on first use.
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
);

ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS product_interest TEXT;
ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS capacity TEXT;
ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS application TEXT;
ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS quantity TEXT;
ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS timeframe TEXT;
ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS lead_score INTEGER NOT NULL DEFAULT 0;
ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS follow_up_required BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE customer_enquiries ADD COLUMN IF NOT EXISTS follow_up_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_customer_enquiries_created_at
  ON customer_enquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_enquiries_email
  ON customer_enquiries (customer_email);
CREATE INDEX IF NOT EXISTS idx_customer_enquiries_follow_up
  ON customer_enquiries (follow_up_required, status, lead_score DESC);
