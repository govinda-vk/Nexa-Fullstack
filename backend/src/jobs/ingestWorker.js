// src/jobs/ingestWorker.js
require('dotenv').config();
const { Worker } = require("bullmq");
const { crawlWebsite } = require("../crawler.js");
const { chunkTextByChars } = require("../chunker.js");
const { createEmbedding } = require("../embeddings.js");
const { upsertVectors } = require("../vectordb.js");
const User = require("../models/User");
const Website = require("../models/Website");
const Widget = require("../models/Widget");

// Test Redis connection
const Redis = require("ioredis");
const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
});

redis.on('connect', () => {
  console.log('✅ Worker connected to Redis successfully');
});

redis.on('error', (err) => {
  console.error('❌ Worker Redis connection error:', err.message);
});

// Helper function to update website status in both models
async function updateWebsiteStatus(jobId, status, additionalData = {}) {
  try {
    if (status === 'failed') {
      // For failed websites, remove from both collections
      console.log(`🗑️ Removing failed website with job ${jobId}`);
      
      // Remove from Website collection
      await Website.findOneAndDelete({ jobId });
      
      // Remove from User embedded documents
      await User.updateOne(
        { 'crawledWebsites.jobId': jobId },
        { $pull: { crawledWebsites: { jobId } } }
      );
      
      console.log(`🗑️ Removed failed website from both collections for job ${jobId}`);
      return { success: true, removed: true };
    } else {
      // For other statuses, update normally
      // Update Website model
      const websiteResult = await Website.updateStatusByJobId(jobId, status, additionalData);
      
      // Update User model embedded document
      const userUpdateResult = await User.updateOne(
        { 'crawledWebsites.jobId': jobId },
        { 
          $set: { 
            'crawledWebsites.$.status': status,
            ...Object.keys(additionalData).reduce((acc, key) => {
              acc[`crawledWebsites.$.${key}`] = additionalData[key];
              return acc;
            }, {})
          }
        }
      );
      
      console.log(`📊 Updated website status to '${status}' for job ${jobId}`);
      return { success: true, website: websiteResult.website, userUpdateResult };
    }
  } catch (error) {
    console.error(`Error updating website status for job ${jobId}:`, error);
    return { success: false, error: error.message };
  }
}

