# Utilities & Middleware Documentation

## Overview
This document covers the utility functions and middleware components that provide security, rate limiting, configuration management, and helper functions for the ASKit backend system.

---

## Authentication Middleware

**Location**: `src/middleware/auth.js`

### Overview
Provides JWT-based authentication and authorization middleware for protecting API endpoints and managing user sessions.

### Core Functions

#### `generateToken(userId)`
Generate a JWT token for user authentication.

```javascript
const token = generateToken(user._id);
// Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Configuration:**
```javascript
const token = jwt.sign(
  { userId }, 
  process.env.JWT_SECRET, 
  { 
    expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
  }
);
```

#### `authenticateToken(req, res, next)`
Middleware to verify and authenticate JWT tokens.

```javascript
// Protect route with authentication
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});
```

**Process:**
1. Extract token from `Authorization: Bearer <token>` header
2. Verify token signature and expiration
3. Fetch user from database using token payload
4. Check if user is active
5. Add user to `req.user` for downstream handlers

**Error Responses:**
```javascript
// No token provided
{ error: 'Access token required', message: 'Please provide a valid authentication token' }

// Invalid or expired token
{ error: 'Token expired', message: 'Please log in again' }

// User not found or deactivated
{ error: 'User not found', message: 'Invalid authentication token' }
{ error: 'Account deactivated', message: 'Your account has been deactivated' }
```

#### `optionalAuth(req, res, next)`
Optional authentication that doesn't fail if no token is provided.

```javascript
// Route that works with or without authentication
app.get('/content', optionalAuth, (req, res) => {
  if (req.user) {
    // Authenticated user - personalized content
  } else {
    // Anonymous user - public content
  }
});
```

#### `checkResourceOwnership(ownerField)`
Ensure authenticated user can only access their own resources.

```javascript
// Protect user-specific resources
app.get('/user/websites/:id', 
  authenticateToken, 
  checkResourceOwnership('owner'), 
  handler
);
```

### Usage Examples

```javascript
const { authenticateToken, generateToken, checkResourceOwnership } = require('./middleware/auth');

// Generate token after successful login
const token = generateToken(user._id);
res.json({ token, user });

// Protect all user routes
app.use('/user', authenticateToken);

// Protect specific endpoint
app.post('/ingest', authenticateToken, ingestHandler);

// Optional auth for enhanced features
app.get('/query', optionalAuth, queryHandler);
```

---

## SSRF Protection

**Location**: `src/utils/ssrf.js`

### Overview
Server-Side Request Forgery (SSRF) protection prevents malicious URLs from accessing internal network resources.

### Core Function: `validateUrl(urlString, options)`

```javascript
const { validateUrl } = require('./utils/ssrf');

const result = await validateUrl('https://example.com', {
  allowedProtocols: ['http:', 'https:'],
  allowPrivate: false,
  whitelistHostnames: ['localhost'],
  timeoutMs: 5000
});

if (result.valid) {
  console.log('Safe URL:', result.url.href);
} else {
  console.error('Unsafe URL:', result.error);
}
```

### Configuration Options

```javascript
const DEFAULT_OPTIONS = {
  allowedProtocols: ['http:', 'https:'],     // Allowed URL protocols
  allowPrivate: false,                        // Block private IP ranges
  whitelistHostnames: [],                     // Explicitly allowed hostnames
  timeoutMs: 5000                            // DNS lookup timeout
};
```

### Protection Features

#### Protocol Validation
```javascript
// Only allow HTTP/HTTPS
if (!opt.allowedProtocols.includes(parsed.protocol)) {
  return { 
    valid: false, 
    error: `Protocol not allowed: ${parsed.protocol}` 
  };
}
```

#### Private IP Detection
```javascript
function isPrivateAddress(addr) {
  const parsed = ipaddr.parse(addr);
  const range = parsed.range();
  
  // Blocked ranges: loopback, linkLocal, private, uniqueLocal, etc.
  const disallowedRanges = [
    'loopback',        // 127.0.0.0/8, ::1
    'linkLocal',       // 169.254.0.0/16, fe80::/10
    'private',         // 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
    'uniqueLocal',     // fc00::/7
    'unspecified',     // 0.0.0.0, ::
    'broadcast',       // 255.255.255.255
    'reserved',        // Reserved ranges
    'carrierGradeNat'  // 100.64.0.0/10
  ];
  
  return disallowedRanges.includes(range);
}
```

#### DNS Resolution & Validation
```javascript
// Resolve hostname to IP addresses
const addresses = await dns.lookup(hostname, { 
  all: true,      // Return all IPs
  verbatim: true  // Maintain order
});

