---
title: "Scripts and event handling"
source_url: "https://docs.astro.build/en/guides/client-side-scripts/#client-side-scripts"
word_count: 1946
reading_time: "10 min read"
date_converted: "2025-04-15T17:28:19.462Z"
---
# Scripts and event handling

You can add interactivity to your Astro components without [using a UI framework](https://docs.astro.build/en/guides/framework-components/) like React, Svelte, Vue, etc. using standard HTML `<script>` tags. This allows you to send JavaScript to run in the browser and add functionality to your Astro components.

Client-Side Scripts
-------------------

[Section titled Client-Side Scripts](https://docs.astro.build/en/guides/client-side-scripts/#client-side-scripts)

Scripts can be used to add event listeners, send analytics data, play animations, and everything else JavaScript can do on the web.

```
<button data-confetti-button>Celebrate!</button><script>  // Import npm modules.  import confetti from 'canvas-confetti';  // Find our component DOM on the page.  const buttons = document.querySelectorAll('[data-confetti-button]');  // Add event listeners to fire confetti when a button is clicked.  buttons.forEach((button) => {    button.addEventListener('click', () => confetti());  });</script>
```

By default, Astro processes and bundles `<script>` tags, adding support for importing npm modules, writing TypeScript, and more.

Using `<script>` in Astro
-------------------------

[Section titled Using &lt;script&gt; in Astro](https://docs.astro.build/en/guides/client-side-scripts/#using-script-in-astro)

In `.astro` files, you can add client-side JavaScript by adding one (or more) `<script>` tags.

In this example, adding the `<Hello />` component to a page will log a message to the browser console.

```
<h1>Welcome, world!</h1><script>  console.log('Welcome, browser console!');</script>
```

### Script processing

[Section titled Script processing](https://docs.astro.build/en/guides/client-side-scripts/#script-processing)

By default, `<script>` tags are processed by Astro.

*   Any imports will be bundled, allowing you to import local files or Node modules.
*   The processed script will be injected at where it’s declared with [`type="module"`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules).
*   TypeScript is fully supported, including importing TypeScript files.
*   If your component is used several times on a page, the script will only be included once.

```
<script>  // Processed! Bundled! TypeScript-supported!  // Importing local scripts and Node modules works.</script>
```

The `type="module"` attribute makes the browser treat the script as a JavaScript module. This has several performance benefits:

*   Rendering is not blocked. The browser continues to process the rest of the HTML while the module script and its dependencies load.
*   The browser waits for HTML to be processed before executing module scripts. You do not need to listen for the “load” event.
*   `async` and `defer` attributes are unnecessary. Module scripts are always deferred.

### Opting out of processing

[Section titled Opting out of processing](https://docs.astro.build/en/guides/client-side-scripts/#opting-out-of-processing)

To prevent Astro from processing a script, add the `is:inline` directive.

```
<script is:inline>  // Will be rendered into the HTML exactly as written!  // Local imports are not resolved and will not work.  // If in a component, repeats each time the component is used.</script>
```

See our [directives reference](https://docs.astro.build/en/reference/directives-reference/#script--style-directives) page for more information about the directives available on `<script>` tags.

### Include JavaScript files on your page

[Section titled Include JavaScript files on your page](https://docs.astro.build/en/guides/client-side-scripts/#include-javascript-files-on-your-page)

You may want to write your scripts as separate `.js`/`.ts` files or need to reference an external script on another server. You can do this by referencing these in a `<script>` tag’s `src` attribute.

#### Import local scripts

[Section titled Import local scripts](https://docs.astro.build/en/guides/client-side-scripts/#import-local-scripts)

**When to use this:** when your script lives inside of `src/`.

Astro will build, optimize, and add these scripts to the page for you, following its [script processing rules](https://docs.astro.build/en/guides/client-side-scripts/#script-processing).

```
<!-- relative path to script at `src/scripts/local.js` --><script src="../scripts/local.js"></script><!-- also works for local TypeScript files --><script src="./script-with-types.ts"></script>
```

#### Load external scripts

[Section titled Load external scripts](https://docs.astro.build/en/guides/client-side-scripts/#load-external-scripts)

**When to use this:** when your JavaScript file lives inside of `public/` or on a CDN.

To load scripts outside of your project’s `src/` folder, include the `is:inline` directive. This approach skips the JavaScript processing, bundling, and optimizations that are provided by Astro when you import scripts as described above.

```
<!-- absolute path to a script at `public/my-script.js` --><script is:inline src="/my-script.js"></script><!-- full URL to a script on a remote server --><script is:inline src="https://my-analytics.com/script.js"></script>
```

Common script patterns
----------------------

[Section titled Common script patterns](https://docs.astro.build/en/guides/client-side-scripts/#common-script-patterns)

### Handle `onclick` and other events

[Section titled Handle onclick and other events](https://docs.astro.build/en/guides/client-side-scripts/#handle-onclick-and-other-events)

Some UI frameworks use custom syntax for event handling like `onClick={...}` (React/Preact) or `@click="..."` (Vue). Astro follows standard HTML more closely and does not use custom syntax for events.

Instead, you can use [`addEventListener`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) in a `<script>` tag to handle user interactions.

```
<button class="alert">Click me!</button><script>  // Find all buttons with the `alert` class on the page.  const buttons = document.querySelectorAll('button.alert');  // Handle clicks on each button.  buttons.forEach((button) => {    button.addEventListener('click', () => {      alert('Button was clicked!');    });  });</script>
```

### Web components with custom elements

[Section titled Web components with custom elements](https://docs.astro.build/en/guides/client-side-scripts/#web-components-with-custom-elements)

You can create your own HTML elements with custom behavior using the Web Components standard. Defining a [custom element](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) in a `.astro` component allows you to build interactive components without needing a UI framework library.

In this example, we define a new `<astro-heart>` HTML element that tracks how many times you click the heart button and updates the `<span>` with the latest count.

```
<!-- Wrap the component elements in our custom element “astro-heart”. --><astro-heart>  <button aria-label="Heart">💜</button> × <span>0</span></astro-heart><script>  // Define the behaviour for our new type of HTML element.  class AstroHeart extends HTMLElement {    connectedCallback() {      let count = 0;      const heartButton = this.querySelector('button');      const countSpan = this.querySelector('span');      // Each time the button is clicked, update the count.      heartButton.addEventListener('click', () => {        count++;        countSpan.textContent = count.toString();      });    }  }  // Tell the browser to use our AstroHeart class for <astro-heart> elements.  customElements.define('astro-heart', AstroHeart);</script>
```

There are two advantages to using a custom element here:

1.  Instead of searching the whole page using `document.querySelector()`, you can use `this.querySelector()`, which only searches within the current custom element instance. This makes it easier to work with only the children of one component instance at a time.
    
2.  Although a `<script>` only runs once, the browser will run our custom element’s `constructor()` method each time it finds `<astro-heart>` on the page. This means you can safely write code for one component at a time, even if you intend to use this component multiple times on a page.
    

### Pass frontmatter variables to scripts

[Section titled Pass frontmatter variables to scripts](https://docs.astro.build/en/guides/client-side-scripts/#pass-frontmatter-variables-to-scripts)

In Astro components, the code in [the frontmatter](https://docs.astro.build/en/basics/astro-components/#the-component-script) between the `---` fences runs on the server and is not available in the browser. To send variables from the server to the client, we need a way to store our variables and then read them when JavaScript runs in the browser.

One way to do this is to use [`data-*` attributes](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes) to store the value of variables in your HTML output. Scripts, including custom elements, can then read these attributes using an element’s `dataset` property once your HTML loads in the browser.

In this example component, a `message` prop is stored in a `data-message` attribute, so the custom element can read `this.dataset.message` and get the value of the prop in the browser.

```
---const { message = 'Welcome, world!' } = Astro.props;---<!-- Store the message prop as a data attribute. --><astro-greet data-message={message}>  <button>Say hi!</button></astro-greet><script>  class AstroGreet extends HTMLElement {    connectedCallback() {      // Read the message from the data attribute.      const message = this.dataset.message;      const button = this.querySelector('button');      button.addEventListener('click', () => {        alert(message);      });    }  }  customElements.define('astro-greet', AstroGreet);</script>
```

Now we can use our component multiple times and be greeted by a different message for each one.

```
---import AstroGreet from '../components/AstroGreet.astro';---<!-- Use the default message: “Welcome, world!” --><AstroGreet /><!-- Use custom messages passed as a props. --><AstroGreet message="Lovely day to build components!" /><AstroGreet message="Glad you made it! 👋" />
```

### Combining scripts and UI Frameworks

[Section titled Combining scripts and UI Frameworks](https://docs.astro.build/en/guides/client-side-scripts/#combining-scripts-and-ui-frameworks)

Elements rendered by a UI framework may not be available yet when a `<script>` tag executes. If your script also needs to handle [UI framework components](https://docs.astro.build/en/guides/framework-components/), using a custom element is recommended.

## Links

- [](https://idx.dev/?utm_source=astro&utm_medium=astro&utm_campaign=astro)
- [Actions](https://docs.astro.build/en/guides/actions/)
- [Adapter API](https://docs.astro.build/en/reference/adapter-reference/)
- [Add an RSS feed](https://docs.astro.build/en/recipes/rss/)
- [Add i18n features](https://docs.astro.build/en/recipes/i18n/)
- [Add icons to external links](https://docs.astro.build/en/recipes/external-links/)
- [Add last modified time](https://docs.astro.build/en/recipes/modified-time/)
- [Add reading time](https://docs.astro.build/en/recipes/reading-time/)
- [addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)
- [Alpine.js](https://docs.astro.build/en/guides/integrations-guide/alpinejs/)
- [Analyze bundle size](https://docs.astro.build/en/recipes/analyze-bundle-size/)
- [ApostropheCMS](https://docs.astro.build/en/guides/cms/apostrophecms/)
- [Appwrite](https://docs.astro.build/en/guides/backend/appwriteio/)
- [Astro DB](https://docs.astro.build/en/guides/astro-db/)
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
- [Buddy](https://docs.astro.build/en/guides/deploy/buddy/)
- [Build a custom image component](https://docs.astro.build/en/recipes/build-custom-img-component/)
- [Build forms with API routes](https://docs.astro.build/en/recipes/build-forms-api/)
- [Build HTML forms in Astro pages](https://docs.astro.build/en/recipes/build-forms/)
- [Build your Astro site with Docker](https://docs.astro.build/en/recipes/docker/)
- [Builder.io](https://docs.astro.build/en/guides/cms/builderio/)
- [ButterCMS](https://docs.astro.build/en/guides/cms/buttercms/)
- [Caisy](https://docs.astro.build/en/guides/cms/caisy/)
- [Call endpoints from the server](https://docs.astro.build/en/recipes/call-endpoints/)
- [Cleavr](https://docs.astro.build/en/guides/deploy/cleavr/)
- [Clever Cloud](https://docs.astro.build/en/guides/deploy/clever-cloud/)
- [CLI Commands](https://docs.astro.build/en/reference/cli-reference/)
- [Client prerendering](https://docs.astro.build/en/reference/experimental-flags/client-prerender/)
- [Client-Side Scripts](https://docs.astro.build/en/guides/client-side-scripts/#client-side-scripts)
- [CloudCannon](https://docs.astro.build/en/guides/cms/cloudcannon/)
- [Cloudflare](https://docs.astro.build/en/guides/deploy/cloudflare/)
- [Cloudinary](https://docs.astro.build/en/guides/media/cloudinary/)
- [CMS overview](https://docs.astro.build/en/guides/cms/)
- [Combining scripts and UI Frameworks](https://docs.astro.build/en/guides/client-side-scripts/#combining-scripts-and-ui-frameworks)
- [Common script patterns](https://docs.astro.build/en/guides/client-side-scripts/#common-script-patterns)
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
- [custom element](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements)
- [Data fetching](https://docs.astro.build/en/guides/data-fetching/)
- [data-* attributes](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes)
- [DatoCMS](https://docs.astro.build/en/guides/cms/datocms/)
- [DB](https://docs.astro.build/en/guides/integrations-guide/db/)
- [Decap CMS](https://docs.astro.build/en/guides/cms/decap-cms/)
- [Deno](https://docs.astro.build/en/guides/deploy/deno/)
- [Deployment overview](https://docs.astro.build/en/guides/deploy/)
- [Dev toolbar](https://docs.astro.build/en/guides/dev-toolbar/)
- [Dev Toolbar App API](https://docs.astro.build/en/reference/dev-toolbar-app-reference/)
- [Develop and build](https://docs.astro.build/en/develop-and-build/)
- [Digital Asset Management overview](https://docs.astro.build/en/guides/media/)
- [directives reference](https://docs.astro.build/en/reference/directives-reference/#script--style-directives)
- [Directus](https://docs.astro.build/en/guides/cms/directus/)
- [Discord](https://astro.build/chat)
- [Docusaurus](https://docs.astro.build/en/guides/migrate-to-astro/from-docusaurus/)
- [Drupal](https://docs.astro.build/en/guides/cms/drupal/)
- [Dynamically import images](https://docs.astro.build/en/recipes/dynamically-importing-images/)
- [E-commerce](https://docs.astro.build/en/guides/ecommerce/)
- [Edgio](https://docs.astro.build/en/guides/deploy/edgio/)
- [Edit page](https://github.com/withastro/docs/edit/main/src/content/docs/en/guides/client-side-scripts.mdx)
- [Editor setup](https://docs.astro.build/en/editor-setup/)
- [Eleventy](https://docs.astro.build/en/guides/migrate-to-astro/from-eleventy/)
- [Endpoints](https://docs.astro.build/en/guides/endpoints/)
- [Environment variables](https://docs.astro.build/en/guides/environment-variables/)
- [Error reference](https://docs.astro.build/en/reference/error-reference/)
- [Firebase](https://docs.astro.build/en/guides/backend/google-firebase/)
- [Fleek](https://docs.astro.build/en/guides/deploy/fleek/)
- [Flightcontrol](https://docs.astro.build/en/guides/deploy/flightcontrol/)
- [Flotiq](https://docs.astro.build/en/guides/cms/flotiq/)
- [Fly.io](https://docs.astro.build/en/guides/deploy/flyio/)
- [Fonts](https://docs.astro.build/en/reference/experimental-flags/fonts/)
- [Front Matter CMS](https://docs.astro.build/en/guides/cms/frontmatter-cms/)
- [Front-end frameworks](https://docs.astro.build/en/guides/framework-components/)
- [Gatsby](https://docs.astro.build/en/guides/migrate-to-astro/from-gatsby/)
- [Get 20% off](https://learnastro.dev/?code=ASTRO_PROMO)
- [Ghost](https://docs.astro.build/en/guides/cms/ghost/)
- [GitBook](https://docs.astro.build/en/guides/migrate-to-astro/from-gitbook/)
- [GitCMS](https://docs.astro.build/en/guides/cms/gitcms/)
- [GitHub](https://github.com/withastro/astro)
- [GitHub Pages](https://docs.astro.build/en/guides/deploy/github/)
- [GitLab Pages](https://docs.astro.build/en/guides/deploy/gitlab/)
- [Google Cloud](https://docs.astro.build/en/guides/deploy/google-cloud/)
- [Google Firebase](https://docs.astro.build/en/guides/deploy/google-firebase/)
- [Gridsome](https://docs.astro.build/en/guides/migrate-to-astro/from-gridsome/)
- [Guides and recipes](https://docs.astro.build/en/guides/client-side-scripts/#__tab-guides-and-recipes)
- [Handle onclick and other events](https://docs.astro.build/en/guides/client-side-scripts/#handle-onclick-and-other-events)
- [Hashnode](https://docs.astro.build/en/guides/cms/hashnode/)
- [Heroku](https://docs.astro.build/en/guides/deploy/heroku/)
- [Hugo](https://docs.astro.build/en/guides/migrate-to-astro/from-hugo/)
- [Hygraph](https://docs.astro.build/en/guides/cms/hygraph/)
- [Image Service API](https://docs.astro.build/en/reference/image-service-reference/)
- [Images](https://docs.astro.build/en/guides/images/)
- [Imports reference](https://docs.astro.build/en/guides/imports/)
- [Include JavaScript files on your page](https://docs.astro.build/en/guides/client-side-scripts/#include-javascript-files-on-your-page)
- [Installation](https://docs.astro.build/en/install-and-setup/)
- [Installing a Vite or Rollup plugin](https://docs.astro.build/en/recipes/add-yaml-support/)
- [Integration API](https://docs.astro.build/en/reference/integrations-reference/)
- [Integrations](https://docs.astro.build/en/guides/client-side-scripts/#__tab-integrations)
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
- [Microsoft Azure](https://docs.astro.build/en/guides/deploy/microsoft-azure/)
- [Middleware](https://docs.astro.build/en/guides/middleware/)
- [Neon](https://docs.astro.build/en/guides/backend/neon/)
- [Netlify](https://docs.astro.build/en/guides/deploy/netlify/)
- [Next.js](https://docs.astro.build/en/guides/migrate-to-astro/from-nextjs/)
- [Node](https://docs.astro.build/en/guides/integrations-guide/node/)
- [NuxtJS](https://docs.astro.build/en/guides/migrate-to-astro/from-nuxtjs/)
- [On-demand rendering](https://docs.astro.build/en/guides/on-demand-rendering/)
- [Opting out of processing](https://docs.astro.build/en/guides/client-side-scripts/#opting-out-of-processing)
- [Pages](https://docs.astro.build/en/basics/astro-pages/)
- [Partytown](https://docs.astro.build/en/guides/integrations-guide/partytown/)
- [Pass frontmatter variables to scripts](https://docs.astro.build/en/guides/client-side-scripts/#pass-frontmatter-variables-to-scripts)
- [Payload CMS](https://docs.astro.build/en/guides/cms/payload/)
- [Pelican](https://docs.astro.build/en/guides/migrate-to-astro/from-pelican/)
- [Preact](https://docs.astro.build/en/guides/integrations-guide/preact/)
- [Prefetch](https://docs.astro.build/en/guides/prefetch/)
- [Prepr CMS](https://docs.astro.build/en/guides/cms/preprcms/)
- [Preserve scripts order](https://docs.astro.build/en/reference/experimental-flags/preserve-scripts-order/)
- [Prismic](https://docs.astro.build/en/guides/cms/prismic/)
- [Programmatic Astro API (experimental)](https://docs.astro.build/en/reference/programmatic-reference/)
- [Project structure](https://docs.astro.build/en/basics/project-structure/)
- [Publish to NPM](https://docs.astro.build/en/reference/publish-to-npm/)
- [React](https://docs.astro.build/en/guides/integrations-guide/react/)
- [Recipes overview](https://docs.astro.build/en/recipes/)
- [Reference](https://docs.astro.build/en/guides/client-side-scripts/#__tab-reference)
- [Render](https://docs.astro.build/en/guides/deploy/render/)
- [Render context](https://docs.astro.build/en/reference/api-reference/)
- [Responsive images](https://docs.astro.build/en/reference/experimental-flags/responsive-images/)
- [Routing](https://docs.astro.build/en/guides/routing/)
- [Routing Reference](https://docs.astro.build/en/reference/routing-reference/)
- [Sanity](https://docs.astro.build/en/guides/cms/sanity/)
- [Script processing](https://docs.astro.build/en/guides/client-side-scripts/#script-processing)
- [Scripts and event handling](https://docs.astro.build/en/guides/client-side-scripts/)
- [Section titled Import local scripts](https://docs.astro.build/en/guides/client-side-scripts/#import-local-scripts)
- [Section titled Load external scripts](https://docs.astro.build/en/guides/client-side-scripts/#load-external-scripts)
- [Sentry](https://docs.astro.build/en/guides/backend/sentry/)
- [Server islands](https://docs.astro.build/en/guides/server-islands/)
- [Sessions](https://docs.astro.build/en/guides/sessions/)
- [Share state between Astro components](https://docs.astro.build/en/recipes/sharing-state/)
- [Share state between islands](https://docs.astro.build/en/recipes/sharing-state-islands/)
- [Site migration overview](https://docs.astro.build/en/guides/migrate-to-astro/)
- [Sitecore XM](https://docs.astro.build/en/guides/cms/sitecore/)
- [Sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/)
- [Skip to content](https://docs.astro.build/en/guides/client-side-scripts/#_top)
- [SolidJS](https://docs.astro.build/en/guides/integrations-guide/solid-js/)
- [Spinal](https://docs.astro.build/en/guides/cms/spinal/)
- [Sponsor](https://opencollective.com/astrodotbuild)
- [SST](https://docs.astro.build/en/guides/deploy/sst/)
- [Start](https://docs.astro.build/en/guides/client-side-scripts/#__tab-start)
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
- [the frontmatter](https://docs.astro.build/en/basics/astro-components/#the-component-script)
- [Third-party services](https://docs.astro.build/en/guides/client-side-scripts/#__tab-third-party-services)
- [Tina CMS](https://docs.astro.build/en/guides/cms/tina-cms/)
- [Translate this page](https://contribute.docs.astro.build/guides/i18n/)
- [Troubleshooting](https://docs.astro.build/en/guides/troubleshooting/)
- [Turso](https://docs.astro.build/en/guides/backend/turso/)
- [Tutorial: Build a blog](https://docs.astro.build/en/tutorial/0-introduction/)
- [type="module"](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [TypeScript](https://docs.astro.build/en/guides/typescript/)
- [Umbraco](https://docs.astro.build/en/guides/cms/umbraco/)
- [Upgrade Astro](https://docs.astro.build/en/upgrade-astro/)
- [Use Bun with Astro](https://docs.astro.build/en/recipes/bun/)
- [Using <script> in Astro](https://docs.astro.build/en/guides/client-side-scripts/#using-script-in-astro)
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
- [Web components with custom elements](https://docs.astro.build/en/guides/client-side-scripts/#web-components-with-custom-elements)
- [web.dev’s Reusable Web Components guide](https://web.dev/custom-elements-v1/)
- [Why Astro?](https://docs.astro.build/en/concepts/why-astro/)
- [Wordpress](https://docs.astro.build/en/guides/cms/wordpress/)
- [WordPress](https://docs.astro.build/en/guides/migrate-to-astro/from-wordpress/)
- [Xata](https://docs.astro.build/en/guides/backend/xata/)
- [Zeabur](https://docs.astro.build/en/guides/deploy/zeabur/)
- [Zerops](https://docs.astro.build/en/guides/deploy/zerops/)
