# Core Features Documentation

## Overview
This document covers the core features of the ASKit backend system, including the RAG (Retrieval-Augmented Generation) system, web crawling, content processing, embeddings, and vector database operations.

---

## RAG System

### Overview
The RAG system combines retrieval of relevant content with AI-powered generation to provide contextually accurate answers to user questions.

**Location**: `src/rag.js`

### Core Function: `answerQuestion()`

```javascript
async function answerQuestion({ 
  question,     // Required: User's question
  userEmail,    // Required: User identifier for data isolation  
  website,      // Optional: Filter to specific website/domain
  topK = 20     // Optional: Number of relevant chunks to retrieve
})
```

### Process Flow

1. **Input Validation**
   - Validates question is non-empty string
   - Ensures topK is between 1-50
   - Normalizes website domain if provided

2. **Question Embedding**
   - Creates vector embedding of user question
   - Uses OpenAI Ada-002 or similar embedding model
   - Returns 1536-dimensional vector

3. **Vector Search**
   - Queries Pinecone vector database
   - Applies filters for user isolation and website filtering
   - Retrieves top-K most similar content chunks

4. **Context Building**
   - Combines retrieved chunks into coherent context
   - Includes metadata (URLs, website names)
   - Limits context to prevent token overflow

5. **Answer Generation**
   - Uses Google Gemini 2.5 Flash for text generation
   - Provides specific instructions for response style
   - Returns generated answer with sources

### Request Example

```javascript
const result = await answerQuestion({
  question: "What are your business hours?",
  userEmail: "user@example.com",
  website: "example.com",
  topK: 5
});

if (result.success) {
  console.log("Answer:", result.answer);
  console.log("Sources:", result.sources);
  console.log("Websites:", result.websites);
}
```

### Response Format

```javascript
{
  success: true,
  answer: "Our business hours are Monday through Friday from 9 AM to 6 PM EST...",
  hits: [
    {
      id: "vec_123",
      score: 0.95,
      metadata: {
        url: "https://example.com/contact",
        website: "example.com",
        textPreview: "Business hours: Monday-Friday..."
      }
    }
  ],
  sources: ["https://example.com/contact", "https://example.com/about"],
  websites: ["example.com"],
  websiteFilter: "example.com",
  context_used: 5
}
```

### Error Handling

```javascript
// Common error scenarios
{
  success: false,
  error: "Invalid question: must be a non-empty string"
}

{
  success: false,
  error: "Failed to create question embedding",
  details: "OpenAI API rate limit exceeded"
}

{
  success: false,
  error: "Invalid Gemini API key for text generation"
}
```

### Configuration

**Environment Variables:**
```bash
# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# OpenAI API (for embeddings)
OPENAI_API_KEY=your_openai_api_key_here

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_environment
PINECONE_INDEX_NAME=askit-index
```

**Model Configuration:**
```javascript
// Gemini generation config
generationConfig: {
  temperature: 0.7,      // Creativity vs consistency
  maxOutputTokens: 1000  // Response length limit
}
```

---

## Web Crawling System

### Overview
The crawling system extracts content from websites using both static HTML parsing and dynamic JavaScript rendering with Puppeteer.

**Location**: `src/crawler.js`

### Architecture

```
URL Input → robots.txt Check → HTML Fetch → Content Extract → Links Discovery → Sitemap Parse → Content Return
```

### Core Functions

#### `fetchHtml(url)`
Fetches fully rendered HTML content using Puppeteer.

```javascript
const result = await fetchHtml('https://example.com/page');
if (result.success) {
  console.log('HTML length:', result.html.length);
  console.log('Final URL:', result.finalUrl);
}
```

**Features:**
- JavaScript rendering support
- Realistic browser simulation
- Network idle waiting for dynamic content
- Memory-efficient page management
- Comprehensive error handling

#### `extractTextContent(html, url)`
Extracts clean text content from HTML.

```javascript
const content = await extractTextContent(htmlString, pageUrl);
console.log('Title:', content.title);
console.log('Text:', content.text);
console.log('Links:', content.links);
```

