# API Testing Guide

## Overview
This comprehensive guide covers testing strategies, tools, and examples for the ASKit backend API. It includes unit tests, integration tests, load testing, and manual testing approaches.

---

## Testing Strategy

### Testing Pyramid

```
    /\
   /  \    E2E Tests (10%)
  /    \   - Full user journeys
 /      \  - Cross-service integration
/________\ Integration Tests (20%)
|        | - API endpoint testing
|        | - Database integration
|        | Unit Tests (70%)
          - Function-level testing
          - Mock dependencies
```

### Test Categories

1. **Unit Tests**: Individual functions and modules
2. **Integration Tests**: API endpoints with real dependencies
3. **End-to-End Tests**: Complete user workflows
4. **Load Tests**: Performance and scalability
5. **Security Tests**: Authentication and authorization
6. **Contract Tests**: API schema validation

---

## Unit Testing

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/tests/unit/**/*.test.js',
    '**/tests/integration/**/*.test.js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/**/*.spec.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 10000,
  verbose: true
};
```

### Test Setup

```javascript
// tests/setup.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Redis = require('ioredis-mock');

let mongod;

// Global test setup
beforeAll(async () => {
  // Setup in-memory MongoDB
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);

  // Mock Redis
  jest.mock('ioredis', () => require('ioredis-mock'));
  
  // Mock external APIs
  jest.mock('openai');
  jest.mock('@google/generative-ai');
  jest.mock('@pinecone-database/pinecone');
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
});

afterEach(async () => {
  // Clean up collections after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  
  // Clear all mocks
  jest.clearAllMocks();
});

// Test utilities
global.createTestUser = async (overrides = {}) => {
  const User = require('../src/models/User');
  const userData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password123!',
    ...overrides
  };
  
  const user = new User(userData);
  await user.save();
  return user;
};

global.generateTestToken = (userId) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'test-secret');
};
```

### Model Testing

```javascript
// tests/unit/models/User.test.js
const User = require('../../../src/models/User');

describe('User Model', () => {
  describe('Validation', () => {
    test('should create user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123!'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.password).not.toBe(userData.password); // Should be hashed
      expect(savedUser.createdAt).toBeDefined();
    });

    test('should fail validation with invalid email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'SecurePass123!'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow('Invalid email format');
    });

    test('should fail validation with weak password', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow('Password too weak');
    });
  });

  describe('Methods', () => {
    test('should compare password correctly', async () => {
      const user = await createTestUser();
      
      const isValid = await user.comparePassword('Password123!');
      const isInvalid = await user.comparePassword('wrongpassword');
      
      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });

    test('should generate auth token', async () => {
      const user = await createTestUser();
      const token = user.generateAuthToken();
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      // Verify token payload
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
      expect(decoded.userId).toEqual(user._id.toString());
    });
  });

  describe('Hooks', () => {
    test('should hash password before saving', async () => {
      const userData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'PlainPassword123!'
      };

      const user = new User(userData);
      await user.save();

      expect(user.password).not.toBe('PlainPassword123!');
      expect(user.password.length).toBeGreaterThan(50); // Hashed password
    });
  });
});
```

### Utility Function Testing

```javascript
// tests/unit/utils/ssrf.test.js
const { validateUrl } = require('../../../src/utils/ssrf');

describe('SSRF Protection', () => {
  describe('validateUrl', () => {
    test('should allow valid public URLs', async () => {
      const result = await validateUrl('https://example.com');
      
      expect(result.valid).toBe(true);
      expect(result.url.href).toBe('https://example.com/');
    });

    test('should block localhost URLs', async () => {
      const result = await validateUrl('http://localhost:3000');
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('disallowed range');
    });

    test('should block private IP addresses', async () => {
      const testCases = [
        'http://192.168.1.1',
        'http://10.0.0.1',
        'http://172.16.0.1',
        'http://127.0.0.1'
      ];

      for (const url of testCases) {
        const result = await validateUrl(url);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('disallowed range');
      }
    });

    test('should allow whitelisted hostnames', async () => {
      const result = await validateUrl('http://localhost:3000', {
        whitelistHostnames: ['localhost']
      });
      
      expect(result.valid).toBe(true);
    });

    test('should validate allowed protocols', async () => {
      const httpResult = await validateUrl('http://example.com', {
        allowedProtocols: ['https:']
      });
      
      expect(httpResult.valid).toBe(false);
      expect(httpResult.error).toContain('Protocol not allowed');
    });
  });
});
```

---

## Integration Testing

### API Endpoint Testing

```javascript
// tests/integration/auth.test.js
const request = require('supertest');
const app = require('../../src/server');

