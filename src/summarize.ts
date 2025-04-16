import pLimit from "p-limit";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.ts";
import { callOpenAI, type OpenAIResult } from "./openai-client.ts";

/**
 * Summarizes content for links that have been successfully scraped but not yet summarized.
 * Handles tag management (fetching existing, upserting new, linking).
 *
 * @param supabase - The Supabase client instance.
 * @param concurrency - The maximum number of concurrent summarization operations.
 */
export async function summarizePendingContent(
	supabase: SupabaseClient<Database>,
	concurrency: number,
	openaiModel: string,
): Promise<void> {
	// 1. Fetch all existing tags once
	console.log("Fetching existing tags...");
	const { data: existingTagsData, error: tagsError } = await supabase
		.from("tags")
		.select("id, name");

	if (tagsError) {
		console.error("Error fetching existing tags:", tagsError.message);
		throw tagsError;
	}
	const existingTags: { id: number; name: string }[] = existingTagsData || [];
	const existingTagNames = existingTags.map((tag) => tag.name);
	console.log(`Found ${existingTags.length} existing tags.`);

	// 2. Fetch content needing summarization
	console.log("Fetching content needing summarization...");
	const { data: linksToSummarize, error: fetchError } = await supabase
		.from("links")
		// Select all fields needed for the OpenAI call and the final update
		.select("id, url, markdown_content, title, description, image_url")
		.eq("crawl_status", "success") // Only summarize successfully scraped links
		.eq("summary_status", "pending") // Only summarize pending ones
		.not("markdown_content", "is", null); // Ensure content exists

	if (fetchError) {
		console.error("Error fetching content to summarize:", fetchError.message);
		throw fetchError;
	}

	if (!linksToSummarize || linksToSummarize.length === 0) {
		console.log("No content found needing summarization.");
		return;
	}

	console.log(
		`Found ${linksToSummarize.length} pieces of content to summarize.`,
	);

	const limit = pLimit(concurrency);
	console.log(`Starting summarization with concurrency ${concurrency}...`);

	// 3. Process each link
	const summaryPromises = linksToSummarize.map((link) =>
		limit(async () => {
			if (!link.markdown_content || !link.url || typeof link.id !== "number") {
				console.warn(
					`Skipping summarization for link ID ${
						link.id || "unknown"
					} due to missing content, URL, or ID.`,
				);
				return;
			}
			const linkId = link.id; // Ensure linkId is a number

			// Prepare title and description, handling nulls
			const pageTitle = link.title || "No title available";
			const pageDescription = link.description || "No description available";

			console.log(
				`Attempting to summarize content for link ID: ${linkId} (URL: ${link.url})`,
			); // Log URL
			try {
				// 4. Call OpenAI with content and existing tags
				const openAIResult: OpenAIResult = await callOpenAI({
					content: link.markdown_content,
					sourceUrl: link.url,
					pageTitle,
					pageDescription,
					existingTagNames,
					openaiModel, // Pass the OpenAI model name
				});

				// 5. Upsert tags returned by OpenAI
				const tagsToUpsert = openAIResult.tags.map((name: string) => ({
					name,
				}));
				if (tagsToUpsert.length === 0) {
					console.log(`No tags returned from OpenAI for link ID: ${linkId}.`);
				}

				let upsertedTags: { id: number; name: string }[] = [];
				if (tagsToUpsert.length > 0) {
					const { data: upsertResult, error: upsertError } = await supabase
						.from("tags")
						.upsert(tagsToUpsert, {
							onConflict: "name",
							ignoreDuplicates: false,
						}) // Ensure ignoreDuplicates is false or default
						.select("id, name"); // Select to get IDs

					if (upsertError) {
						console.error(
							`Error upserting tags for link ID ${linkId}:`,
							upsertError.message,
						);
						// Decide whether to proceed without tags or fail
						throw upsertError; // Failing for now
					}
					upsertedTags = upsertResult || [];
					console.log(
						`Upserted/found ${upsertedTags.length} tags for link ID: ${linkId}`,
					);
				}

				// 6. Manage link_tags associations
				// 6a. Delete existing associations for this link
				const { error: deleteError } = await supabase
					.from("link_tags")
					.delete()
					.eq("link_id", linkId);

				if (deleteError) {
					console.error(
						`Error deleting old tag associations for link ID ${linkId}:`,
						deleteError.message,
					);
					throw deleteError;
				}

				// 6b. Insert new associations
				if (upsertedTags.length > 0) {
					const newLinkTags = upsertedTags.map((tag) => ({
						link_id: linkId,
						tag_id: tag.id,
					}));
					const { error: insertLinkTagsError } = await supabase
						.from("link_tags")
						.insert(newLinkTags);

					if (insertLinkTagsError) {
						console.error(
							`Error inserting new tag associations for link ID ${linkId}:`,
							insertLinkTagsError.message,
						);
						throw insertLinkTagsError;
					}
				}

				// 7. Update the links table with the summary
				const now = new Date().toISOString();
				const { error: updateLinkError } = await supabase
					.from("links")
					.update({
						summary: openAIResult.summary, // Store just the summary text
						summary_status: "success",
						summary_error: null,
						summary_created_at: now, // Consider if this should be updated or kept
						summary_updated_at: now,
					})
					.eq("id", linkId);

				if (updateLinkError) {
					console.error(
						`Error updating link summary for link ID ${linkId}:`,
						updateLinkError.message,
					);
					// Don't throw here, as summarization & tagging might have succeeded partially
				} else {
					console.log(`Successfully summarized and tagged link ID: ${linkId}`);
				}
			} catch (err: any) {
				const errorMessage =
					err.message || "Unknown summarization or tagging error";
				console.error(`Error processing link ID ${linkId}:`, errorMessage);
				// Update link status to failed
				const { error: updateError } = await supabase
					.from("links")
					.update({
						summary_status: "failed",
						summary_error: errorMessage,
						summary_updated_at: new Date().toISOString(),
					})
					.eq("id", linkId);

				if (updateError) {
					console.error(
						`Error updating DB with summarization error for link ID ${linkId}:`,
						updateError.message,
					);
				}
			}
		}),
	);

	await Promise.all(summaryPromises);

	console.log("Summarization process finished.");
}
