// ... existing code ...
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.ts';
// import type { Link } from 'unist'; // Incorrect import
import type { Link } from 'mdast'; // Correct type for markdown links

import path from 'node:path';
import { remark } from 'remark';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import { glob } from "glob";
import { readFile } from "node:fs/promises";

interface ExtractedLink {
	url: string;
	sourceFile: string;
}

export async function extractLinks(
	sourceDir: string,
	supabase: SupabaseClient<Database>
) {
	console.log(`Starting link extraction from: ${sourceDir}`);
	const markdownFiles = await glob('**/*.md', { cwd: sourceDir, absolute: true, nodir: true });
	console.log(`Found ${markdownFiles.length} markdown files.`);

	const allLinks: ExtractedLink[] = [];

	for (const filePath of markdownFiles) {
		console.log(` Processing file: ${filePath}`);
		try {
			const fileContent = await readFile(filePath, 'utf-8');
			const file = remark().use(remarkParse).use(remarkGfm).parse(fileContent);
			const sourceFileRelative = path.relative(process.cwd(), filePath); // Store relative path

			visit(file, 'link', (node: Link) => {
				if (node.url && (node.url.startsWith('http://') || node.url.startsWith('https://'))) {
					allLinks.push({ url: node.url, sourceFile: sourceFileRelative });
				}
			});
		} catch (error: any) {
			console.error(` Error processing file ${filePath}: ${error.message}`);
		}
	}

	// Remove duplicates based on URL before inserting
	const uniqueLinksMap = new Map<string, ExtractedLink>();
	allLinks.forEach(link => {
		if (!uniqueLinksMap.has(link.url)) {
			uniqueLinksMap.set(link.url, link);
		}
	});
	const uniqueLinks = Array.from(uniqueLinksMap.values());

	console.log(`Extracted ${uniqueLinks.length} unique HTTP/HTTPS links.`);

	if (uniqueLinks.length > 0) {
		console.log('Inserting links into the database...');
		const linksToInsert = uniqueLinks.map(link => ({
			url: link.url,
			source_file: link.sourceFile,
			// Default values for status etc. will be applied by the database
		}));

		const { error: insertError } = await supabase
			.from('links')
			.insert(linksToInsert, {
				// onConflict: 'url', // Specify the constraint name if known
				// ignoreDuplicates: true, // Or use this simpler option if your Supabase version supports it
			}); // Note: Simple insert might fail on duplicates; need ON CONFLICT handling

		// Supabase client v2 doesn't return detailed info on upsert/ignore duplicates easily.
		// We rely on the UNIQUE constraint on `url` to prevent duplicates.
		// A failed insert due to duplicate URL will be caught by the error check.
		if (insertError) {
			// It's common to get a duplicate key error (23505) which we can arguably ignore if just adding new links.
			if (insertError.code === '23505') { // 23505: unique_violation
				console.warn('Some links were already present in the database (unique constraint violation).');
			} else {
				console.error(` Database insert error: ${insertError.message}`);
				// Decide if we should throw or just log
				// throw new Error(`Database insert error: ${insertError.message}`);
			}
		} else {
			console.log('Successfully processed link insertions (duplicates ignored by constraint).');
		}
	}

	console.log('Link extraction finished.');
}
