-- 📧 Supabase SQL Schema for User Tracking
-- Run this SQL in your Supabase dashboard: SQL Editor

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster queries
CREATE INDEX idx_users_email ON users(email);

-- Enable RLS (Row Level Security) - Optional but recommended
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (auth.jwt() ->> 'email' = email);

-- Policy: Service role can insert/update (for server operations)
CREATE POLICY "Service role can manage users"
  ON users
  FOR ALL
  USING (auth.role() = 'service_role');

-- Optional: Create an updated_at trigger to auto-update the timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
