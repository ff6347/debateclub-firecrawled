import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.ts';

export function createSupabaseClient(supabaseUrl: string, supabaseAnonKey: string) {
	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set');
	}
	return createClient<Database>(supabaseUrl, supabaseAnonKey);
}