**Extraction Process:**
1. Remove script, style, and navigation elements
2. Extract title and meta description
3. Clean and normalize text content
4. Extract internal and external links
5. Remove excessive whitespace and formatting

#### `discoverUrls(baseUrl, maxPages)`
Discovers URLs through multiple strategies.

```javascript
const urls = await discoverUrls('https://example.com', 50);
console.log(`Discovered ${urls.length} URLs to crawl`);
```

**Discovery Methods:**
1. **Sitemap Parsing**: XML sitemaps and sitemap index
2. **Internal Link Following**: Recursive link discovery
3. **Common Path Guessing**: Blog, products, services pages
4. **robots.txt Parsing**: Sitemap references

#### `crawlWebsite(websiteUrl, maxPages, callback)`
Main crawling orchestration function.

```javascript
await crawlWebsite('https://example.com', 100, (progress) => {
  console.log(`Progress: ${progress.completed}/${progress.total} pages`);
});
```

**Process:**
1. Validate URL and check robots.txt
2. Discover all crawlable URLs
3. Crawl pages in batches with rate limiting
4. Extract content and handle errors
5. Provide progress callbacks
6. Return aggregated results

### Browser Management

**Global Browser Instance:**
```javascript
let globalBrowser = null;

async function getBrowser() {
  if (!globalBrowser || !globalBrowser.isConnected()) {
    globalBrowser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
      ]
    });
  }
  return globalBrowser;
}
```

**Benefits:**
- Reduces browser launch overhead
- Improves crawling performance
- Better resource management
- Handles browser crashes gracefully

### Rate Limiting & Politeness

```javascript
// Configurable delays between requests
const CRAWL_DELAY = 1000; // 1 second between pages
const BATCH_SIZE = 5;     // Process 5 pages concurrently
const MAX_RETRIES = 3;    // Retry failed pages

// Respect robots.txt crawl delays
if (robots && robots.getCrawlDelay('*')) {
  delay = Math.max(delay, robots.getCrawlDelay('*') * 1000);
}
```

### Error Handling

```javascript
// Comprehensive error handling for different scenarios
if (error.name === 'TimeoutError') {
  return { 
    success: false, 
    error: "Page load timeout - server may be slow or unresponsive" 
  };
} else if (error.message.includes('net::ERR_NAME_NOT_RESOLVED')) {
  return { 
    success: false, 
    error: "Domain name could not be resolved" 
  };
} else if (error.message.includes('Navigation failed')) {
  return { 
    success: false, 
    error: "Page navigation failed - page may be unavailable" 
  };
}
```

### Content Extraction Features

**HTML Cleaning:**
```javascript
// Remove unwanted elements
$('script, style, nav, header, footer, aside, .navigation').remove();

// Extract meaningful content
const title = $('title').text() || $('h1').first().text();
const description = $('meta[name="description"]').attr('content');
```

**Link Processing:**
```javascript
// Extract and normalize links
$('a[href]').each((i, el) => {
  const href = $(el).attr('href');
  if (href && !href.startsWith('#') && !href.startsWith('mailto:')) {
    const absoluteUrl = new URL(href, url).href;
    links.push(absoluteUrl);
  }
});
```

---

## Content Processing Pipeline

### Chunking System

**Location**: `src/chunker.js`

#### Overview
The chunking system breaks down large text content into manageable pieces suitable for embedding and retrieval.

```javascript
function chunkText(text, maxTokens = 1000, overlap = 100) {
  // Split text into chunks with token-based sizing
  // Maintain context overlap between chunks
  // Preserve paragraph and sentence boundaries
}
```

**Features:**
- Token-based chunking (not character-based)
- Configurable overlap for context preservation
- Smart boundary detection (paragraphs, sentences)
- Metadata preservation per chunk

#### Chunking Strategy

