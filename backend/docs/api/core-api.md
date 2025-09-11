# Core API Documentation

## Overview
The Core API provides the main functionality for content ingestion, RAG-based querying, and job management. These endpoints handle the core intelligence features of the ASKit platform.

## Base URL
```
http://localhost:3000
```

## Authentication
All endpoints require user authentication:
```
Authorization: Bearer <jwt_token>
```

---

## Content Management Endpoints

### 1. Ingest Website Content
Add a website to the crawling and processing queue.

**Endpoint**: `POST /ingest`

**Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body**:
```json
{
  "websiteUrl": "https://example.com"
}
```

**Validation**:
- URL must be valid and accessible
- Must not be a private IP address (SSRF protection)
- Must not exceed user's website limit
- Must not already exist in user's collection

**Success Response** (200):
```json
{
  "message": "ingest enqueued",
  "jobId": "bull:ingest:123456789"
}
```

**Error Responses**:
```json
// 400 - Missing URL
{
  "error": "websiteUrl required"
}

// 400 - Invalid URL
{
  "error": "Invalid URL",
  "reason": "URL is not accessible or is a private IP"
}

// 400 - Limit reached
{
  "error": "Website limit reached",
  "message": "You can only crawl up to 10 websites"
}

// 409 - Website exists
{
  "error": "Website already exists",
  "message": "This website is already in your crawled websites list"
}
```

**Process Flow**:
1. Validate URL and check SSRF protection
2. Verify user hasn't reached website limit
3. Check if website already exists
4. Enqueue background job for crawling
5. Create Website record in database
6. Add to user's crawled websites list
7. Return job ID for tracking

**cURL Example**:
```bash
curl -X POST http://localhost:3000/ingest \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"websiteUrl": "https://example.com"}'
```

---

### 2. Query Content (RAG)
Ask questions about crawled website content using Retrieval-Augmented Generation.

**Endpoint**: `POST /query`

**Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body**:
```json
{
  "question": "What are your business hours?",
  "website": "example.com",
  "topK": 5
}
```

**Parameters**:
- `question` (required): The question to ask
- `website` (optional): Filter results to specific website domain
- `topK` (optional, default: 5): Number of relevant chunks to retrieve

**Success Response** (200):
```json
{
  "answer": "Our business hours are Monday through Friday from 9 AM to 6 PM EST. We're closed on weekends and major holidays. For urgent inquiries outside these hours, you can contact our emergency support line.",
  "sources": [
    {
      "url": "https://example.com/contact",
      "title": "Contact Us - Example Website",
      "snippet": "Business hours: Monday-Friday 9 AM to 6 PM EST",
      "score": 0.95
    },
    {
      "url": "https://example.com/support",
      "title": "Support Information",
      "snippet": "Our support team is available during regular business hours",
      "score": 0.87
    }
  ],
  "websites": [
    {
      "domain": "example.com",
      "title": "Example Website",
      "chunks_found": 12
    }
  ],
  "websiteFilter": "example.com",
  "context_used": 2,
  "hits": [
    {
      "id": "vec_12345",
      "score": 0.95,
      "metadata": {
        "url": "https://example.com/contact",
        "title": "Contact Us",
        "chunk_index": 3
      }
    }
  ]
}
```

**Error Responses**:
```json
// 400 - Missing question
{
  "error": "question required"
}

// 400 - Query failed
{
  "error": "Query failed",
  "reason": "No relevant content found",
  "details": "Please make sure the website has been successfully crawled"
}
```

**RAG Process**:
1. Generate embeddings for the question
2. Search vector database for similar content
3. Retrieve top-K most relevant chunks
4. Filter by website if specified
5. Use GPT to generate coherent answer
6. Return answer with sources and metadata

**cURL Example**:
```bash
curl -X POST http://localhost:3000/query \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What are your business hours?",
    "website": "example.com",
    "topK": 3
  }'
```

---

## Job Management Endpoints

### 3. Get Job Status
Check the status of a crawling/ingestion job.

**Endpoint**: `GET /job-status/:jobId`

**Path Parameters**:
- `jobId`: Job identifier returned from ingest endpoint

**Success Response** (200):
```json
{
  "id": "bull:ingest:123456789",
  "name": "ingest-job",
  "status": "completed",
  "progress": 100,
  "data": {
    "websiteUrl": "https://example.com",
    "userEmail": "user@example.com"
  },
  "result": {
    "pagesCrawled": 25,
    "chunksProcessed": 156,
    "vectorsUpserted": 156,
    "processingTime": 45000
  },
  "timestamp": "2025-09-11T10:30:00.000Z"
}
```