// Check all resolved IPs
for (const { address } of addresses) {
  if (!opt.allowPrivate && isPrivateAddress(address)) {
    return { 
      valid: false, 
      error: `Resolved IP ${address} is in a disallowed range` 
    };
  }
}
```

### Express Middleware: `middleware(options)`

```javascript
const ssrfMiddleware = require('./utils/ssrf').middleware;

// Apply SSRF protection to ingestion endpoint
app.post('/ingest', 
  ssrfMiddleware({ 
    whitelistHostnames: ['trusted-site.com'] 
  }), 
  ingestHandler
);
```

**Middleware Behavior:**
1. Extracts URL from `req.body.websiteUrl`, `req.query.websiteUrl`, or `req.params.websiteUrl`
2. If no URL present, continues to next middleware
3. Validates URL using `validateUrl()`
4. Returns 400 error if invalid, otherwise continues

### Attack Prevention

**Protected Against:**
- **Internal Network Access**: `http://127.0.0.1:8080/admin`
- **Private Network Scanning**: `http://192.168.1.1/config`
- **Cloud Metadata Access**: `http://169.254.169.254/metadata`
- **DNS Rebinding**: Domain that resolves to private IP
- **Protocol Smuggling**: `file://`, `ftp://`, `gopher://`

**Example Blocked URLs:**
```javascript
// These would be blocked by default
'http://localhost:3000'           // Loopback
'https://192.168.1.1'            // Private network
'http://169.254.169.254'         // AWS metadata
'ftp://internal-server.com'      // Disallowed protocol
'http://10.0.0.1:22'            // Private IP with port
```

### Usage Examples

```javascript
// Basic validation
const result = await validateUrl('https://example.com');
if (!result.valid) {
  throw new Error(result.error);
}

// With custom options
const result = await validateUrl('http://internal.company.com', {
  allowPrivate: true,
  whitelistHostnames: ['internal.company.com']
});

// As middleware
app.use('/api/crawl', ssrfMiddleware({
  allowedProtocols: ['https:'], // Only HTTPS
  timeoutMs: 3000
}));
```

---

## Rate Limiting

**Location**: `src/utils/rateLimit.js`

### Overview
In-memory rate limiting middleware to prevent API abuse and ensure fair usage across clients.

### Core Function: `createRateLimiter(options)`

```javascript
const rateLimit = require('./utils/rateLimit');

const limiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute window
  max: 30,              // 30 requests per window
  keyGenerator: (req) => req.user?.id || req.ip,
  headers: true         // Include rate limit headers
});

app.use('/api', limiter);
```

### Configuration Options

```javascript
const DEFAULTS = {
  windowMs: 60 * 1000,                    // Time window in milliseconds
  max: 60,                               // Max requests per window per key
  keyGenerator: (req) => req.ip,         // Function to generate rate limit key
  skip: null,                            // Optional skip function
  headers: true                          // Include RateLimit headers
};
```

### Key Generation Strategies

#### IP-based Rate Limiting
```javascript
const ipLimiter = rateLimit({
  keyGenerator: (req) => req.ip || req.headers['x-forwarded-for'] || 'unknown'
});
```

#### User-based Rate Limiting
```javascript
const userLimiter = rateLimit({
  keyGenerator: (req) => req.user?.id || req.ip,
  max: 100  // Higher limit for authenticated users
});
```

#### API Key Rate Limiting
```javascript
const apiKeyLimiter = rateLimit({
  keyGenerator: (req) => req.headers['x-api-key'] || req.ip,
  max: 1000
});
```

### HTTP Headers

Rate limiter includes informative headers:

```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 29
X-RateLimit-Reset: 1694436660
Retry-After: 45
```

### Advanced Configuration

#### Skip Certain Requests
```javascript
const limiter = rateLimit({
  windowMs: 60000,
  max: 30,
  skip: (req) => {
    // Skip rate limiting for admin users
    return req.user?.role === 'admin';
  }
});
```

