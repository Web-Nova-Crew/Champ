import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { isSupabaseConfigured } from '../mock-data'

// Check if Supabase is configured
const checkSupabaseConfig = () => {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase not configured. Running in MOCK/DEMO mode.')
    return false
  }
  return true
}

// Client component supabase client
export const createSupabaseClient = () => {
  if (!checkSupabaseConfig()) {
    // Return a mock client that won't throw errors
    return null as any
  }
  try {
    return createClientComponentClient()
  } catch (error) {
    console.warn('Supabase client creation failed, using mock mode:', error)
    return null as any
  }
}

// Server-side supabase client
export const createServerSupabaseClient = () => {
  if (!checkSupabaseConfig()) {
    return null as any
  }
  try {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  } catch (error) {
    console.warn('Supabase server client creation failed:', error)
    return null as any
  }
}

// Admin client for server actions
export const createAdminSupabaseClient = () => {
  if (!checkSupabaseConfig()) {
    return null as any
  }
  try {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  } catch (error) {
    console.warn('Supabase admin client creation failed:', error)
    return null as any
  }
}