**Status Values**:
- `waiting`: Job is in queue
- `active`: Currently processing
- `completed`: Successfully finished
- `failed`: Failed with error
- `delayed`: Waiting for retry
- `paused`: Job is paused

**Error Response**:
```json
// Job not found
{
  "error": "Job not found",
  "jobId": "bull:ingest:invalid"
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:3000/job-status/bull:ingest:123456789
```

---

### 4. Get Queue Statistics
Retrieve statistics about the job queue system.

**Endpoint**: `GET /queue-stats`

**Success Response** (200):
```json
{
  "success": true,
  "queues": {
    "ingest": {
      "waiting": 3,
      "active": 2,
      "completed": 145,
      "failed": 12,
      "delayed": 1,
      "paused": 0
    }
  },
  "workers": {
    "active": 2,
    "total": 4
  },
  "processing": {
    "avgProcessingTime": 42000,
    "successRate": 0.923,
    "totalProcessed": 157
  },
  "timestamp": "2025-09-11T10:30:00.000Z"
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:3000/queue-stats
```

---

### 5. Clear Queue (Admin)
Clear all jobs from the queue (development/admin endpoint).

**Endpoint**: `DELETE /queue/clear`

**Query Parameters**:
- `type` (optional): Specific job type to clear

**Success Response** (200):
```json
{
  "success": true,
  "message": "Queue cleared",
  "cleared": {
    "waiting": 5,
    "active": 1,
    "completed": 100,
    "failed": 10,
    "total": 116
  }
}
```

**cURL Example**:
```bash
curl -X DELETE http://localhost:3000/queue/clear
```

---

## Webhook Endpoints

### 6. Job Status Webhook
Internal webhook for job status updates (used by background workers).

**Endpoint**: `POST /webhook/job-status`

**Headers**: `Content-Type: application/json`

**Request Body**:
```json
{
  "jobId": "bull:ingest:123456789",
  "status": "completed",
  "websiteUrl": "https://example.com",
  "pagesCrawled": 25,
  "errorMessage": null,
  "vectorIds": ["vec_1", "vec_2", "vec_3"]
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Webhook processed"
}
```

**Process**:
1. Updates website status in database
2. Updates user's crawled websites list
3. Logs status changes
4. Triggers notifications if configured

---

## Enhanced Legacy Endpoints

### 7. Get Websites (Enhanced)
Get available websites with authentication awareness.

**Endpoint**: `GET /websites` or `GET /websites/:userId`

**Headers**: `Authorization: Bearer <token>` (optional)

**Behavior**:
- **Authenticated users**: Returns user's websites from MongoDB
- **Anonymous users**: Returns websites from Pinecone (legacy support)

**Success Response** (200):
```json
{
  "websites": [
    {
      "domain": "example.com",
      "title": "Example Website",
      "status": "completed",
      "pagesCrawled": 25,
      "lastCrawled": "2025-09-11T08:30:00.000Z"
    }
  ],
  "total": 15,
  "userAuthenticated": true
}
```

---

## Error Handling

### Common Error Responses

**Authentication Errors**:
```json
// 401 - No token provided
{
  "error": "Access token required",
  "message": "Please provide a valid authentication token"
}

// 401 - Invalid token
{
  "error": "Invalid token",
  "message": "Please provide a valid authentication token"
}
```

**Validation Errors**:
```json
// 400 - Missing required fields
{
  "error": "websiteUrl required"
}

// 400 - Invalid data format
{
  "error": "Invalid URL",
  "reason": "URL must be a valid HTTP or HTTPS URL"
}
```

**Business Logic Errors**:
```json
// 409 - Resource conflict
{
  "error": "Website already exists",
  "message": "This website is already in your crawled websites list"
}

// 400 - Limit exceeded
{
  "error": "Website limit reached",
  "message": "You can only crawl up to 10 websites"
}
```

**Server Errors**:
```json
// 500 - Internal server error
{
  "error": "Internal server error",
  "message": "Failed to process ingestion request"
}

// 503 - Service unavailable
{
  "error": "Service unavailable",
  "message": "RAG system is temporarily unavailable"
}
```

---

## Rate Limiting

Core API endpoints have specific rate limits:

| Endpoint | Rate Limit | Window |
|----------|------------|---------|
| `/ingest` | 5 requests | 1 hour |
| `/query` | 30 requests | 1 minute |
| `/job-status` | 60 requests | 1 minute |
| `/queue-stats` | 10 requests | 1 minute |

