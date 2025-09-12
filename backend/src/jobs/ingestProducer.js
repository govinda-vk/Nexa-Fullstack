require('dotenv').config();
const { Queue } = require("bullmq");

// Test Redis connection
const Redis = require("ioredis");
const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
});

redis.on('connect', () => {
  console.log('✅ Producer connected to Redis successfully');
});

redis.on('error', (err) => {
  console.error('❌ Producer Redis connection error:', err.message);
});

const queue = new Queue("ingest", {
  connection: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
  },
});

async function enqueueIngestJob({ websiteUrl, userEmail }) {
  const job = await queue.add("ingest-job", { websiteUrl, userEmail });
  return job.id;
}

async function getJobStatus(jobId) {
  const job = await queue.getJob(jobId);
  if (!job) {
    return { status: 'not_found', message: 'Job not found' };
  }

  const state = await job.getState();
  const progress = job.progress || 0;
  
  let status;
  let message;
  let phase = 'unknown';
  let phaseDescription = '';
  
  // Determine current phase based on progress
  if (progress >= 0 && progress < 5) {
    phase = 'initializing';
    phaseDescription = 'Preparing to crawl website';
  } else if (progress >= 5 && progress <= 40) {
    phase = 'crawling';
    phaseDescription = 'Discovering and crawling website pages';
  } else if (progress > 40 && progress < 100) {
    phase = 'processing';
    phaseDescription = 'Processing content and creating embeddings';
  } else if (progress === 100) {
    phase = 'completed';
    phaseDescription = 'All tasks completed successfully';
  }
  
  switch (state) {
    case 'waiting':
      status = 'waiting';
      message = 'Job is waiting in queue';
      phase = 'queued';
      phaseDescription = 'Job is queued for processing';
      break;
    case 'active':
      status = 'processing';
      message = phaseDescription || 'Job is currently processing';
      break;
    case 'completed':
      status = 'completed';
      message = 'Job completed successfully';
      phase = 'completed';
      phaseDescription = 'All tasks completed successfully';
      break;
    case 'failed':
      status = 'failed';
      message = job.failedReason || 'Job failed with unknown error';
      phase = 'failed';
      phaseDescription = 'Job encountered an error and failed';
      break;
    default:
      status = 'unknown';
      message = `Job is in ${state} state`;
  }

  return {
    jobId,
    status,
    message,
    progress,
    phase,
    phaseDescription,
    data: job.data,
    result: job.returnvalue,
    createdAt: new Date(job.timestamp),
    processedAt: job.processedOn ? new Date(job.processedOn) : null,
    finishedAt: job.finishedOn ? new Date(job.finishedOn) : null
  };
}

async function clearAllJobs() {
  try {
    // Clear waiting jobs
    await queue.drain();
    
    // Clear completed jobs
    await queue.clean(0, 'completed');
    
    // Clear failed jobs
    await queue.clean(0, 'failed');
    
    // Clear active jobs (be careful with this)
    await queue.clean(0, 'active');
    
    return { success: true, message: 'All jobs cleared successfully' };
  } catch (error) {
    console.error('Error clearing jobs:', error);
    return { success: false, error: `Failed to clear jobs: ${error.message}` };
  }
}

async function clearJobsByType(type, olderThan = 0) {
  try {
    let count = 0;
    
    if (type === 'waiting') {
      await queue.drain();
      count = 'all waiting';
    } else if (['completed', 'failed', 'active', 'stalled'].includes(type)) {
      const jobs = await queue.clean(olderThan, type);
      count = jobs.length;
    } else {
      return { success: false, error: 'Invalid job type. Use: waiting, completed, failed, active, stalled' };
    }
    
    return { success: true, message: `Cleared ${count} ${type} jobs` };
  } catch (error) {
    console.error(`Error clearing ${type} jobs:`, error);
    return { success: false, error: `Failed to clear ${type} jobs: ${error.message}` };
  }
}

async function getQueueStats() {
  try {
    const waiting = await queue.getWaiting();
    const active = await queue.getActive();
    const completed = await queue.getCompleted();
    const failed = await queue.getFailed();
    
    return {
      success: true,
      stats: {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        total: waiting.length + active.length + completed.length + failed.length
      },
      jobs: {
        waiting: waiting.slice(0, 5).map(job => ({ id: job.id, data: job.data })),
        active: active.slice(0, 5).map(job => ({ id: job.id, data: job.data, progress: job.progress })),
        recent_completed: completed.slice(-5).map(job => ({ id: job.id, data: job.data })),
        recent_failed: failed.slice(-5).map(job => ({ id: job.id, data: job.data, reason: job.failedReason }))
      }
    };
  } catch (error) {
    console.error('Error getting queue stats:', error);
    return { success: false, error: `Failed to get queue stats: ${error.message}` };
  }
}

module.exports = { enqueueIngestJob, getJobStatus, clearAllJobs, clearJobsByType, getQueueStats };
