const express = require('express');
const User = require('../models/User');
const Website = require('../models/Website');
const { authenticateToken, checkResourceOwnership } = require('../middleware/auth');

const router = express.Router();

// Get user's crawled websites (using Website collection)
router.get('/websites', authenticateToken, async (req, res) => {
  try {
    const { status, limit = 10, page = 1 } = req.query;
    
    // Build filter
    const filter = { owner: req.user._id };
    if (status) {
      filter.status = status;
    }
    
    // Get websites with pagination
    const skip = (page - 1) * limit;
    const websites = await Website.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('owner', 'name email');
    
    // Get total count for pagination
    const totalCount = await Website.countDocuments(filter);
    
    // Get stats
    const stats = await Website.aggregate([
      { $match: { owner: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const statsObject = {
      total: totalCount,
      pending: 0,
      crawling: 0,
      completed: 0,
      failed: 0
    };
    
    stats.forEach(stat => {
      statsObject[stat._id] = stat.count;
    });
    
    res.json({
      websites: websites.map(w => ({
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
        errorMessage: w.errorMessage
      })),
      pagination: {
        current: parseInt(page),
        total: Math.ceil(totalCount / limit),
        count: totalCount,
        perPage: parseInt(limit)
      },
      stats: statsObject
    });
  } catch (error) {
    console.error('Get websites error:', error);
    res.status(500).json({
      error: 'Failed to get websites',
      message: 'Internal server error'
    });
  }
});

// Get specific website details
router.get('/websites/:websiteId', authenticateToken, async (req, res) => {
  try {
    const website = await Website.findOne({
      _id: req.params.websiteId,
      owner: req.user._id
    }).populate('owner', 'name email');
    
    if (!website) {
      return res.status(404).json({
        error: 'Website not found',
        message: 'Website not found in your crawled websites'
      });
    }
    
    res.json({ 
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
  } catch (error) {
    console.error('Get website error:', error);
    res.status(500).json({
      error: 'Failed to get website',
      message: 'Internal server error'
    });
  }
});

// Add a new website to crawl
router.post('/websites', authenticateToken, async (req, res) => {
  try {
    const { url, title, description } = req.body;
    
    if (!url) {
      return res.status(400).json({
        error: 'Missing URL',
        message: 'Website URL is required'
      });
    }
    
    // Ensure crawledWebsites is initialized
    if (!req.user.crawledWebsites) {
      req.user.crawledWebsites = [];
    }
    
    // Check if website already exists for this user
    const existingWebsite = req.user.crawledWebsites.find(w => w.url === url);
    if (existingWebsite) {
      return res.status(409).json({
        error: 'Website already exists',
        message: 'This website is already in your crawled websites list'
      });
    }
    
    // Check if user has reached the limit
    if (req.user.crawledWebsites.length >= req.user.preferences.maxWebsites) {
      return res.status(400).json({
        error: 'Limit reached',
        message: `You can only crawl up to ${req.user.preferences.maxWebsites} websites`
      });
    }
    
    const websiteData = {
      url,
      title: title || '',
      description: description || '',
      status: 'pending'
    };
    
    req.user.crawledWebsites.push(websiteData);
    await req.user.save();
    
    const addedWebsite = req.user.crawledWebsites[req.user.crawledWebsites.length - 1];
    
    res.status(201).json({
      message: 'Website added successfully',
      website: addedWebsite
    });
  } catch (error) {
    console.error('Add website error:', error);
    res.status(500).json({
      error: 'Failed to add website',
      message: 'Internal server error'
    });
  }
});

// Update website details
router.put('/websites/:websiteId', authenticateToken, async (req, res) => {
  try {
    const allowedUpdates = ['title', 'description', 'status', 'pagesCrawled', 'errorMessage', 'jobId', 'vectorIds', 'metadata'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    
    if (!isValidOperation) {
      return res.status(400).json({
        error: 'Invalid updates',
        message: `Allowed updates: ${allowedUpdates.join(', ')}`
      });
    }
    
    // Ensure crawledWebsites is initialized
    if (!req.user.crawledWebsites) {
      req.user.crawledWebsites = [];
    }
    
    const website = req.user.crawledWebsites.id(req.params.websiteId);
    if (!website) {
      return res.status(404).json({
        error: 'Website not found',
        message: 'Website not found in your crawled websites'
      });
    }
    
    updates.forEach(update => {
      website[update] = req.body[update];
    });
    
    await req.user.save();
    
    res.json({
      message: 'Website updated successfully',
      website
    });
  } catch (error) {
    console.error('Update website error:', error);
    res.status(500).json({
      error: 'Failed to update website',
      message: 'Internal server error'
    });
  }
});

// Delete website (complete deletion from everywhere)
router.delete('/websites/:websiteId', authenticateToken, async (req, res) => {
  try {
    const { websiteId } = req.params;
    
    // First, find the website in the main Website collection to verify ownership
    const Website = require('../models/Website');
    const Widget = require('../models/Widget');
    
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
    
    // Step 1: Delete associated widget (if exists)
    let deletedWidget = null;
    if (website.hasWidget && website.widgetId) {
      try {
        deletedWidget = await Widget.findByIdAndDelete(website.widgetId);
        console.log(`✅ Deleted associated widget: ${deletedWidget?.widgetId || website.widgetId}`);
      } catch (widgetError) {
        console.error('⚠️  Failed to delete widget:', widgetError);
        // Continue with website deletion even if widget deletion fails
      }
    }
    
    // Step 2: Delete from main Website collection
    await Website.findByIdAndDelete(websiteId);
    
    // Step 3: Remove from User embedded documents using jobId or URL
    await req.user.updateOne({
      $pull: { 
        crawledWebsites: { 
          $or: [
            { jobId: website.jobId },
            { url: website.url }
          ]
        }
      }
    });
    
    res.json({
      message: 'Website and all associated data deleted successfully',
      deletedWebsite: {
        _id: website._id,
        url: website.url,
        domain: website.domain
      },
      deletedWidget: deletedWidget ? {
        _id: deletedWidget._id,
        widgetId: deletedWidget.widgetId
      } : null
    });
  } catch (error) {
    console.error('Delete website error:', error);
    res.status(500).json({
      error: 'Failed to delete website',
      message: 'Internal server error'
    });
  }
});

// Get user statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Ensure crawledWebsites is an array
    const crawledWebsites = user.crawledWebsites || [];
    
    const stats = {
      ...user.stats.toObject(),
      websites: {
        total: crawledWebsites.length,
        active: user.activeWebsitesCount,
        pending: crawledWebsites.filter(w => w.status === 'pending').length,
        crawling: crawledWebsites.filter(w => w.status === 'crawling').length,
        completed: crawledWebsites.filter(w => w.status === 'completed').length,
        failed: crawledWebsites.filter(w => w.status === 'failed').length
      },
      account: {
        createdAt: user.createdAt,
        isEmailVerified: user.isEmailVerified,
        provider: user.provider
      }
    };
    
    res.json({ stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      error: 'Failed to get statistics',
      message: 'Internal server error'
    });
  }
});

module.exports = router;
