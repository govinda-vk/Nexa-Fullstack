const express = require('express');
const Widget = require('../models/Widget');
const Website = require('../models/Website');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get widget configuration for a website
router.get('/website/:websiteId', authenticateToken, async (req, res) => {
  try {
    const { websiteId } = req.params;
    
    // Verify website ownership
    const website = await Website.findOne({ 
      _id: websiteId, 
      owner: req.user._id 
    });
    
    if (!website) {
      return res.status(404).json({
        error: 'Website not found',
        message: 'Website not found or you do not have permission to access it'
      });
    }
    
    // Get widget configuration
    const widget = await Widget.findOne({ websiteId });
    
    if (!widget) {
      return res.status(404).json({
        error: 'Widget not found',
        message: 'No widget configuration found for this website'
      });
    }
    
    // Return widget with embed code
    const response = widget.toJSON();
    response.embedCode = widget.embedCode;
    response.scriptUrl = widget.scriptUrl;
    
    res.json({
      message: 'Widget configuration retrieved successfully',
      widget: response
    });
    
  } catch (error) {
    console.error('Get widget config error:', error);
    res.status(500).json({
      error: 'Failed to get widget configuration',
      message: 'Internal server error'
    });
  }
});

// Update widget configuration
router.put('/website/:websiteId', authenticateToken, async (req, res) => {
  try {
    const { websiteId } = req.params;
    
    // Verify website ownership
    const website = await Website.findOne({ 
      _id: websiteId, 
      owner: req.user._id 
    });
    
    if (!website) {
      return res.status(404).json({
        error: 'Website not found',
        message: 'Website not found or you do not have permission to access it'
      });
    }
    
    const widget = await Widget.findOne({ websiteId });
    
    if (!widget) {
      return res.status(404).json({
        error: 'Widget not found',
        message: 'No widget configuration found for this website'
      });
    }
    
    // Define allowed config updates
    const allowedConfigUpdates = [
      'theme', 'primaryColor', 'position', 'size', 'autoOpen', 
      'showWelcomeMessage', 'welcomeMessage', 'placeholder', 
      'title', 'subtitle', 'avatar', 'showPoweredBy',
      'maxMessages', 'sessionTimeout', 'allowFileUploads', 
      'allowFeedback'
    ];
    
    const allowedRootUpdates = ['isActive', 'allowedDomains'];
    
    // Update config fields
    if (req.body.config) {
      Object.keys(req.body.config).forEach(key => {
        if (allowedConfigUpdates.includes(key)) {
          widget.config[key] = req.body.config[key];
        }
      });
    }
    
    // Update root level fields
    Object.keys(req.body).forEach(key => {
      if (allowedRootUpdates.includes(key)) {
        widget[key] = req.body[key];
      }
    });
    
    // Update rate limits if provided
    if (req.body.rateLimits) {
      Object.keys(req.body.rateLimits).forEach(key => {
        if (['messagesPerMinute', 'messagesPerHour'].includes(key)) {
          widget.rateLimits[key] = req.body.rateLimits[key];
        }
      });
    }
    
    await widget.save();
    
    // Update website widget status if changed
    if (req.body.isActive !== undefined) {
      await Website.findByIdAndUpdate(websiteId, {
        widgetEnabled: req.body.isActive
      });
    }
    
    const response = widget.toJSON();
    response.embedCode = widget.embedCode;
    response.scriptUrl = widget.scriptUrl;
    
    res.json({
      message: 'Widget configuration updated successfully',
      widget: response
    });
    
  } catch (error) {
    console.error('Update widget config error:', error);
    res.status(500).json({
      error: 'Failed to update widget configuration',
      message: 'Internal server error'
    });
  }
});

// Regenerate widget API key
router.post('/website/:websiteId/regenerate-key', authenticateToken, async (req, res) => {
  try {
    const { websiteId } = req.params;
    
    // Verify website ownership
    const website = await Website.findOne({ 
      _id: websiteId, 
      owner: req.user._id 
    });
    
    if (!website) {
      return res.status(404).json({
        error: 'Website not found',
        message: 'Website not found or you do not have permission to access it'
      });
    }
    
    const widget = await Widget.findOne({ websiteId });
    
    if (!widget) {
      return res.status(404).json({
        error: 'Widget not found',
        message: 'No widget configuration found for this website'
      });
    }
    
    await widget.regenerateApiKey();
    
    res.json({
      message: 'API key regenerated successfully',
      apiKey: widget.apiKey
    });
    
  } catch (error) {
    console.error('Regenerate API key error:', error);
    res.status(500).json({
      error: 'Failed to regenerate API key',
      message: 'Internal server error'
    });
  }
});

