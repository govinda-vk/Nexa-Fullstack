# Database Models Documentation

## Overview
This document describes the database models used in the ASKit backend system. The application uses MongoDB with Mongoose ODM for data modeling and validation.

---

## User Model

### Schema Definition
The User model represents registered users of the ASKit platform with their authentication information, preferences, and crawled websites.

```javascript
// Location: src/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Authentication fields
  email: String,           // Required, unique, validated email
  password: String,        // Hashed password (for local auth)
  googleId: String,        // Google OAuth ID (sparse index)
  provider: String,        // 'local' or 'google'
  
  // Profile fields
  name: String,            // Required, max 50 characters
  avatar: String,          // Avatar image URL
  
  // Website management
  crawledWebsites: [websiteSchema], // Embedded documents
  
  // User preferences
  preferences: {
    maxWebsites: Number,    // Default: 10
    theme: String,          // 'light', 'dark', 'auto'
    notifications: {
      email: Boolean,       // Default: true
      browser: Boolean      // Default: true
    }
  },
  
  // Account status
  isActive: Boolean,       // Default: true
  isEmailVerified: Boolean, // Default: false
  
  // Usage statistics
  stats: {
    totalWebsitesCrawled: Number,
    totalQueries: Number,
    lastLogin: Date
  }
}, {
  timestamps: true // Adds createdAt, updatedAt
});
```

### Field Specifications

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `email` | String | Yes | - | Valid email format, unique, lowercase |
| `password` | String | No* | - | Min 6 chars, auto-hashed |
| `googleId` | String | No | - | Sparse index, unique when present |
| `provider` | String | No | 'local' | Enum: ['local', 'google'] |
| `name` | String | Yes | - | Max 50 characters |
| `avatar` | String | No | - | URL string |
| `crawledWebsites` | Array | No | [] | Embedded website documents |
| `preferences.maxWebsites` | Number | No | 10 | Positive integer |
| `preferences.theme` | String | No | 'auto' | Enum: ['light', 'dark', 'auto'] |
| `isActive` | Boolean | No | true | - |
| `isEmailVerified` | Boolean | No | false | - |
| `stats.totalWebsitesCrawled` | Number | No | 0 | Auto-calculated |
| `stats.totalQueries` | Number | No | 0 | Incremented on queries |
| `stats.lastLogin` | Date | No | now | Auto-updated on login |

*Required for local provider only

### Embedded Website Schema
```javascript
const websiteSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    trim: true
  },
  title: String,
  description: String,
  status: {
    type: String,
    enum: ['pending', 'crawling', 'completed', 'failed'],
    default: 'pending'
  },
  jobId: String,
  pagesCrawled: { type: Number, default: 0 },
  chunksProcessed: { type: Number, default: 0 },
  chunksAttempted: { type: Number, default: 0 },
  errorMessage: String,
  vectorIds: [String],
  metadata: mongoose.Schema.Types.Mixed,
  crawledAt: { type: Date, default: Date.now }
});
```

### Indexes
```javascript
// Performance indexes
userSchema.index({ email: 1 });                    // Login queries
userSchema.index({ googleId: 1 });                 // OAuth queries
userSchema.index({ 'crawledWebsites.url': 1 });    // Website lookups
userSchema.index({ 'crawledWebsites.status': 1 }); // Status filtering
userSchema.index({ createdAt: 1 });                // Registration ordering
```

### Virtual Fields
```javascript
// Count of successfully crawled websites
userSchema.virtual('activeWebsitesCount').get(function() {
  return this.crawledWebsites.filter(w => w.status === 'completed').length;
});
```

### Instance Methods

#### `comparePassword(candidatePassword)`
Compare provided password with stored hash.

```javascript
const isMatch = await user.comparePassword('password123');
```

#### `addWebsite(websiteData)`
Add a new website to user's collection with validation.

```javascript
await user.addWebsite({
  url: 'https://example.com',
  title: 'Example Website',
  jobId: 'job-123'
});
```

