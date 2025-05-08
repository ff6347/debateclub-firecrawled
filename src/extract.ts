import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.ts";
import type { ExtractedLink } from "./types.ts";
import type { Link } from "mdast"; // Correct type for markdown links

import path from "node:path";
import { remark } from "remark";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import { glob } from "glob";
import { readFile } from "node:fs/promises";
import {
	createUniqueLinks,
	insertLinks,
	importTagsForLinks,
} from "./common.ts";
import { ndjsonExtract } from "./ndjson.ts";
export async function extractLinks({
	sourceDir,
	supabase,
	isMarkdownMode,
}: {
	sourceDir: string;
	supabase: SupabaseClient<Database>;
	isMarkdownMode: boolean;
}) {
	console.log(`Starting link extraction from: ${sourceDir}`);
	let linksToInsert: ExtractedLink[] = [];
	if (isMarkdownMode) {
		linksToInsert = await markdownExtract(sourceDir);
	} else {
		linksToInsert = await ndjsonExtract(sourceDir);
	}
	await insertLinks(supabase, linksToInsert);
	if (!isMarkdownMode) {
		await importTagsForLinks(supabase, linksToInsert);
	}
}
async function markdownExtract(sourceDir: string): Promise<ExtractedLink[]> {
	const markdownFiles = await glob("**/*.{md,mdx,markdown,txt,html,mdc}", {
		cwd: sourceDir,
		absolute: true,
		nodir: true,
	});
	console.log(`Found ${markdownFiles.length} markdown files.`);

	const allLinks: ExtractedLink[] = [];

	for (const filePath of markdownFiles) {
		console.log(` Processing file: ${filePath}`);
		try {
			const fileContent = await readFile(filePath, "utf-8");
			const file = remark().use(remarkParse).use(remarkGfm).parse(fileContent);
			const sourceFileRelative = path.relative(process.cwd(), filePath); // Store relative path

			visit(file, "link", (node: Link) => {
				if (
					node.url &&
					(node.url.startsWith("http://") || node.url.startsWith("https://"))
				) {
					allLinks.push({ url: node.url, sourceFile: sourceFileRelative });
				}
			});
		} catch (error: any) {
			console.error(` Error processing file ${filePath}: ${error.message}`);
		}
	}

	// Remove duplicates based on URL before inserting
	const uniqueLinks = createUniqueLinks(allLinks);

	console.info(
		`[extract] Extracted ${uniqueLinks.length} unique HTTP/HTTPS links.`,
	);

	if (uniqueLinks.length > 0) {
		const linksToInsert: ExtractedLink[] = uniqueLinks.map(
			(link) =>
				({
					url: link.url,
					sourceFile: link.sourceFile,
					sourceJson: undefined,
					// Default values for status etc. will be applied by the database
				}) as unknown as ExtractedLink,
		);

		return linksToInsert;
	} else {
		return [];
	}
}
