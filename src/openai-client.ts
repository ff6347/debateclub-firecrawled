// import { fetch } from 'undici'; // Removed, fetch is global
import { setTimeout } from 'node:timers/promises';
import OpenAI from 'openai';

// Initialize OpenAI client
// The API key is read automatically from the OPENAI_API_KEY environment variable
const openai = new OpenAI();

// Define a type for the expected structure of the JSON response from OpenAI
// Adjust this based on the actual structure you expect from your prompt
interface OpenAISummaryResponse {
	summary: string;
	tags: string[];
}

/**
 * Type for the object returned by callOpenAI
 */
export interface OpenAIResult {
	summary: string;
	tags: string[];
}

/**
 * Calls the OpenAI API to generate a summary and tags for the given content.
 *
 * @param content - The content to summarize.
 * @param sourceUrl - The original URL of the content.
 * @param pageTitle - The title of the page.
 * @param pageDescription - The description of the page.
 * @param existingTagNames - Array of existing tag names from the database.
 * @returns An object containing the summary text and an array of tag strings.
 * @throws If the API call fails or returns an unexpected format.
 */
export async function callOpenAI(
	content: string,
	sourceUrl: string,
	pageTitle?: string | null,
	pageDescription?: string | null,
	existingTagNames: string[] = []
): Promise<OpenAIResult> {
	// Truncate content to avoid potential issues with very large inputs
	// Consider token limits of gpt-4.1-nano
	const MAX_CONTENT_LENGTH = 10000; // Adjust as needed based on token limits and typical content size
	const truncatedContent = content.length > MAX_CONTENT_LENGTH
		? content.substring(0, MAX_CONTENT_LENGTH) + '\n... [Content Truncated] ...'
		: content;

	const prompt = `Analyze the following content scraped from the URL: ${sourceUrl}

Page Title: ${pageTitle || 'N/A'}
Page Description: ${pageDescription || 'N/A'}

Existing Tags (Prefer these if relevant):
[${existingTagNames.length > 0 ? existingTagNames.join(', ') : 'No existing tags provided'}]

Instructions:
1. Provide a concise summary (2-4 sentences) of the main points of the content.
2. List 3-5 relevant keywords or topics as tags.

Return the response ONLY as a JSON object with the following structure:
{
  "summary": "Your concise summary here.",
  "tags": ["tag1", "tag2", "tag3"]
}`;

	const MAX_RETRIES = 3;
	const RETRY_DELAY_MS = 1000;
	const model = 'gpt-4.1-nano'; // Use the specified model

	for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
		try {
			console.log(`Attempting OpenAI call ${attempt}/${MAX_RETRIES} for ${sourceUrl}`);
			const completion = await openai.chat.completions.create({
				model: model,
				messages: [{ role: 'user', content: prompt }],
				temperature: 0.5, // Adjust temperature for desired creativity/determinism
				max_tokens: 500, // Adjust based on expected output size
				response_format: { type: 'json_object' }, // Ensure response is JSON
			});

			const responseText = completion.choices[0]?.message?.content;

			if (!responseText) {
				throw new Error('OpenAI response was empty.');
			}

			// Parse the JSON response
			let parsedResponse: OpenAISummaryResponse;
			try {
				parsedResponse = JSON.parse(responseText) as OpenAISummaryResponse;
				// Basic validation of the parsed structure
				if (typeof parsedResponse.summary !== 'string' || !Array.isArray(parsedResponse.tags)) {
					throw new Error('Parsed JSON does not match expected structure ({summary: string, tags: string[]}).');
				}
			} catch (parseError: any) {
				console.error('Error parsing OpenAI JSON response:', parseError.message);
				throw new Error(`Failed to parse OpenAI JSON response: ${parseError.message}`);
			}

			const summaryText = parsedResponse.summary.trim();
			const tags = parsedResponse.tags
				?.map(tag => String(tag).trim())
				?.filter(tag => tag.length > 0) || [];

			if (!summaryText && tags.length === 0) {
				throw new Error('OpenAI response contained an empty summary and no tags.');
			}

			// Return the result object
			return { summary: summaryText, tags: tags };

		} catch (error: any) {
			console.error(`Error calling OpenAI API (Attempt ${attempt}/${MAX_RETRIES}):`, error.message);
			if (attempt === MAX_RETRIES) {
				// If this was the last attempt, re-throw the error
				console.error(`OpenAI call failed after ${MAX_RETRIES} attempts for URL: ${sourceUrl}`);
				throw error; // Re-throw the original error to preserve details (like status code if available)
			}
			// Wait before the next retry
			console.log(`Waiting ${RETRY_DELAY_MS}ms before next OpenAI retry...`);
			await setTimeout(RETRY_DELAY_MS);
		}
	}

	// Should not be reached if retries are exhausted (error is thrown),
	// but need to satisfy TypeScript return type.
	throw new Error('OpenAI call failed after maximum retries.');
}