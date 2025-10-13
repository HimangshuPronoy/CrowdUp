-- Company Management System

-- Add owner and verification to companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES profiles(id);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);

-- Company team members table
CREATE TABLE IF NOT EXISTS company_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  invited_by UUID REFERENCES profiles(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

-- Company invitations table
CREATE TABLE IF NOT EXISTS company_invitations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
  invited_by UUID REFERENCES profiles(id) NOT NULL,
  token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, email, status)
);

-- Company responses to posts
CREATE TABLE IF NOT EXISTS company_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  response TEXT NOT NULL,
  status TEXT CHECK (status IN ('acknowledged', 'in_progress', 'completed', 'wont_fix')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_company_members_company_id ON company_members(company_id);
CREATE INDEX IF NOT EXISTS idx_company_members_user_id ON company_members(user_id);
CREATE INDEX IF NOT EXISTS idx_company_invitations_company_id ON company_invitations(company_id);
CREATE INDEX IF NOT EXISTS idx_company_invitations_email ON company_invitations(email);
CREATE INDEX IF NOT EXISTS idx_company_invitations_token ON company_invitations(token);
CREATE INDEX IF NOT EXISTS idx_company_responses_post_id ON company_responses(post_id);
CREATE INDEX IF NOT EXISTS idx_company_responses_company_id ON company_responses(company_id);

-- Enable RLS
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for company_members
CREATE POLICY "Anyone can view company members" ON company_members FOR SELECT USING (true);
CREATE POLICY "Company admins can add members" ON company_members FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM company_members cm 
      WHERE cm.company_id = company_members.company_id 
      AND cm.user_id = auth.uid() 
      AND cm.role IN ('owner', 'admin')
    )
  );
CREATE POLICY "Company admins can remove members" ON company_members FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM company_members cm 
      WHERE cm.company_id = company_members.company_id 
      AND cm.user_id = auth.uid() 
      AND cm.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for company_invitations
CREATE POLICY "Company members can view invitations" ON company_invitations FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM company_members cm 
      WHERE cm.company_id = company_invitations.company_id 
      AND cm.user_id = auth.uid()
    )
  );
CREATE POLICY "Company admins can create invitations" ON company_invitations FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM company_members cm 
      WHERE cm.company_id = company_invitations.company_id 
      AND cm.user_id = auth.uid() 
      AND cm.role IN ('owner', 'admin')
    )
  );
CREATE POLICY "Company admins can update invitations" ON company_invitations FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM company_members cm 
      WHERE cm.company_id = company_invitations.company_id 
      AND cm.user_id = auth.uid() 
      AND cm.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for company_responses
CREATE POLICY "Anyone can view company responses" ON company_responses FOR SELECT USING (true);
CREATE POLICY "Company members can create responses" ON company_responses FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM company_members cm 
      WHERE cm.company_id = company_responses.company_id 
      AND cm.user_id = auth.uid()
    )
  );
CREATE POLICY "Company members can update own responses" ON company_responses FOR UPDATE 
  USING (auth.uid() = user_id);

-- Update companies RLS to allow creation
DROP POLICY IF EXISTS "Companies are viewable by everyone" ON companies;
CREATE POLICY "Companies are viewable by everyone" ON companies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create companies" ON companies FOR INSERT 
  WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Company owners can update their companies" ON companies FOR UPDATE 
  USING (
    auth.uid() = owner_id OR 
    EXISTS (
      SELECT 1 FROM company_members cm 
      WHERE cm.company_id = companies.id 
      AND cm.user_id = auth.uid() 
      AND cm.role IN ('owner', 'admin')
    )
  );

-- Function to automatically add creator as owner
CREATE OR REPLACE FUNCTION add_company_owner()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO company_members (company_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  
  UPDATE companies 
  SET owner_id = NEW.created_by 
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER add_company_owner_trigger
AFTER INSERT ON companies
FOR EACH ROW EXECUTE FUNCTION add_company_owner();

-- Function to generate invitation token
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TRIGGER AS $$
BEGIN
  NEW.token := encode(gen_random_bytes(32), 'hex');
  NEW.expires_at := NOW() + INTERVAL '7 days';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_invitation_token_trigger
BEFORE INSERT ON company_invitations
FOR EACH ROW EXECUTE FUNCTION generate_invitation_token();
