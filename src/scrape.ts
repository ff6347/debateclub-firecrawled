import pLimit from 'p-limit';
import FirecrawlApp, { type ScrapeResponse, type ErrorResponse, type ScrapeParams } from '@mendable/firecrawl-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.ts';

// Define the type for a link record explicitly for clarity
type LinkRecord = Database['public']['Tables']['links']['Row'];
type LinkUpdate = Database['public']['Tables']['links']['Update'];

/**
 * Scrapes links from the database that haven't been scraped yet.
 *
 * @param supabase - The Supabase client instance.
 * @param concurrency - The maximum number of concurrent scrape operations.
 * @param firecrawlApiKey - Optional Firecrawl API key (uses env FIRECRAWL_API_KEY if not provided).
 * @param firecrawlApiUrl - Optional Firecrawl API URL (uses env FIRECRAWL_API_URL or default if not provided).
 */
export async function scrapePendingLinks(
	supabase: SupabaseClient<Database>,
	concurrency: number,
	firecrawlApiKey?: string,
	firecrawlApiUrl?: string
): Promise<void> {
	console.log('Fetching links needing scraping...');
	const { data: linksToScrape, error: fetchError } = await supabase
		.from('links')
		.select('id, url')
		.eq('crawl_status', 'pending');

	if (fetchError) {
		console.error('Error fetching links to scrape:', fetchError.message);
		throw fetchError;
	}

	if (!linksToScrape || linksToScrape.length === 0) {
		console.log('No links found with status \'pending\' for scraping.');
		return;
	}

	console.log(`Found ${linksToScrape.length} links to scrape.`);

	const apiKey = firecrawlApiKey || process.env['FIRECRAWL_API_KEY'] || null;
	if (!apiKey) {
		console.warn(
			'Warning: FIRECRAWL_API_KEY environment variable not set. Scraping might fail if the default plan requires an API key.'
		);
	}

	const firecrawl = new FirecrawlApp({ apiKey: apiKey, apiUrl: firecrawlApiUrl || null });
	const limit = pLimit(concurrency);

	console.log(`Starting scrape with concurrency ${concurrency}...`);

	const scrapePromises = linksToScrape.map((link) =>
		limit(async () => {
			console.log(`Attempting to scrape: ${link.url}`);
			try {
				// Pass parameters directly to scrapeUrl
				const scrapeParams: ScrapeParams = { formats: ['markdown'] };
				const scrapeResult = await firecrawl.scrapeUrl(link.url, scrapeParams);

				// Type guard: Check if it's a successful response before accessing properties
				if (scrapeResult.success) {
					// Inside this block, scrapeResult is inferred as ScrapeResponse
					if (!scrapeResult.markdown) {
						throw new Error('Scrape reported success but markdown content is missing.');
					}
					const content = scrapeResult.markdown;
					const metadata = scrapeResult.metadata;

					// Prepare data for update using the LinkUpdate type
					const updateData: LinkUpdate = {
						crawled_at: new Date().toISOString(),
						markdown_content: content,
						crawl_error: null,
						crawl_status: 'success',
						title: metadata?.title || null,
						description: metadata?.description || null,
						image_url: metadata?.ogImage || null,
					};

					// Process keywords if they exist and the column expects text[]
					if ('keywords' in updateData) {
						if (metadata?.keywords && typeof metadata.keywords === 'string') {
							updateData.keywords = metadata.keywords.split(',')
								.map((kw: string) => kw.trim())
								.filter((kw: string) => kw.length > 0);
						} else {
							updateData.keywords = null;
						}
					}

					console.log(`Successfully scraped: ${link.url}`);
					const { error: updateError } = await supabase
						.from('links')
						.update(updateData)
						.eq('id', link.id);

					if (updateError) {
						console.error(`Error updating DB for ${link.url}:`, updateError.message);
					}
				} else {
					const scrapeErrorMessage = typeof scrapeResult.error === 'string' ? scrapeResult.error : 'Unknown scrape error (success=false)';
					throw new Error(scrapeErrorMessage);
				}
			} catch (err: any) {
				const errorMessage = err.message || 'Unknown scrape error';
				console.error(`Error scraping ${link.url}:`, errorMessage);
				const { error: updateError } = await supabase
					.from('links')
					.update({
						crawled_at: new Date().toISOString(),
						crawl_error: errorMessage,
						crawl_status: 'failed',
					})
					.eq('id', link.id);

				if (updateError) {
					console.error(`Error updating DB with error for ${link.url}:`, updateError.message);
				}
			}
		})
	);

	await Promise.all(scrapePromises);

	console.log('Scraping process finished.');
}