**Validation**:
- Checks for duplicate URLs
- Enforces website limit
- Validates required fields

#### `updateWebsiteStatus(websiteUrl, status, additionalData)`
Update website status and metadata.

```javascript
await user.updateWebsiteStatus('https://example.com', 'completed', {
  pagesCrawled: 25,
  chunksProcessed: 156
});
```

#### `removeWebsite(websiteUrl)`
Remove website from user's collection.

```javascript
await user.removeWebsite('https://example.com');
```

### Static Methods

#### `findByEmailOrGoogleId(email, googleId)`
Find user by email or Google ID.

```javascript
const user = await User.findByEmailOrGoogleId('user@example.com');
```

### Pre/Post Middleware

#### Password Hashing
```javascript
// Automatically hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
```

#### Stats Updates
```javascript
// Update website count when websites array changes
userSchema.pre('save', function(next) {
  if (this.isModified('crawledWebsites')) {
    this.stats.totalWebsitesCrawled = this.crawledWebsites.length;
  }
  next();
});
```

---

## Website Model

### Schema Definition
The Website model represents individual websites that have been crawled or are being processed.

```javascript
// Location: src/models/Website.js
const websiteSchema = new mongoose.Schema({
  // Basic website info
  url: String,             // Required, full URL
  title: String,           // Extracted page title
  description: String,     // Meta description
  domain: String,          // Required, hostname
  
  // Ownership
  owner: ObjectId,         // Required, ref to User
  ownerEmail: String,      // Required, denormalized for queries
  
  // Processing status
  status: String,          // 'pending', 'crawling', 'completed', 'failed'
  jobId: String,           // Required, BullMQ job ID
  
  // Crawl results
  pagesCrawled: Number,    // Default: 0
  chunksProcessed: Number, // Default: 0
  chunksAttempted: Number, // Default: 0
  crawledAt: Date,         // Default: now
  completedAt: Date,       // Set when status = 'completed'
  errorMessage: String,    // Error details if failed
  vectorIds: [String],     // Pinecone vector IDs
  
  // Metadata
  crawlStats: Mixed,       // Detailed crawl statistics
  metadata: Mixed,         // Additional website metadata
  
  // Widget integration
  hasWidget: Boolean,      // Default: false
  widgetId: ObjectId,      // Ref to Widget model
  widgetEnabled: Boolean   // Default: true
}, {
  timestamps: true
});
```

### Field Specifications

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `url` | String | Yes | - | Full website URL |
| `domain` | String | Yes | - | Hostname extracted from URL |
| `owner` | ObjectId | Yes | - | Reference to User model |
| `ownerEmail` | String | Yes | - | Denormalized for performance |
| `status` | String | No | 'pending' | Processing status |
| `jobId` | String | Yes | - | BullMQ job identifier |
| `pagesCrawled` | Number | No | 0 | Number of pages crawled |
| `chunksProcessed` | Number | No | 0 | Number of text chunks processed |
| `vectorIds` | Array | No | [] | Pinecone vector identifiers |
| `crawlStats` | Mixed | No | {} | Detailed statistics |
| `hasWidget` | Boolean | No | false | Widget created for this website |
| `widgetEnabled` | Boolean | No | true | Widget active status |

### Indexes
```javascript
// Query optimization indexes
websiteSchema.index({ owner: 1, status: 1 });      // User's websites by status
websiteSchema.index({ ownerEmail: 1, status: 1 }); // Email-based queries
websiteSchema.index({ jobId: 1 });                 // Job status updates
websiteSchema.index({ domain: 1 });                // Domain-based lookups
websiteSchema.index({ url: 1, owner: 1 }, { unique: true }); // Prevent duplicates
```

### Virtual Fields
```javascript
// Extract domain name from URL
websiteSchema.virtual('domainName').get(function() {
  try {
    return new URL(this.url).hostname;
  } catch (e) {
    return this.domain || 'unknown';
  }
});
```

### Static Methods

