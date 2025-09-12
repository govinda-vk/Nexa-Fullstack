# Postman Collection Guide

## Overview
This guide provides comprehensive instructions for using the ASKit Backend Postman collection to test and interact with the API endpoints.

---

## Collection Contents

### 📁 **ASKit Backend API Collection**
- **Total Requests**: 35+ endpoints
- **Authentication**: JWT Bearer token
- **Categories**: Authentication, User Management, RAG System, Widget Management, Widget API, Admin & Utilities
- **Environment Variables**: Pre-configured for easy testing

---

## Quick Setup

### Step 1: Import Collection and Environment

1. **Download Files**:
   - `askit-backend.postman_collection.json`
   - `askit-backend.postman_environment.json`

2. **Import into Postman**:
   - Open Postman
   - Click "Import" button
   - Drag and drop both JSON files or browse to select them
   - Click "Import"

3. **Select Environment**:
   - In the top-right corner, select "ASKit Backend Environment"
   - Verify environment variables are loaded

### Step 2: Configure Base URL

Update the `baseUrl` variable for your environment:

- **Local Development**: `http://localhost:3000`
- **Staging**: `https://staging-api.yourdomain.com`
- **Production**: `https://api.yourdomain.com`

### Step 3: Test Connection

Run the "Health Check" request to verify API connectivity:
```
GET {{baseUrl}}/health
```

Expected Response:
```json
{
  "status": "ok",
  "timestamp": "2025-09-11T10:30:00.000Z",
  "services": {
    "mongodb": "connected",
    "redis": "connected",
    "pinecone": "connected"
  }
}
```

---

## Authentication Flow

### Method 1: Registration + Auto-Login

1. **Register New User**:
   ```
   POST {{baseUrl}}/auth/register
   ```
   - Automatically sets `authToken` and `userId` variables
   - Creates test account with demo credentials

2. **Verify Authentication**:
   ```
   GET {{baseUrl}}/auth/profile
   ```
   - Should return user profile information

### Method 2: Login with Existing Account

1. **Login**:
   ```
   POST {{baseUrl}}/auth/login
   ```
   - Uses `testEmail` and `testPassword` variables
   - Automatically updates `authToken`

### Method 3: Manual Token Setup

If you have an existing token:

1. Go to "ASKit Backend Environment"
2. Set `authToken` variable to your JWT token
3. Set `userId` to your user ID

---

## Testing Workflows

### Complete User Journey

Execute requests in this order for a full test:

#### 1. **Setup & Authentication**
```
1. Health Check
2. Register User (or Login User)
3. Get User Profile
```

#### 2. **Website Management**
```
4. Get User Websites (should be empty)
5. Add New Website
6. Get Website Details
7. Update Website
8. Get Website Statistics
```

#### 3. **Content Ingestion**
```
9. Start Website Ingestion
10. Get Job Status (repeat until completed)
11. Get All User Jobs
```

#### 4. **RAG Queries**
```
12. Query Website Content (wait for ingestion to complete)
13. Query with different parameters
```

#### 5. **Widget Management**
```
14. Get User Widgets (should be empty)
15. Create New Widget
16. Get Widget Details
17. Update Widget Configuration
18. Get Widget Script
19. Get Widget Analytics
20. Toggle Widget Status
```

#### 6. **Public Widget API**
```
21. Initialize Widget
22. Send Chat Message
23. Get Chat History
24. Submit Widget Feedback
```

#### 7. **Cleanup** (Optional)
```
25. Delete Widget
26. Delete Website
27. Logout
```

### Automated Test Scenarios

The collection includes automated tests for each request:

#### Authentication Tests
- ✅ Registration creates user and returns token
- ✅ Login validates credentials and returns token
- ✅ Profile requires authentication
- ✅ Invalid credentials are rejected

#### API Response Tests
- ✅ Response time < 5 seconds
- ✅ Content-Type is application/json
- ✅ Success responses have success: true
- ✅ Error responses include error messages

#### Data Validation Tests
- ✅ Required fields are present
- ✅ Data types are correct
- ✅ IDs are valid MongoDB ObjectIds
- ✅ URLs are properly formatted

---

## Environment Variables

### Auto-Managed Variables

These are automatically set by test scripts:

| Variable | Description | Set By |
|----------|-------------|---------|
| `authToken` | JWT authentication token | Register/Login requests |
| `userId` | Current user ID | Register/Login requests |
| `websiteId` | Created website ID | Add Website request |
| `widgetId` | Created widget ID | Create Widget request |
| `jobId` | Background job ID | Start Ingestion request |

### Manual Configuration

Update these as needed:

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `baseUrl` | `http://localhost:3000` | API base URL |
| `testEmail` | `demo@askit.ai` | Test user email |
| `testPassword` | `DemoPass123!` | Test user password |
| `testWebsiteUrl` | `https://example.com` | Website for testing |

---

## Request Categories

### 🔐 Authentication
- **Health Check**: System status verification
- **Register User**: Create new account
- **Login User**: Authenticate with credentials
- **Get User Profile**: Retrieve user information
- **Update User Profile**: Modify user data
- **Google OAuth Initiate**: Start OAuth flow
- **Logout**: End user session

### 👤 User Management  
- **Get User Websites**: List user's websites
- **Add New Website**: Register website for crawling
- **Get Website Details**: Detailed website information
- **Update Website**: Modify website settings
- **Get Website Statistics**: Analytics and metrics
- **Delete Website**: Remove website and data

### 🤖 RAG System
- **Start Website Ingestion**: Begin crawling process
- **Query Website Content**: Ask questions about content
- **Get Job Status**: Check background job progress
- **Get All User Jobs**: List all processing jobs
- **Cancel Job**: Stop running background job

### 🎨 Widget Management
- **Get User Widgets**: List user's chat widgets
- **Create New Widget**: Set up embeddable widget
- **Get Widget Details**: Widget configuration
- **Update Widget Configuration**: Modify widget settings
- **Get Widget Script**: Embeddable JavaScript code
- **Get Widget Analytics**: Usage statistics
- **Toggle Widget Status**: Enable/disable widget
- **Delete Widget**: Remove widget

### 🌐 Widget API (Public)
- **Initialize Widget**: Setup widget session
- **Send Chat Message**: Process user messages
- **Get Chat History**: Retrieve conversation
- **Widget Feedback**: Submit message ratings

### ⚙️ Admin & Utilities
- **System Health Check**: Comprehensive status
- **Get API Metrics**: Performance metrics
- **Search Websites**: Content search functionality

---

## Advanced Usage

### Custom Test Scripts

Add custom validation in the "Tests" tab:

```javascript
// Custom test example
pm.test("Response contains specific data", function () {
    const response = pm.response.json();
    pm.expect(response.data).to.have.property('expectedField');
    pm.expect(response.data.expectedField).to.be.a('string');
});

// Store response data for later use
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.collectionVariables.set('customVariable', response.someValue);
}
```

### Pre-request Scripts

Add setup logic in the "Pre-request Script" tab:

```javascript
// Generate dynamic test data
const timestamp = Date.now();
pm.collectionVariables.set('uniqueEmail', `test${timestamp}@example.com`);
pm.collectionVariables.set('uniqueWebsite', `https://test${timestamp}.example.com`);

// Add custom headers
pm.request.headers.add({
    key: 'X-Request-ID',
    value: pm.globals.get('timestamp')
});
```

### Batch Operations

Run multiple requests efficiently:

1. **Collection Runner**:
   - Click "Runner" tab
   - Select "ASKit Backend API Collection"
   - Choose environment
   - Set iterations and delays
   - Click "Run"

2. **Automated Testing**:
   - Set up continuous integration
   - Use Newman (Postman CLI) for automated runs
   ```bash
   newman run askit-backend.postman_collection.json \
     -e askit-backend.postman_environment.json \
     --reporters cli,junit \
     --reporter-junit-export results.xml
   ```

---

## Error Handling

### Common Error Responses

#### 401 Unauthorized
```json
{
  "error": "Access token required",
  "message": "Please provide a valid authentication token"
}
```
**Solution**: Ensure `authToken` is set and valid

#### 400 Bad Request
```json
{
  "error": "Validation failed",
  "message": "Invalid email format",
  "details": {
    "field": "email",
    "value": "invalid-email"
  }
}
```
**Solution**: Check request body for required/valid fields

#### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests from this IP"
}
```
**Solution**: Wait before retrying or reduce request frequency

#### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Something went wrong"
}
```
**Solution**: Check server logs and system health

### Debugging Tips

1. **Enable Postman Console**:
   - View → Show Postman Console
   - See detailed request/response logs

2. **Check Environment Variables**:
   - Verify all required variables are set
   - Check variable scopes (collection vs environment)

3. **Validate Request Format**:
   - Ensure Content-Type headers are correct
   - Verify JSON syntax in request bodies

4. **Monitor Network**:
   - Check if API server is running
   - Verify correct base URL

---

## Load Testing with Postman

### Performance Testing

1. **Collection Runner Settings**:
   - **Iterations**: 100
   - **Delay**: 100ms
   - **Data File**: CSV with test data

2. **Key Metrics to Monitor**:
   - Average response time
   - 95th percentile response time
   - Error rate
   - Throughput (requests/second)

### Sample CSV Data File

Create `test-data.csv`:
```csv
email,password,websiteUrl,query
user1@test.com,Pass123!,https://example1.com,What is this about?
user2@test.com,Pass123!,https://example2.com,How does this work?
user3@test.com,Pass123!,https://example3.com,Tell me more
```

Use in requests:
```json
{
  "email": "{{email}}",
  "password": "{{password}}"
}
```

---

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: API Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install Newman
        run: npm install -g newman
      
      - name: Run Postman Tests
        run: |
          newman run docs/postman/askit-backend.postman_collection.json \
            -e docs/postman/askit-backend.postman_environment.json \
            --env-var "baseUrl=${{ secrets.API_BASE_URL }}" \
            --reporters cli,junit \
            --reporter-junit-export test-results.xml
      
      - name: Publish Test Results
        uses: EnricoMi/publish-unit-test-result-action@v1
        if: always()
        with:
          files: test-results.xml
```

### Jenkins Pipeline

```groovy
pipeline {
    agent any
    
    stages {
        stage('API Tests') {
            steps {
                script {
                    sh '''
                        newman run docs/postman/askit-backend.postman_collection.json \
                          -e docs/postman/askit-backend.postman_environment.json \
                          --env-var "baseUrl=${API_BASE_URL}" \
                          --reporters cli,htmlextra \
                          --reporter-htmlextra-export newman-report.html
                    '''
                }
            }
        }
    }
    
    post {
        always {
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: '.',
                reportFiles: 'newman-report.html',
                reportName: 'API Test Report'
            ])
        }
    }
}
```

---

## Troubleshooting

### Common Issues

#### Collection Import Fails
- **Cause**: Invalid JSON format
- **Solution**: Validate JSON files, re-download from repository

#### Environment Not Loading
- **Cause**: Environment not selected
- **Solution**: Select "ASKit Backend Environment" in top-right dropdown

#### Authentication Fails
- **Cause**: Expired or invalid token
- **Solution**: Run "Login User" request to refresh token

#### Requests Timeout
- **Cause**: Server not running or wrong URL
- **Solution**: Verify server is running and `baseUrl` is correct

#### Variable Not Set
- **Cause**: Previous request didn't execute successfully
- **Solution**: Run prerequisite requests in order

### Debug Checklist

- [ ] API server is running
- [ ] Correct environment selected
- [ ] `baseUrl` points to correct server
- [ ] Required environment variables are set
- [ ] Authentication token is valid
- [ ] Request body JSON is valid
- [ ] Content-Type headers are set correctly

---

## Best Practices

### Organization
1. **Use Folders**: Group related requests
2. **Descriptive Names**: Clear request names
3. **Documentation**: Add descriptions for complex requests
4. **Version Control**: Track collection changes

### Testing
1. **Automate Validation**: Add test scripts to requests
2. **Use Variables**: Avoid hardcoded values
3. **Error Handling**: Test both success and error cases
4. **Performance**: Monitor response times

### Collaboration
1. **Share Collections**: Export and share with team
2. **Environment Management**: Separate dev/staging/prod environments
3. **Documentation**: Maintain up-to-date guides
4. **Standards**: Establish team conventions

### Security
1. **Sensitive Data**: Use environment variables for secrets
2. **Token Management**: Regularly refresh auth tokens
3. **Access Control**: Limit collection sharing
4. **Audit Logs**: Monitor API access

---

**Last Updated**: September 2025  
**Collection Version**: 1.0.0  
**Postman Version**: 10.0+
