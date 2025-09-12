const mongoose = require('mongoose');
const crypto = require('crypto');

const widgetSchema = new mongoose.Schema({
  // Associated website
  websiteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    required: true,
    unique: true
  },
  
  // Widget identification
  widgetId: {
    type: String,
    required: true,
    unique: true,
    default: () => crypto.randomBytes(16).toString('hex')
  },
  
  // API key for widget authentication
  apiKey: {
    type: String,
    required: true,
    unique: true,
    default: () => `nexa_widget_${crypto.randomBytes(24).toString('hex')}`
  },
  
  // Widget configuration
  config: {
    // Appearance
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    primaryColor: {
      type: String,
      default: '#8B5CF6' // Purple color from the UI
    },
    position: {
      type: String,
      enum: ['bottom-right', 'bottom-left', 'top-right', 'top-left'],
      default: 'bottom-right'
    },
    size: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium'
    },
    
    // Behavior
    autoOpen: {
      type: Boolean,
      default: false
    },
    showWelcomeMessage: {
      type: Boolean,
      default: true
    },
    welcomeMessage: {
      type: String,
      default: 'Hello! How can I help you today?'
    },
    placeholder: {
      type: String,
      default: 'Type your message...'
    },
    
    // Branding
    title: {
      type: String,
      default: 'NEXA Assistant'
    },
    subtitle: {
      type: String,
      default: 'AI-powered support'
    },
    avatar: {
      type: String,
      default: null // URL to avatar image
    },
    showPoweredBy: {
      type: Boolean,
      default: true
    },
    
    // Advanced settings
    maxMessages: {
      type: Number,
      default: 100,
      min: 10,
      max: 500
    },
    sessionTimeout: {
      type: Number,
      default: 30, // minutes
      min: 5,
      max: 7200 // 5 days in minutes (was 120)
    },
    allowFileUploads: {
      type: Boolean,
      default: false
    },
    allowFeedback: {
      type: Boolean,
      default: true
    }
  },
  
  // Analytics and usage
  stats: {
    totalConversations: {
      type: Number,
      default: 0
    },
    totalMessages: {
      type: Number,
      default: 0
    },
    lastUsed: {
      type: Date,
      default: null
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    }
  },
  
  // Security and access control
  allowedDomains: [{
    type: String,
    trim: true
  }],
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Rate limiting
  rateLimits: {
    messagesPerMinute: {
      type: Number,
      default: 10,
      min: 1,
      max: 60
    },
    messagesPerHour: {
      type: Number,
      default: 100,
      min: 10,
      max: 1000
    }
  }
}, {
  timestamps: true
});

// Indexes
widgetSchema.index({ websiteId: 1 }, { unique: true });
widgetSchema.index({ widgetId: 1 }, { unique: true });
widgetSchema.index({ apiKey: 1 }, { unique: true });
widgetSchema.index({ isActive: 1 });

// Virtual for embed code
widgetSchema.virtual('embedCode').get(function() {
  const baseUrl = process.env.WIDGET_BASE_URL || 'http://localhost:3000';
  return `<script src="${baseUrl}/widget/${this.widgetId}/script.js"></script>`;
});

// Virtual for script URL
widgetSchema.virtual('scriptUrl').get(function() {
  const baseUrl = process.env.WIDGET_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/widget/${this.widgetId}/script.js`;
});

// Method to regenerate API key
widgetSchema.methods.regenerateApiKey = function() {
  this.apiKey = `nexa_widget_${crypto.randomBytes(24).toString('hex')}`;
  return this.save();
};

// Method to update stats
widgetSchema.methods.incrementUsage = async function(messageCount = 1) {
  this.stats.totalMessages += messageCount;
  this.stats.lastUsed = new Date();
  return this.save();
};

// Method to start new conversation
widgetSchema.methods.incrementConversations = async function() {
  this.stats.totalConversations += 1;
  return this.save();
};

// Method to add rating
widgetSchema.methods.addRating = async function(rating) {
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
  
  const currentTotal = this.stats.averageRating * this.stats.totalRatings;
  this.stats.totalRatings += 1;
  this.stats.averageRating = (currentTotal + rating) / this.stats.totalRatings;
  
  return this.save();
};

// Static method to create widget for website
widgetSchema.statics.createForWebsite = async function(websiteId, websiteUrl) {
  try {
    // Extract domain from website URL for title only
    const domain = new URL(websiteUrl).hostname;
    
    const widget = new this({
      websiteId,
      allowedDomains: [], // Empty array = no domain restrictions (universal)
      config: {
        title: `${domain} Assistant`,
        subtitle: 'AI-powered support'
      }
    });
    
    await widget.save();
    return { success: true, widget };
  } catch (error) {
    console.error('Error creating widget:', error);
    return { success: false, error: error.message };
  }
};

// Static method to find by widget ID
widgetSchema.statics.findByWidgetId = function(widgetId) {
  return this.findOne({ widgetId, isActive: true })
    .populate('websiteId', 'url domain title status');
};

// Static method to validate API key
widgetSchema.statics.validateApiKey = function(apiKey) {
  return this.findOne({ apiKey, isActive: true })
    .populate('websiteId', 'url domain title status');
};

module.exports = mongoose.model('Widget', widgetSchema);
