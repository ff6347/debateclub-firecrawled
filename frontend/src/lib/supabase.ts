import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are available during build
const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // In Astro v4+, process.env is not available during build by default.
  // We rely on import.meta.env injected via Astro's Vite config.
  // Check your Astro config if these are undefined.
  // For local dev using .envrc, ensure direnv is loading variables into the process running `astro dev` or `astro build`.
  throw new Error('Supabase URL or Anon Key is missing. Check environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);