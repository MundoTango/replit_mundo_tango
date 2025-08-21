import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Create Supabase client with service role for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Create public client for auth operations
export const supabaseAuth = createClient(
  supabaseUrl, 
  process.env.SUPABASE_ANON_KEY || '',
  {
    auth: {
      flowType: 'implicit'
    }
  }
)

export default supabase