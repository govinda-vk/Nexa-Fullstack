const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const session = require("express-session");
const path = require("path");
const passport = require("./config/passport");
const connectDB = require("./config/database");
const { enqueueIngestJob, getJobStatus, clearAllJobs, clearJobsByType, getQueueStats } = require("./jobs/ingestProducer.js");
const { answerQuestion } = require("./rag.js");
const { validateUrl } = require("./utils/ssrf.js");
const { authenticateToken, optionalAuth } = require("./middleware/auth");

// Models
const User = require("./models/User");
const Website = require("./models/Website");
const Widget = require("./models/Widget");

// Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const widgetRoutes = require("./routes/widget");
const widgetApiRoutes = require("./routes/widgetApi");
const cashflowRoutes = require("./cashflow-analysis/routes/cashflowRoutes");

// Widget utilities
const { generateWidgetScript } = require("./utils/widgetScript");

dotenv.config();

// Connect to MongoDB
connectDB();

// Import and start the worker
const worker = require("./jobs/ingestWorker.js");
console.log("📋 Background worker started");

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", // Allow inline scripts for demo pages
        "'unsafe-eval'", // Allow eval for dynamic script loading
        "https://generativelanguage.googleapis.com", // Gemini API
        "https://www.google-analytics.com", // Analytics if needed
        "https://cdn.jsdelivr.net", // Chart.js CDN
      ],
      scriptSrcAttr: ["'unsafe-inline'"], // Allow inline event handlers
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://generativelanguage.googleapis.com"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));
app.use(cors({
  origin: true, // Allow all origins for universal widget embedding
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Widget-API-Key', 'X-Widget-Session', 'Origin', 'Accept'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining']
}));

// Session configuration for Passport
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Request logging middleware
app.use(morgan('combined'));

app.use(express.json({ limit: "1mb" }));

// Serve static HTML files for testing
app.use(express.static(path.join(__dirname, '..')));

// Auth routes
app.use('/auth', authRoutes);

// User routes
app.use('/user', userRoutes);

// Widget management routes
app.use('/widget', widgetRoutes);

// Widget API routes (for embedded widgets)
app.use('/widget', widgetApiRoutes);

// Cashflow analysis routes
app.use('/api/cashflow', cashflowRoutes);

// POST /ingest { websiteUrl } - Requires authentication
app.post("/ingest", authenticateToken, async (req, res) => {
  try {
    const { websiteUrl } = req.body;
    if (!websiteUrl) return res.status(400).json({ error: "websiteUrl required" });
    
    // User must be authenticated to ingest websites
    const userEmail = req.user.email;
    
    // Check if user has reached website limit
    if (req.user.crawledWebsites.length >= req.user.preferences.maxWebsites) {
      return res.status(400).json({
        error: "Website limit reached",
        message: `You can only crawl up to ${req.user.preferences.maxWebsites} websites`
      });
    }
    
    // Check if website already exists for this user
    const existingWebsite = req.user.crawledWebsites.find(w => w.url === websiteUrl);
    if (existingWebsite) {
      return res.status(409).json({
        error: "Website already exists",
        message: "This website is already in your crawled websites list"
      });
    }
    
    // Validate URL with proper error handling
    const validation = await validateUrl(websiteUrl);
    if (!validation.valid) {
      return res.status(400).json({ 
        error: "Invalid URL", 
        reason: validation.error 
      });
    }

    // enqueue background job that will crawl + embed + upsert
    const jobId = await enqueueIngestJob({ websiteUrl, userEmail });
    
    // Extract domain from URL
    let domain;
    try {
      domain = new URL(websiteUrl).hostname;
    } catch (e) {
      domain = websiteUrl.replace(/^https?:\/\//, '').split('/')[0];
    }
    
    // Create entry in Website collection
    const website = new Website({
      url: websiteUrl,
      domain,
      owner: req.user._id,
      ownerEmail: userEmail,
      jobId,
      status: 'pending'
    });
    
    try {
      await website.save();
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          error: "Website already exists",
          message: "This website is already in your crawled websites list"
        });
      }
      throw error;
    }
    
    // Add website to user's list (embedded document)
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        crawledWebsites: {
          url: websiteUrl,
          domain,
          status: 'pending',
          jobId: jobId,
          crawledAt: new Date()
        }
      }
    });
    
    return res.json({ message: "ingest enqueued", jobId });
  } catch (err) {
    console.error("Error in /ingest endpoint:", err);
    return res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to process ingestion request" 
    });
  }
});

