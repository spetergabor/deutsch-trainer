import { createClient } from '@supabase/supabase-js'

// A Vite-nél import.meta.env-et használunk a folyamatban lévő környezeti változókhoz
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)