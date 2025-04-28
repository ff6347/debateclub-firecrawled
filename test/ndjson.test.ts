import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { readNdjson } from "../src/ndjson.ts";

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
