const express = require('express');
const rateLimit = require('express-rate-limit');
const Widget = require('../models/Widget');
const { answerQuestion } = require('../rag');

const router = express.Router();

// Middleware to authenticate widget API key
const authenticateWidget = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-widget-api-key'];
    const referer = req.headers['referer'] || req.headers['origin'];
    
    if (!apiKey) {
      return res.status(401).json({
        error: 'API key required',
        message: 'Widget API key is required'
      });
    }
    
    // Find widget by API key
    const widget = await Widget.validateApiKey(apiKey);
    
    if (!widget) {
      return res.status(401).json({
        error: 'Invalid API key',
        message: 'Widget API key is invalid or inactive'
      });
    }
    
    // Allow all domains - no domain restrictions for universal embedding
    // This enables the widget to work on any website with just the script tag
    
    req.widget = widget;
    next();
  } catch (error) {
    console.error('Widget authentication error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      message: 'Internal server error during authentication'
    });
  }
};

// Temporary: Disable rate limiting to fix cross-origin issues
const widgetRateLimit = (req, res, next) => {
  // Skip rate limiting for now
  next();
};

// Widget chat endpoint
router.post('/chat', authenticateWidget, widgetRateLimit, async (req, res) => {
  try {
    const { message, sessionId, websiteUrl, timestamp } = req.body;
    const widget = req.widget;
    
    // Validate required fields
    if (!message || !message.trim()) {
      return res.status(400).json({
        error: 'Message required',
        message: 'Please provide a message'
      });
    }
    
    if (!sessionId) {
      return res.status(400).json({
        error: 'Session ID required',
        message: 'Widget session ID is required'
      });
    }
    
    // Check if widget is active
    if (!widget.isActive) {
      return res.status(403).json({
        error: 'Widget inactive',
        message: 'This chat widget is currently disabled'
      });
    }
    
    // Get website information
    const website = widget.websiteId;
    if (!website || website.status !== 'completed') {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'The knowledge base is not ready yet. Please try again later.'
      });
    }
    
    console.log(`🤖 Widget chat request for ${website.domain}: "${message}"`);
    
    // Update widget usage stats
    try {
      await widget.incrementUsage(1);
    } catch (statsError) {
      console.warn('Failed to update widget stats:', statsError);
    }
    
    // Use the existing RAG system to answer the question
    const ragResult = await answerQuestion({
      question: message.trim(),
      userEmail: website.ownerEmail,
      website: website.domain, // Filter responses to this website only
      topK: 5
    });
    
    if (!ragResult.success) {
      console.error('RAG system error:', ragResult.error);
      return res.status(500).json({
        error: 'Processing failed',
        message: 'I apologize, but I encountered an error processing your question. Please try again.',
        details: ragResult.error
      });
    }
    
    // Format response for widget
    const response = {
      answer: ragResult.answer,
      sources: ragResult.sources || [],
      sessionId,
      timestamp: new Date().toISOString(),
      confidence: ragResult.confidence || null,
      
      // Widget-specific metadata
      widget: {
        title: widget.config.title,
        sessionTimeout: widget.config.sessionTimeout
      }
    };
    
    console.log(`✅ Widget response sent for ${website.domain}`);
    
    res.json(response);
    
  } catch (error) {
    console.error('Widget chat error:', error);
    
    // Don't expose internal errors to widget users
    res.status(500).json({
      error: 'Processing failed',
      message: 'I apologize, but I encountered an error. Please try again later.'
    });
  }
});

// Widget configuration endpoint (for dynamic updates)
router.get('/config', authenticateWidget, async (req, res) => {
  try {
    const widget = req.widget;
    
    // Return safe config (no API keys or sensitive data)
    const safeConfig = {
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
    
    res.json({
      config: safeConfig,
      websiteInfo: {
        domain: widget.websiteId.domain,
        title: widget.websiteId.title
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get widget config error:', error);
    res.status(500).json({
      error: 'Failed to get configuration',
      message: 'Internal server error'
    });
  }
});

// Widget stats endpoint (for analytics pings)
router.post('/stats', authenticateWidget, async (req, res) => {
  try {
    const { sessionId, action, timestamp } = req.body;
    const widget = req.widget;
    
    // Update stats based on action
    switch (action) {
      case 'widget_opened':
        // Could track widget opens
        break;
      case 'conversation_started':
        await widget.incrementConversations();
        break;
      case 'message_sent':
        // Already handled in chat endpoint
        break;
      default:
        // Unknown action, just acknowledge
        break;
    }
    
    res.json({
      success: true,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Widget stats error:', error);
    res.status(200).json({
      success: false,
      error: 'Failed to update stats'
    });
  }
});

// Widget feedback endpoint
router.post('/feedback', authenticateWidget, async (req, res) => {
  try {
    const { rating, comment, sessionId } = req.body;
    const widget = req.widget;
    
    if (!widget.config.allowFeedback) {
      return res.status(403).json({
        error: 'Feedback disabled',
        message: 'Feedback is not enabled for this widget'
      });
    }
    
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        error: 'Invalid rating',
        message: 'Rating must be between 1 and 5'
      });
    }
    
    // Add rating to widget
    if (rating) {
      await widget.addRating(rating);
    }
    
    // Here you could store detailed feedback in a separate collection
    // For now, just acknowledge
    console.log(`📝 Widget feedback for ${widget.websiteId.domain}: Rating ${rating}, Comment: "${comment}"`);
    
    res.json({
      success: true,
      message: 'Thank you for your feedback!',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Widget feedback error:', error);
    res.status(500).json({
      error: 'Failed to submit feedback',
      message: 'Internal server error'
    });
  }
});

// Health check for widget
router.get('/health', authenticateWidget, (req, res) => {
  const widget = req.widget;
  
  res.json({
    status: 'ok',
    widget: {
      id: widget.widgetId,
      domain: widget.websiteId.domain,
      active: widget.isActive
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