#### Custom Error Responses
```javascript
const limiter = rateLimit({
  windowMs: 60000,
  max: 30,
  onLimitReached: (req, res) => {
    console.log(`Rate limit exceeded for ${req.ip}`);
  }
});
```

### Production Considerations

**⚠️ Important**: The current implementation uses in-memory storage and is **NOT suitable for horizontally scaled applications**.

For production, consider:

#### Redis-based Rate Limiting
```javascript
const redis = require('redis');
const client = redis.createClient();

function createRedisRateLimiter(options) {
  return async (req, res, next) => {
    const key = `ratelimit:${options.keyGenerator(req)}`;
    const window = Math.floor(Date.now() / options.windowMs);
    const redisKey = `${key}:${window}`;
    
    const count = await client.incr(redisKey);
    if (count === 1) {
      await client.expire(redisKey, Math.ceil(options.windowMs / 1000));
    }
    
    if (count > options.max) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    
    next();
  };
}
```

#### Distributed Rate Limiting
```javascript
const { RateLimiterRedis } = require('rate-limiter-flexible');

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'middleware',
  points: 30,    // Number of requests
  duration: 60,  // Per 60 seconds
});
```

### Usage Examples

```javascript
// Basic API rate limiting
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per 15 minutes
}));

// Strict rate limiting for sensitive endpoints
app.use('/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5 // 5 login attempts per 15 minutes
}));

// Per-user rate limiting
app.use('/user', authenticateToken, rateLimit({
  keyGenerator: (req) => req.user.id,
  windowMs: 60 * 1000,
  max: 60
}));

// Different limits for different endpoints
const strictLimit = rateLimit({ max: 5, windowMs: 60000 });
const normalLimit = rateLimit({ max: 30, windowMs: 60000 });

app.post('/ingest', strictLimit, ingestHandler);
app.get('/query', normalLimit, queryHandler);
```

---

## Configuration Management

**Location**: `src/config/`

### Database Configuration

**File**: `src/config/database.js`

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### Passport Configuration

**File**: `src/config/passport.js`

```javascript
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let user = await User.findOne({ 
      $or: [
        { googleId: profile.id },
        { email: profile.emails[0].value }
      ]
    });

    if (user) {
      // Update Google ID if not set
      if (!user.googleId) {
        user.googleId = profile.id;
        user.provider = 'google';
        await user.save();
      }
      return done(null, user);
    }

    // Create new user
    user = new User({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      avatar: profile.photos[0].value,
      provider: 'google',
      isEmailVerified: true
    });

    await user.save();
    done(null, user);
  } catch (error) {
    console.error('Google OAuth error:', error);
    done(error, null);
  }
}));

// Serialize/deserialize user for session management
passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
```

---

## Helper Utilities

### User Website Management

**Location**: `src/utils/userWebsite.js`

```javascript
const User = require('../models/User');
const Website = require('../models/Website');

// Update website status for user
async function updateWebsiteStatus(jobId, status, additionalData = {}) {
  try {
    // Update in Website collection
    const website = await Website.findOneAndUpdate(
      { jobId },
      { status, ...additionalData },
      { new: true }
    );

    if (!website) {
      return { success: false, error: 'Website not found' };
    }

    // Update in User's embedded documents
    const user = await User.findById(website.owner);
    if (user) {
      const userWebsite = user.crawledWebsites.find(w => w.url === website.url);
      if (userWebsite) {
        userWebsite.status = status;
        Object.assign(userWebsite, additionalData);
        await user.save();
      }
    }

    return { success: true, website };
  } catch (error) {
    console.error('Error updating website status:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { updateWebsiteStatus };
```

### Widget Script Generation

**Location**: `src/utils/widgetScript.js`

```javascript
// Generate embeddable widget script
function generateWidgetScript(widgetId, apiKey, config = {}) {
  const defaultConfig = {
    theme: 'auto',
    position: 'bottom-right',
    primaryColor: '#8B5CF6'
  };

  const finalConfig = { ...defaultConfig, ...config };
  
  return `