```javascript
// Default configuration
const CHUNK_SIZE = 1000;    // Max tokens per chunk
const CHUNK_OVERLAP = 100;  // Tokens overlap between chunks
const MIN_CHUNK_SIZE = 50;  // Minimum viable chunk size

// Process text with smart boundaries
const chunks = chunkText(extractedText, {
  maxTokens: CHUNK_SIZE,
  overlap: CHUNK_OVERLAP,
  preserveBoundaries: true,
  metadata: {
    url: pageUrl,
    title: pageTitle,
    domain: siteDomain
  }
});
```

#### Chunk Metadata Structure

```javascript
{
  chunkIndex: 0,
  totalChunks: 15,
  tokenCount: 856,
  url: "https://example.com/page",
  title: "Page Title",
  domain: "example.com",
  textPreview: "First 200 characters of chunk...",
  timestamp: "2025-09-11T10:30:00.000Z"
}
```

---

## Embeddings System

**Location**: `src/embeddings.js`

### Overview
Converts text content into high-dimensional vectors for semantic search and retrieval.

### Core Function: `createEmbedding(text)`

```javascript
async function createEmbedding(text) {
  // Input validation and preprocessing
  if (!text || typeof text !== 'string') {
    return { success: false, error: "Invalid text input" };
  }
  
  // Call OpenAI Embeddings API
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.trim(),
    encoding_format: "float"
  });
  
  return {
    success: true,
    embedding: response.data[0].embedding,
    tokenCount: response.usage.total_tokens
  };
}
```

### Features

**Text Preprocessing:**
```javascript
// Clean and normalize text before embedding
function preprocessText(text) {
  return text
    .replace(/\s+/g, ' ')      // Normalize whitespace
    .replace(/\n+/g, '\n')     // Normalize newlines
    .trim()                    // Remove leading/trailing space
    .substring(0, 8191);       // Respect token limits
}
```

**Batch Processing:**
```javascript
async function createBatchEmbeddings(textArray) {
  const batchSize = 100; // OpenAI batch limit
  const results = [];
  
  for (let i = 0; i < textArray.length; i += batchSize) {
    const batch = textArray.slice(i, i + batchSize);
    const batchResult = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: batch
    });
    results.push(...batchResult.data);
  }
  
  return results;
}
```

### Error Handling

```javascript
// Handle API-specific errors
if (error.response?.status === 401) {
  return { success: false, error: "Invalid OpenAI API key" };
} else if (error.response?.status === 429) {
  return { success: false, error: "OpenAI rate limit exceeded" };
} else if (error.response?.status === 400) {
  return { success: false, error: "Invalid request to OpenAI API" };
}
```

### Configuration

```javascript
// Model options
const EMBEDDING_MODELS = {
  'text-embedding-3-small': {
    dimensions: 1536,
    maxTokens: 8191,
    costPer1kTokens: 0.00002
  },
  'text-embedding-3-large': {
    dimensions: 3072,
    maxTokens: 8191,
    costPer1kTokens: 0.00013
  }
};
```

---

## Vector Database System

**Location**: `src/vectordb.js`

### Overview
Manages vector storage, indexing, and similarity search using Pinecone vector database.

### Core Functions

#### `upsertVector(id, embedding, metadata)`
Store or update a vector with metadata.

```javascript
const result = await upsertVector(
  'vec_page123_chunk1',
  embeddingVector,
  {
    url: 'https://example.com/page',
    title: 'Page Title',
    textPreview: 'First 200 chars...',
    userEmail: 'user@example.com',
    website: 'example.com',
    chunkIndex: 1,
    tokenCount: 856
  }
);
```

#### `queryVector(embedding, topK, filter)`
Search for similar vectors with optional filtering.

```javascript
const results = await queryVector(
  questionEmbedding,
  10, // Return top 10 matches
  {
    userEmail: 'user@example.com',
    website: 'example.com'
  }
);
```

**Response Format:**
```javascript
{
  success: true,
  matches: [
    {
      id: 'vec_page123_chunk1',
      score: 0.95,
      metadata: {
        url: 'https://example.com/page',
        textPreview: 'Relevant content...',
        website: 'example.com'
      }
    }
  ]
}
```

#### `deleteVectorsByFilter(filter)`
Remove vectors matching specific criteria.

