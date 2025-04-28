import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./database.ts";

export interface ExtractedLink {
	url: string;
	sourceFile: string;
	sourceJson?: string;
}

export function createUniqueLinks(allLinks: ExtractedLink[]) {
	const uniqueLinksMap = new Map<string, ExtractedLink>();
	allLinks.forEach((link) => {
		if (!uniqueLinksMap.has(link.url)) {
			uniqueLinksMap.set(link.url, link);
		}
	});
	const uniqueLinks = Array.from(uniqueLinksMap.values());
	return uniqueLinks;
}

export async function insertLinks(
	supabase: SupabaseClient<Database>,
	linksToInsert: {
		url: string;
		source_file: string;
		source_json: string | undefined;
	}[],
) {
	const { error: insertError } = await supabase
		.from("links")
		.insert(linksToInsert, {
			// onConflict: 'url', // Specify the constraint name if known
			// ignoreDuplicates: true, // Or use this simpler option if your Supabase version supports it
		});
	if (insertError) {
		// It's common to get a duplicate key error (23505) which we can arguably ignore if just adding new links.
		if (insertError.code === "23505") {
			// 23505: unique_violation
			console.warn(
				"Some links were already present in the database (unique constraint violation).",
			);
		} else {
			console.error(` Database insert error: ${insertError.message}`);
			// Decide if we should throw or just log
			// throw new Error(`Database insert error: ${insertError.message}`);
		}
	} else {
		console.log(
			"Successfully processed link insertions (duplicates ignored by constraint).",
		);
	}
}