<script>
(function() {
  // Widget configuration
  window.NEXA_WIDGET_CONFIG = {
    widgetId: '${widgetId}',
    apiKey: '${apiKey}',
    ...${JSON.stringify(finalConfig)}
  };

  // Load widget script
  const script = document.createElement('script');
  script.src = '${process.env.WIDGET_SCRIPT_URL}/widget.js';
  script.async = true;
  script.setAttribute('data-widget-id', '${widgetId}');
  document.head.appendChild(script);
})();
</script>`;
}

module.exports = { generateWidgetScript };
```

---

## Environment Variables

### Required Configuration

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/askit

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-256-bits
JWT_EXPIRES_IN=7d

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Session Management
SESSION_SECRET=your-session-secret-key

# API Keys
OPENAI_API_KEY=sk-your-openai-api-key
GEMINI_API_KEY=AIyour-gemini-api-key

# Vector Database
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=us-west1-gcp
PINECONE_INDEX_NAME=askit-index

# Redis (for job queue)
REDIS_URL=redis://localhost:6379

# Application Settings
NODE_ENV=development
PORT=3000

# Widget Configuration
WIDGET_SCRIPT_URL=https://widget.nexa.ai
WIDGET_API_BASE_URL=https://api.nexa.ai

# Processing Limits
MAX_PAGES_PER_CRAWL=100
MAX_CONCURRENT_JOBS=5
CRAWL_DELAY=1000

# Security Settings
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

### Environment Validation

```javascript
// src/utils/validateEnv.js
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'OPENAI_API_KEY',
  'GEMINI_API_KEY',
  'PINECONE_API_KEY'
];

function validateEnvironment() {
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:');
    missing.forEach(varName => console.error(`- ${varName}`));
    process.exit(1);
  }

  // Validate JWT secret strength
  if (process.env.JWT_SECRET.length < 32) {
    console.error('JWT_SECRET must be at least 32 characters long');
    process.exit(1);
  }

  console.log('✅ Environment validation passed');
}

module.exports = { validateEnvironment };
```

---

## Security Best Practices

### JWT Security

```javascript
// Strong secret generation
const crypto = require('crypto');
const jwtSecret = crypto.randomBytes(64).toString('hex');

// Token validation
function validateToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      maxAge: '7d'
    });
    return { valid: true, payload: decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}
```

### Password Security

```javascript
// Strong password hashing
const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  return await bcrypt.hash(password, rounds);
}

// Password strength validation
function validatePasswordStrength(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const score = [
    password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar
  ].filter(Boolean).length;

  return {
    valid: score >= 3,
    score,
    suggestions: [
      !hasUpperCase && 'Add uppercase letters',
      !hasLowerCase && 'Add lowercase letters',
      !hasNumbers && 'Add numbers',
      !hasSpecialChar && 'Add special characters',
      password.length < minLength && `Use at least ${minLength} characters`
    ].filter(Boolean)
  };
}
```

### Input Sanitization

```javascript
const validator = require('validator');

function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  // Remove potential XSS
  input = validator.escape(input);
  
  // Remove excessive whitespace
  input = input.trim().replace(/\s+/g, ' ');
  
  // Remove null bytes
  input = input.replace(/\0/g, '');
  
  return input;
}

// Middleware for input sanitization
function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    for (const [key, value] of Object.entries(req.body)) {
      if (typeof value === 'string') {
        req.body[key] = sanitizeInput(value);
      }
    }
  }
  next();
}
```

---

## Error Handling Utilities

### Centralized Error Handler

```javascript
// src/utils/errorHandler.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

function globalErrorHandler(err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
}

function sendErrorDev(err, res) {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
}

function sendErrorProd(err, res) {
  // Only send operational errors to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // Log error and send generic message
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    });
  }
}

module.exports = { AppError, globalErrorHandler };
```

### Async Error Wrapper

```javascript
// Wrapper for async route handlers
function catchAsync(fn) {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

// Usage
app.get('/async-route', catchAsync(async (req, res, next) => {
  const data = await someAsyncOperation();
  res.json(data);
}));
```

---

## Performance Utilities

### Response Compression

```javascript
const compression = require('compression');

app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024
}));
```

### Request Logging

```javascript
const morgan = require('morgan');

// Custom log format
morgan.token('user', (req) => {
  return req.user ? req.user.email : 'anonymous';
});

app.use(morgan(
  ':method :url :status :res[content-length] - :response-time ms [:user]'
));
```

---

**Last Updated**: September 2025  
**API Version**: 1.0.0
