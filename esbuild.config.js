//@ts-check

import * as esbuild from 'esbuild';
import { sync } from 'glob';

const entryPoints = sync('./src/**/*.ts', {
	ignore: [
		'**/__tests__/**/*.ts',
		'**/__test-utils/**/*.ts',
		'**/*.test.ts',
		'node_modules/**',
	],
});
// process.exit(0);

esbuild
	.build({
		platform: 'node',
		sourcemap: true,
		treeShaking: true,
		banner: {
			js: '"use strict";',
		},
		target: ['esnext'],
		format: 'esm',
		entryPoints,
		outdir: './dist',
		tsconfig: 'tsconfig.json',
	})
	.then((result) => {
		console.info('Esbuild is processing these files:');
		console.info(entryPoints.join('\n'));
		if (result.outputFiles) {
			console.info(result.outputFiles);
		}
		if (result.warnings.length > 0) {
			console.warn(result.warnings);
		}
		if (result.errors.length > 0) {
			console.error(result.errors);
		}
		console.log('⚡ Esbuild is done');
	})
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