// POST /query { question, website, topK } - Requires authentication
app.post("/query", authenticateToken, async (req, res) => {
  try {
    const { question, website, topK = 5 } = req.body;
    if (!question) return res.status(400).json({ error: "question required" });
    
    // Use authenticated user's email
    const userEmail = req.user.email;
    
    // Update user's query statistics
    const User = require("./models/User");
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.totalQueries': 1 }
    });
    
    const result = await answerQuestion({ question, userEmail, website, topK });
    
    if (!result.success) {
      return res.status(400).json({ 
        error: "Query failed", 
        reason: result.error,
        details: result.details 
      });
    }
    
    return res.json({
      answer: result.answer,
      sources: result.sources || [],
      websites: result.websites || [],
      websiteFilter: result.websiteFilter,
      context_used: result.context_used || 0,
      hits: result.hits || []
    });
  } catch (err) {
    console.error("Error in /query endpoint:", err);
    return res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to process query" 
    });
  }
});

// GET /job-status/:jobId
app.get("/job-status/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;
    const status = await getJobStatus(jobId);
    return res.json(status);
  } catch (err) {
    console.error("Error getting job status:", err);
    return res.status(500).json({ error: "Failed to get job status" });
  }
});

// POST /webhook/job-status - Webhook for job status updates
app.post("/webhook/job-status", async (req, res) => {
  try {
    const { jobId, status, websiteUrl, pagesCrawled, errorMessage, vectorIds } = req.body;
    
    if (!jobId || !status) {
      return res.status(400).json({ error: "jobId and status are required" });
    }

    // Update user's website status if user exists
    const { updateWebsiteStatus } = require("./utils/userWebsite");
    const additionalData = {};
    
    if (pagesCrawled !== undefined) additionalData.pagesCrawled = pagesCrawled;
    if (errorMessage) additionalData.errorMessage = errorMessage;
    if (vectorIds) additionalData.vectorIds = vectorIds;
    if (websiteUrl) additionalData.url = websiteUrl;
    
    const result = await updateWebsiteStatus(jobId, status, additionalData);
    
    if (result.success) {
      console.log(`✅ Updated website status for job ${jobId}: ${status}`);
    } else {
      console.log(`⚠️ Failed to update website status for job ${jobId}: ${result.error}`);
    }
    
    return res.json({ success: true, message: "Webhook processed" });
  } catch (err) {
    console.error("Error processing job status webhook:", err);
    return res.status(500).json({ error: "Failed to process webhook" });
  }
});

// GET /queue-stats - Get queue statistics
app.get("/queue-stats", async (req, res) => {
  try {
    const stats = await getQueueStats();
    if (!stats.success) {
      return res.status(500).json({ error: stats.error });
    }
    return res.json(stats);
  } catch (err) {
    console.error("Error getting queue stats:", err);
    return res.status(500).json({ error: "Failed to get queue statistics" });
  }
});

// DELETE /queue/clear - Clear all jobs
app.delete("/queue/clear", async (req, res) => {
  try {
    const result = await clearAllJobs();
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }
    return res.json(result);
  } catch (err) {
    console.error("Error clearing queue:", err);
    return res.status(500).json({ error: "Failed to clear queue" });
  }
});

// DELETE /queue/clear/:type - Clear specific job types
app.delete("/queue/clear/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const { olderThan = 0 } = req.query; // Optional: clear jobs older than X milliseconds
    
    const result = await clearJobsByType(type, parseInt(olderThan));
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    return res.json(result);
  } catch (err) {
    console.error(`Error clearing ${req.params.type} jobs:`, err);
    return res.status(500).json({ error: `Failed to clear ${req.params.type} jobs` });
  }
});

// GET /websites - List available websites for authenticated user
app.get("/websites", authenticateToken, async (req, res) => {
  try {
    // Get websites from both Website collection and User embedded documents
    const websiteResult = await Website.getUserWebsitesWithStats(req.user._id);
    
    if (!websiteResult.success) {
      return res.status(500).json({ error: websiteResult.error });
    }
    
    return res.json({
      userEmail: req.user.email,
      websites: await Promise.all(websiteResult.websites.map(async (w) => {
        // Get widget information if available
        let widgetInfo = null;
        if (w.hasWidget && w.widgetId) {
          try {
            const widget = await Widget.findById(w.widgetId);
            if (widget) {
              widgetInfo = {
                widgetId: widget.widgetId,
                embedCode: widget.embedCode,
                scriptUrl: widget.scriptUrl,
                isActive: widget.isActive,
                config: {
                  title: widget.config.title,
                  theme: widget.config.theme,
                  position: widget.config.position
                }
              };
            }
          } catch (err) {
            console.warn(`Failed to get widget info for website ${w._id}:`, err);
          }
        }
        
        return {
          _id: w._id,
          url: w.url,
          title: w.title,
          domain: w.domain,
          status: w.status,
          crawledAt: w.crawledAt,
          completedAt: w.completedAt,
          pagesCrawled: w.pagesCrawled,
          chunksProcessed: w.chunksProcessed,
          jobId: w.jobId,
          errorMessage: w.errorMessage,
          hasWidget: w.hasWidget,
          widgetEnabled: w.widgetEnabled,
          widget: widgetInfo
        };
      })),
      totalWebsites: websiteResult.websites.length,
      stats: websiteResult.stats
    });
    
  } catch (err) {
    console.error("Error getting websites:", err);
    return res.status(500).json({ error: "Failed to get websites" });
  }
});