// Get widget analytics/stats
router.get('/website/:websiteId/stats', authenticateToken, async (req, res) => {
  try {
    const { websiteId } = req.params;
    
    // Verify website ownership
    const website = await Website.findOne({ 
      _id: websiteId, 
      owner: req.user._id 
    });
    
    if (!website) {
      return res.status(404).json({
        error: 'Website not found',
        message: 'Website not found or you do not have permission to access it'
      });
    }
    
    const widget = await Widget.findOne({ websiteId });
    
    if (!widget) {
      return res.status(404).json({
        error: 'Widget not found',
        message: 'No widget configuration found for this website'
      });
    }
    
    res.json({
      stats: widget.stats,
      website: {
        url: website.url,
        domain: website.domain,
        title: website.title
      }
    });
    
  } catch (error) {
    console.error('Get widget stats error:', error);
    res.status(500).json({
      error: 'Failed to get widget statistics',
      message: 'Internal server error'
    });
  }
});

// Test widget functionality (for development/debugging)
router.post('/website/:websiteId/test', authenticateToken, async (req, res) => {
  try {
    const { websiteId } = req.params;
    const { message } = req.body;
    
    // Verify website ownership
    const website = await Website.findOne({ 
      _id: websiteId, 
      owner: req.user._id 
    });
    
    if (!website) {
      return res.status(404).json({
        error: 'Website not found',
        message: 'Website not found or you do not have permission to access it'
      });
    }
    
    const widget = await Widget.findOne({ websiteId }).populate('websiteId');
    
    if (!widget) {
      return res.status(404).json({
        error: 'Widget not found',
        message: 'No widget configuration found for this website'
      });
    }
    
    if (!widget.isActive) {
      return res.status(400).json({
        error: 'Widget inactive',
        message: 'Widget is currently disabled'
      });
    }
    
    // This is a test endpoint - in real implementation, this would
    // use the same chat API that the widget uses
    res.json({
      message: 'Widget test successful',
      config: {
        title: widget.config.title,
        theme: widget.config.theme,
        position: widget.config.position
      },
      testMessage: message || 'Hello from NEXA Assistant!',
      website: website.url
    });
    
  } catch (error) {
    console.error('Test widget error:', error);
    res.status(500).json({
      error: 'Failed to test widget',
      message: 'Internal server error'
    });
  }
});

// Create widget for existing website (manual creation)
router.post('/website/:websiteId/create', authenticateToken, async (req, res) => {
  try {
    const { websiteId } = req.params;
    
    // Verify website ownership
    const website = await Website.findOne({ 
      _id: websiteId, 
      owner: req.user._id 
    });
    
    if (!website) {
      return res.status(404).json({
        error: 'Website not found',
        message: 'Website not found or you do not have permission to access it'
      });
    }
    
    if (website.status !== 'completed') {
      return res.status(400).json({
        error: 'Website not ready',
        message: 'Widget can only be created for completed websites'
      });
    }
    
    // Check if widget already exists
    const existingWidget = await Widget.findOne({ websiteId });
    
    if (existingWidget) {
      return res.status(409).json({
        error: 'Widget already exists',
        message: 'A widget already exists for this website'
      });
    }
    
    // Create widget
    const widgetResult = await Widget.createForWebsite(websiteId, website.url);
    
    if (!widgetResult.success) {
      return res.status(500).json({
        error: 'Failed to create widget',
        message: widgetResult.error
      });
    }
    
    // Update website
    await Website.findByIdAndUpdate(websiteId, {
      hasWidget: true,
      widgetId: widgetResult.widget._id,
      widgetEnabled: true
    });
    
    const response = widgetResult.widget.toJSON();
    response.embedCode = widgetResult.widget.embedCode;
    response.scriptUrl = widgetResult.widget.scriptUrl;
    
    res.status(201).json({
      message: 'Widget created successfully',
      widget: response
    });
    
  } catch (error) {
    console.error('Create widget error:', error);
    res.status(500).json({
      error: 'Failed to create widget',
      message: 'Internal server error'
    });
  }
});

module.exports = router;