#### `updateStatusByJobId(jobId, status, additionalData)`
Update website status using job ID.

```javascript
const result = await Website.updateStatusByJobId('job-123', 'completed', {
  pagesCrawled: 25,
  chunksProcessed: 156,
  vectorIds: ['vec1', 'vec2', 'vec3']
});
```

**Returns**: `{ success: boolean, website: Document | null }`

#### `getUserWebsitesWithStats(userId)`
Get user's websites with aggregated statistics.

```javascript
const result = await Website.getUserWebsitesWithStats(userId);
// Returns: { success: true, websites: [], stats: {} }
```

**Stats Object**:
```javascript
{
  total: 15,
  pending: 2,
  crawling: 1,
  completed: 10,
  failed: 2
}
```

---

## Widget Model

### Schema Definition
The Widget model represents embeddable chat widgets associated with crawled websites.

```javascript
// Location: src/models/Widget.js
const widgetSchema = new mongoose.Schema({
  // Associated website
  websiteId: {
    type: ObjectId,
    ref: 'Website',
    required: true,
    unique: true
  },
  
  // Widget identification
  widgetId: String,        // Unique widget identifier
  apiKey: String,          // Authentication key for widget API
  
  // Status
  isActive: Boolean,       // Default: true
  
  // Configuration
  config: {
    // Appearance
    theme: String,         // 'light', 'dark', 'auto'
    primaryColor: String,  // Hex color code
    position: String,      // Widget position on page
    size: String,          // 'small', 'medium', 'large'
    
    // Behavior
    autoOpen: Boolean,     // Auto-open on page load
    showWelcomeMessage: Boolean,
    welcomeMessage: String,
    placeholder: String,
    
    // Branding
    title: String,
    subtitle: String,
    avatar: String,        // Avatar image URL
    showPoweredBy: Boolean,
    
    // Features
    maxMessages: Number,   // Max conversation history
    sessionTimeout: Number, // Session timeout in seconds
    allowFileUploads: Boolean,
    allowFeedback: Boolean
  },
  
  // Access control
  allowedDomains: [String], // Domains where widget can be embedded
  
  // Rate limiting
  rateLimits: {
    messagesPerMinute: Number,
    messagesPerHour: Number
  },
  
  // Usage statistics
  stats: {
    totalMessages: Number,
    totalConversations: Number,
    averageRating: Number,
    totalRatings: Number,
    lastUsed: Date
  }
}, {
  timestamps: true
});
```

### Default Configuration
```javascript
const defaultConfig = {
  theme: 'auto',
  primaryColor: '#8B5CF6',
  position: 'bottom-right',
  size: 'medium',
  autoOpen: false,
  showWelcomeMessage: true,
  welcomeMessage: 'Hello! How can I help you today?',
  placeholder: 'Type your question here...',
  title: 'NEXA Assistant',
  subtitle: 'Ask me anything about this website',
  showPoweredBy: true,
  maxMessages: 50,
  sessionTimeout: 1800, // 30 minutes
  allowFileUploads: false,
  allowFeedback: true
};
```

### Field Specifications

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `widgetId` | String | Generated | Unique widget identifier |
| `apiKey` | String | Generated | Authentication key with prefix |
| `isActive` | Boolean | true | Widget active status |
| `config.theme` | String | 'auto' | Visual theme |
| `config.primaryColor` | String | '#8B5CF6' | Primary color (hex) |
| `config.position` | String | 'bottom-right' | Screen position |
| `config.maxMessages` | Number | 50 | Conversation history limit |
| `config.sessionTimeout` | Number | 1800 | Session timeout (seconds) |
| `allowedDomains` | Array | [] | Allowed embedding domains |
| `rateLimits.messagesPerMinute` | Number | 10 | Rate limit per minute |
| `rateLimits.messagesPerHour` | Number | 100 | Rate limit per hour |