describe('Authentication API', () => {
  describe('POST /auth/register', () => {
    test('should register new user successfully', async () => {
      const userData = {
        name: 'Integration Test User',
        email: 'integration@example.com',
        password: 'SecurePass123!'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'User registered successfully'
      });
      
      expect(response.body.user).toMatchObject({
        name: userData.name,
        email: userData.email
      });
      
      expect(response.body.user.password).toBeUndefined();
      expect(response.body.token).toBeDefined();
    });

    test('should not register user with existing email', async () => {
      const userData = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'SecurePass123!'
      };

      // First registration
      await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      // Second registration with same email
      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('Email already exists');
    });

    test('should validate required fields', async () => {
      const testCases = [
        { name: '', email: 'test@example.com', password: 'Pass123!' },
        { name: 'Test', email: '', password: 'Pass123!' },
        { name: 'Test', email: 'test@example.com', password: '' }
      ];

      for (const userData of testCases) {
        const response = await request(app)
          .post('/auth/register')
          .send(userData)
          .expect(400);

        expect(response.body.error).toBeDefined();
      }
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create test user
      await request(app)
        .post('/auth/register')
        .send({
          name: 'Login Test User',
          email: 'login@example.com',
          password: 'SecurePass123!'
        });
    });

    test('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'SecurePass123!'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('login@example.com');
    });

    test('should not login with invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword'
        })
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });
  });
});
```

### Protected Route Testing

```javascript
// tests/integration/user.test.js
const request = require('supertest');
const app = require('../../src/server');

describe('User Management API', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    // Create and authenticate test user
    const registerResponse = await request(app)
      .post('/auth/register')
      .send({
        name: 'API Test User',
        email: 'apitest@example.com',
        password: 'SecurePass123!'
      });

    authToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;
  });

  describe('GET /user/websites', () => {
    test('should return user websites when authenticated', async () => {
      const response = await request(app)
        .get('/user/websites')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        websites: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          limit: 10
        }
      });
    });

    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/user/websites')
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });

    test('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/user/websites')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.error).toBe('Token expired');
    });
  });

  describe('POST /user/websites', () => {
    test('should add new website successfully', async () => {
      const websiteData = {
        name: 'Test Website',
        url: 'https://example.com',
        description: 'A test website'
      };

      const response = await request(app)
        .post('/user/websites')
        .set('Authorization', `Bearer ${authToken}`)
        .send(websiteData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.website).toMatchObject({
        name: websiteData.name,
        url: websiteData.url,
        status: 'pending'
      });
    });

    test('should validate website URL', async () => {
      const websiteData = {
        name: 'Invalid Website',
        url: 'not-a-url',
        description: 'Invalid URL test'
      };

      const response = await request(app)
        .post('/user/websites')
        .set('Authorization', `Bearer ${authToken}`)
        .send(websiteData)
        .expect(400);

      expect(response.body.error).toContain('Invalid URL');
    });
  });
});
```

### RAG System Testing

```javascript
// tests/integration/rag.test.js
const request = require('supertest');
const app = require('../../src/server');

// Mock external services
jest.mock('openai');
jest.mock('@google/generative-ai');
jest.mock('@pinecone-database/pinecone');

