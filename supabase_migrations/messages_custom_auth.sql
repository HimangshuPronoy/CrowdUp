-- MESSAGES MIGRATION FOR CUSTOM AUTH
-- This version works with your current custom authentication system
-- Note: RLS is disabled since you're not using Supabase Auth yet

-- Drop existing tables if needed (be careful in production!)
-- DROP TABLE IF EXISTS messages CASCADE;
-- DROP TABLE IF EXISTS conversations CASCADE;

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant1_id, participant2_id),
  CHECK (participant1_id < participant2_id) -- Ensure consistent ordering
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_participant1 ON conversations(participant1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant2 ON conversations(participant2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(conversation_id, read) WHERE read = FALSE;

-- Function to update conversation timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation timestamp on new message
DROP TRIGGER IF EXISTS update_conversation_timestamp_trigger ON messages;
CREATE TRIGGER update_conversation_timestamp_trigger
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();

-- Create a view for easier querying with unread counts
CREATE OR REPLACE VIEW conversation_summary AS
SELECT 
  c.id,
  c.participant1_id,
  c.participant2_id,
  c.created_at,
  c.updated_at,
  (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id) as message_count,
  (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.read = FALSE) as unread_count,
  (SELECT content FROM messages m WHERE m.conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
  (SELECT created_at FROM messages m WHERE m.conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_at
FROM conversations c;

-- Helper function to get or create conversation between two users
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  user1_id UUID,
  user2_id UUID
)
RETURNS UUID AS $$
DECLARE
  conversation_id UUID;
  p1_id UUID;
  p2_id UUID;
BEGIN
  -- Ensure consistent ordering
  IF user1_id < user2_id THEN
    p1_id := user1_id;
    p2_id := user2_id;
  ELSE
    p1_id := user2_id;
    p2_id := user1_id;
  END IF;

  -- Try to find existing conversation
  SELECT id INTO conversation_id
  FROM conversations
  WHERE participant1_id = p1_id AND participant2_id = p2_id;

  -- If not found, create new conversation
  IF conversation_id IS NULL THEN
    INSERT INTO conversations (participant1_id, participant2_id)
    VALUES (p1_id, p2_id)
    RETURNING id INTO conversation_id;
  END IF;

  RETURN conversation_id;
END;
$$ LANGUAGE plpgsql;

-- Helper function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE messages
  SET read = TRUE
  WHERE conversation_id = p_conversation_id
    AND sender_id != p_user_id
    AND read = FALSE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- IMPORTANT: Since you're using custom auth, RLS is disabled
-- When you migrate to Supabase Auth, uncomment and modify the RLS policies below:

-- ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view their own conversations" ON conversations
--   FOR SELECT USING (
--     auth.uid() = participant1_id OR auth.uid() = participant2_id
--   );

-- CREATE POLICY "Users can create conversations with connections" ON conversations
--   FOR INSERT WITH CHECK (
--     auth.uid() = participant1_id OR auth.uid() = participant2_id
--   );

-- CREATE POLICY "Users can view messages in their conversations" ON messages
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM conversations
--       WHERE conversations.id = messages.conversation_id
--       AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
--     )
--   );

-- CREATE POLICY "Users can send messages in their conversations" ON messages
--   FOR INSERT WITH CHECK (
--     auth.uid() = sender_id AND
--     EXISTS (
--       SELECT 1 FROM conversations
--       WHERE conversations.id = messages.conversation_id
--       AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
--     )
--   );

-- CREATE POLICY "Users can update their own messages" ON messages
--   FOR UPDATE USING (sender_id = auth.uid());

-- Grant permissions (for development - remove in production with proper auth)
GRANT ALL ON conversations TO anon, authenticated;
GRANT ALL ON messages TO anon, authenticated;
GRANT ALL ON conversation_summary TO anon, authenticated;

-- Test data (optional - comment out in production)
-- INSERT INTO conversations (participant1_id, participant2_id)
-- SELECT 
--   (SELECT id FROM users LIMIT 1 OFFSET 0),
--   (SELECT id FROM users LIMIT 1 OFFSET 1)
-- WHERE EXISTS (SELECT 1 FROM users HAVING COUNT(*) >= 2);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Messages tables created successfully!';
  RAISE NOTICE 'Remember: RLS is disabled since you are using custom auth';
  RAISE NOTICE 'Tables created: conversations, messages';
  RAISE NOTICE 'Views created: conversation_summary';
  RAISE NOTICE 'Functions created: get_or_create_conversation, mark_messages_as_read';
END $$;
