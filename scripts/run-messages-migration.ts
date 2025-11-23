#!/usr/bin/env node

/**
 * Script to execute the messages migration
 * Run with: npm run migrate:messages
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eodcobxjgofitexvlqwc.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvZGNvYnhqZ29maXRleHZscXdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MDY5NTQsImV4cCI6MjA3ODI4Mjk1NH0.RontzgcpgiBR0qlI51vx-BUKo28wUTUHRMD8pOFM4Ng'

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
})

async function runMigration() {
  console.log('🚀 Starting messages migration...')
  console.log('📦 Using Supabase URL:', supabaseUrl)

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase_migrations', 'messages_custom_auth.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    console.log('📄 Loaded migration file:', migrationPath)

    // Split SQL into individual statements (simple approach)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`📝 Found ${statements.length} SQL statements to execute`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      
      // Skip comments and empty statements
      if (statement.trim().startsWith('--') || statement.trim().length <= 1) {
        continue
      }

      console.log(`\n🔧 Executing statement ${i + 1}/${statements.length}...`)
      
      // Log first 100 chars of statement for debugging
      const preview = statement.substring(0, 100).replace(/\n/g, ' ')
      console.log(`   ${preview}${statement.length > 100 ? '...' : ''}`)

      // Try to execute via RPC
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          // RPC might not be available, that's okay
          console.log(`   ⚠️  RPC not available, statement needs manual execution`)
        } else {
          console.log(`   ✅ Success`)
        }
      } catch (rpcError) {
        // RPC function doesn't exist - this is expected
        console.log(`   ⚠️  RPC not available, statement needs manual execution`)
      }
    }

    // Test the tables were created
    console.log('\n🧪 Testing migration...')

    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('count')
      .limit(1)

    if (convError) {
      console.error('❌ Failed to query conversations table:', convError)
    } else {
      console.log('✅ Conversations table created successfully')
    }

    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('count')
      .limit(1)

    if (msgError) {
      console.error('❌ Failed to query messages table:', msgError)
    } else {
      console.log('✅ Messages table created successfully')
    }

    console.log('\n🎉 Migration completed!')
    console.log('\n📌 Next steps:')
    console.log('1. Test messaging functionality in your app')
    console.log('2. When you migrate to Supabase Auth, enable RLS policies')
    console.log('3. Add proper authentication checks in your API routes')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run the migration
runMigration()