describe('RAG System API', () => {
  let authToken;
  let websiteId;

  beforeEach(async () => {
    // Setup authenticated user and website
    const registerResponse = await request(app)
      .post('/auth/register')
      .send({
        name: 'RAG Test User',
        email: 'rag@example.com',
        password: 'SecurePass123!'
      });

    authToken = registerResponse.body.token;

    const websiteResponse = await request(app)
      .post('/user/websites')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'RAG Test Site',
        url: 'https://example.com',
        description: 'Site for RAG testing'
      });

    websiteId = websiteResponse.body.website.id;
  });

  describe('POST /ingest', () => {
    test('should accept ingest request for valid website', async () => {
      const response = await request(app)
        .post('/ingest')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          websiteUrl: 'https://example.com',
          maxPages: 5
        })
        .expect(202);

      expect(response.body.success).toBe(true);
      expect(response.body.jobId).toBeDefined();
      expect(response.body.message).toContain('started');
    });

    test('should reject SSRF attempts', async () => {
      const response = await request(app)
        .post('/ingest')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          websiteUrl: 'http://localhost:3000',
          maxPages: 5
        })
        .expect(400);

      expect(response.body.error).toContain('disallowed');
    });
  });

  describe('POST /query', () => {
    test('should process query with valid parameters', async () => {
      // Mock successful RAG response
      const mockRAGResponse = {
        answer: 'This is a test answer',
        sources: ['https://example.com/page1'],
        confidence: 0.85
      };

      jest.doMock('../../src/rag', () => ({
        processQuery: jest.fn().mockResolvedValue(mockRAGResponse)
      }));

      const response = await request(app)
        .post('/query')
        .send({
          query: 'What is this website about?',
          websiteUrl: 'https://example.com'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.answer).toBe(mockRAGResponse.answer);
      expect(response.body.sources).toEqual(mockRAGResponse.sources);
    });

    test('should validate query parameters', async () => {
      const testCases = [
        { query: '', websiteUrl: 'https://example.com' },
        { query: 'Valid query', websiteUrl: '' },
        { query: 'Valid query', websiteUrl: 'invalid-url' }
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .post('/query')
          .send(testCase)
          .expect(400);

        expect(response.body.error).toBeDefined();
      }
    });
  });

  describe('GET /jobs/:jobId', () => {
    test('should return job status for valid job ID', async () => {
      // Create ingest job first
      const ingestResponse = await request(app)
        .post('/ingest')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          websiteUrl: 'https://example.com',
          maxPages: 5
        });

      const jobId = ingestResponse.body.jobId;

      const response = await request(app)
        .get(`/jobs/${jobId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.job).toMatchObject({
        id: jobId,
        status: expect.stringMatching(/pending|processing|completed|failed/)
      });
    });

    test('should return 404 for non-existent job', async () => {
      const response = await request(app)
        .get('/jobs/non-existent-job-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toBe('Job not found');
    });
  });
});
```

---

## Load Testing

### Artillery Configuration

```yaml
# artillery.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 5
      name: "Warm up"
    - duration: 120
      arrivalRate: 10
      rampTo: 50
      name: "Ramp up load"
    - duration: 300
      arrivalRate: 50
      name: "Sustained load"
  payload:
    path: "test-data.csv"
    fields:
      - "email"
      - "password"
  processor: "./load-test-functions.js"

scenarios:
  - name: "Authentication Flow"
    weight: 30
    flow:
      - post:
          url: "/auth/register"
          json:
            name: "Load Test User {{ $randomString() }}"
            email: "loadtest{{ $randomNumber(1, 10000) }}@example.com"
            password: "LoadTest123!"
          capture:
            json: "$.token"
            as: "authToken"
      - think: 2
      - get:
          url: "/user/profile"
          headers:
            Authorization: "Bearer {{ authToken }}"

  - name: "Website Management"
    weight: 40
    flow:
      - function: "loginUser"
      - post:
          url: "/user/websites"
          headers:
            Authorization: "Bearer {{ authToken }}"
          json:
            name: "Load Test Site {{ $randomString() }}"
            url: "https://example{{ $randomNumber(1, 100) }}.com"
            description: "Load testing website"
      - think: 1
      - get:
          url: "/user/websites"
          headers:
            Authorization: "Bearer {{ authToken }}"

  - name: "RAG Queries"
    weight: 30
    flow:
      - function: "loginUser"
      - post:
          url: "/query"
          json:
            query: "{{ $randomPick(['What is this about?', 'How does this work?', 'Tell me more']) }}"
            websiteUrl: "https://example.com"
          capture:
            json: "$.requestId"
            as: "queryId"
```

### Load Test Functions

```javascript
// load-test-functions.js
const { faker } = require('@faker-js/faker');

function loginUser(requestParams, context, ee, next) {
  // Simulate user login
  const email = faker.internet.email();
  const password = 'LoadTest123!';
  
  // Store in context for use in subsequent requests
  context.vars.email = email;
  context.vars.password = password;
  
  return next();
}

function generateRandomQuery(requestParams, context, ee, next) {
  const queries = [
    'What is this website about?',
    'How can I contact support?',
    'What are the main features?',
    'How does the pricing work?',
    'What is the return policy?'
  ];
  
  context.vars.query = queries[Math.floor(Math.random() * queries.length)];
  return next();
}

module.exports = {
  loginUser,
  generateRandomQuery
};
```

### Running Load Tests

```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery run artillery.yml

# Run with custom target
artillery run --target http://staging.yourdomain.com artillery.yml

# Generate HTML report
artillery run artillery.yml --output loadtest-results.json
artillery report loadtest-results.json --output loadtest-report.html
```

### K6 Load Testing

```javascript
// k6-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export let options = {
  stages: [
    { duration: '2m', target: 10 },   // Ramp up
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    errors: ['rate<0.1'],             // Error rate must be below 10%
    http_req_duration: ['p(95)<2000'] // 95% of requests under 2s
  }
};

const BASE_URL = 'http://localhost:3000';

export function setup() {
  // Setup data for all VUs
  return {
    authToken: registerAndLogin()
  };
}

function registerAndLogin() {
  const email = `k6test${Date.now()}@example.com`;
  const password = 'K6Test123!';
  
  const registerPayload = {
    name: 'K6 Test User',
    email: email,
    password: password
  };

  const registerResponse = http.post(`${BASE_URL}/auth/register`, JSON.stringify(registerPayload), {
    headers: { 'Content-Type': 'application/json' }
  });

  check(registerResponse, {
    'registration successful': (r) => r.status === 201,
  });

  return registerResponse.json().token;
}

export default function(data) {
  const token = data.authToken;
  
  // Test authenticated endpoint
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // Get user websites
  const websitesResponse = http.get(`${BASE_URL}/user/websites`, { headers });
  
  const websitesCheck = check(websitesResponse, {
    'websites endpoint returns 200': (r) => r.status === 200,
    'response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  errorRate.add(!websitesCheck);

  // Add new website
  const websitePayload = {
    name: `K6 Test Site ${Date.now()}`,
    url: `https://k6-test-${Date.now()}.example.com`,
    description: 'K6 load test website'
  };

  const addWebsiteResponse = http.post(`${BASE_URL}/user/websites`, JSON.stringify(websitePayload), { headers });
  
  const addWebsiteCheck = check(addWebsiteResponse, {
    'add website returns 201': (r) => r.status === 201,
  });

  errorRate.add(!addWebsiteCheck);

  sleep(1);
}

export function teardown(data) {
  console.log('Load test completed');
}
```

---

## End-to-End Testing

### Playwright E2E Tests

```javascript
// e2e/auth.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001'); // Frontend URL
  });

  test('should complete full registration and login flow', async ({ page }) => {
    // Registration
    await page.click('[data-testid="register-link"]');
    await page.fill('[data-testid="name-input"]', 'E2E Test User');
    await page.fill('[data-testid="email-input"]', 'e2e@example.com');
    await page.fill('[data-testid="password-input"]', 'E2ETest123!');
    await page.click('[data-testid="register-button"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('[data-testid="welcome-message"]')).toContainText('Welcome, E2E Test User');

    // Logout
    await page.click('[data-testid="logout-button"]');
    
    // Login with same credentials
    await page.click('[data-testid="login-link"]');
    await page.fill('[data-testid="email-input"]', 'e2e@example.com');
    await page.fill('[data-testid="password-input"]', 'E2ETest123!');
    await page.click('[data-testid="login-button"]');

    // Should be back at dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.click('[data-testid="login-link"]');
    await page.fill('[data-testid="email-input"]', 'nonexistent@example.com');
    await page.fill('[data-testid="password-input"]', 'WrongPassword123!');
    await page.click('[data-testid="login-button"]');

    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
  });
});
```

### RAG System E2E Tests

```javascript
// e2e/rag-flow.spec.js
const { test, expect } = require('@playwright/test');

