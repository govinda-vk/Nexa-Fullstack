const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  domain: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownerEmail: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'crawling', 'completed', 'failed'],
    default: 'pending'
  },
  jobId: {
    type: String,
    required: true,
    trim: true
  },
  pagesCrawled: {
    type: Number,
    default: 0
  },
  chunksProcessed: {
    type: Number,
    default: 0
  },
  chunksAttempted: {
    type: Number,
    default: 0
  },
  crawledAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  errorMessage: {
    type: String,
    trim: true
  },
  vectorIds: [{
    type: String,
    trim: true
  }],
  crawlStats: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Widget integration
  hasWidget: {
    type: Boolean,
    default: false
  },
  widgetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Widget',
    default: null
  },
  widgetEnabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
websiteSchema.index({ owner: 1, status: 1 });
websiteSchema.index({ ownerEmail: 1, status: 1 });
websiteSchema.index({ jobId: 1 });
websiteSchema.index({ domain: 1 });
websiteSchema.index({ url: 1, owner: 1 }, { unique: true }); // Prevent duplicate URLs per user

// Virtual for getting domain from URL
websiteSchema.virtual('domainName').get(function() {
  try {
    return new URL(this.url).hostname;
  } catch (e) {
    return this.domain || 'unknown';
  }
});

// Static method to update status by jobId
websiteSchema.statics.updateStatusByJobId = async function(jobId, status, additionalData = {}) {
  try {
    const updateData = { 
      status,
      ...additionalData
    };
    
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }
    
    const result = await this.findOneAndUpdate(
      { jobId },
      updateData,
      { new: true, runValidators: true }
    );
    
    return { success: true, website: result };
  } catch (error) {
    console.error('Error updating website status:', error);
    return { success: false, error: error.message };
  }
};

// Static method to get user's websites with stats
websiteSchema.statics.getUserWebsitesWithStats = async function(userId) {
  try {
    const websites = await this.find({ owner: userId })
      .sort({ createdAt: -1 })
      .populate('owner', 'name email');
    
    const stats = {
      total: websites.length,
      pending: websites.filter(w => w.status === 'pending').length,
      crawling: websites.filter(w => w.status === 'crawling').length,
      completed: websites.filter(w => w.status === 'completed').length,
      failed: websites.filter(w => w.status === 'failed').length
    };
    
    return { success: true, websites, stats };
  } catch (error) {
    console.error('Error getting user websites:', error);
    return { success: false, error: error.message };
  }
};

module.exports = mongoose.model('Website', websiteSchema);
