-- Customer enquiry storage for KPIA.
-- The application also creates this table automatically on first use.
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
);

CREATE INDEX IF NOT EXISTS idx_customer_enquiries_created_at
  ON customer_enquiries (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_customer_enquiries_email
  ON customer_enquiries (customer_email);