test.describe('RAG System Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:3001/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'Test123!');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should complete website ingestion flow', async ({ page }) => {
    // Navigate to website management
    await page.click('[data-testid="websites-nav"]');
    
    // Add new website
    await page.click('[data-testid="add-website-button"]');
    await page.fill('[data-testid="website-name"]', 'E2E Test Website');
    await page.fill('[data-testid="website-url"]', 'https://example.com');
    await page.fill('[data-testid="website-description"]', 'Website for E2E testing');
    await page.click('[data-testid="submit-website"]');

    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Website added successfully');

    // Start ingestion
    await page.click('[data-testid="start-ingestion"]');
    await page.fill('[data-testid="max-pages"]', '5');
    await page.click('[data-testid="start-crawl-button"]');

    // Should show job started message
    await expect(page.locator('[data-testid="job-status"]')).toContainText('Ingestion started');
    
    // Wait for job to complete (in real test, you'd poll or use websockets)
    await page.waitForTimeout(5000);
    await page.reload();
    
    // Check job status
    const status = await page.locator('[data-testid="job-status"]').textContent();
    expect(['Completed', 'Processing']).toContain(status);
  });

  test('should handle RAG queries', async ({ page }) => {
    // Navigate to query interface
    await page.click('[data-testid="query-nav"]');
    
    // Enter query
    await page.fill('[data-testid="query-input"]', 'What is this website about?');
    await page.selectOption('[data-testid="website-select"]', 'https://example.com');
    await page.click('[data-testid="submit-query"]');

    // Should show loading state
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible();
    
    // Wait for response
    await page.waitForSelector('[data-testid="query-response"]', { timeout: 10000 });
    
    // Should show answer and sources
    await expect(page.locator('[data-testid="query-answer"]')).not.toBeEmpty();
    await expect(page.locator('[data-testid="query-sources"]')).toBeVisible();
  });
});
```

---

## Security Testing

### Authentication Security Tests

```javascript
// tests/security/auth-security.test.js
const request = require('supertest');
const app = require('../../src/server');

