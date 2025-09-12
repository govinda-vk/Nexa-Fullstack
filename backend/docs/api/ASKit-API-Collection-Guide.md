# ASKit Backend API - Postman Collection

This Postman collection contains all the actual API endpoints implemented in the ASKit backend system, based on thorough codebase analysis.

## 🚀 Quick Start

1. **Import the Collection**: Import `ASKit-Backend-API-Actual.postman_collection.json` into Postman
2. **Set Base URL**: Update the `baseUrl` variable to match your server (default: `http://localhost:3000`)
3. **Authenticate**: Use the Login request to get a JWT token (automatically saved)
4. **Start Testing**: Use the organized folders to test different API functionalities

## 📁 Collection Structure

### 1. Authentication (`/auth`)
- **Register User**: Create a new user account
- **Login User**: Authenticate and get JWT token (auto-saves token)
- **Get Profile**: Retrieve current user information
- **Update Profile**: Modify user profile data
- **Change Password**: Update password for local auth users
- **Google OAuth**: Google authentication flow

### 2. User Management (`/user`)
- **Get Websites**: List user's crawled websites with pagination/filtering
- **Website Details**: Get detailed information about a specific website
- **Add Website**: Add a new website to crawl
- **Update Website**: Modify website information
- **Delete Website**: Remove a website from the system
- **User Statistics**: Get comprehensive user stats

### 3. Website Crawling & Ingestion
- **Start Crawl** (`POST /ingest`): Initiate website crawling process
- **Job Status** (`GET /job-status/:jobId`): Monitor crawling progress
- **Job Webhook** (`POST /webhook/job-status`): Webhook for status updates
- **Queue Stats** (`GET /queue-stats`): View queue statistics
- **Clear Queue** (`DELETE /queue/clear`): Clear processing queue

### 4. RAG Query System
- **Query** (`POST /query`): Ask questions using the RAG system

### 5. Widget Management (`/widget`)
- **Get Configuration**: Retrieve widget settings for a website
- **Update Configuration**: Modify widget appearance and behavior
- **Create Widget**: Set up widget for an existing website
- **Regenerate API Key**: Generate new widget API key
- **Get Statistics**: View widget usage analytics
- **Test Widget**: Test widget functionality

### 6. Widget Public API (`/widget-api`)
> **Note**: These endpoints use Widget API Key authentication (X-Widget-API-Key header)

- **Chat**: Send messages through the widget
- **Get Config**: Retrieve widget configuration
- **Statistics Ping**: Track widget usage events
- **Feedback**: Submit user feedback
- **Health Check**: Verify widget status

### 7. Server Endpoints (Direct)
- **Health Check** (`GET /health`): Server health status
- **Widget Script** (`GET /widget/:widgetId/script.js`): Embeddable widget script
- Direct website management endpoints

## 🔑 Authentication

### JWT Authentication (Most Endpoints)
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Widget API Key Authentication (Widget API Endpoints)
```
X-Widget-API-Key: YOUR_WIDGET_API_KEY
```

## 📋 Variables

The collection uses these variables for easy testing:

| Variable | Description | Auto-Set |
|----------|-------------|----------|
| `baseUrl` | API server base URL | Manual |
| `token` | JWT authentication token | ✅ Login |
| `widgetApiKey` | Widget API key | ✅ Widget Config |
| `websiteId` | Website ID for testing | ✅ Get Websites |
| `jobId` | Crawl job ID | ✅ Start Crawl |
| `widgetId` | Widget ID | ✅ Widget Config |

## 🔄 Typical Workflow

### 1. User Registration & Setup
1. **Register** a new user account
2. **Login** to get JWT token
3. **Get Profile** to verify authentication

### 2. Website Management
1. **Start Crawl** to ingest a website
2. **Monitor Job Status** until completion
3. **Get Websites** to see crawled sites
4. **Query** the knowledge base

### 3. Widget Setup
1. **Create Widget** for a completed website
2. **Update Configuration** to customize appearance
3. **Get Widget Script** for embedding
4. **Test Widget** functionality

### 4. Widget Integration
1. Use **Widget API** endpoints for live chat
2. **Submit Feedback** from users
3. **Track Statistics** for analytics

