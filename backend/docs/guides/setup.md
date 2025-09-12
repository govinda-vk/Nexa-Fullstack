# Setup & Installation Guide

## Prerequisites

### System Requirements
- **Node.js**: Version 18.0 or higher
- **npm**: Version 9.0 or higher (or Yarn 1.22+)
- **MongoDB**: Version 5.0 or higher
- **Redis**: Version 6.0 or higher (for job queue)
- **Git**: Latest version

### Hardware Requirements
- **Minimum**: 4GB RAM, 2 CPU cores, 20GB disk space
- **Recommended**: 8GB RAM, 4 CPU cores, 50GB disk space
- **Production**: 16GB+ RAM, 8+ CPU cores, 100GB+ disk space

---

## Local Development Setup

### Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/askit-backend.git
cd askit-backend

# Verify Node.js version
node --version  # Should be 18.0+
npm --version   # Should be 9.0+
```

### Step 2: Install Dependencies

```bash
# Install all dependencies
npm install

# Or using Yarn
yarn install
```

**Key Dependencies Installed:**
- **Express**: Web framework
- **Mongoose**: MongoDB ODM
- **Passport**: Authentication
- **BullMQ**: Job queue management
- **Puppeteer**: Web scraping
- **OpenAI**: Embeddings generation
- **Google Generative AI**: LLM integration
- **Pinecone**: Vector database client

### Step 3: Database Setup

#### MongoDB Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition
# Windows (using Chocolatey)
choco install mongodb

# Start MongoDB service
net start MongoDB

# Verify MongoDB is running
mongo --eval "print('MongoDB is running')"
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create new cluster
3. Create database user
4. Whitelist your IP address
5. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/askit`

**Option C: Docker MongoDB**
```bash
# Run MongoDB in Docker
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:latest
```

#### Redis Setup

**Option A: Local Redis (Windows)**
```bash
# Using Chocolatey
choco install redis-64

# Start Redis
redis-server
```

**Option B: Docker Redis**
```bash
# Run Redis in Docker
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:alpine
```