```javascript
// Delete all vectors for a user's website
await deleteVectorsByFilter({
  userEmail: 'user@example.com',
  website: 'example.com'
});
```

### Indexing Strategy

**Vector ID Format:**
```
{userEmail}_{website}_{pageHash}_{chunkIndex}
```

**Metadata Schema:**
```javascript
{
  userEmail: string,      // User isolation
  website: string,        // Website domain
  url: string,           // Full page URL
  title: string,         // Page title
  textPreview: string,   // First 200 chars of chunk
  chunkIndex: number,    // Chunk position in document
  totalChunks: number,   // Total chunks for document
  tokenCount: number,    // Number of tokens in chunk
  timestamp: string      // ISO date string
}
```

### Performance Optimization

**Batch Operations:**
```javascript
// Upsert multiple vectors at once
async function batchUpsert(vectors) {
  const batchSize = 100; // Pinecone batch limit
  
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await pineconeIndex.upsert({ vectors: batch });
  }
}
```

**Index Statistics:**
```javascript
const stats = await pineconeIndex.describeIndexStats();
console.log('Total vectors:', stats.totalVectorCount);
console.log('Index utilization:', stats.indexFullness);
```

---

## Job Queue System

**Location**: `src/jobs/`

### Architecture

```
ingestProducer.js → BullMQ Queue → Redis → ingestWorker.js → Processing Pipeline
```

### Producer (`ingestProducer.js`)

#### `enqueueIngestJob(data)`
Add crawling job to queue.

```javascript
const jobId = await enqueueIngestJob({
  websiteUrl: 'https://example.com',
  userEmail: 'user@example.com',
  maxPages: 100
});

console.log('Job queued:', jobId);
```

**Job Configuration:**
```javascript
const jobOptions = {
  delay: 0,              // No delay
  attempts: 3,           // Retry failed jobs 3 times
  backoff: {
    type: 'exponential',
    delay: 5000          // Start with 5s, double each retry
  },
  removeOnComplete: 10,  // Keep last 10 completed jobs
  removeOnFail: 5        // Keep last 5 failed jobs
};
```

### Worker (`ingestWorker.js`)

#### Processing Pipeline

```javascript
async function processIngestJob(job) {
  const { websiteUrl, userEmail } = job.data;
  
  try {
    // Update job progress
    await job.updateProgress(10);
    
    // 1. Crawl website
    const crawlResult = await crawlWebsite(websiteUrl, maxPages);
    await job.updateProgress(40);
    
    // 2. Chunk content
    const chunks = await chunkAllContent(crawlResult.pages);
    await job.updateProgress(60);
    
    // 3. Create embeddings
    const embeddings = await createBatchEmbeddings(chunks);
    await job.updateProgress(80);
    
    // 4. Store in vector database
    const vectorIds = await batchUpsert(embeddings);
    await job.updateProgress(100);
    
    // 5. Update website status
    await updateWebsiteStatus(job.id, 'completed', {
      pagesCrawled: crawlResult.pages.length,
      chunksProcessed: chunks.length,
      vectorIds: vectorIds
    });
    
    return {
      pagesCrawled: crawlResult.pages.length,
      chunksProcessed: chunks.length,
      processingTime: Date.now() - job.timestamp
    };
    
  } catch (error) {
    await updateWebsiteStatus(job.id, 'failed', {
      errorMessage: error.message
    });
    throw error;
  }
}
```

### Queue Management

#### Queue Statistics
```javascript
async function getQueueStats() {
  const queue = getIngestQueue();
  
  const [waiting, active, completed, failed] = await Promise.all([
    queue.getWaiting(),
    queue.getActive(),
    queue.getCompleted(),
    queue.getFailed()
  ]);
  
  return {
    waiting: waiting.length,
    active: active.length,
    completed: completed.length,
    failed: failed.length
  };
}
```

#### Job Status Tracking
```javascript
async function getJobStatus(jobId) {
  const job = await queue.getJob(jobId);
  
  if (!job) {
    return { error: 'Job not found' };
  }
  
  return {
    id: job.id,
    status: await job.getState(),
    progress: job.progress,
    data: job.data,
    result: job.returnvalue,
    failedReason: job.failedReason,
    timestamp: job.timestamp
  };
}
```

