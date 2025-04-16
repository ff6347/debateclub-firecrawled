import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.ts";

export function createSupabaseClient({
	supabaseUrl,
	supabaseServiceRoleKey,
}: {
	supabaseUrl: string;
	supabaseServiceRoleKey: string;
}) {
	if (!supabaseUrl || !supabaseServiceRoleKey) {
		throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
	}
	return createClient<Database>(supabaseUrl, supabaseServiceRoleKey);
}