**Option C: Redis Cloud**
1. Sign up at [Redis Cloud](https://redis.com/cloud/)
2. Create database
3. Get connection URL: `redis://username:password@host:port`

### Step 4: Environment Configuration

Create `.env` file in root directory:

```bash
# Copy example environment file
cp .env.example .env

# Edit environment variables
code .env  # or nano .env
```

**Complete `.env` Configuration:**

```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/askit
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-should-be-at-least-32-characters-long
JWT_EXPIRES_IN=7d

# Session Configuration
SESSION_SECRET=your-session-secret-key-for-oauth

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=text-embedding-ada-002

# Google Gemini Configuration
GEMINI_API_KEY=AIyour-gemini-api-key-here
GEMINI_MODEL=gemini-pro

# Pinecone Vector Database
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=us-west1-gcp
PINECONE_INDEX_NAME=askit-embeddings

# Application Settings
NODE_ENV=development
PORT=3000
API_BASE_URL=http://localhost:3000

# Widget Configuration
WIDGET_SCRIPT_URL=http://localhost:3000
WIDGET_API_BASE_URL=http://localhost:3000

# Processing Configuration
MAX_PAGES_PER_CRAWL=50
MAX_CONCURRENT_JOBS=3
CRAWL_DELAY=2000
CHUNK_SIZE=1000
CHUNK_OVERLAP=200

# Rate Limiting
RATE_LIMIT_WINDOW=900000    # 15 minutes in ms
RATE_LIMIT_MAX=100          # Max requests per window
LOGIN_RATE_LIMIT=5          # Max login attempts

# Security
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://localhost:3001
```

### Step 5: API Keys Setup

#### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up/Login to your account
3. Navigate to API Keys section
4. Create new secret key
5. Copy key starting with `sk-`

#### Google Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/)
2. Sign in with Google account
3. Create new API key
4. Copy key starting with `AI`

#### Pinecone API Key
1. Sign up at [Pinecone](https://pinecone.io/)
2. Create new project
3. Create index with:
   - **Dimensions**: 1536 (for OpenAI embeddings)
   - **Metric**: cosine
   - **Environment**: us-west1-gcp (or your preferred)
4. Get API key from console

#### Google OAuth Setup (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add redirect URI: `http://localhost:3000/auth/google/callback`
6. Copy Client ID and Secret

### Step 6: Database Initialization

```bash
# Start the application (will create indexes automatically)
npm run dev

# Or run database initialization script
node scripts/init-db.js
```

### Step 7: Verify Installation

```bash
# Start development server
npm run dev

# Server should start on http://localhost:3000
# Check logs for successful connections:
# ✅ MongoDB Connected: localhost:27017
# ✅ Redis Connected: localhost:6379
# ✅ Pinecone Connected: us-west1-gcp
```

**Test API Endpoints:**
```bash
# Health check
curl http://localhost:3000/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "mongodb": "connected",
    "redis": "connected",
    "pinecone": "connected"
  }
}
```

---

## Development Workflow

### Available Scripts

```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/ --fix",
    "format": "prettier --write src/",
    "db:seed": "node scripts/seed.js",
    "db:reset": "node scripts/reset-db.js",
    "worker": "node src/jobs/ingestWorker.js"
  }
}
```

### Development Commands

```bash
# Start development server with hot reload
npm run dev

# Start worker process for job queue
npm run worker

# Run tests
npm test
npm run test:watch

# Code formatting and linting
npm run lint
npm run format

# Database operations
npm run db:seed    # Populate with sample data
npm run db:reset   # Clear all data
```

### Project Structure Understanding

```
askit-backend/
├── src/
│   ├── server.js              # Main application entry
│   ├── routes/                # API route handlers
│   │   ├── auth.js           # Authentication routes
│   │   ├── user.js           # User management
│   │   ├── widget.js         # Widget management
│   │   └── widgetApi.js      # Public widget API
│   ├── models/               # Database models
│   │   ├── User.js           # User schema
│   │   ├── Website.js        # Website schema
│   │   └── Widget.js         # Widget schema
│   ├── middleware/           # Custom middleware
│   │   └── auth.js           # Authentication middleware
│   ├── utils/                # Utility functions
│   │   ├── rateLimit.js      # Rate limiting
│   │   └── ssrf.js           # SSRF protection
│   ├── config/               # Configuration files
│   │   ├── database.js       # Database connection
│   │   └── passport.js       # OAuth configuration
│   ├── jobs/                 # Background job processing
│   │   ├── ingestProducer.js # Job creation
│   │   └── ingestWorker.js   # Job processing
│   ├── crawler.js            # Web scraping logic
│   ├── chunker.js            # Text chunking
│   ├── embeddings.js         # Vector embeddings
│   ├── vectordb.js           # Pinecone operations
│   └── rag.js                # RAG implementation
├── docs/                     # Documentation
├── tests/                    # Test files
├── scripts/                  # Utility scripts
├── .env                      # Environment variables
├── .env.example              # Environment template
└── package.json              # Dependencies and scripts
```

### Code Style and Standards

**ESLint Configuration (`.eslintrc.js`):**
```javascript
module.exports = {
  env: {
    node: true,
    es2021: true
  },
  extends: ['eslint:recommended'],
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always']
  }
};
```

**Prettier Configuration (`.prettierrc`):**
```json
{
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "semi": true
}
```

---

## Testing Setup

### Test Configuration

**Jest Configuration (`jest.config.js`):**
```javascript
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 10000
};
```

**Test Database Setup (`tests/setup.js`):**
```javascript
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
```

### Running Tests

```bash
# Install test dependencies
npm install --save-dev jest supertest mongodb-memory-server

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- auth.test.js

# Run tests matching pattern
npm test -- --testNamePattern="authentication"
```

### Sample Test File

**Example (`tests/auth.test.js`):**
```javascript
const request = require('supertest');
const app = require('../src/server');
const User = require('../src/models/User');

describe('Authentication', () => {
  describe('POST /auth/register', () => {
    test('should register new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.token).toBeDefined();
    });

    test('should not register user with weak password', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: '123'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toContain('password');
    });
  });
});
```

---

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed

**Error:**
```
MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions:**
```bash
# Check if MongoDB is running
netstat -an | findstr 27017

# Start MongoDB service (Windows)
net start MongoDB

# Check MongoDB logs
type "C:\Program Files\MongoDB\Server\6.0\log\mongod.log"

# Test connection manually
mongo mongodb://localhost:27017/test
```

#### 2. Redis Connection Failed

**Error:**
```
Error: Redis connection to 127.0.0.1:6379 failed - connect ECONNREFUSED
```

**Solutions:**
```bash
# Check if Redis is running
redis-cli ping

# Start Redis server
redis-server

# Check Redis configuration
redis-cli config get "*"
```

#### 3. API Key Issues

**Error:**
```
OpenAI API Error: Incorrect API key provided
```

**Solutions:**
1. Verify API key format: `sk-...` for OpenAI
2. Check API key permissions
3. Verify billing account status
4. Test API key with curl:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     https://api.openai.com/v1/models
```

#### 4. Pinecone Connection Issues

**Error:**
```
PineconeConnectionError: Failed to connect to index
```

**Solutions:**
1. Verify index exists in Pinecone console
2. Check API key and environment
3. Verify index dimensions match embeddings (1536)
4. Test connection:

```bash
curl -X GET "https://API_KEY@INDEX_NAME-PROJECT.svc.ENVIRONMENT.pinecone.io/describe_index_stats" \
     -H "Accept: application/json"
```

#### 5. Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**
```bash
# Find process using port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in .env
PORT=3001
```

#### 6. Memory Issues During Development

**Error:**
```
JavaScript heap out of memory
```

**Solutions:**
```bash
# Increase Node.js heap size
node --max-old-space-size=4096 src/server.js

# Or add to package.json scripts
"dev": "node --max-old-space-size=4096 --inspect src/server.js"
```

### Debugging Tools

#### Enable Debug Logs
```bash
# Environment variable for debug logs
DEBUG=app:* npm run dev

# Or specific modules
DEBUG=app:crawler,app:embeddings npm run dev
```

#### VS Code Debug Configuration

**`.vscode/launch.json`:**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/server.js",
      "env": {
        "NODE_ENV": "development"
      },
      "envFile": "${workspaceFolder}/.env",
      "console": "integratedTerminal",
      "restart": true,
      "runtimeArgs": ["--inspect"]
    }
  ]
}
```

#### Health Check Endpoint

Test system health:
```bash
curl http://localhost:3000/health
```

Expected healthy response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "mongodb": "connected",
    "redis": "connected", 
    "pinecone": "connected"
  },
  "version": "1.0.0",
  "uptime": 3600
}
```

---

## Next Steps

Once you have successfully set up the development environment:

1. **Explore the API**: Use the [API documentation](../api/README.md) to understand available endpoints
2. **Test with Postman**: Import the [Postman collection](../postman/askit-backend.postman_collection.json)
3. **Review Examples**: Check out code examples in the [features documentation](../features/core-features.md)
4. **Production Setup**: Follow the [deployment guide](./deployment.md) for production configuration

---

**Last Updated**: September 2025  
**Setup Version**: 1.0.0