---

## Performance Monitoring

### Metrics Collection

```javascript
// Track processing metrics
const metrics = {
  crawlTime: 0,
  chunkTime: 0,
  embeddingTime: 0,
  vectorStoreTime: 0,
  totalTime: 0
};

// Measure performance
const startTime = Date.now();
await performOperation();
metrics.operationTime = Date.now() - startTime;
```

### Error Analytics

```javascript
// Categorize and track errors
const errorCategories = {
  'NETWORK_ERROR': 'Connection or timeout issues',
  'PARSING_ERROR': 'Content extraction failures',
  'API_ERROR': 'External API failures',
  'VALIDATION_ERROR': 'Input validation failures'
};

function categorizeError(error) {
  if (error.code === 'ECONNREFUSED' || error.name === 'TimeoutError') {
    return 'NETWORK_ERROR';
  } else if (error.message.includes('parsing') || error.message.includes('extract')) {
    return 'PARSING_ERROR';
  } else if (error.response?.status >= 400) {
    return 'API_ERROR';
  }
  return 'UNKNOWN_ERROR';
}
```

### Health Checks

```javascript
// System health monitoring
async function performHealthCheck() {
  const checks = {
    database: await checkMongoConnection(),
    vectorDb: await checkPineconeConnection(),
    queue: await checkRedisConnection(),
    browser: await checkBrowserHealth()
  };
  
  const healthy = Object.values(checks).every(check => check.healthy);
  
  return {
    status: healthy ? 'healthy' : 'degraded',
    checks,
    timestamp: new Date().toISOString()
  };
}
```

---

## Configuration Management

### Environment Variables

```bash
# Core Services
MONGODB_URI=mongodb://localhost:27017/askit
REDIS_URL=redis://localhost:6379

# AI Services
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AI...

# Vector Database
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=us-west1-gcp
PINECONE_INDEX_NAME=askit-index

# Processing Limits
MAX_PAGES_PER_CRAWL=100
MAX_CHUNK_SIZE=1000
MAX_CONCURRENT_JOBS=5

# Browser Configuration
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
CRAWL_DELAY=1000
```

### Feature Flags

```javascript
const featureFlags = {
  ENABLE_DYNAMIC_CRAWLING: true,
  ENABLE_BATCH_PROCESSING: true,
  ENABLE_SITEMAP_DISCOVERY: true,
  MAX_RETRIES: 3,
  RESPECT_ROBOTS_TXT: true
};
```

---

## Troubleshooting Guide

### Common Issues

**1. Crawling Failures**
```javascript
// Check browser connectivity
const browser = await getBrowser();
const isConnected = browser.isConnected();

// Validate URL accessibility
const response = await axios.head(url, { timeout: 5000 });
```

**2. Embedding Failures**
```javascript
// Validate API key
const result = await openai.models.list();

// Check token limits
const tokenCount = encode(text).length;
if (tokenCount > 8191) {
  text = text.substring(0, 8000); // Truncate
}
```

**3. Vector Database Issues**
```javascript
// Check Pinecone connection
const stats = await pineconeIndex.describeIndexStats();

// Validate metadata filters
const filter = { userEmail: { "$eq": userEmail } };
```

**4. Job Queue Problems**
```javascript
// Check Redis connection
const queueHealth = await queue.client.ping();

// Retry failed jobs
const failedJobs = await queue.getFailed();
await Promise.all(failedJobs.map(job => job.retry()));
```

### Debugging Tools

```javascript
// Enable debug logging
DEBUG=crawler:*,rag:*,embeddings:* npm run dev

// Monitor job progress
const job = await queue.getJob(jobId);
console.log('Progress:', job.progress);
console.log('Logs:', job.logs);

// Trace API calls
axios.interceptors.request.use(config => {
  console.log(`API Call: ${config.method.toUpperCase()} ${config.url}`);
  return config;
});
```

---

**Last Updated**: September 2025  
**API Version**: 1.0.0
