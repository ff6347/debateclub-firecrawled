import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.ts";
import type { ExtractedLink } from "./types.ts";

const TAG_BLACKLIST = [
	"links", // Add more as needed
];

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
	linksToInsert: ExtractedLink[],
) {
	const { error: insertError } = await supabase.from("links").insert(
		linksToInsert.map((link) => ({
			url: link.url,
			source_file: link.sourceFile,
			source_json: link.sourceJson,
		})),
		{
			// onConflict: 'url', // Specify the constraint name if known
			// ignoreDuplicates: true, // Or use this simpler option if your Supabase version supports it
		},
	);
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

/**
 * Upserts tags by name and returns their IDs.
 * @param supabase Supabase client
 * @param tagNames Array of tag names
 * @returns Array of {id, name} for the tags
 */
export async function upsertTagsAndGetIds(
	supabase: SupabaseClient<Database>,
	tagNames: string[],
): Promise<{ id: number; name: string }[]> {
	if (!tagNames.length) return [];
	const tagsToUpsert = tagNames.map((name) => ({ name }));
	const { error: upsertError } = await supabase
		.from("tags")
		.upsert(tagsToUpsert, { onConflict: "name", ignoreDuplicates: false });
	if (upsertError) {
		console.error("Error upserting tags:", upsertError.message);
		throw upsertError;
	}
	const { data: tags, error: fetchError } = await supabase
		.from("tags")
		.select("id, name")
		.in("name", tagNames);
	if (fetchError) {
		console.error("Error fetching tag IDs:", fetchError.message);
		throw fetchError;
	}
	return tags || [];
}

/**
 * Associates a set of tag IDs with a link ID in the link_tags table.
 * Ignores duplicate associations (unique constraint violations).
 * @param supabase Supabase client
 * @param linkId Link ID
 * @param tagIds Array of tag IDs
 */
export async function associateTagsWithLink(
	supabase: SupabaseClient<Database>,
	linkId: number,
	tagIds: number[],
): Promise<void> {
	if (!tagIds.length) return;
	const associations = tagIds.map((tag_id) => ({ link_id: linkId, tag_id }));
	// Supabase JS does not support onConflict/ignore for insert. Just insert and ignore unique violation errors.
	const { error } = await supabase.from("link_tags").insert(associations);
	if (error && error.code !== "23505") {
		console.error(`Error associating tags with link ${linkId}:`, error.message);
		throw error;
	}
}

/**
 * For a batch of ExtractedLink, parse tags from sourceJson and associate with the link in DB.
 * Looks up link.id by url after insertLinks.
 */
export async function importTagsForLinks(
	supabase: SupabaseClient<Database>,
	links: ExtractedLink[],
): Promise<void> {
	let processed = 0;
	for (const link of links) {
		if (!link.sourceJson) continue;
		let tags: string[] = [];
		try {
			const parsed = JSON.parse(link.sourceJson);
			if (Array.isArray(parsed.tags)) {
				tags = parsed.tags.map((t: any) => String(t)).filter(Boolean);
			}
		} catch (e) {
			console.warn(`Could not parse sourceJson for url ${link.url}`);
			continue;
		}
		if (!tags.length) continue;
		// Blacklist filter (case-insensitive)
		const filteredTags = tags.filter(
			(t) => !TAG_BLACKLIST.some((b) => t.toLowerCase() === b.toLowerCase()),
		);
		if (filteredTags.length !== tags.length) {
			const removed = tags.filter((t) =>
				TAG_BLACKLIST.some((b) => t.toLowerCase() === b.toLowerCase()),
			);
			console.log(
				`Filtered blacklisted tags for url ${link.url}: [${removed.join(", ")}]`,
			);
		}
		if (!filteredTags.length) continue;
		// Look up link.id by url
		const { data: linkRow, error } = await supabase
			.from("links")
			.select("id")
			.eq("url", link.url)
			.single();
		if (error || !linkRow) {
			console.warn(`Could not find link id for url ${link.url}`);
			continue;
		}
		try {
			const tagRows = await upsertTagsAndGetIds(supabase, filteredTags);
			const tagIds = tagRows.map((t) => t.id);
			await associateTagsWithLink(supabase, linkRow.id, tagIds);
			processed++;
			if (processed % 50 === 0) {
				console.log(`Tagged ${processed} links...`);
			}
		} catch (err: any) {
			console.error(`Error tagging link url ${link.url}:`, err.message);
		}
	}
	console.log(`Done. Tagged ${processed} new links with tags.`);
}
