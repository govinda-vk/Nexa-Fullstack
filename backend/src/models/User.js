const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
  crawledAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'crawling', 'completed', 'failed'],
    default: 'pending'
  },
  jobId: {
    type: String,
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
  errorMessage: {
    type: String,
    trim: true
  },
  vectorIds: [{
    type: String,
    trim: true
  }],
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  avatar: {
    type: String,
    trim: true
  },
  // Google OAuth fields
  googleId: {
    type: String,
    sparse: true // Allows for unique constraint but also null values
  },
  provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  // Websites crawled by this user
  crawledWebsites: {
    type: [websiteSchema],
    default: []
  },
  // User preferences
  preferences: {
    maxWebsites: {
      type: Number,
      default: 10
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      browser: {
        type: Boolean,
        default: true
      }
    }
  },
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  // Usage statistics
  stats: {
    totalWebsitesCrawled: {
      type: Number,
      default: 0
    },
    totalQueries: {
      type: Number,
      default: 0
    },
    lastLogin: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ 'crawledWebsites.url': 1 });
userSchema.index({ 'crawledWebsites.status': 1 });
userSchema.index({ createdAt: 1 });

// Virtual for active websites count
userSchema.virtual('activeWebsitesCount').get(function() {
  if (!this.crawledWebsites || !Array.isArray(this.crawledWebsites)) {
    return 0;
  }
  return this.crawledWebsites.filter(website => website.status === 'completed').length;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash password if it's been modified (or is new) and exists
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    // Hash password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Update stats when websites are added
userSchema.pre('save', function(next) {
  // Ensure crawledWebsites is always an array
  if (!this.crawledWebsites) {
    this.crawledWebsites = [];
  }
  
  if (this.isModified('crawledWebsites')) {
    this.stats.totalWebsitesCrawled = this.crawledWebsites.length;
  }
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to add a website
userSchema.methods.addWebsite = function(websiteData) {
  // Initialize crawledWebsites if undefined
  if (!this.crawledWebsites) {
    this.crawledWebsites = [];
  }
  
  // Check if website already exists
  const existingWebsite = this.crawledWebsites.find(
    website => website.url === websiteData.url
  );
  
  if (existingWebsite) {
    throw new Error('Website already exists for this user');
  }
  
  // Check if user has reached the limit
  if (this.crawledWebsites.length >= this.preferences.maxWebsites) {
    throw new Error(`Maximum number of websites reached (${this.preferences.maxWebsites})`);
  }
  
  this.crawledWebsites.push(websiteData);
  return this.save();
};

// Instance method to update website status
userSchema.methods.updateWebsiteStatus = function(websiteUrl, status, additionalData = {}) {
  // Initialize crawledWebsites if undefined
  if (!this.crawledWebsites) {
    this.crawledWebsites = [];
  }
  
  const website = this.crawledWebsites.find(w => w.url === websiteUrl);
  if (!website) {
    throw new Error('Website not found for this user');
  }
  
  website.status = status;
  Object.assign(website, additionalData);
  
  return this.save();
};

// Instance method to remove a website
userSchema.methods.removeWebsite = function(websiteUrl) {
  // Initialize crawledWebsites if undefined
  if (!this.crawledWebsites) {
    this.crawledWebsites = [];
  }
  
  this.crawledWebsites = this.crawledWebsites.filter(w => w.url !== websiteUrl);
  return this.save();
};

// Static method to find user by email or googleId
userSchema.statics.findByEmailOrGoogleId = function(email, googleId) {
  const query = {};
  if (email) query.email = email;
  if (googleId) query.googleId = googleId;
  
  return this.findOne({ $or: [query] });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
