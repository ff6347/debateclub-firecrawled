---
title: "Content collections"
source_url: "https://docs.astro.build/en/guides/content-collections/#defining-the-collection-loader"
word_count: 4400
reading_time: "22 min read"
date_converted: "2025-04-15T16:39:30.790Z"
---
# Content collections

**Added in:** `astro@2.0.0`

**Content collections** are the best way to manage sets of content in any Astro project. Collections help to organize and query your documents, enable Intellisense and type checking in your editor, and provide automatic TypeScript type-safety for all of your content. Astro v5.0 introduced the Content Layer API for defining and querying content collections. This performant, scalable API provides built-in content loaders for your local collections. For remote content, you can use third-party and community-built loaders or create your own custom loader and pull in your data from any source.

What are Content Collections?
-----------------------------

[Section titled What are Content Collections?](https://docs.astro.build/en/guides/content-collections/#what-are-content-collections)

You can define a **collection** from a set of data that is structurally similar. This can be a directory of blog posts, a JSON file of product items, or any data that represents multiple items of the same shape.

Collections stored locally in your project or on your filesystem can have entries of Markdown, MDX, Markdoc, YAML, or JSON files:

*   Directorysrc/
    
    *   …
    
*   Directory**newsletter/**
    
    *   week-1.md
    *   week-2.md
    *   week-3.md
    
*   Directory**authors/**
    
    *   authors.json
    

With an appropriate collection loader, you can fetch remote data from any external source, such as a CMS, database, or headless payment system.

TypeScript configuration for collections
----------------------------------------

[Section titled TypeScript configuration for collections](https://docs.astro.build/en/guides/content-collections/#typescript-configuration-for-collections)

Content collections rely on TypeScript to provide Zod validation, Intellisense and type checking in your editor. If you are not extending one of Astro’s `strict` or `strictest` TypeScript settings, you will need to ensure the following `compilerOptions` are set in your `tsconfig.json`:

```
{  // Included with "astro/tsconfigs/strict" or "astro/tsconfigs/strictest"  "extends": "astro/tsconfigs/base",  "compilerOptions": {    "strictNullChecks": true, // add if using `base` template    "allowJs": true // required, and included with all Astro templates  }}
```

Defining Collections
--------------------

[Section titled Defining Collections](https://docs.astro.build/en/guides/content-collections/#defining-collections)

Individual collections use `defineCollection()` to configure:

*   a `loader` for a data source (required)
*   a `schema` for type safety (optional, but highly recommended!)

### The collection config file

[Section titled The collection config file](https://docs.astro.build/en/guides/content-collections/#the-collection-config-file)

To define collections, you must create a `src/content.config.ts` file in your project (`.js` and `.mjs` extensions are also supported.) This is a special file that Astro will use to configure your content collections based on the following structure:

```
// 1. Import utilities from `astro:content`import { defineCollection, z } from 'astro:content';// 2. Import loader(s)import { glob, file } from 'astro/loaders';// 3. Define your collection(s)const blog = defineCollection({ /* ... */ });const dogs = defineCollection({ /* ... */ });// 4. Export a single `collections` object to register your collection(s)export const collections = { blog, dogs };
```

### Defining the collection `loader`

[Section titled Defining the collection loader](https://docs.astro.build/en/guides/content-collections/#defining-the-collection-loader)

The Content Layer API allows you to fetch your content (whether stored locally in your project or remotely) and uses a `loader` property to retrieve your data.

#### Built-in loaders

[Section titled Built-in loaders](https://docs.astro.build/en/guides/content-collections/#built-in-loaders)

Astro provides [two built-in loader functions](https://docs.astro.build/en/reference/content-loader-reference/#built-in-loaders) (`glob()` and `file()`) for fetching your local content, as well as access to the API to construct your own loader and fetch remote data.

The [`glob()` loader](https://docs.astro.build/en/reference/content-loader-reference/#glob-loader) creates entries from directories of Markdown, MDX, Markdoc, JSON, or YAML files from anywhere on the filesystem. It accepts a `pattern` of entry files to match using glob patterns supported by [micromatch](https://github.com/micromatch/micromatch#matching-features), and a base file path of where your files are located. Each entry’s `id` will be automatically generated from its file name. Use this loader when you have one file per entry.

The [`file()` loader](https://docs.astro.build/en/reference/content-loader-reference/#file-loader) creates multiple entries from a single local file. Each entry in the file must have a unique `id` key property. It accepts a `base` file path to your file and optionally a [`parser` function](https://docs.astro.build/en/guides/content-collections/#parser-function) for data files it cannot parse automatically. Use this loader when your data file can be parsed as an array of objects.

```
import { defineCollection, z } from 'astro:content';import { glob, file } from 'astro/loaders'; // Not available with legacy APIconst blog = defineCollection({  loader: glob({ pattern: "**/*.md", base: "./src/data/blog" }),  schema: /* ... */});const dogs = defineCollection({  loader: file("src/data/dogs.json"),  schema: /* ... */});const probes = defineCollection({  // `loader` can accept an array of multiple patterns as well as string patterns  // Load all markdown files in the space-probes directory, except for those that start with "voyager-"  loader: glob({ pattern: ['*.md', '!voyager-*'], base: 'src/data/space-probes' }),  schema: z.object({    name: z.string(),    type: z.enum(['Space Probe', 'Mars Rover', 'Comet Lander']),    launch_date: z.date(),    status: z.enum(['Active', 'Inactive', 'Decommissioned']),    destination: z.string(),    operator: z.string(),    notable_discoveries: z.array(z.string()),  }),});export const collections = { blog, dogs, probes };
```

##### `parser` function

[Section titled parser function](https://docs.astro.build/en/guides/content-collections/#parser-function)

The `file()` loader accepts a second argument that defines a `parser` function. This allows you to specify a custom parser (e.g. `toml.parse` or `csv-parse`) to create a collection from a file’s contents.

The `file()` loader will automatically detect and parse a single array of objects from JSON and YAML files (based on their file extension) with no need for a `parser` unless you have a [nested JSON document](https://docs.astro.build/en/guides/content-collections/#nested-json-documents). To use other files, such as `.toml` and `.csv`, you will need a to create a parser function.

The following example defines a content collection `dogs` using a `.toml` file:

```
[[dogs]]id = "..."age = "..."[[dogs]]id = "..."age = "..."
```

After importing TOML’s parser, you can load the `dogs` collection into your project by passing both a file path and `parser` function to the `file()` loader. A similar process can be used to define a `cats` collection from a `.csv` file:

```
import { defineCollection } from "astro:content";import { file } from "astro/loaders";import { parse as parseToml } from "toml";import { parse as parseCsv } from "csv-parse/sync";const dogs = defineCollection({  loader: file("src/data/dogs.toml", { parser: (text) => parseToml(text).dogs }),  schema: /* ... */})const cats = defineCollection({  loader: file("src/data/cats.csv", { parser: (text) => parseCsv(text, { columns: true, skipEmptyLines: true })})});
```

###### Nested `.json` documents

[Section titled Nested .json documents](https://docs.astro.build/en/guides/content-collections/#nested-json-documents)

The `parser` argument also allows you to load a single collection from a nested JSON document. For example, this JSON file contains multiple collections:

```
{"dogs": [{}], "cats": [{}]}
```

You can separate these collections by passing a custom `parser` to the `file()` loader for each collection:

```
const dogs = defineCollection({  loader: file("src/data/pets.json", { parser: (text) => JSON.parse(text).dogs })});const cats = defineCollection({  loader: file("src/data/pets.json", { parser: (text) => JSON.parse(text).cats })});
```

#### Building a custom loader

[Section titled Building a custom loader](https://docs.astro.build/en/guides/content-collections/#building-a-custom-loader)

You can build a custom loader to fetch remote content from any data source, such as a CMS, a database, or an API endpoint.

Using a loader to fetch your data will automatically create a collection from your remote data. This gives you all the benefits of local collections, such as collection-specific API helpers such as `getCollection()` and `render()` to query and display your data, as well as schema validation.

You can define a loader inline, inside your collection, as an async function that returns an array of entries.

This is useful for loaders that don’t need to manually control how the data is loaded and stored. Whenever the loader is called, it will clear the store and reload all the entries.

```
const countries = defineCollection({  loader: async () => {    const response = await fetch("https://restcountries.com/v3.1/all");    const data = await response.json();    // Must return an array of entries with an id property, or an object with IDs as keys and entries as values    return data.map((country) => ({      id: country.cca3,      ...country,    }));  },  schema: /* ... */});
```

The returned entries are stored in the collection and can be queried using the `getCollection()` and `getEntry()` functions.

For more control over the loading process, you can use the Content Loader API to create a loader object. For example, with access to the `load` method directly, you can create a loader that allows entries to be updated incrementally or clears the store only when necessary.

Similar to creating an Astro integration or Vite plugin, you can [distribute your loader as an NPM package](https://docs.astro.build/en/reference/publish-to-npm/) that others can use in their projects.

### Defining the collection schema

[Section titled Defining the collection schema](https://docs.astro.build/en/guides/content-collections/#defining-the-collection-schema)

Schemas enforce consistent frontmatter or entry data within a collection through Zod validation. A schema **guarantees** that this data exists in a predictable form when you need to reference or query it. If any file violates its collection schema, Astro will provide a helpful error to let you know.

Schemas also power Astro’s automatic TypeScript typings for your content. When you define a schema for your collection, Astro will automatically generate and apply a TypeScript interface to it. The result is full TypeScript support when you query your collection, including property autocompletion and type-checking.

Every frontmatter or data property of your collection entries must be defined using a Zod data type:

```
import { defineCollection, z } from 'astro:content';import { glob, file } from 'astro/loaders'; // Not available with legacy APIconst blog = defineCollection({  loader: glob({ pattern: "**/*.md", base: "./src/data/blog" }),  schema: z.object({    title: z.string(),    description: z.string(),    pubDate: z.coerce.date(),    updatedDate: z.coerce.date().optional(),  })});const dogs = defineCollection({  loader: file("src/data/dogs.json"),  schema: z.object({    id: z.string(),    breed: z.string(),    temperament: z.array(z.string()),  }),});export const collections = { blog, dogs };
```

#### Defining datatypes with Zod

[Section titled Defining datatypes with Zod](https://docs.astro.build/en/guides/content-collections/#defining-datatypes-with-zod)

Astro uses [Zod](https://github.com/colinhacks/zod) to power its content schemas. With Zod, Astro is able to validate every file’s data within a collection _and_ provide automatic TypeScript types when you go to query content from inside your project.

To use Zod in Astro, import the `z` utility from `"astro:content"`. This is a re-export of the Zod library, and it supports all of the features of Zod.

```
// Example: A cheatsheet of many common Zod datatypesimport { z, defineCollection } from 'astro:content';defineCollection({  schema: z.object({    isDraft: z.boolean(),    title: z.string(),    sortOrder: z.number(),    image: z.object({      src: z.string(),      alt: z.string(),    }),    author: z.string().default('Anonymous'),    language: z.enum(['en', 'es']),    tags: z.array(z.string()),    footnote: z.string().optional(),    // In YAML, dates written without quotes around them are interpreted as Date objects    publishDate: z.date(), // e.g. 2024-09-17    // Transform a date string (e.g. "2022-07-08") to a Date object    updatedDate: z.string().transform((str) => new Date(str)),    authorContact: z.string().email(),    canonicalURL: z.string().url(),  })})
```

See [Zod’s README](https://github.com/colinhacks/zod) for complete documentation on how Zod works and what features are available.

##### Zod schema methods

[Section titled Zod schema methods](https://docs.astro.build/en/guides/content-collections/#zod-schema-methods)

All [Zod schema methods](https://zod.dev/?id=schema-methods) (e.g. `.parse()`, `.transform()`) are available, with some limitations. Notably, performing custom validation checks on images using `image().refine()` is unsupported.

#### Defining collection references

[Section titled Defining collection references](https://docs.astro.build/en/guides/content-collections/#defining-collection-references)

Collection entries can also “reference” other related entries.

With the [`reference()` function](https://docs.astro.build/en/reference/modules/astro-content/#reference) from the Collections API, you can define a property in a collection schema as an entry from another collection. For example, you can require that every `space-shuttle` entry includes a `pilot` property which uses the `pilot` collection’s own schema for type checking, autocomplete, and validation.

A common example is a blog post that references reusable author profiles stored as JSON, or related post URLs stored in the same collection:

```
import { defineCollection, reference, z } from 'astro:content';import { glob } from 'astro/loaders';const blog = defineCollection({  loader: glob({ pattern: '**/[^_]*.md', base: "./src/data/blog" }),  schema: z.object({    title: z.string(),    // Reference a single author from the `authors` collection by `id`    author: reference('authors'),    // Reference an array of related posts from the `blog` collection by `slug`    relatedPosts: z.array(reference('blog')),  })});const authors = defineCollection({  loader: glob({ pattern: '**/[^_]*.json', base: "./src/data/authors" }),  schema: z.object({    name: z.string(),    portfolio: z.string().url(),  })});export const collections = { blog, authors };
```

This example blog post specifies the `id`s of related posts and the `id` of the post author:

```
---title: "Welcome to my blog"author: ben-holmes # references `src/data/authors/ben-holmes.json`relatedPosts:- about-me # references `src/data/blog/about-me.md`- my-year-in-review # references `src/data/blog/my-year-in-review.md`---
```

These references will be transformed into objects containing a `collection` key and an `id` key, allowing you to easily [query them in your templates](https://docs.astro.build/en/guides/content-collections/#accessing-referenced-data).

### Defining custom IDs

[Section titled Defining custom IDs](https://docs.astro.build/en/guides/content-collections/#defining-custom-ids)

When using the `glob()` loader with Markdown, MDX, Markdoc, or JSON files, every content entry [`id`](https://docs.astro.build/en/reference/modules/astro-content/#id) is automatically generated in an URL-friendly format based on the content filename. The `id` is used to query the entry directly from your collection. It is also useful when creating new pages and URLs from your content.

You can override an entry’s generated `id` by adding your own `slug` property to the file frontmatter or data object for JSON files. This is similar to the “permalink” feature of other web frameworks.

```
---title: My Blog Postslug: my-custom-id/supports/slashes---Your blog post content here.
```

```
{  "title": "My Category",  "slug": "my-custom-id/supports/slashes",  "description": "Your category description here."}
```

Querying Collections
--------------------

[Section titled Querying Collections](https://docs.astro.build/en/guides/content-collections/#querying-collections)

Astro provides helper functions to query a collection and return one (or more) content entries.

*   [`getCollection()`](https://docs.astro.build/en/reference/modules/astro-content/#getcollection) fetches an entire collection and returns an array of entries.
*   [`getEntry()`](https://docs.astro.build/en/reference/modules/astro-content/#getentry) fetches a single entry from a collection.

These return entries with a unique `id`, a `data` object with all defined properties, and will also return a `body` containing the raw, uncompiled body of a Markdown, MDX, or Markdoc document.

```
import { getCollection, getEntry } from 'astro:content';// Get all entries from a collection.// Requires the name of the collection as an argument.const allBlogPosts = await getCollection('blog');// Get a single entry from a collection.// Requires the name of the collection and `id`const poodleData = await getEntry('dogs', 'poodle');
```

### Using content in Astro templates

[Section titled Using content in Astro templates](https://docs.astro.build/en/guides/content-collections/#using-content-in-astro-templates)

After querying your collections, you can access each entry’s content directly inside of your Astro component template. For example, you can create a list of links to your blog posts, displaying information from your entry’s frontmatter using the `data` property.

```
---import { getCollection } from 'astro:content';const posts = await getCollection('blog');---<h1>My posts</h1><ul>  {posts.map(post => (    <li><a href={`/blog/${post.id}`}>{post.data.title}</a></li>  ))}</ul>
```

#### Rendering body content

[Section titled Rendering body content](https://docs.astro.build/en/guides/content-collections/#rendering-body-content)

Once queried, you can render Markdown and MDX entries to HTML using the [`render()`](https://docs.astro.build/en/reference/modules/astro-content/#render) function property. Calling this function gives you access to rendered HTML content, including both a `<Content />` component and a list of all rendered headings.

```
---import { getEntry, render } from 'astro:content';const entry = await getEntry('blog', 'post-1');if (!entry) {  // Handle Error, for example:  throw new Error('Could not find blog post 1');}const { Content, headings } = await render(entry);---<p>Published on: {entry.data.published.toDateString()}</p><Content />
```

#### Passing content as props

[Section titled Passing content as props](https://docs.astro.build/en/guides/content-collections/#passing-content-as-props)

A component can also pass an entire collection entry as a prop.

You can use the [`CollectionEntry`](https://docs.astro.build/en/reference/modules/astro-content/#collectionentry) utility to correctly type your component’s props using TypeScript. This utility takes a string argument that matches the name of your collection schema and will inherit all of the properties of that collection’s schema.

```
---import type { CollectionEntry } from 'astro:content';interface Props {  post: CollectionEntry<'blog'>;}// `post` will match your 'blog' collection schema typeconst { post } = Astro.props;---
```

### Filtering collection queries

[Section titled Filtering collection queries](https://docs.astro.build/en/guides/content-collections/#filtering-collection-queries)

`getCollection()` takes an optional “filter” callback that allows you to filter your query based on an entry’s `id` or `data` properties.

You can use this to filter by any content criteria you like. For example, you can filter by properties like `draft` to prevent any draft blog posts from publishing to your blog:

```
// Example: Filter out content entries with `draft: true`import { getCollection } from 'astro:content';const publishedBlogEntries = await getCollection('blog', ({ data }) => {  return data.draft !== true;});
```

You can also create draft pages that are available when running the dev server, but not built in production:

```
// Example: Filter out content entries with `draft: true` only when building for productionimport { getCollection } from 'astro:content';const blogEntries = await getCollection('blog', ({ data }) => {  return import.meta.env.PROD ? data.draft !== true : true;});
```

The filter argument also supports filtering by nested directories within a collection. Since the `id` includes the full nested path, you can filter by the start of each `id` to only return items from a specific nested directory:

```
// Example: Filter entries by sub-directory in the collectionimport { getCollection } from 'astro:content';const englishDocsEntries = await getCollection('docs', ({ id }) => {  return id.startsWith('en/');});
```

### Accessing referenced data

[Section titled Accessing referenced data](https://docs.astro.build/en/guides/content-collections/#accessing-referenced-data)

Any [references defined in your schema](https://docs.astro.build/en/guides/content-collections/#defining-collection-references) must be queried separately after first querying your collection entry. Since the [`reference()` function](https://docs.astro.build/en/reference/modules/astro-content/#reference) transforms a reference to an object with `collection` and `id` as keys, you can use the `getEntry()` function to return a single referenced item, or `getEntries()` to retrieve multiple referenced entries from the returned `data` object.

```
---import { getEntry, getEntries } from 'astro:content';const blogPost = await getEntry('blog', 'welcome');// Resolve a singular reference (e.g. `{collection: "authors", id: "ben-holmes"}`)const author = await getEntry(blogPost.data.author);// Resolve an array of references// (e.g. `[{collection: "blog", id: "about-me"}, {collection: "blog", id: "my-year-in-review"}]`)const relatedPosts = await getEntries(blogPost.data.relatedPosts);---<h1>{blogPost.data.title}</h1><p>Author: {author.data.name}</p><!-- ... --><h2>You might also like:</h2>{relatedPosts.map(post => (  <a href={post.id}>{post.data.title}</a>))}
```

Generating Routes from Content
------------------------------

[Section titled Generating Routes from Content](https://docs.astro.build/en/guides/content-collections/#generating-routes-from-content)

Content collections are stored outside of the `src/pages/` directory. This means that no pages or routes are generated for your collection items by default.

You will need to manually create a new [dynamic route](https://docs.astro.build/en/guides/routing/#dynamic-routes) if you want to generate HTML pages for each of your collection entries, such as individual blog posts. Your dynamic route will map the incoming request param (e.g. `Astro.params.slug` in `src/pages/blog/[...slug].astro`) to fetch the correct entry for each page.

The exact method for generating routes will depend on whether your pages are prerendered (default) or rendered on demand by a server.

### Building for static output (default)

[Section titled Building for static output (default)](https://docs.astro.build/en/guides/content-collections/#building-for-static-output-default)

If you are building a static website (Astro’s default behavior), use the [`getStaticPaths()`](https://docs.astro.build/en/reference/routing-reference/#getstaticpaths) function to create multiple pages from a single page component (e.g. `src/pages/[slug]`) during your build.

Call `getCollection()` inside of `getStaticPaths()` to have your collection data available for building static routes. Then, create the individual URL paths using the `id` property of each content entry. Each page is passed the entire collection entry as a prop for [use in your page template](https://docs.astro.build/en/guides/content-collections/#using-content-in-astro-templates).

```
---import { getCollection, render } from 'astro:content';// 1. Generate a new path for every collection entryexport async function getStaticPaths() {  const posts = await getCollection('blog');  return posts.map(post => ({    params: { id: post.id },    props: { post },  }));}// 2. For your template, you can get the entry directly from the propconst { post } = Astro.props;const { Content } = await render(post);---<h1>{post.data.title}</h1><Content />
```

This will generate a page route for every entry in the `blog` collection. For example, an entry at `src/blog/hello-world.md` will have an `id` of `hello-world`, and therefore its final URL will be `/posts/hello-world/`.

### Building for server output (SSR)

[Section titled Building for server output (SSR)](https://docs.astro.build/en/guides/content-collections/#building-for-server-output-ssr)

If you are building a dynamic website (using Astro’s SSR support), you are not expected to generate any paths ahead of time during the build. Instead, your page should examine the request (using `Astro.request` or `Astro.params`) to find the `slug` on-demand, and then fetch it using [`getEntry()`](https://docs.astro.build/en/reference/modules/astro-content/#getentry).

```
---import { getEntry, render } from "astro:content";// 1. Get the slug from the incoming server requestconst { id } = Astro.params;if (id === undefined) {  return Astro.redirect("/404");}// 2. Query for the entry directly using the request slugconst post = await getEntry("blog", id);// 3. Redirect if the entry does not existif (post === undefined) {  return Astro.redirect("/404");}// 4. Render the entry to HTML in the templateconst { Content } = await render(post);---<h1>{post.data.title}</h1><Content />
```

When to create a collection
---------------------------

[Section titled When to create a collection](https://docs.astro.build/en/guides/content-collections/#when-to-create-a-collection)

You can [create a collection](https://docs.astro.build/en/guides/content-collections/#defining-collections) any time you have a group of related data or content that shares a common structure.

Much of the benefit of using collections comes from:

*   Defining a common data shape to validate that an individual entry is “correct” or “complete”, avoiding errors in production.
*   Content-focused APIs designed to make querying intuitive (e.g. `getCollection()` instead of `import.meta.glob()`) when importing and rendering content on your pages.
*   A [Content Loader API](https://docs.astro.build/en/reference/content-loader-reference/) for retrieving your content that provides both built-in loaders and access to the low-level API. There are several third-party and community-built loaders available, and you can build your own custom loader to fetch data from anywhere.
*   Performance and scalability. The Content Layer API allows data to be cached between builds and is suitable for tens of thousands of content entries.

[Define your data](https://docs.astro.build/en/guides/content-collections/#defining-collections) as a collection when:

*   You have multiple files or data to organize that share the same overall structure (e.g. blog posts written in Markdown which all have the same frontmatter properties).
*   You have existing content stored remotely, such as in a CMS, and want to take advantage of the collections helper functions and Content Layer API instead of using `fetch()` or SDKs.
*   You need to fetch (tens of) thousands of related pieces of data, and need a querying and caching method that handles at scale.

### When not to create a collection

[Section titled When not to create a collection](https://docs.astro.build/en/guides/content-collections/#when-not-to-create-a-collection)

Collections provide excellent structure, safety, and organization when you have **multiple pieces of content that must share the same properties**.

Collections **may not be your solution** if:

*   You have only one or a small number of different pages. Consider [making individual page components](https://docs.astro.build/en/basics/astro-pages/) such as `src/pages/about.astro` with your content directly instead.
*   You are displaying files that are not processed by Astro, such as PDFs. Place these static assets in the [`public/` directory](https://docs.astro.build/en/basics/project-structure/#public) of your project instead.
*   Your data source has its own SDK/client library for imports that is incompatible with or does not offer a content loader and you prefer to use it directly.
*   You are using APIs that need to be updated in real time. Content collections are only updated at build time, so if you need live data, use other methods of [importing files](https://docs.astro.build/en/guides/imports/#import-statements) or [fetching data](https://docs.astro.build/en/guides/data-fetching/) with [on-demand rendering](https://docs.astro.build/en/guides/on-demand-rendering/).

## Links

- [](https://idx.dev/?utm_source=astro&utm_medium=astro&utm_campaign=astro)
- [Accessing referenced data](https://docs.astro.build/en/guides/content-collections/#accessing-referenced-data)
- [Actions](https://docs.astro.build/en/guides/actions/)
- [Adapter API](https://docs.astro.build/en/reference/adapter-reference/)
- [Add an RSS feed](https://docs.astro.build/en/recipes/rss/)
- [Add i18n features](https://docs.astro.build/en/recipes/i18n/)
- [Add icons to external links](https://docs.astro.build/en/recipes/external-links/)
- [Add last modified time](https://docs.astro.build/en/recipes/modified-time/)
- [Add reading time](https://docs.astro.build/en/recipes/reading-time/)
- [Alpine.js](https://docs.astro.build/en/guides/integrations-guide/alpinejs/)
- [Analyze bundle size](https://docs.astro.build/en/recipes/analyze-bundle-size/)
- [ApostropheCMS](https://docs.astro.build/en/guides/cms/apostrophecms/)
- [Appwrite](https://docs.astro.build/en/guides/backend/appwriteio/)
- [Astro DB](https://docs.astro.build/en/guides/astro-db/)
- [Astro integrations directory](https://astro.build/integrations/?search=&categories%5B%5D=loaders)
- [astro:actions](https://docs.astro.build/en/reference/modules/astro-actions/)
- [astro:assets](https://docs.astro.build/en/reference/modules/astro-assets/)
- [astro:config](https://docs.astro.build/en/reference/modules/astro-config/)
- [astro:content](https://docs.astro.build/en/reference/modules/astro-content/)
- [astro:env](https://docs.astro.build/en/reference/modules/astro-env/)
- [astro:i18n](https://docs.astro.build/en/reference/modules/astro-i18n/)
- [astro:middleware](https://docs.astro.build/en/reference/modules/astro-middleware/)
- [astro:transitions](https://docs.astro.build/en/reference/modules/astro-transitions/)
- [Authentication](https://docs.astro.build/en/guides/authentication/)
- [AWS](https://docs.astro.build/en/guides/deploy/aws/)
- [Azion](https://docs.astro.build/en/guides/deploy/azion/)
- [Backend services overview](https://docs.astro.build/en/guides/backend/)
- [blog tutorial demo code on GitHub](https://github.com/withastro/blog-tutorial-demo/tree/content-collections/src/pages)
- [Buddy](https://docs.astro.build/en/guides/deploy/buddy/)
- [Build a custom image component](https://docs.astro.build/en/recipes/build-custom-img-component/)
- [Build forms with API routes](https://docs.astro.build/en/recipes/build-forms-api/)
- [Build HTML forms in Astro pages](https://docs.astro.build/en/recipes/build-forms/)
- [Build your Astro site with Docker](https://docs.astro.build/en/recipes/docker/)
- [Builder.io](https://docs.astro.build/en/guides/cms/builderio/)
- [Building for server output (SSR)](https://docs.astro.build/en/guides/content-collections/#building-for-server-output-ssr)
- [Building for static output (default)](https://docs.astro.build/en/guides/content-collections/#building-for-static-output-default)
- [ButterCMS](https://docs.astro.build/en/guides/cms/buttercms/)
- [Caisy](https://docs.astro.build/en/guides/cms/caisy/)
- [Call endpoints from the server](https://docs.astro.build/en/recipes/call-endpoints/)
- [Cleavr](https://docs.astro.build/en/guides/deploy/cleavr/)
- [Clever Cloud](https://docs.astro.build/en/guides/deploy/clever-cloud/)
- [CLI Commands](https://docs.astro.build/en/reference/cli-reference/)
- [Client prerendering](https://docs.astro.build/en/reference/experimental-flags/client-prerender/)
- [CloudCannon](https://docs.astro.build/en/guides/cms/cloudcannon/)
- [Cloudflare](https://docs.astro.build/en/guides/deploy/cloudflare/)
- [Cloudinary](https://docs.astro.build/en/guides/media/cloudinary/)
- [CMS overview](https://docs.astro.build/en/guides/cms/)
- [CollectionEntry type](https://docs.astro.build/en/reference/modules/astro-content/#collectionentry)
- [Components](https://docs.astro.build/en/basics/astro-components/)
- [Configuration overview](https://docs.astro.build/en/guides/configuring-astro/)
- [Configuration Reference](https://docs.astro.build/en/reference/configuration-reference/)
- [Configuring experimental flags](https://docs.astro.build/en/reference/experimental-flags/)
- [Container API (experimental)](https://docs.astro.build/en/reference/container-reference/)
- [Content collections](https://docs.astro.build/en/guides/content-collections/)
- [Content Loader API](https://docs.astro.build/en/reference/content-loader-reference/)
- [Contentful](https://docs.astro.build/en/guides/cms/contentful/)
- [Contribute to Astro](https://docs.astro.build/en/contribute/)
- [Cosmic](https://docs.astro.build/en/guides/cms/cosmic/)
- [Craft CMS](https://docs.astro.build/en/guides/cms/craft-cms/)
- [Create a dev toolbar app](https://docs.astro.build/en/recipes/making-toolbar-apps/)
- [Create React App](https://docs.astro.build/en/guides/migrate-to-astro/from-create-react-app/)
- [Crystallize](https://docs.astro.build/en/guides/cms/crystallize/)
- [Data fetching](https://docs.astro.build/en/guides/data-fetching/)
- [DatoCMS](https://docs.astro.build/en/guides/cms/datocms/)
- [DB](https://docs.astro.build/en/guides/integrations-guide/db/)
- [Decap CMS](https://docs.astro.build/en/guides/cms/decap-cms/)
- [Defining Collections](https://docs.astro.build/en/guides/content-collections/#defining-collections)
- [Defining custom IDs](https://docs.astro.build/en/guides/content-collections/#defining-custom-ids)
- [Defining the collection loader](https://docs.astro.build/en/guides/content-collections/#defining-the-collection-loader)
- [Defining the collection schema](https://docs.astro.build/en/guides/content-collections/#defining-the-collection-schema)
- [Deno](https://docs.astro.build/en/guides/deploy/deno/)
- [Deployment overview](https://docs.astro.build/en/guides/deploy/)
- [Dev toolbar](https://docs.astro.build/en/guides/dev-toolbar/)
- [Dev Toolbar App API](https://docs.astro.build/en/reference/dev-toolbar-app-reference/)
- [Develop and build](https://docs.astro.build/en/develop-and-build/)
- [Digital Asset Management overview](https://docs.astro.build/en/guides/media/)
- [Directus](https://docs.astro.build/en/guides/cms/directus/)
- [Discord](https://astro.build/chat)
- [Docusaurus](https://docs.astro.build/en/guides/migrate-to-astro/from-docusaurus/)
- [Drupal](https://docs.astro.build/en/guides/cms/drupal/)
- [dynamic route](https://docs.astro.build/en/guides/routing/#dynamic-routes)
- [Dynamically import images](https://docs.astro.build/en/recipes/dynamically-importing-images/)
- [E-commerce](https://docs.astro.build/en/guides/ecommerce/)
- [Edgio](https://docs.astro.build/en/guides/deploy/edgio/)
- [Edit page](https://github.com/withastro/docs/edit/main/src/content/docs/en/guides/content-collections.mdx)
- [Editor setup](https://docs.astro.build/en/editor-setup/)
- [Eleventy](https://docs.astro.build/en/guides/migrate-to-astro/from-eleventy/)
- [Endpoints](https://docs.astro.build/en/guides/endpoints/)
- [Environment variables](https://docs.astro.build/en/guides/environment-variables/)
- [Error reference](https://docs.astro.build/en/reference/error-reference/)
- [file() loader](https://docs.astro.build/en/reference/content-loader-reference/#file-loader)
- [Filtering collection queries](https://docs.astro.build/en/guides/content-collections/#filtering-collection-queries)
- [Firebase](https://docs.astro.build/en/guides/backend/google-firebase/)
- [Fleek](https://docs.astro.build/en/guides/deploy/fleek/)
- [Flightcontrol](https://docs.astro.build/en/guides/deploy/flightcontrol/)
- [Flotiq](https://docs.astro.build/en/guides/cms/flotiq/)
- [Fly.io](https://docs.astro.build/en/guides/deploy/flyio/)
- [Fonts](https://docs.astro.build/en/reference/experimental-flags/fonts/)
- [Front Matter CMS](https://docs.astro.build/en/guides/cms/frontmatter-cms/)
- [Front-end frameworks](https://docs.astro.build/en/guides/framework-components/)
- [Gatsby](https://docs.astro.build/en/guides/migrate-to-astro/from-gatsby/)
- [Generating Routes from Content](https://docs.astro.build/en/guides/content-collections/#generating-routes-from-content)
- [Get 20% off](https://learnastro.dev/?code=ASTRO_PROMO)
- [getCollection()](https://docs.astro.build/en/reference/modules/astro-content/#getcollection)
- [getEntry()](https://docs.astro.build/en/reference/modules/astro-content/#getentry)
- [getStaticPaths()](https://docs.astro.build/en/reference/routing-reference/#getstaticpaths)
- [Ghost](https://docs.astro.build/en/guides/cms/ghost/)
- [GitBook](https://docs.astro.build/en/guides/migrate-to-astro/from-gitbook/)
- [GitCMS](https://docs.astro.build/en/guides/cms/gitcms/)
- [GitHub](https://github.com/withastro/astro)
- [GitHub Pages](https://docs.astro.build/en/guides/deploy/github/)
- [GitLab Pages](https://docs.astro.build/en/guides/deploy/gitlab/)
- [glob() loader](https://docs.astro.build/en/reference/content-loader-reference/#glob-loader)
- [Google Cloud](https://docs.astro.build/en/guides/deploy/google-cloud/)
- [Google Firebase](https://docs.astro.build/en/guides/deploy/google-firebase/)
- [Gridsome](https://docs.astro.build/en/guides/migrate-to-astro/from-gridsome/)
- [Guides and recipes](https://docs.astro.build/en/guides/content-collections/#__tab-guides-and-recipes)
- [Hashnode](https://docs.astro.build/en/guides/cms/hashnode/)
- [Heroku](https://docs.astro.build/en/guides/deploy/heroku/)
- [Hugo](https://docs.astro.build/en/guides/migrate-to-astro/from-hugo/)
- [Hygraph](https://docs.astro.build/en/guides/cms/hygraph/)
- [id](https://docs.astro.build/en/reference/modules/astro-content/#id)
- [Image Service API](https://docs.astro.build/en/reference/image-service-reference/)
- [Images](https://docs.astro.build/en/guides/images/)
- [importing files](https://docs.astro.build/en/guides/imports/#import-statements)
- [Imports reference](https://docs.astro.build/en/guides/imports/)
- [Installation](https://docs.astro.build/en/install-and-setup/)
- [Installing a Vite or Rollup plugin](https://docs.astro.build/en/recipes/add-yaml-support/)
- [Integration API](https://docs.astro.build/en/reference/integrations-reference/)
- [Integrations](https://docs.astro.build/en/guides/content-collections/#__tab-integrations)
- [Integrations overview](https://docs.astro.build/en/guides/integrations-guide/)
- [Intellisense for collections](https://docs.astro.build/en/reference/experimental-flags/content-intellisense/)
- [Internationalization (i18n)](https://docs.astro.build/en/guides/internationalization/)
- [Islands architecture](https://docs.astro.build/en/concepts/islands/)
- [Jekyll](https://docs.astro.build/en/guides/migrate-to-astro/from-jekyll/)
- [Keystatic](https://docs.astro.build/en/guides/cms/keystatic/)
- [KeystoneJS](https://docs.astro.build/en/guides/cms/keystonejs/)
- [Kinsta](https://docs.astro.build/en/guides/deploy/kinsta/)
- [Kontent.ai](https://docs.astro.build/en/guides/cms/kontent-ai/)
- [Layouts](https://docs.astro.build/en/basics/layouts/)
- [Legacy flags](https://docs.astro.build/en/reference/legacy-flags/)
- [Markdoc](https://docs.astro.build/en/guides/integrations-guide/markdoc/)
- [Markdown](https://docs.astro.build/en/guides/markdown-content/)
- [Markdown heading ID compatibility](https://docs.astro.build/en/reference/experimental-flags/heading-id-compat/)
- [MDX](https://docs.astro.build/en/guides/integrations-guide/mdx/)
- [microCMS](https://docs.astro.build/en/guides/cms/microcms/)
- [micromatch](https://github.com/micromatch/micromatch#matching-features)
- [Microsoft Azure](https://docs.astro.build/en/guides/deploy/microsoft-azure/)
- [Middleware](https://docs.astro.build/en/guides/middleware/)
- [Neon](https://docs.astro.build/en/guides/backend/neon/)
- [nested JSON document](https://docs.astro.build/en/guides/content-collections/#nested-json-documents)
- [Netlify](https://docs.astro.build/en/guides/deploy/netlify/)
- [Next.js](https://docs.astro.build/en/guides/migrate-to-astro/from-nextjs/)
- [Node](https://docs.astro.build/en/guides/integrations-guide/node/)
- [NuxtJS](https://docs.astro.build/en/guides/migrate-to-astro/from-nuxtjs/)
- [On-demand rendering](https://docs.astro.build/en/guides/on-demand-rendering/)
- [Pages](https://docs.astro.build/en/basics/astro-pages/)
- [parser function](https://docs.astro.build/en/guides/content-collections/#parser-function)
- [Partytown](https://docs.astro.build/en/guides/integrations-guide/partytown/)
- [Payload CMS](https://docs.astro.build/en/guides/cms/payload/)
- [Pelican](https://docs.astro.build/en/guides/migrate-to-astro/from-pelican/)
- [Preact](https://docs.astro.build/en/guides/integrations-guide/preact/)
- [Prefetch](https://docs.astro.build/en/guides/prefetch/)
- [Prepr CMS](https://docs.astro.build/en/guides/cms/preprcms/)
- [Preserve scripts order](https://docs.astro.build/en/reference/experimental-flags/preserve-scripts-order/)
- [Prismic](https://docs.astro.build/en/guides/cms/prismic/)
- [Programmatic Astro API (experimental)](https://docs.astro.build/en/reference/programmatic-reference/)
- [Project structure](https://docs.astro.build/en/basics/project-structure/)
- [public/ directory](https://docs.astro.build/en/basics/project-structure/#public)
- [Publish to NPM](https://docs.astro.build/en/reference/publish-to-npm/)
- [Querying Collections](https://docs.astro.build/en/guides/content-collections/#querying-collections)
- [React](https://docs.astro.build/en/guides/integrations-guide/react/)
- [Recipes overview](https://docs.astro.build/en/recipes/)
- [Reference](https://docs.astro.build/en/guides/content-collections/#__tab-reference)
- [reference() function](https://docs.astro.build/en/reference/modules/astro-content/#reference)
- [Render](https://docs.astro.build/en/guides/deploy/render/)
- [Render context](https://docs.astro.build/en/reference/api-reference/)
- [render()](https://docs.astro.build/en/reference/modules/astro-content/#render)
- [Responsive images](https://docs.astro.build/en/reference/experimental-flags/responsive-images/)
- [rest parameter (e.g. [...slug])](https://docs.astro.build/en/guides/routing/#rest-parameters)
- [Routing](https://docs.astro.build/en/guides/routing/)
- [Routing Reference](https://docs.astro.build/en/reference/routing-reference/)
- [Sanity](https://docs.astro.build/en/guides/cms/sanity/)
- [Scripts and event handling](https://docs.astro.build/en/guides/client-side-scripts/)
- [Section titled Building a custom loader](https://docs.astro.build/en/guides/content-collections/#building-a-custom-loader)
- [Section titled Built-in loaders](https://docs.astro.build/en/guides/content-collections/#built-in-loaders)
- [Section titled Defining collection references](https://docs.astro.build/en/guides/content-collections/#defining-collection-references)
- [Section titled Defining datatypes with Zod](https://docs.astro.build/en/guides/content-collections/#defining-datatypes-with-zod)
- [Section titled Inline loaders](https://docs.astro.build/en/guides/content-collections/#inline-loaders)
- [Section titled Loader objects](https://docs.astro.build/en/guides/content-collections/#loader-objects)
- [Section titled Passing content as props](https://docs.astro.build/en/guides/content-collections/#passing-content-as-props)
- [Section titled Rendering body content](https://docs.astro.build/en/guides/content-collections/#rendering-body-content)
- [Section titled Zod schema methods](https://docs.astro.build/en/guides/content-collections/#zod-schema-methods)
- [Sentry](https://docs.astro.build/en/guides/backend/sentry/)
- [Server islands](https://docs.astro.build/en/guides/server-islands/)
- [Sessions](https://docs.astro.build/en/guides/sessions/)
- [Share state between Astro components](https://docs.astro.build/en/recipes/sharing-state/)
- [Share state between islands](https://docs.astro.build/en/recipes/sharing-state-islands/)
- [Site migration overview](https://docs.astro.build/en/guides/migrate-to-astro/)
- [Sitecore XM](https://docs.astro.build/en/guides/cms/sitecore/)
- [Sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/)
- [Skip to content](https://docs.astro.build/en/guides/content-collections/#_top)
- [SolidJS](https://docs.astro.build/en/guides/integrations-guide/solid-js/)
- [Spinal](https://docs.astro.build/en/guides/cms/spinal/)
- [Sponsor](https://opencollective.com/astrodotbuild)
- [SST](https://docs.astro.build/en/guides/deploy/sst/)
- [Start](https://docs.astro.build/en/guides/content-collections/#__tab-start)
- [Statamic](https://docs.astro.build/en/guides/cms/statamic/)
- [Stormkit](https://docs.astro.build/en/guides/deploy/stormkit/)
- [Storyblok](https://docs.astro.build/en/guides/cms/storyblok/)
- [Strapi](https://docs.astro.build/en/guides/cms/strapi/)
- [StudioCMS](https://docs.astro.build/en/guides/cms/studiocms/)
- [Style rendered Markdown with Tailwind Typography](https://docs.astro.build/en/recipes/tailwind-rendered-markdown/)
- [Styles and CSS](https://docs.astro.build/en/guides/styling/)
- [Supabase](https://docs.astro.build/en/guides/backend/supabase/)
- [Surge](https://docs.astro.build/en/guides/deploy/surge/)
- [Svelte](https://docs.astro.build/en/guides/integrations-guide/svelte/)
- [SvelteKit](https://docs.astro.build/en/guides/migrate-to-astro/from-sveltekit/)
- [Syntax Highlighting](https://docs.astro.build/en/guides/syntax-highlighting/)
- [Template directives reference](https://docs.astro.build/en/reference/directives-reference/)
- [Template expressions reference](https://docs.astro.build/en/reference/astro-syntax/)
- [Testing](https://docs.astro.build/en/guides/testing/)
- [The collection config file](https://docs.astro.build/en/guides/content-collections/#the-collection-config-file)
- [Third-party services](https://docs.astro.build/en/guides/content-collections/#__tab-third-party-services)
- [Tina CMS](https://docs.astro.build/en/guides/cms/tina-cms/)
- [Translate this page](https://contribute.docs.astro.build/guides/i18n/)
- [Troubleshooting](https://docs.astro.build/en/guides/troubleshooting/)
- [Turso](https://docs.astro.build/en/guides/backend/turso/)
- [Tutorial: Build a blog](https://docs.astro.build/en/tutorial/0-introduction/)
- [two built-in loader functions](https://docs.astro.build/en/reference/content-loader-reference/#built-in-loaders)
- [TypeScript](https://docs.astro.build/en/guides/typescript/)
- [TypeScript configuration for collections](https://docs.astro.build/en/guides/content-collections/#typescript-configuration-for-collections)
- [Umbraco](https://docs.astro.build/en/guides/cms/umbraco/)
- [update any existing collections](https://docs.astro.build/en/guides/upgrade-to/v5/#legacy-v20-content-collections-api)
- [Upgrade Astro](https://docs.astro.build/en/upgrade-astro/)
- [Use Bun with Astro](https://docs.astro.build/en/recipes/bun/)
- [Using content in Astro templates](https://docs.astro.build/en/guides/content-collections/#using-content-in-astro-templates)
- [Using streaming to improve page performance](https://docs.astro.build/en/recipes/streaming-improve-page-performance/)
- [v1.0](https://docs.astro.build/en/guides/upgrade-to/v1/)
- [v2.0](https://docs.astro.build/en/guides/upgrade-to/v2/)
- [v3.0](https://docs.astro.build/en/guides/upgrade-to/v3/)
- [v4.0](https://docs.astro.build/en/guides/upgrade-to/v4/)
- [v5.0](https://docs.astro.build/en/guides/upgrade-to/v5/)
- [Vercel](https://docs.astro.build/en/guides/deploy/vercel/)
- [Verify a Captcha](https://docs.astro.build/en/recipes/captcha/)
- [View transitions](https://docs.astro.build/en/guides/view-transitions/)
- [Vue](https://docs.astro.build/en/guides/integrations-guide/vue/)
- [VuePress](https://docs.astro.build/en/guides/migrate-to-astro/from-vuepress/)
- [What are Content Collections?](https://docs.astro.build/en/guides/content-collections/#what-are-content-collections)
- [When not to create a collection](https://docs.astro.build/en/guides/content-collections/#when-not-to-create-a-collection)
- [When to create a collection](https://docs.astro.build/en/guides/content-collections/#when-to-create-a-collection)
- [Why Astro?](https://docs.astro.build/en/concepts/why-astro/)
- [Wordpress](https://docs.astro.build/en/guides/cms/wordpress/)
- [WordPress](https://docs.astro.build/en/guides/migrate-to-astro/from-wordpress/)
- [Xata](https://docs.astro.build/en/guides/backend/xata/)
- [Zeabur](https://docs.astro.build/en/guides/deploy/zeabur/)
- [Zerops](https://docs.astro.build/en/guides/deploy/zerops/)
- [Zod](https://github.com/colinhacks/zod)
- [Zod schema methods](https://zod.dev/?id=schema-methods)