describe('Authentication Security', () => {
  describe('JWT Token Security', () => {
    test('should reject tampered tokens', async () => {
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MTIzNDU2Nzg5MCIsImlhdCI6MTYzNDU2Nzg5MH0.invalid';
      
      const response = await request(app)
        .get('/user/profile')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(401);

      expect(response.body.error).toBe('Token expired');
    });

    test('should handle token expiration', async () => {
      // Create expired token
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { userId: '507f1f77bcf86cd799439011' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .get('/user/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.error).toBe('Token expired');
    });
  });

  describe('Rate Limiting', () => {
    test('should enforce login rate limits', async () => {
      const loginAttempts = Array(10).fill(null).map((_, i) => 
        request(app)
          .post('/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword'
          })
      );

      const responses = await Promise.all(loginAttempts);
      
      // Last few should be rate limited
      const rateLimitedResponses = responses.slice(-3);
      rateLimitedResponses.forEach(response => {
        expect(response.status).toBe(429);
      });
    });
  });

  describe('Input Validation', () => {
    test('should sanitize malicious input', async () => {
      const maliciousData = {
        name: '<script>alert("xss")</script>',
        email: 'test@example.com',
        password: 'Test123!'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(maliciousData)
        .expect(201);

      expect(response.body.user.name).not.toContain('<script>');
    });
  });
});
```

### SSRF Security Tests

```javascript
// tests/security/ssrf.test.js
const request = require('supertest');
const app = require('../../src/server');

describe('SSRF Protection', () => {
  let authToken;

  beforeEach(async () => {
    const registerResponse = await request(app)
      .post('/auth/register')
      .send({
        name: 'SSRF Test User',
        email: 'ssrf@example.com',
        password: 'Test123!'
      });
    
    authToken = registerResponse.body.token;
  });

  test('should block internal network access', async () => {
    const maliciousUrls = [
      'http://127.0.0.1:3000',
      'http://localhost:8080',
      'http://192.168.1.1',
      'http://10.0.0.1',
      'http://172.16.0.1',
      'http://169.254.169.254' // AWS metadata
    ];

    for (const url of maliciousUrls) {
      const response = await request(app)
        .post('/ingest')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          websiteUrl: url,
          maxPages: 5
        })
        .expect(400);

      expect(response.body.error).toContain('disallowed');
    }
  });

  test('should block non-HTTP protocols', async () => {
    const maliciousProtocols = [
      'file:///etc/passwd',
      'ftp://internal-server.com',
      'gopher://internal-server.com',
      'ldap://internal-server.com'
    ];

    for (const url of maliciousProtocols) {
      const response = await request(app)
        .post('/ingest')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          websiteUrl: url,
          maxPages: 5
        })
        .expect(400);

      expect(response.body.error).toContain('Protocol not allowed');
    }
  });
});
```

---

## Performance Testing

### Database Performance Tests

```javascript
// tests/performance/database.test.js
const mongoose = require('mongoose');
const User = require('../../src/models/User');
const Website = require('../../src/models/Website');

