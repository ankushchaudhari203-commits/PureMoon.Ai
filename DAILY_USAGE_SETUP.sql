CREATE TABLE IF NOT EXISTS daily_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_key TEXT NOT NULL,
  user_email TEXT,
  session_id TEXT,
  usage_date DATE NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_usage_user_key_date
ON daily_usage(user_key, usage_date);

ALTER TABLE daily_usage ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION update_daily_usage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_daily_usage_updated_at_trigger ON daily_usage;

CREATE TRIGGER update_daily_usage_updated_at_trigger
BEFORE UPDATE ON daily_usage
FOR EACH ROW
EXECUTE FUNCTION update_daily_usage_updated_at();
