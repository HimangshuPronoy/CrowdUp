# 📨 Messages Migration Execution Guide

## 🚀 Quick Execute (3 Methods)

### Method 1: Supabase Dashboard (Recommended) ⭐

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/eodcobxjgofitexvlqwc/sql/new

2. **Copy & Paste SQL**
   - Open file: `/supabase_migrations/messages_custom_auth.sql`
   - Copy entire contents
   - Paste into SQL Editor

3. **Run Query**
   - Click "Run" button
   - You should see success messages

4. **Verify Tables Created**
   ```sql
   -- Run this to verify:
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('conversations', 'messages');
   ```

---

### Method 2: npm Script (Automated)

```bash
# Install tsx if needed
npm install --save-dev tsx

# Run migration
npm run migrate:messages
```

**Note:** This method may show warnings about RPC not being available - that's okay, you'll need to run the SQL manually in Supabase Dashboard.

---

### Method 3: Supabase CLI

```bash
# Install Supabase CLI if needed
brew install supabase/tap/supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref eodcobxjgofitexvlqwc

# Run migration
supabase db push < supabase_migrations/messages_custom_auth.sql
```

---

## ✅ Verification Steps

After running the migration, verify everything worked:

### 1. Check Tables Exist
```sql
-- In Supabase SQL Editor
SELECT COUNT(*) FROM conversations;
SELECT COUNT(*) FROM messages;
```

### 2. Check Indexes
```sql
SELECT indexname FROM pg_indexes 
WHERE tablename IN ('conversations', 'messages');
```

### 3. Check Functions
```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_or_create_conversation', 'mark_messages_as_read');
```

### 4. Test Conversation Creation
```sql
-- Get two user IDs
SELECT id, username FROM users LIMIT 2;

-- Create test conversation (replace with actual IDs)
SELECT get_or_create_conversation(
  'user-id-1'::uuid, 
  'user-id-2'::uuid
);
```

---

## 🔍 What This Migration Creates

### Tables
- **conversations** - Stores conversations between users
- **messages** - Stores individual messages

### Indexes
- 8 performance indexes for fast queries

### Functions
- `get_or_create_conversation()` - Helper to manage conversations
- `mark_messages_as_read()` - Mark messages as read
- `update_conversation_timestamp()` - Auto-update timestamps

### Views
- **conversation_summary** - Easy querying with message counts

---

## ⚠️ Important Notes

### Security Warning
- **RLS is disabled** because you're using custom auth
- Anyone can read/write messages without proper API protection
- **Fix this ASAP** by migrating to Supabase Auth (see IMPLEMENTATION_ROADMAP.md)

### Next Steps After Migration

1. **Test Messaging UI**
   - Navigate to `/messages` in your app
   - Try sending a message

2. **Add API Protection**
   ```typescript
   // In your API routes, add auth checks:
   const userId = getUserIdFromSession() // Your custom auth
   if (!userId) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
   }
   ```

3. **Consider Migration to Supabase Auth**
   - This will enable RLS policies
   - See IMPLEMENTATION_ROADMAP.md Phase 1

---

## 🆘 Troubleshooting

### Error: "relation already exists"
- Tables already created, this is fine
- Drop and recreate if needed:
  ```sql
  DROP TABLE IF EXISTS messages CASCADE;
  DROP TABLE IF EXISTS conversations CASCADE;
  ```

### Error: "permission denied"
- Make sure you're using service role key or admin access
- Check Supabase Dashboard → Settings → API → Service Role Key

### Error: "RPC function not found"
- Normal if using npm script
- Just run SQL directly in Supabase Dashboard

---

## 📝 Quick Test Code

After migration, test with this code:

```typescript
// Test in your app
import { supabase } from '@/lib/supabase'

async function testMessaging() {
  // Get or create conversation
  const { data: conv } = await supabase
    .rpc('get_or_create_conversation', {
      user1_id: 'your-user-id',
      user2_id: 'other-user-id'
    })

  console.log('Conversation ID:', conv)

  // Send a message
  const { data: message } = await supabase
    .from('messages')
    .insert({
      conversation_id: conv,
      sender_id: 'your-user-id',
      content: 'Hello, this is a test message!'
    })
    .select()
    .single()

  console.log('Message sent:', message)

  // Get messages
  const { data: messages } = await supabase
    .from('messages')
    .select('*, sender:sender_id(username, display_name)')
    .eq('conversation_id', conv)
    .order('created_at', { ascending: true })

  console.log('Messages:', messages)
}
```

---

## ✅ Success Checklist

- [ ] SQL executed successfully
- [ ] Tables created (conversations, messages)
- [ ] Indexes created (8 total)
- [ ] Functions created (3 total)
- [ ] View created (conversation_summary)
- [ ] Test message sent successfully

---

**Ready to execute? Start with Method 1 (Supabase Dashboard) - it's the easiest!**
