import { createClient } from '@supabase/supabase-js'

// This file should only be imported in server-side code (API routes, server actions, etc.)
// DO NOT import this in client components

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Only create admin client if we have the service key (server-side only)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null as any // This will be null on client-side, which is fine since it shouldn't be used there