// GET /websites/:websiteId - Get specific website details
app.get("/websites/:websiteId", authenticateToken, async (req, res) => {
  try {
    const { websiteId } = req.params;
    
    const website = await Website.findOne({
      _id: websiteId,
      owner: req.user._id
    }).populate('owner', 'name email');
    
    if (!website) {
      return res.status(404).json({ error: "Website not found" });
    }
    
    return res.json({
      website: {
        _id: website._id,
        url: website.url,
        title: website.title,
        domain: website.domain,
        status: website.status,
        crawledAt: website.crawledAt,
        completedAt: website.completedAt,
        pagesCrawled: website.pagesCrawled,
        chunksProcessed: website.chunksProcessed,
        jobId: website.jobId,
        errorMessage: website.errorMessage,
        crawlStats: website.crawlStats,
        metadata: website.metadata,
        owner: website.owner
      }
    });
    
  } catch (err) {
    console.error("Error getting website details:", err);
    return res.status(500).json({ error: "Failed to get website details" });
  }
});

// DELETE /websites/:websiteId - Delete a website
app.delete("/websites/:websiteId", authenticateToken, async (req, res) => {
  try {
    const { websiteId } = req.params;
    
    // Find and delete from Website collection
    const website = await Website.findOneAndDelete({
      _id: websiteId,
      owner: req.user._id
    });
    
    if (!website) {
      return res.status(404).json({ error: "Website not found" });
    }
    
    // Remove from User embedded documents
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { crawledWebsites: { jobId: website.jobId } }
    });
    
    return res.json({
      message: "Website deleted successfully",
      deletedWebsite: {
        _id: website._id,
        url: website.url,
        domain: website.domain
      }
    });
    
  } catch (err) {
    console.error("Error deleting website:", err);
    return res.status(500).json({ error: "Failed to delete website" });
  }
});

// GET /health
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Widget script serving endpoint
app.get("/widget/:widgetId/script.js", async (req, res) => {
  try {
    const { widgetId } = req.params;
    
    // Find widget by widgetId
    const widget = await Widget.findByWidgetId(widgetId);
    
    if (!widget) {
      return res.status(404).send('// Widget not found');
    }
    
    if (!widget.isActive) {
      return res.status(403).send('// Widget is disabled');
    }
    
    // Prepare widget configuration for script
    const widgetConfig = {
      widgetId: widget.widgetId,
      apiKey: widget.apiKey,
      title: widget.config.title,
      subtitle: widget.config.subtitle,
      theme: widget.config.theme,
      primaryColor: widget.config.primaryColor,
      position: widget.config.position,
      size: widget.config.size,
      autoOpen: widget.config.autoOpen,
      showWelcomeMessage: widget.config.showWelcomeMessage,
      welcomeMessage: widget.config.welcomeMessage,
      placeholder: widget.config.placeholder,
      avatar: widget.config.avatar,
      showPoweredBy: widget.config.showPoweredBy,
      maxMessages: widget.config.maxMessages,
      sessionTimeout: widget.config.sessionTimeout,
      allowFileUploads: widget.config.allowFileUploads,
      allowFeedback: widget.config.allowFeedback
    };
    
    // Generate the widget script
    const script = generateWidgetScript(widgetConfig);
    
    // Set comprehensive CORS headers for cross-origin script loading
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'false'); // Scripts don't need credentials
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); // Allow cross-origin resource loading
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    res.send(script);
    
  } catch (error) {
    console.error('Widget script serving error:', error);
    res.status(500).send('// Error loading widget script');
  }
});

// Handle OPTIONS preflight for widget script
app.options("/widget/:widgetId/script.js", (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours
  res.status(204).send();
});

// Start the server
app.listen(process.env.PORT || 3000, () => {
  console.log(`🚀 Server running on port ${process.env.PORT || 3000}`);
  console.log("📋 Background job worker is active");
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down server...');
  if (worker) {
    await worker.close();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down server...');
  if (worker) {
    await worker.close();
  }
  process.exit(0);
});