### Virtual Fields
```javascript
// Generate embed code
widgetSchema.virtual('embedCode').get(function() {
  return `<script src="${process.env.WIDGET_SCRIPT_URL || 'https://widget.nexa.ai/widget.js'}" ` +
         `data-widget-id="${this.widgetId}" ` +
         `data-api-key="${this.apiKey}"></script>`;
});

// Generate script URL
widgetSchema.virtual('scriptUrl').get(function() {
  return `${process.env.WIDGET_SCRIPT_URL || 'https://widget.nexa.ai/widget.js'}?id=${this.widgetId}`;
});
```

### Instance Methods

#### `regenerateApiKey()`
Generate a new API key for the widget.

```javascript
await widget.regenerateApiKey();
console.log('New API key:', widget.apiKey);
```

#### `incrementUsage(messageCount)`
Update usage statistics.

```javascript
await widget.incrementUsage(1); // Increment message count
```

#### `incrementConversations()`
Increment conversation count.

```javascript
await widget.incrementConversations();
```

#### `addRating(rating)`
Add a rating and update average.

```javascript
await widget.addRating(5); // 5-star rating
```

### Static Methods

#### `validateApiKey(apiKey)`
Validate API key and return widget if valid.

```javascript
const widget = await Widget.validateApiKey('nexa_widget_abc123');
if (widget) {
  console.log('Valid API key for widget:', widget.widgetId);
}
```

#### `createForWebsite(websiteId, websiteUrl)`
Create a new widget for a website.

```javascript
const result = await Widget.createForWebsite(websiteId, 'https://example.com');
if (result.success) {
  console.log('Widget created:', result.widget.widgetId);
}
```

---

## Usage Examples

### User Management

```javascript
// Create a new user
const user = new User({
  email: 'user@example.com',
  password: 'password123',
  name: 'John Doe',
  provider: 'local'
});
await user.save();

// Add website to user
await user.addWebsite({
  url: 'https://example.com',
  title: 'Example Website',
  jobId: 'job-123'
});

// Update website status
await user.updateWebsiteStatus('https://example.com', 'completed', {
  pagesCrawled: 25,
  chunksProcessed: 156
});

// Get active websites count
console.log('Active websites:', user.activeWebsitesCount);
```

### Website Management

```javascript
// Create website record
const website = new Website({
  url: 'https://example.com',
  domain: 'example.com',
  owner: userId,
  ownerEmail: 'user@example.com',
  jobId: 'job-123'
});
await website.save();

// Update status by job ID
await Website.updateStatusByJobId('job-123', 'completed', {
  pagesCrawled: 25,
  completedAt: new Date()
});

// Get user's websites with stats
const result = await Website.getUserWebsitesWithStats(userId);
console.log(`User has ${result.stats.completed} completed websites`);
```

### Widget Management

```javascript
// Create widget for website
const widgetResult = await Widget.createForWebsite(websiteId, 'https://example.com');
const widget = widgetResult.widget;

// Update configuration
widget.config.theme = 'dark';
widget.config.primaryColor = '#FF6B6B';
await widget.save();

// Generate new API key
await widget.regenerateApiKey();

// Get embed code
console.log('Embed code:', widget.embedCode);

// Track usage
await widget.incrementUsage(1);
await widget.addRating(4);
```

---

## Relationships

### User → Website (One-to-Many)
```javascript
// User has many websites
const userWithWebsites = await User.findById(userId).populate('crawledWebsites');

// Website belongs to user
const website = await Website.findById(websiteId).populate('owner', 'name email');
```

### Website → Widget (One-to-One)
```javascript
// Website has one widget
const websiteWithWidget = await Website.findById(websiteId).populate('widgetId');

// Widget belongs to website
const widget = await Widget.findOne({ websiteId }).populate('websiteId');
```

### Querying with Relationships
```javascript
// Get user with all completed websites and their widgets
const user = await User.findById(userId)
  .populate({
    path: 'crawledWebsites',
    match: { status: 'completed' },
    populate: {
      path: 'widgetId',
      select: 'widgetId isActive config.theme'
    }
  });

// Get all widgets for a user's websites
const widgets = await Widget.find({
  websiteId: { $in: userWebsiteIds }
}).populate('websiteId', 'url domain title');
```