Rate limit headers:
```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 29
X-RateLimit-Reset: 1694436600
X-RateLimit-Window: 60
```

---

## Usage Examples

### Complete Ingestion Flow

```javascript
// 1. Ingest a website
async function ingestWebsite(websiteUrl, token) {
  try {
    const response = await fetch('/ingest', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ websiteUrl })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || result.error);
    }

    console.log('Ingestion started:', result.jobId);
    return result.jobId;
  } catch (error) {
    console.error('Ingestion failed:', error.message);
    throw error;
  }
}

// 2. Monitor job progress
async function monitorJob(jobId) {
  const maxAttempts = 60; // 5 minutes with 5s intervals
  let attempts = 0;

  return new Promise((resolve, reject) => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/job-status/${jobId}`);
        const status = await response.json();

        console.log(`Job ${jobId} status: ${status.status} (${status.progress}%)`);

        if (status.status === 'completed') {
          console.log('✅ Job completed successfully:', status.result);
          resolve(status);
        } else if (status.status === 'failed') {
          console.error('❌ Job failed:', status.failedReason);
          reject(new Error(`Job failed: ${status.failedReason}`));
        } else if (attempts >= maxAttempts) {
          reject(new Error('Job monitoring timeout'));
        } else {
          attempts++;
          setTimeout(checkStatus, 5000); // Check every 5 seconds
        }
      } catch (error) {
        console.error('Error checking job status:', error);
        if (attempts >= maxAttempts) {
          reject(error);
        } else {
          attempts++;
          setTimeout(checkStatus, 5000);
        }
      }
    };

    checkStatus();
  });
}

// 3. Query the ingested content
async function queryContent(question, website, token) {
  try {
    const response = await fetch('/query', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question,
        website,
        topK: 5
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || result.error);
    }

    return result;
  } catch (error) {
    console.error('Query failed:', error.message);
    throw error;
  }
}

