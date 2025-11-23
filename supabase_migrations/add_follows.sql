-- Add company and app follows functionality

-- Company follows table
CREATE TABLE IF NOT EXISTS company_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

-- App follows table
CREATE TABLE IF NOT EXISTS app_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(app_id, user_id)
);

-- Add follower count columns
ALTER TABLE companies ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_company_follows_company ON company_follows(company_id);
CREATE INDEX IF NOT EXISTS idx_company_follows_user ON company_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_app_follows_app ON app_follows(app_id);
CREATE INDEX IF NOT EXISTS idx_app_follows_user ON app_follows(user_id);

-- Function to update company follower count
CREATE OR REPLACE FUNCTION update_company_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE companies SET follower_count = follower_count + 1 WHERE id = NEW.company_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE companies SET follower_count = GREATEST(0, follower_count - 1) WHERE id = OLD.company_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update app follower count
CREATE OR REPLACE FUNCTION update_app_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE apps SET follower_count = follower_count + 1 WHERE id = NEW.app_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE apps SET follower_count = GREATEST(0, follower_count - 1) WHERE id = OLD.app_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers for company follows
DROP TRIGGER IF EXISTS update_company_follower_count_trigger ON company_follows;
CREATE TRIGGER update_company_follower_count_trigger
AFTER INSERT OR DELETE ON company_follows
FOR EACH ROW
EXECUTE FUNCTION update_company_follower_count();

-- Triggers for app follows
DROP TRIGGER IF EXISTS update_app_follower_count_trigger ON app_follows;
CREATE TRIGGER update_app_follower_count_trigger
AFTER INSERT OR DELETE ON app_follows
FOR EACH ROW
EXECUTE FUNCTION update_app_follower_count();

-- Grant permissions (for development - adjust for production)
GRANT ALL ON company_follows TO anon, authenticated;
GRANT ALL ON app_follows TO anon, authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Follow functionality added successfully!';
  RAISE NOTICE 'Tables created: company_follows, app_follows';
  RAISE NOTICE 'Columns added: follower_count to companies and apps';
END $$;