---

## Validation & Error Handling

### Mongoose Validation
```javascript
// Custom validators
userSchema.path('email').validate(function(email) {
  return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
}, 'Please enter a valid email');

// Unique validation handling
try {
  await user.save();
} catch (error) {
  if (error.code === 11000) {
    // Handle duplicate key error
    console.log('Email already exists');
  }
}
```

### Business Logic Validation
```javascript
// In User model methods
addWebsite(websiteData) {
  if (this.crawledWebsites.length >= this.preferences.maxWebsites) {
    throw new Error(`Maximum number of websites reached`);
  }
  
  const exists = this.crawledWebsites.find(w => w.url === websiteData.url);
  if (exists) {
    throw new Error('Website already exists');
  }
  
  this.crawledWebsites.push(websiteData);
  return this.save();
}
```

---

## Performance Considerations

### Indexing Strategy
```javascript
// Compound indexes for common queries
userSchema.index({ email: 1, isActive: 1 });
websiteSchema.index({ owner: 1, status: 1, createdAt: -1 });
widgetSchema.index({ websiteId: 1, isActive: 1 });

// Sparse indexes for optional fields
userSchema.index({ googleId: 1 }, { sparse: true });
```

### Query Optimization
```javascript
// Use projection to limit fields
const users = await User.find({}, 'name email isActive');

// Use lean() for read-only data
const websites = await Website.find({ owner: userId }).lean();

// Populate only needed fields
const user = await User.findById(userId)
  .populate('crawledWebsites', 'url title status pagesCrawled');
```

### Aggregation Pipelines
```javascript
// Get website statistics per user
const stats = await Website.aggregate([
  { $match: { owner: ObjectId(userId) } },
  {
    $group: {
      _id: '$status',
      count: { $sum: 1 },
      totalPages: { $sum: '$pagesCrawled' }
    }
  }
]);

// Get top domains by user count
const topDomains = await Website.aggregate([
  {
    $group: {
      _id: '$domain',
      userCount: { $addToSet: '$owner' },
      totalWebsites: { $sum: 1 }
    }
  },
  {
    $project: {
      domain: '$_id',
      userCount: { $size: '$userCount' },
      totalWebsites: 1
    }
  },
  { $sort: { userCount: -1 } },
  { $limit: 10 }
]);
```

---

## Migration Scripts

### User Data Migration
```javascript
// Migrate user preferences
async function migrateUserPreferences() {
  const users = await User.find({ 'preferences.maxWebsites': { $exists: false } });
  
  for (const user of users) {
    user.preferences.maxWebsites = 10; // Default value
    await user.save();
  }
  
  console.log(`Migrated ${users.length} users`);
}
```

### Website Data Cleanup
```javascript
// Clean up orphaned websites
async function cleanupOrphanedWebsites() {
  const orphaned = await Website.find({
    owner: { $exists: false }
  });
  
  await Website.deleteMany({
    _id: { $in: orphaned.map(w => w._id) }
  });
  
  console.log(`Removed ${orphaned.length} orphaned websites`);
}
```

---

## Best Practices

### Model Design
1. **Normalize when data is frequently updated separately**
2. **Denormalize when data is read together frequently**
3. **Use embedded documents for one-to-few relationships**
4. **Use references for one-to-many or many-to-many relationships**

### Performance
1. **Create appropriate indexes for your query patterns**
2. **Use projection to limit returned fields**
3. **Consider using aggregation pipelines for complex queries**
4. **Use lean() for read-only operations**

### Security
1. **Never expose sensitive fields (passwords, tokens)**
2. **Validate all input data**
3. **Use select: false for sensitive fields**
4. **Implement proper authorization checks**

---

**Last Updated**: September 2025  
**API Version**: 1.0.0