// Usage example
async function processWebsite() {
  const token = 'your_jwt_token_here';
  const websiteUrl = 'https://example.com';
  
  try {
    // Start ingestion
    console.log('🚀 Starting ingestion...');
    const jobId = await ingestWebsite(websiteUrl, token);
    
    // Monitor progress
    console.log('📊 Monitoring progress...');
    const completedJob = await monitorJob(jobId);
    
    // Query content
    console.log('💬 Querying content...');
    const answer = await queryContent(
      'What are your business hours?', 
      'example.com', 
      token
    );
    
    console.log('Answer:', answer.answer);
    console.log('Sources:', answer.sources);
    
  } catch (error) {
    console.error('Process failed:', error.message);
  }
}
```

### Bulk Processing

```javascript
// Process multiple websites
async function bulkIngest(websites, token) {
  const results = [];
  
  for (const websiteUrl of websites) {
    try {
      console.log(`Processing ${websiteUrl}...`);
      
      const jobId = await ingestWebsite(websiteUrl, token);
      results.push({
        url: websiteUrl,
        jobId,
        status: 'started',
        timestamp: new Date().toISOString()
      });
      
      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`Failed to process ${websiteUrl}:`, error.message);
      results.push({
        url: websiteUrl,
        error: error.message,
        status: 'failed',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  return results;
}

// Monitor multiple jobs
async function monitorBulkJobs(jobIds) {
  const promises = jobIds.map(jobId => monitorJob(jobId));
  
  try {
    const results = await Promise.allSettled(promises);
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`Bulk processing complete: ${successful} successful, ${failed} failed`);
    return results;
  } catch (error) {
    console.error('Bulk monitoring failed:', error);
    throw error;
  }
}
```

### Advanced Querying

```javascript
// Multi-website query with fallback
async function smartQuery(question, preferredWebsites, token) {
  const results = [];
  
  // Try preferred websites first
  for (const website of preferredWebsites) {
    try {
      const result = await queryContent(question, website, token);
      if (result.answer && result.sources.length > 0) {
        results.push({
          website,
          ...result,
          confidence: 'high'
        });
      }
    } catch (error) {
      console.warn(`Query failed for ${website}:`, error.message);
    }
  }
  
  // If no good results, try without website filter
  if (results.length === 0) {
    try {
      const result = await queryContent(question, null, token);
      results.push({
        website: 'all',
        ...result,
        confidence: 'medium'
      });
    } catch (error) {
      console.error('Fallback query failed:', error.message);
      throw error;
    }
  }
  
  return results;
}

// Context-aware conversation
class ConversationManager {
  constructor(token) {
    this.token = token;
    this.history = [];
  }
  
  async ask(question, website = null) {
    try {
      // Build context from conversation history
      const contextQuestion = this.buildContextualQuestion(question);
      
      const result = await queryContent(contextQuestion, website, this.token);
      
      // Add to history
      this.history.push({
        question,
        answer: result.answer,
        sources: result.sources,
        timestamp: new Date().toISOString()
      });
      
      // Limit history size
      if (this.history.length > 10) {
        this.history = this.history.slice(-10);
      }
      
      return result;
    } catch (error) {
      console.error('Conversation query failed:', error);
      throw error;
    }
  }
  
  buildContextualQuestion(question) {
    if (this.history.length === 0) {
      return question;
    }
    
    const recentContext = this.history.slice(-3)
      .map(h => `Q: ${h.question}\nA: ${h.answer}`)
      .join('\n\n');
    
    return `Given this conversation context:\n${recentContext}\n\nNew question: ${question}`;
  }
  
  clearHistory() {
    this.history = [];
  }
}

// Usage
const conversation = new ConversationManager('your_token_here');

await conversation.ask('What are your business hours?');
await conversation.ask('Do you offer weekend support?'); // Context-aware
await conversation.ask('How can I contact you?'); // Context-aware
```

---

## Performance Optimization

### Caching Strategies

```javascript
// Simple query cache
class QueryCache {
  constructor(ttl = 300000) { // 5 minutes
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  generateKey(question, website) {
    return `${question}:${website || 'all'}`;
  }
  
  get(question, website) {
    const key = this.generateKey(question, website);
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.data;
    }
    
    this.cache.delete(key);
    return null;
  }
  
  set(question, website, data) {
    const key = this.generateKey(question, website);
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  
  clear() {
    this.cache.clear();
  }
}

const queryCache = new QueryCache();

async function cachedQuery(question, website, token) {
  const cached = queryCache.get(question, website);
  if (cached) {
    console.log('✅ Cache hit');
    return { ...cached, cached: true };
  }
  
  console.log('🔍 Cache miss, querying API...');
  const result = await queryContent(question, website, token);
  
  queryCache.set(question, website, result);
  return result;
}
```

### Batch Operations

```javascript
// Efficient batch querying
async function batchQuery(questions, website, token, batchSize = 5) {
  const results = [];
  
  for (let i = 0; i < questions.length; i += batchSize) {
    const batch = questions.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (question, index) => {
      try {
        const result = await queryContent(question, website, token);
        return { index: i + index, question, ...result };
      } catch (error) {
        return { 
          index: i + index, 
          question, 
          error: error.message 
        };
      }
    });
    
    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults.map(r => r.value || r.reason));
    
    // Rate limiting delay between batches
    if (i + batchSize < questions.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results.sort((a, b) => a.index - b.index);
}
```

---

## Troubleshooting

### Common Issues

**1. Job Stuck in Processing**
```javascript
// Check job status and queue stats
const jobStatus = await fetch(`/job-status/${jobId}`).then(r => r.json());
const queueStats = await fetch('/queue-stats').then(r => r.json());

console.log('Job Status:', jobStatus);
console.log('Queue Stats:', queueStats);

// If job is stuck, you might need to restart it
```

**2. Poor Query Results**
```javascript
// Debug query with detailed response
const result = await queryContent(question, website, token);

console.log('Context used:', result.context_used);
console.log('Sources found:', result.sources.length);
console.log('Hits:', result.hits);

// Try different topK values or broader website filter
```

**3. Rate Limit Errors**
```javascript
// Implement exponential backoff
async function resilientQuery(question, website, token, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await queryContent(question, website, token);
    } catch (error) {
      if (error.message.includes('rate limit') && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`Rate limited, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}
```

**4. Ingestion Failures**
```javascript
// Validate URL before ingestion
async function validateAndIngest(websiteUrl, token) {
  try {
    // Basic URL validation
    new URL(websiteUrl);
    
    // Check if URL is accessible
    const response = await fetch(websiteUrl, { method: 'HEAD' });
    if (!response.ok) {
      throw new Error(`Website returned ${response.status}`);
    }
    
    // Proceed with ingestion
    return await ingestWebsite(websiteUrl, token);
  } catch (error) {
    console.error('Pre-validation failed:', error.message);
    throw error;
  }
}
```

---

**Last Updated**: September 2025  
**API Version**: 1.0.0