describe('Database Performance', () => {
  test('should handle bulk user creation efficiently', async () => {
    const startTime = Date.now();
    
    const users = Array(1000).fill(null).map((_, i) => ({
      name: `Bulk User ${i}`,
      email: `bulk${i}@example.com`,
      password: 'BulkTest123!'
    }));

    await User.insertMany(users);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should complete within reasonable time
    expect(duration).toBeLessThan(5000); // 5 seconds
  });

  test('should efficiently query with pagination', async () => {
    // Create test data
    const websites = Array(100).fill(null).map((_, i) => ({
      name: `Performance Site ${i}`,
      url: `https://performance${i}.example.com`,
      owner: new mongoose.Types.ObjectId(),
      status: 'completed'
    }));

    await Website.insertMany(websites);

    const startTime = Date.now();
    
    // Test paginated query
    const result = await Website.find({ status: 'completed' })
      .limit(10)
      .skip(0)
      .sort({ createdAt: -1 });
    
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(result).toHaveLength(10);
    expect(duration).toBeLessThan(100); // 100ms
  });

  test('should efficiently handle complex aggregations', async () => {
    const startTime = Date.now();
    
    const result = await Website.aggregate([
      { $match: { status: 'completed' } },
      { $group: { 
        _id: '$owner', 
        count: { $sum: 1 },
        totalPages: { $sum: '$totalPages' }
      }},
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(200); // 200ms
  });
});
```

### API Performance Tests

```javascript
// tests/performance/api.test.js
const request = require('supertest');
const app = require('../../src/server');

describe('API Performance', () => {
  let authToken;

  beforeEach(async () => {
    const registerResponse = await request(app)
      .post('/auth/register')
      .send({
        name: 'Performance Test User',
        email: 'performance@example.com',
        password: 'Test123!'
      });
    
    authToken = registerResponse.body.token;
  });

  test('should handle concurrent requests efficiently', async () => {
    const concurrentRequests = 50;
    const startTime = Date.now();
    
    const requests = Array(concurrentRequests).fill(null).map(() =>
      request(app)
        .get('/user/websites')
        .set('Authorization', `Bearer ${authToken}`)
    );

    const responses = await Promise.all(requests);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    const avgResponseTime = duration / concurrentRequests;

    // All requests should succeed
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });

    // Average response time should be reasonable
    expect(avgResponseTime).toBeLessThan(500); // 500ms per request
  });

  test('should handle memory efficiently during large operations', async () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Perform memory-intensive operation
    const largeDataRequests = Array(100).fill(null).map((_, i) =>
      request(app)
        .post('/user/websites')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: `Memory Test Site ${i}`,
          url: `https://memtest${i}.example.com`,
          description: 'X'.repeat(1000) // 1KB description
        })
    );

    await Promise.all(largeDataRequests);
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // MB

    // Memory increase should be reasonable
    expect(memoryIncrease).toBeLessThan(100); // Less than 100MB
  });
});
```

---

## API Testing Best Practices

### Test Data Management

```javascript
// tests/helpers/testData.js
const mongoose = require('mongoose');

class TestDataManager {
  constructor() {
    this.createdUsers = [];
    this.createdWebsites = [];
    this.createdWidgets = [];
  }

  async createUser(data = {}) {
    const User = require('../../src/models/User');
    const userData = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'TestPass123!',
      ...data
    };

