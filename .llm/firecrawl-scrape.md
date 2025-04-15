---
title: "Scrape | Firecrawl"
source_url: "https://docs.firecrawl.dev/features/scrape"
word_count: 1813
reading_time: "10 min read"
date_converted: "2025-04-15T14:11:33.661Z"
---
# Scrape | Firecrawl

Scrape | Firecrawl
===============
 

[Firecrawl Docs home page![Image 1: light logo](https://mintlify.s3.us-west-1.amazonaws.com/firecrawl/logo/logo.png)![Image 2: dark logo](https://mintlify.s3.us-west-1.amazonaws.com/firecrawl/logo/logo-dark.png)](https://firecrawl.dev/)

v1

Search or ask...

Ctrl K

*   [Status](https://firecrawl.betteruptime.com/)
*   [Support](mailto:help@firecrawl.com)
*   [mendableai/firecrawl 35,776](https://github.com/mendableai/firecrawl)
*   [mendableai/firecrawl 35,776](https://github.com/mendableai/firecrawl)

Search...

Navigation

Scrape

Scrape

[Documentation](https://docs.firecrawl.dev/introduction)[SDKs](https://docs.firecrawl.dev/sdks/overview)[Learn](https://www.firecrawl.dev/blog/category/tutorials)[API Reference](https://docs.firecrawl.dev/api-reference/introduction)

*   [Playground](https://firecrawl.dev/playground)
*   [Blog](https://firecrawl.dev/blog)
*   [Community](https://discord.gg/gSmWdAkdwd)
*   [Changelog](https://firecrawl.dev/changelog)

##### Get Started

*   [Quickstart](https://docs.firecrawl.dev/introduction)
*   [Launch Week III (New)](https://docs.firecrawl.dev/launch-week)
*   [Welcome to V1](https://docs.firecrawl.dev/v1-welcome)
*   [Rate Limits](https://docs.firecrawl.dev/rate-limits)
*   [Integrations](https://docs.firecrawl.dev/integrations)
*   [Advanced Scraping Guide](https://docs.firecrawl.dev/advanced-scraping-guide)

##### Features

*   Scrape
    
    *   [Scrape](https://docs.firecrawl.dev/features/scrape)
    *   [Batch Scrape](https://docs.firecrawl.dev/features/batch-scrape)
    *   [LLM Extract](https://docs.firecrawl.dev/features/llm-extract)
    *   [Change Tracking (New)](https://docs.firecrawl.dev/features/change-tracking)
*   Crawl
    
*   [Map](https://docs.firecrawl.dev/features/map)
*   [Extract (New)](https://docs.firecrawl.dev/features/extract)

##### Alpha Features

*   LLMs.txt API
    
*   Deep Research API
    

##### Integrations

*   [Langchain](https://docs.firecrawl.dev/integrations/langchain)
*   [Llamaindex](https://docs.firecrawl.dev/integrations/llamaindex)
*   [CrewAI](https://docs.firecrawl.dev/integrations/crewai)
*   [Dify](https://docs.firecrawl.dev/integrations/dify)
*   [Flowise](https://docs.firecrawl.dev/integrations/flowise)
*   [Langflow](https://docs.firecrawl.dev/integrations/langflow)
*   [Camel AI](https://docs.firecrawl.dev/integrations/camelai)
*   [SourceSync.ai](https://docs.firecrawl.dev/integrations/sourcesyncai)

##### Contributing

*   [Open Source vs Cloud](https://docs.firecrawl.dev/contributing/open-source-or-cloud)
*   [Running locally](https://docs.firecrawl.dev/contributing/guide)
*   [Self-hosting](https://docs.firecrawl.dev/contributing/self-host)

Scrape

Scrape
======

Turn any url into clean data

Firecrawl converts web pages into markdown, ideal for LLM applications.

*   It manages complexities: proxies, caching, rate limits, js-blocked content
*   Handles dynamic content: dynamic websites, js-rendered sites, PDFs, images
*   Outputs clean markdown, structured data, screenshots or html.

For details, see the [Scrape Endpoint API Reference](https://docs.firecrawl.dev/api-reference/endpoint/scrape).

[​](https://docs.firecrawl.dev/features/scrape#scraping-a-url-with-firecrawl)

Scraping a URL with Firecrawl
--------------------------------------------------------------------------------------------------------------

### 

[​](https://docs.firecrawl.dev/features/scrape#%2Fscrape-endpoint)

/scrape endpoint

Used to scrape a URL and get its content.

### 

[​](https://docs.firecrawl.dev/features/scrape#installation)

Installation

Python

Node

Go

Rust

Copy

```bash
pip install firecrawl-py
```

### 

[​](https://docs.firecrawl.dev/features/scrape#usage)

Usage

Python

Node

Go

Rust

cURL

Copy

```python
from firecrawl import FirecrawlApp

app = FirecrawlApp(api_key="fc-YOUR_API_KEY")

# Scrape a website:
scrape_result = app.scrape_url('firecrawl.dev', params={'formats': ['markdown', 'html']})
print(scrape_result)
```

For more details about the parameters, refer to the [API Reference](https://docs.firecrawl.dev/api-reference/endpoint/scrape).

### 

[​](https://docs.firecrawl.dev/features/scrape#response)

Response

SDKs will return the data object directly. cURL will return the payload exactly as shown below.

Copy

```json
{
  "success": true,
  "data" : {
    "markdown": "Launch Week I is here! [See our Day 2 Release 🚀](https://www.firecrawl.dev/blog/launch-week-i-day-2-doubled-rate-limits)[💥 Get 2 months free...",
    "html": "<!DOCTYPE html><html lang=\"en\" class=\"light\" style=\"color-scheme: light;\"><body class=\"__variable_36bd41 __variable_d7dc5d font-inter ...",
    "metadata": {
      "title": "Home - Firecrawl",
      "description": "Firecrawl crawls and converts any website into clean markdown.",
      "language": "en",
      "keywords": "Firecrawl,Markdown,Data,Mendable,Langchain",
      "robots": "follow, index",
      "ogTitle": "Firecrawl",
      "ogDescription": "Turn any website into LLM-ready data.",
      "ogUrl": "https://www.firecrawl.dev/",
      "ogImage": "https://www.firecrawl.dev/og.png?123",
      "ogLocaleAlternate": [],
      "ogSiteName": "Firecrawl",
      "sourceURL": "https://firecrawl.dev",
      "statusCode": 200
    }
  }
}
```

[​](https://docs.firecrawl.dev/features/scrape#scrape-formats)

Scrape Formats
--------------------------------------------------------------------------------

You can now choose what formats you want your output in. You can specify multiple output formats. Supported formats are:

*   Markdown (markdown)
*   HTML (html)
*   Raw HTML (rawHtml) (with no modifications)
*   Screenshot (screenshot or screenshot@fullPage)
*   Links (links)
*   Extract (extract) - structured output

Output keys will match the format you choose.

[​](https://docs.firecrawl.dev/features/scrape#extract-structured-data)

Extract structured data
--------------------------------------------------------------------------------------------------

### 

[​](https://docs.firecrawl.dev/features/scrape#%2Fscrape-with-extract-endpoint)

/scrape (with extract) endpoint

Used to extract structured data from scraped pages.

Python

Node

cURL

Copy

```python
from firecrawl import FirecrawlApp
from pydantic import BaseModel, Field

# Initialize the FirecrawlApp with your API key
app = FirecrawlApp(api_key='your_api_key')

class ExtractSchema(BaseModel):
    company_mission: str
    supports_sso: bool
    is_open_source: bool
    is_in_yc: bool

data = app.scrape_url('https://docs.firecrawl.dev/', {
    'formats': ['json'],
    'jsonOptions': {
        'schema': ExtractSchema.model_json_schema(),
    }
})
print(data["json"])
```

Output:

JSON

Copy

```json
{
    "success": true,
    "data": {
      "json": {
        "company_mission": "Train a secure AI on your technical resources that answers customer and employee questions so your team doesn't have to",
        "supports_sso": true,
        "is_open_source": false,
        "is_in_yc": true
      },
      "metadata": {
        "title": "Mendable",
        "description": "Mendable allows you to easily build AI chat applications. Ingest, customize, then deploy with one line of code anywhere you want. Brought to you by SideGuide",
        "robots": "follow, index",
        "ogTitle": "Mendable",
        "ogDescription": "Mendable allows you to easily build AI chat applications. Ingest, customize, then deploy with one line of code anywhere you want. Brought to you by SideGuide",
        "ogUrl": "https://docs.firecrawl.dev/",
        "ogImage": "https://docs.firecrawl.dev/mendable_new_og1.png",
        "ogLocaleAlternate": [],
        "ogSiteName": "Mendable",
        "sourceURL": "https://docs.firecrawl.dev/"
      },
    }
}
```

### 

[​](https://docs.firecrawl.dev/features/scrape#extracting-without-schema-new)

Extracting without schema (New)

You can now extract without a schema by just passing a `prompt` to the endpoint. The llm chooses the structure of the data.

cURL

Copy

```bash
curl -X POST https://api.firecrawl.dev/v1/scrape \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer YOUR_API_KEY' \
    -d '{
      "url": "https://docs.firecrawl.dev/",
      "formats": ["json"],
      "jsonOptions": {
        "prompt": "Extract the company mission from the page."
      }
    }'
```

Output:

JSON

Copy

```json
{
    "success": true,
    "data": {
      "json": {
        "company_mission": "Train a secure AI on your technical resources that answers customer and employee questions so your team doesn't have to",
      },
      "metadata": {
        "title": "Mendable",
        "description": "Mendable allows you to easily build AI chat applications. Ingest, customize, then deploy with one line of code anywhere you want. Brought to you by SideGuide",
        "robots": "follow, index",
        "ogTitle": "Mendable",
        "ogDescription": "Mendable allows you to easily build AI chat applications. Ingest, customize, then deploy with one line of code anywhere you want. Brought to you by SideGuide",
        "ogUrl": "https://docs.firecrawl.dev/",
        "ogImage": "https://docs.firecrawl.dev/mendable_new_og1.png",
        "ogLocaleAlternate": [],
        "ogSiteName": "Mendable",
        "sourceURL": "https://docs.firecrawl.dev/"
      },
    }
}
```

### 

[​](https://docs.firecrawl.dev/features/scrape#extract-object)

Extract object

The `extract` object accepts the following parameters:

*   `schema`: The schema to use for the extraction.
*   `systemPrompt`: The system prompt to use for the extraction.
*   `prompt`: The prompt to use for the extraction without a schema.

[​](https://docs.firecrawl.dev/features/scrape#interacting-with-the-page-with-actions)

Interacting with the page with Actions
--------------------------------------------------------------------------------------------------------------------------------

Firecrawl allows you to perform various actions on a web page before scraping its content. This is particularly useful for interacting with dynamic content, navigating through pages, or accessing content that requires user interaction.

Here is an example of how to use actions to navigate to google.com, search for Firecrawl, click on the first result, and take a screenshot.

It is important to almost always use the `wait` action before/after executing other actions to give enough time for the page to load.

### 

[​](https://docs.firecrawl.dev/features/scrape#example)

Example

Python

Node

cURL

Copy

```python
from firecrawl import FirecrawlApp

app = FirecrawlApp(api_key="fc-YOUR_API_KEY")

# Scrape a website:
scrape_result = app.scrape_url('firecrawl.dev', 
    params={
        'formats': ['markdown', 'html'], 
        'actions': [
            {"type": "wait", "milliseconds": 2000},
            {"type": "click", "selector": "textarea[title=\"Search\"]"},
            {"type": "wait", "milliseconds": 2000},
            {"type": "write", "text": "firecrawl"},
            {"type": "wait", "milliseconds": 2000},
            {"type": "press", "key": "ENTER"},
            {"type": "wait", "milliseconds": 3000},
            {"type": "click", "selector": "h3"},
            {"type": "wait", "milliseconds": 3000},
            {"type": "scrape"},
            {"type": "screenshot"}
        ]
    }
)
print(scrape_result)
```

### 

[​](https://docs.firecrawl.dev/features/scrape#output)

Output

JSON

Copy

```json
{
  "success": true,
  "data": {
    "markdown": "Our first Launch Week is over! [See the recap 🚀](blog/firecrawl-launch-week-1-recap)...",
    "actions": {
      "screenshots": [
        "https://alttmdsdujxrfnakrkyi.supabase.co/storage/v1/object/public/media/screenshot-75ef2d87-31e0-4349-a478-fb432a29e241.png"
      ],
      "scrapes": [
        {
          "url": "https://www.firecrawl.dev/",
          "html": "<html><body><h1>Firecrawl</h1></body></html>"
        }
      ]
    },
    "metadata": {
      "title": "Home - Firecrawl",
      "description": "Firecrawl crawls and converts any website into clean markdown.",
      "language": "en",
      "keywords": "Firecrawl,Markdown,Data,Mendable,Langchain",
      "robots": "follow, index",
      "ogTitle": "Firecrawl",
      "ogDescription": "Turn any website into LLM-ready data.",
      "ogUrl": "https://www.firecrawl.dev/",
      "ogImage": "https://www.firecrawl.dev/og.png?123",
      "ogLocaleAlternate": [],
      "ogSiteName": "Firecrawl",
      "sourceURL": "http://google.com",
      "statusCode": 200
    }
  }
}
```

For more details about the actions parameters, refer to the [API Reference](https://docs.firecrawl.dev/api-reference/endpoint/scrape).

[​](https://docs.firecrawl.dev/features/scrape#location-and-language)

Location and Language
----------------------------------------------------------------------------------------------

Specify country and preferred languages to get relevant content based on your target location and language preferences.

### 

[​](https://docs.firecrawl.dev/features/scrape#how-it-works)

How it works

When you specify the location settings, Firecrawl will use an appropriate proxy if available and emulate the corresponding language and timezone settings. By default, the location is set to ‘US’ if not specified.

### 

[​](https://docs.firecrawl.dev/features/scrape#usage-2)

Usage

To use the location and language settings, include the `location` object in your request body with the following properties:

*   `country`: ISO 3166-1 alpha-2 country code (e.g., ‘US’, ‘AU’, ‘DE’, ‘JP’). Defaults to ‘US’.
*   `languages`: An array of preferred languages and locales for the request in order of priority. Defaults to the language of the specified location.

Python

Node

cURL

Copy

```python
from firecrawl import FirecrawlApp

app = FirecrawlApp(api_key="fc-YOUR_API_KEY")

# Scrape a website:
scrape_result = app.scrape_url('airbnb.com', 
    params={
        'formats': ['markdown', 'html'], 
        'location': {
            'country': 'BR',
            'languages': ['pt-BR']
        }
    }
)
print(scrape_result)
```

[​](https://docs.firecrawl.dev/features/scrape#batch-scraping-multiple-urls)

Batch scraping multiple URLs
------------------------------------------------------------------------------------------------------------

You can now batch scrape multiple URLs at the same time. It takes the starting URLs and optional parameters as arguments. The params argument allows you to specify additional options for the batch scrape job, such as the output formats.

### 

[​](https://docs.firecrawl.dev/features/scrape#how-it-works-2)

How it works

It is very similar to how the `/crawl` endpoint works. It submits a batch scrape job and returns a job ID to check the status of the batch scrape.

The sdk provides 2 methods, synchronous and asynchronous. The synchronous method will return the results of the batch scrape job, while the asynchronous method will return a job ID that you can use to check the status of the batch scrape.

### 

[​](https://docs.firecrawl.dev/features/scrape#usage-3)

Usage

Python

Node

cURL

Copy

```python
from firecrawl import FirecrawlApp

app = FirecrawlApp(api_key="fc-YOUR_API_KEY")

# Scrape multiple websites:
batch_scrape_result = app.batch_scrape_urls(['firecrawl.dev', 'mendable.ai'], {'formats': ['markdown', 'html']})
print(batch_scrape_result)

# Or, you can use the asynchronous method:
batch_scrape_job = app.async_batch_scrape_urls(['firecrawl.dev', 'mendable.ai'], {'formats': ['markdown', 'html']})
print(batch_scrape_job)

# (async) You can then use the job ID to check the status of the batch scrape:
batch_scrape_status = app.check_batch_scrape_status(batch_scrape_job['id'])
print(batch_scrape_status)
```

### 

[​](https://docs.firecrawl.dev/features/scrape#response-2)

Response

If you’re using the sync methods from the SDKs, it will return the results of the batch scrape job. Otherwise, it will return a job ID that you can use to check the status of the batch scrape.

#### 

[​](https://docs.firecrawl.dev/features/scrape#synchronous)

Synchronous

Completed

Copy

```json
{
  "status": "completed",
  "total": 36,
  "completed": 36,
  "creditsUsed": 36,
  "expiresAt": "2024-00-00T00:00:00.000Z",
  "next": "https://api.firecrawl.dev/v1/batch/scrape/123-456-789?skip=26",
  "data": [
    {
      "markdown": "[Firecrawl Docs home page![light logo](https://mintlify.s3-us-west-1.amazonaws.com/firecrawl/logo/light.svg)!...",
      "html": "<!DOCTYPE html><html lang=\"en\" class=\"js-focus-visible lg:[--scroll-mt:9.5rem]\" data-js-focus-visible=\"\">...",
      "metadata": {
        "title": "Build a 'Chat with website' using Groq Llama 3 | Firecrawl",
        "language": "en",
        "sourceURL": "https://docs.firecrawl.dev/learn/rag-llama3",
        "description": "Learn how to use Firecrawl, Groq Llama 3, and Langchain to build a 'Chat with your website' bot.",
        "ogLocaleAlternate": [],
        "statusCode": 200
      }
    },
    ...
  ]
}
```

#### 

[​](https://docs.firecrawl.dev/features/scrape#asynchronous)

Asynchronous

You can then use the job ID to check the status of the batch scrape by calling the `/batch/scrape/{id}` endpoint. This endpoint is meant to be used while the job is still running or right after it has completed **as batch scrape jobs expire after 24 hours**.

Copy

```json
{
  "success": true,
  "id": "123-456-789",
  "url": "https://api.firecrawl.dev/v1/batch/scrape/123-456-789"
}
```

[Suggest edits](https://github.com/hellofirecrawl/docs/edit/main/features/scrape.mdx)[Raise issue](https://github.com/hellofirecrawl/docs/issues/new?title=Issue%20on%20docs&body=Path:%20/features/scrape)

[Advanced Scraping Guide](https://docs.firecrawl.dev/advanced-scraping-guide)[Batch Scrape](https://docs.firecrawl.dev/features/batch-scrape)

[x](https://x.com/firecrawl_dev)[github](https://github.com/mendableai/firecrawl)[linkedin](https://www.linkedin.com/company/firecrawl)

[Powered by Mintlify](https://mintlify.com/preview-request?utm_campaign=poweredBy&utm_medium=docs&utm_source=docs.firecrawl.dev)

On this page

*   [Scraping a URL with Firecrawl](https://docs.firecrawl.dev/features/scrape#scraping-a-url-with-firecrawl)
*   [/scrape endpoint](https://docs.firecrawl.dev/features/scrape#%2Fscrape-endpoint)
*   [Installation](https://docs.firecrawl.dev/features/scrape#installation)
*   [Usage](https://docs.firecrawl.dev/features/scrape#usage)
*   [Response](https://docs.firecrawl.dev/features/scrape#response)
*   [Scrape Formats](https://docs.firecrawl.dev/features/scrape#scrape-formats)
*   [Extract structured data](https://docs.firecrawl.dev/features/scrape#extract-structured-data)
*   [/scrape (with extract) endpoint](https://docs.firecrawl.dev/features/scrape#%2Fscrape-with-extract-endpoint)
*   [Extracting without schema (New)](https://docs.firecrawl.dev/features/scrape#extracting-without-schema-new)
*   [Extract object](https://docs.firecrawl.dev/features/scrape#extract-object)
*   [Interacting with the page with Actions](https://docs.firecrawl.dev/features/scrape#interacting-with-the-page-with-actions)
*   [Example](https://docs.firecrawl.dev/features/scrape#example)
*   [Output](https://docs.firecrawl.dev/features/scrape#output)
*   [Location and Language](https://docs.firecrawl.dev/features/scrape#location-and-language)
*   [How it works](https://docs.firecrawl.dev/features/scrape#how-it-works)
*   [Usage](https://docs.firecrawl.dev/features/scrape#usage-2)
*   [Batch scraping multiple URLs](https://docs.firecrawl.dev/features/scrape#batch-scraping-multiple-urls)
*   [How it works](https://docs.firecrawl.dev/features/scrape#how-it-works-2)
*   [Usage](https://docs.firecrawl.dev/features/scrape#usage-3)
*   [Response](https://docs.firecrawl.dev/features/scrape#response-2)
*   [Synchronous](https://docs.firecrawl.dev/features/scrape#synchronous)
*   [Asynchronous](https://docs.firecrawl.dev/features/scrape#asynchronous)

## Links

- [​](https://docs.firecrawl.dev/features/scrape#asynchronous)
- [Advanced Scraping Guide](https://docs.firecrawl.dev/advanced-scraping-guide)
- [API Reference](https://docs.firecrawl.dev/api-reference/introduction)
- [Batch Scrape](https://docs.firecrawl.dev/features/batch-scrape)
- [Blog](https://firecrawl.dev/blog)
- [Camel AI](https://docs.firecrawl.dev/integrations/camelai)
- [Change Tracking (New)](https://docs.firecrawl.dev/features/change-tracking)
- [Changelog](https://firecrawl.dev/changelog)
- [Community](https://discord.gg/gSmWdAkdwd)
- [CrewAI](https://docs.firecrawl.dev/integrations/crewai)
- [Dify](https://docs.firecrawl.dev/integrations/dify)
- [Documentation](https://docs.firecrawl.dev/introduction)
- [Extract (New)](https://docs.firecrawl.dev/features/extract)
- [Firecrawl Docs home page](https://firecrawl.dev/)
- [Flowise](https://docs.firecrawl.dev/integrations/flowise)
- [Integrations](https://docs.firecrawl.dev/integrations)
- [Langchain](https://docs.firecrawl.dev/integrations/langchain)
- [Langflow](https://docs.firecrawl.dev/integrations/langflow)
- [Launch Week III (New)](https://docs.firecrawl.dev/launch-week)
- [Learn](https://www.firecrawl.dev/blog/category/tutorials)
- [linkedin](https://www.linkedin.com/company/firecrawl)
- [Llamaindex](https://docs.firecrawl.dev/integrations/llamaindex)
- [LLM Extract](https://docs.firecrawl.dev/features/llm-extract)
- [Map](https://docs.firecrawl.dev/features/map)
- [mendableai/firecrawl35,776](https://github.com/mendableai/firecrawl)
- [Open Source vs Cloud](https://docs.firecrawl.dev/contributing/open-source-or-cloud)
- [Playground](https://firecrawl.dev/playground)
- [Powered by Mintlify](https://mintlify.com/preview-request?utm_campaign=poweredBy&utm_medium=docs&utm_source=docs.firecrawl.dev)
- [Raise issue](https://github.com/hellofirecrawl/docs/issues/new?title=Issue%20on%20docs&body=Path:%20/features/scrape)
- [Rate Limits](https://docs.firecrawl.dev/rate-limits)
- [Running locally](https://docs.firecrawl.dev/contributing/guide)
- [Scrape](https://docs.firecrawl.dev/features/scrape)
- [Scrape Endpoint API Reference](https://docs.firecrawl.dev/api-reference/endpoint/scrape)
- [SDKs](https://docs.firecrawl.dev/sdks/overview)
- [Self-hosting](https://docs.firecrawl.dev/contributing/self-host)
- [SourceSync.ai](https://docs.firecrawl.dev/integrations/sourcesyncai)
- [Status](https://firecrawl.betteruptime.com/)
- [Suggest edits](https://github.com/hellofirecrawl/docs/edit/main/features/scrape.mdx)
- [Support](mailto:help@firecrawl.com)
- [Welcome to V1](https://docs.firecrawl.dev/v1-welcome)
- [x](https://x.com/firecrawl_dev)