const worker = new Worker("ingest", async job => {
  console.log(`🔄 Starting job ${job.id} for ${job.data.websiteUrl}`);
  const { websiteUrl, userEmail } = job.data;
  
  if (!userEmail) {
    throw new Error('User email is required for ingestion');
  }
  
  // Update status to 'crawling'
  await updateWebsiteStatus(job.id, 'crawling');
  
  try {
    // Step 1: Crawling (40% of total progress)
    await job.updateProgress(5);
    console.log(`Starting crawl for ${websiteUrl}...`);

    // Create progress callback function for crawler
    const crawlProgressCallback = async (progress, message) => {
      await job.updateProgress(progress);
      console.log(`Crawl progress: ${progress}% - ${message}`);
    };

    const crawlResult = await crawlWebsite(websiteUrl, 10, crawlProgressCallback); // Pass progress callback
    if (!crawlResult.success) {
      throw new Error(`Crawling failed: ${crawlResult.error}`);
    }
    
    const pages = crawlResult.results;
    console.log(`Crawled ${pages.length} pages`);

    if (!pages || pages.length === 0) {
      throw new Error('No pages found to crawl - website may be empty or inaccessible');
    }

    // Calculate total chunks for progress tracking
    let totalChunks = 0;
    const pageChunks = [];
    
    for (const page of pages) {
      // Log the page content being processed
      console.log(`\n📋 PROCESSING PAGE CONTENT: ${page.url}`);
      console.log(`${'='.repeat(80)}`);
      console.log(page.text);
      console.log(`${'='.repeat(80)}`);
      console.log(`📊 Page content length: ${page.text.length} characters\n`);
      
      const chunkResult = chunkTextByChars(page.text, 1600, 300);
      if (!chunkResult.success) {
        console.warn(`Failed to chunk text for ${page.url}: ${chunkResult.error}`);
        continue;
      }
      pageChunks.push({ page, chunks: chunkResult.chunks });
      totalChunks += chunkResult.chunks.length;
      
      console.log(`📝 Created ${chunkResult.chunks.length} chunks from ${page.url}`);
    }

    if (totalChunks === 0) {
      throw new Error('No valid text chunks could be created from crawled pages');
    }

    console.log(`Processing ${totalChunks} chunks from ${pageChunks.length} pages...`);

    const batch = [];
    let processedChunks = 0;
    let successfulChunks = 0; // Track only successfully processed chunks

    // Step 2: Processing pages (60% of remaining progress: 40% -> 100%)
    for (const { page, chunks } of pageChunks) {
      console.log(`\n🔄 Processing ${chunks.length} chunks from ${page.url}:`);
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        // Log each chunk content
        console.log(`\n📝 CHUNK ${i + 1}/${chunks.length} from ${page.url}:`);
        console.log(`${'─'.repeat(60)}`);
        console.log(chunk);
        console.log(`${'─'.repeat(60)}`);
        console.log(`📏 Chunk length: ${chunk.length} characters`);
        
        // Step 2a: Generate embedding
        const embeddingResult = await createEmbedding(chunk);
        processedChunks++; // Always increment for progress tracking
        
        if (!embeddingResult.success) {
          console.error(`Failed to create embedding for chunk ${i} of ${page.url}: ${embeddingResult.error}`);
          // Update progress even for failed chunks to show we've attempted processing
          const progressPercent = Math.min(40 + Math.floor((processedChunks / totalChunks) * 55), 95);
          await job.updateProgress(progressPercent);
          continue; // Skip this chunk but continue processing
        }
        
        console.log(`✅ Generated embedding for chunk ${i + 1}/${chunks.length}`);
        successfulChunks++; // Only increment for successful chunks
        
        const id = `${userEmail}::${encodeURIComponent(page.url)}::${i}`;
        
        // Extract website domain for filtering
        let websiteDomain;
        try {
          websiteDomain = new URL(page.url).hostname;
        } catch (e) {
          websiteDomain = page.url; // Fallback if URL parsing fails
        }
        
        batch.push({
          id,
          values: embeddingResult.embedding,
          metadata: { 
            url: page.url, 
            website: websiteDomain,
            textPreview: chunk.slice(0, 400), 
            userEmail 
          }
        });

        // Update progress: 40% (crawling) + 55% * (processed/total), leaving 5% for final operations
        const progressPercent = Math.min(40 + Math.floor((processedChunks / totalChunks) * 55), 95);
        await job.updateProgress(progressPercent);

        // Batch upsert when we have 100 vectors
        if (batch.length >= 100) {
          console.log(`💾 Upserting batch of ${batch.length} vectors...`);
          const upsertResult = await upsertVectors(batch.splice(0, batch.length));
          if (!upsertResult.success) {
            throw new Error(`Vector upsert failed: ${upsertResult.error}`);
          }
          console.log(`✅ Successfully upserted batch`);
        }
      }
    }

    // Upsert remaining vectors
    if (batch.length > 0) {
      console.log(`💾 Upserting final batch of ${batch.length} vectors...`);
      await job.updateProgress(98); // Show we're in final cleanup phase
      const upsertResult = await upsertVectors(batch);
      if (!upsertResult.success) {
        throw new Error(`Final vector upsert failed: ${upsertResult.error}`);
      }
      console.log(`✅ Successfully upserted final batch`);
    }

    // Final progress update
    await job.updateProgress(100);
    
    // Log processing summary
    console.log(`\n📊 PROCESSING SUMMARY:`);
    console.log(`Total chunks attempted: ${totalChunks}`);
    console.log(`Successfully processed: ${successfulChunks}`);
    console.log(`Failed chunks: ${totalChunks - successfulChunks}`);
    console.log(`Success rate: ${((successfulChunks / totalChunks) * 100).toFixed(1)}%`);
    
    // Update status to completed
    const websiteUpdateResult = await updateWebsiteStatus(job.id, 'completed', {
      pagesCrawled: pages.length,
      chunksProcessed: successfulChunks, // Use successful chunks count
      chunksAttempted: totalChunks, // Track total attempts
      crawlStats: crawlResult.stats,
      completedAt: new Date()
    });
    
    // Create widget for the completed website
    if (websiteUpdateResult.success && websiteUpdateResult.website) {
      console.log(`🎨 Creating widget for website: ${websiteUpdateResult.website.url}`);
      
      try {
        const widgetResult = await Widget.createForWebsite(
          websiteUpdateResult.website._id, 
          websiteUpdateResult.website.url
        );
        
        if (widgetResult.success) {
          // Update website with widget information
          await Website.findByIdAndUpdate(websiteUpdateResult.website._id, {
            hasWidget: true,
            widgetId: widgetResult.widget._id,
            widgetEnabled: true
          });
          
          console.log(`✅ Widget created successfully with ID: ${widgetResult.widget.widgetId}`);
        } else {
          console.error(`❌ Failed to create widget: ${widgetResult.error}`);
        }
      } catch (widgetError) {
        console.error('❌ Widget creation error:', widgetError);
        // Don't fail the entire job if widget creation fails
      }
    }
    
    return { 
      success: true,
      pagesIngested: pages.length,
      chunksProcessed: successfulChunks, // Use successful chunks count
      chunksAttempted: totalChunks, // Track total attempts
      completedAt: new Date().toISOString(),
      crawlStats: crawlResult.stats
    };

  } catch (error) {
    console.error(`Job failed for ${websiteUrl}:`, error.message);
    
    // Update status to failed
    await updateWebsiteStatus(job.id, 'failed', {
      errorMessage: error.message,
      completedAt: new Date()
    });
    
    throw error;
  }
}, {
  connection: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
  },
});

// Add error handling and logging for worker
worker.on('ready', () => {
  console.log('🚀 Ingest worker is ready and waiting for jobs...');
});

worker.on('active', (job) => {
  console.log(`🔄 Job ${job.id} started processing: ${job.data.websiteUrl}`);
}); 

worker.on('completed', (job, result) => {
  console.log(`✅ Job ${job.id} completed successfully:`, result);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err.message);
});
    
worker.on('error', (err) => {
  console.error('🚨 Worker error:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down worker...');
  await worker.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down worker...');
  await worker.close();
  process.exit(0);
});

module.exports = worker;