    const user = new User(userData);
    await user.save();
    this.createdUsers.push(user._id);
    
    return user;
  }

  async createWebsite(owner, data = {}) {
    const Website = require('../../src/models/Website');
    const websiteData = {
      name: 'Test Website',
      url: `https://test${Date.now()}.example.com`,
      owner: owner,
      status: 'completed',
      ...data
    };

    const website = new Website(websiteData);
    await website.save();
    this.createdWebsites.push(website._id);
    
    return website;
  }

  async createWidget(owner, data = {}) {
    const Widget = require('../../src/models/Widget');
    const widgetData = {
      name: 'Test Widget',
      owner: owner,
      isActive: true,
      ...data
    };

    const widget = new Widget(widgetData);
    await widget.save();
    this.createdWidgets.push(widget._id);
    
    return widget;
  }

  async cleanup() {
    const User = require('../../src/models/User');
    const Website = require('../../src/models/Website');
    const Widget = require('../../src/models/Widget');

    // Clean up in reverse order due to dependencies
    await Widget.deleteMany({ _id: { $in: this.createdWidgets } });
    await Website.deleteMany({ _id: { $in: this.createdWebsites } });
    await User.deleteMany({ _id: { $in: this.createdUsers } });

    this.createdUsers = [];
    this.createdWebsites = [];
    this.createdWidgets = [];
  }
}

module.exports = TestDataManager;
```

### Test Utilities

```javascript
// tests/helpers/testUtils.js
const jwt = require('jsonwebtoken');

class TestUtils {
  static generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  }

  static generateExpiredToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '-1h' }
    );
  }

  static async waitForJobCompletion(jobId, timeout = 10000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const job = await this.getJobStatus(jobId);
      
      if (job.status === 'completed' || job.status === 'failed') {
        return job;
      }
      
      await this.delay(100);
    }
    
    throw new Error('Job did not complete within timeout');
  }

  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static generateRandomString(length = 10) {
    return Math.random().toString(36).substring(2, length + 2);
  }

  static generateValidEmail() {
    return `test${Date.now()}${this.generateRandomString(5)}@example.com`;
  }

  static generateValidUrl() {
    return `https://${this.generateRandomString(10)}.example.com`;
  }
}

module.exports = TestUtils;
```

---

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: API Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]
        mongodb-version: [5.0, 6.0]

    services:
      mongodb:
        image: mongo:${{ matrix.mongodb-version }}
        env:
          MONGO_INITDB_ROOT_USERNAME: root
          MONGO_INITDB_ROOT_PASSWORD: password
        ports:
          - 27017:27017
        options: --health-cmd mongo --health-interval 10s --health-timeout 5s --health-retries 5

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: --health-cmd "redis-cli ping" --health-interval 10s --health-timeout 5s --health-retries 5

    steps:
    - uses: actions/checkout@v4

    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run linting
      run: npm run lint

    - name: Run unit tests
      run: npm test -- --coverage
      env:
        NODE_ENV: test
        MONGODB_URI: mongodb://root:password@localhost:27017/test?authSource=admin
        REDIS_URL: redis://localhost:6379
        JWT_SECRET: test-jwt-secret-for-ci-environment
        OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}

    - name: Run integration tests
      run: npm run test:integration
      env:
        NODE_ENV: test
        MONGODB_URI: mongodb://root:password@localhost:27017/test?authSource=admin
        REDIS_URL: redis://localhost:6379

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella

    - name: Run load tests
      run: npm run test:load
      if: github.event_name == 'push' && github.ref == 'refs/heads/main'
```

### Test Scripts Configuration

```json
{
  "scripts": {
    "test": "jest --runInBand",
    "test:unit": "jest --testPathPattern=tests/unit --runInBand",
    "test:integration": "jest --testPathPattern=tests/integration --runInBand",
    "test:e2e": "playwright test",
    "test:load": "artillery run artillery.yml",
    "test:security": "jest --testPathPattern=tests/security --runInBand",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage --runInBand",
    "test:ci": "jest --ci --coverage --watchAll=false --runInBand"
  }
}
```

---

**Last Updated**: September 2025  
**Testing Guide Version**: 1.0.0