## 🧪 Testing Features

### Automatic Token Management
- Login request automatically saves JWT token
- All authenticated requests use the saved token

### Response Processing
- Website ID extracted from listings
- Job ID saved from crawl initiation
- Widget credentials captured automatically

### Error Handling
- Response time validation
- Error response logging
- Status code verification

## 🛠️ Advanced Usage

### Environment Setup
Create different environments for:
- **Development**: `http://localhost:3000`
- **Staging**: `https://staging-api.yourdomain.com`
- **Production**: `https://api.yourdomain.com`

### Custom Scripts
The collection includes pre-request and test scripts for:
- Automatic authentication header injection
- Response data extraction and variable setting
- Performance monitoring
- Error logging

## 📊 API Endpoints Summary

### Authentication Routes (`/auth`)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user
- `PUT /auth/profile` - Update profile
- `PUT /auth/change-password` - Change password
- `GET /auth/google` - Google OAuth
- `GET /auth/google/callback` - OAuth callback

### User Routes (`/user`)
- `GET /user/websites` - List websites
- `GET /user/websites/:id` - Get website details
- `POST /user/websites` - Add website
- `PUT /user/websites/:id` - Update website
- `DELETE /user/websites/:id` - Delete website
- `GET /user/stats` - User statistics

### Widget Management (`/widget`)
- `GET /widget/website/:websiteId` - Get widget config
- `PUT /widget/website/:websiteId` - Update widget config
- `POST /widget/website/:websiteId/create` - Create widget
- `POST /widget/website/:websiteId/regenerate-key` - Regenerate API key
- `GET /widget/website/:websiteId/stats` - Widget stats
- `POST /widget/website/:websiteId/test` - Test widget

### Widget Public API (`/widget-api`)
- `POST /widget-api/chat` - Chat with widget
- `GET /widget-api/config` - Get widget config
- `POST /widget-api/stats` - Update stats
- `POST /widget-api/feedback` - Submit feedback
- `GET /widget-api/health` - Health check

### Main Server Routes
- `POST /ingest` - Start website crawl
- `GET /job-status/:jobId` - Check job status
- `POST /webhook/job-status` - Job status webhook
- `GET /queue-stats` - Queue statistics
- `DELETE /queue/clear` - Clear queue
- `POST /query` - Query knowledge base
- `GET /websites` - List all websites
- `GET /websites/:id` - Get website details
- `DELETE /websites/:id` - Delete website
- `GET /health` - Health check
- `GET /widget-demo` - Widget demo page
- `GET /widget-test` - Widget test page
- `GET /widget/:id/script.js` - Widget script

## 🔍 Key Implementation Details

### Widget Authentication
- Uses `X-Widget-API-Key` header
- No domain restrictions for universal embedding
- Rate limiting temporarily disabled for cross-origin compatibility

### Data Models
- **User**: Authentication and profile management
- **Website**: Crawled website information and status
- **Widget**: Widget configuration and analytics

### Job Processing
- Uses BullMQ for background processing
- Redis for queue management
- Webhook notifications for status updates

### RAG System
- Pinecone vector database for embeddings
- OpenAI GPT for answer generation
- Website-specific filtering for responses

## 📝 Notes

1. **Google OAuth**: Requires proper CLIENT_ID/SECRET configuration
2. **Widget Embedding**: Scripts include CORS headers for cross-origin loading
3. **Rate Limiting**: Temporarily disabled on widget API for development
4. **Database**: MongoDB with Mongoose ODM
5. **Queue System**: Redis + BullMQ for background job processing

## 🐛 Troubleshooting

### Common Issues
1. **401 Unauthorized**: Check if JWT token is valid and properly set
2. **404 Not Found**: Verify website/widget IDs are correct
3. **500 Server Error**: Check server logs for detailed error information
4. **CORS Issues**: Ensure proper headers are set for widget embedding

### Debug Tips
- Use the Health Check endpoint to verify server status
- Check Queue Stats for job processing issues
- Monitor Job Status for crawling problems
- Use Widget Test endpoints for debugging widget issues
