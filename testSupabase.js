import { createClient } from '@supabase/supabase-js'

// Pull secrets from environment variables
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

async function testConnection() {
  const { data, error } = await supabase.from('users').select('*')

  if (error) {
    console.error('❌ Supabase error:', error.message)
  } else {
    console.log('✅ Supabase connected! User rows:', data)
  }
}

testConnection()