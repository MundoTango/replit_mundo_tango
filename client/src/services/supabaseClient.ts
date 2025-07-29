import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Validate Supabase configuration
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

if (!supabaseUrl || !isValidUrl(supabaseUrl)) {
  console.warn('⚠️ VITE_SUPABASE_URL not configured or invalid - real-time features will be disabled');
}

if (!supabaseAnonKey) {
  console.warn('⚠️ VITE_SUPABASE_ANON_KEY not configured - real-time features will be disabled');
}

// Only create client if both URL and key are provided and URL is valid
export const supabase = (supabaseUrl && supabaseAnonKey && isValidUrl(supabaseUrl)) ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
}) : null

// Auth helpers for client-side authentication
export const auth = {
  signIn: async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase not configured');
    return await supabase.auth.signInWithPassword({ email, password })
  },
  
  signUp: async (email: string, password: string, userData?: any) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },
  
  signOut: async () => {
    if (!supabase) throw new Error('Supabase not configured');
    return await supabase.auth.signOut()
  },
  
  getSession: async () => {
    if (!supabase) throw new Error('Supabase not configured');
    return await supabase.auth.getSession()
  },
  
  getUser: async () => {
    if (!supabase) throw new Error('Supabase not configured');
    return await supabase.auth.getUser()
  },
  
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    if (!supabase) throw new Error('Supabase not configured');
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Real-time subscriptions for client
export const realtime = {
  subscribeToPosts: (userId: string, callback: (payload: any) => void) => {
    if (!supabase) throw new Error('Supabase not configured');
    return supabase
      .channel(`posts-${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'posts'
      }, callback)
      .subscribe()
  },
  
  subscribeToMessages: (roomId: string, callback: (payload: any) => void) => {
    if (!supabase) throw new Error('Supabase not configured');
    return supabase
      .channel(`messages-${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `chat_room_id=eq.${roomId}`
      }, callback)
      .subscribe()
  },
  
  subscribeToNotifications: (userId: string, callback: (payload: any) => void) => {
    if (!supabase) throw new Error('Supabase not configured');
    return supabase
      .channel(`notifications-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',  
        table: 'notifications',
        filter: `recipient_id=eq.${userId}`
      }, callback)
      .subscribe()
  }
}

export default supabase