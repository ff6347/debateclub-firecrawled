import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { readNdjson } from "../src/ndjson.ts";
import { ndjsonExtract } from "../src/ndjson.ts";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../src/database.ts";

describe("readNdjson", () => {
	let tempDir: string;
	let validFilePath: string;
	let invalidJsonFilePath: string;
	let emptyFilePath: string;
	const nonExistentFilePath = "non-existent-file.ndjson";

	before(async () => {
		tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "ndjson-test-"));
		validFilePath = path.join(tempDir, "valid.ndjson");
		invalidJsonFilePath = path.join(tempDir, "invalid.ndjson");
		emptyFilePath = path.join(tempDir, "empty.ndjson");

		// Create sample files
		await fs.writeFile(
			validFilePath,
			'{"id": 1, "name": "Alice"}\n{"id": 2, "name": "Bob"}\n',
		);
		await fs.writeFile(
			invalidJsonFilePath,
			'{"id": 1, "name": "Alice"}\ninvalid json\n{"id": 3, "name": "Charlie"}',
		);
		await fs.writeFile(emptyFilePath, "");
	});

	after(async () => {
		await fs.rm(tempDir, { recursive: true, force: true });
	});

	test("should read and parse a valid NDJSON file", async () => {
		const result = await readNdjson(validFilePath);
		assert.deepStrictEqual(result, [
			{ id: 1, name: "Alice" },
			{ id: 2, name: "Bob" },
		]);
	});

	test("should return an empty array for an empty file", async () => {
		const result = await readNdjson(emptyFilePath);
		assert.deepStrictEqual(result, []);
	});

	test("should throw an error for a non-existent file", async () => {
		await assert.rejects(
			async () => await readNdjson(nonExistentFilePath),
			/File not found: non-existent-file.ndjson/,
		);
	});

	test("should reject with a parse error for invalid JSON content (strict mode)", async (t) => {
		// Mock console.error to prevent logging during test
		t.mock.method(console, "error", () => {});

		await assert.rejects(
			async () => await readNdjson(invalidJsonFilePath),
			(err: Error) => {
				assert.match(err.message, /Could not parse row/);
				return true; // Indicate that the error is expected
			},
		);
	});

	// Optional: Test non-strict mode if you implement that option in parse()
	// test('should skip invalid lines in non-strict mode', async () => {
	// 	// Modify parse to accept strict: false
	// 	// const result = await readNdjson(invalidJsonFilePath, { strict: false });
	// 	// assert.deepStrictEqual(result, [{ id: 1, name: 'Alice' }, { id: 3, name: 'Charlie' }]);
	// });
});

// Basic mock for SupabaseClient - replace with more specific mocks if needed
const mockSupabase = {} as unknown as SupabaseClient<Database>;

describe("ndjsonExtract", () => {
	let tempDir: string;
	let file1Path: string;
	let file2Path: string;
	let emptyFilePath: string;
	let nonNdjsonPath: string;

	const link1 = "https://example.com/page1";
	const link2 = "http://anothersite.org/resource";
	const row1 = { text: `Some text with [a link](${link1})`, tags: ["test"] };
	const row2 = { text: "Just text, no links.", tags: [] };
	const row3 = { text: `Another [link here](${link2})`, tags: ["another"] };

	before(async () => {
		tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "ndjson-extract-test-"));
		file1Path = path.join(tempDir, "file1.ndjson");
		file2Path = path.join(tempDir, "file2.ndjson");
		emptyFilePath = path.join(tempDir, "empty.ndjson");
		nonNdjsonPath = path.join(tempDir, "notes.txt");

		// Create sample files
		await fs.writeFile(
			file1Path,
			`${JSON.stringify(row1)}\n${JSON.stringify(row2)}\n`,
		);
		await fs.writeFile(file2Path, `${JSON.stringify(row3)}\n`);
		await fs.writeFile(emptyFilePath, "");
		await fs.writeFile(nonNdjsonPath, "this is not ndjson");
	});

	after(async () => {
		await fs.rm(tempDir, { recursive: true, force: true });
	});

	test("should extract links from all .ndjson files in a directory", async () => {
		// We don't need to mock insertLinks anymore as the function returns the links
		const result = await ndjsonExtract(tempDir);

		// Note: createUniqueLinks might change the order or remove duplicates if links were identical
		// We assume createUniqueLinks preserves order and handles uniqueness correctly here.
		// A more robust test might mock createUniqueLinks or check for presence regardless of order.
		assert.strictEqual(result.length, 2, "Should find 2 unique links");

		const expectedLinks = [
			{
				url: link1,
				source_file: path.relative(process.cwd(), file1Path),
				source_json: JSON.stringify(row1),
			},
			{
				url: link2,
				source_file: path.relative(process.cwd(), file2Path),
				source_json: JSON.stringify(row3),
			},
		];

		// Check if results contain the expected links (order might not be guaranteed depending on readdir)
		assert.ok(
			result.some(
				(r) =>
					r.url === link1 &&
					r.source_file === expectedLinks[0].source_file &&
					r.source_json === expectedLinks[0].source_json,
			),
			"Link 1 not found or incorrect",
		);
		assert.ok(
			result.some(
				(r) =>
					r.url === link2 &&
					r.source_file === expectedLinks[1].source_file &&
					r.source_json === expectedLinks[1].source_json,
			),
			"Link 2 not found or incorrect",
		);
	});

	test("should return an empty array if no .ndjson files are found", async (t) => {
		t.mock.method(console, "warn", () => {}); // Suppress warning log
		const emptyDir = await fs.mkdtemp(path.join(os.tmpdir(), "ndjson-empty-"));
		await fs.writeFile(path.join(emptyDir, "test.txt"), "hello"); // Add a non-ndjson file

		try {
			const result = await ndjsonExtract(emptyDir);
			assert.deepStrictEqual(result, [], "Result should be an empty array");
		} finally {
			await fs.rm(emptyDir, { recursive: true, force: true });
		}
	});

	test("should return an empty array for an empty directory", async (t) => {
		t.mock.method(console, "warn", () => {}); // Suppress warning log
		const emptyDir = await fs.mkdtemp(
			path.join(os.tmpdir(), "ndjson-empty-dir-"),
		);
		try {
			const result = await ndjsonExtract(emptyDir);
			assert.deepStrictEqual(result, [], "Result should be an empty array");
		} finally {
			await fs.rm(emptyDir, { recursive: true, force: true });
		}
	});

	test("should handle errors reading individual files and continue", async (t) => {
		t.mock.method(console, "error", () => {}); // Suppress error log for malformed file

		const errorDir = await fs.mkdtemp(path.join(os.tmpdir(), "ndjson-error-"));
		const validFilePath = path.join(errorDir, "valid.ndjson");
		const invalidFilePath = path.join(errorDir, "invalid.ndjson");

		const validRow = { text: `[Valid Link](https://valid.com)`, tags: [] };

		await fs.writeFile(validFilePath, `${JSON.stringify(validRow)}\n`);
		await fs.writeFile(invalidFilePath, "this is not json\n"); // File that causes readNdjson to error

		try {
			const result = await ndjsonExtract(errorDir);
			assert.strictEqual(
				result.length,
				1,
				"Should extract link from the valid file",
			);
			assert.strictEqual(result[0].url, "https://valid.com");
			assert.strictEqual(
				result[0].source_file,
				path.relative(process.cwd(), validFilePath),
			);
			assert.strictEqual(result[0].source_json, JSON.stringify(validRow));
		} finally {
			await fs.rm(errorDir, { recursive: true, force: true });
		}
	});
});
