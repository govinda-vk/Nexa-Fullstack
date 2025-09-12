# User Management API Documentation

## Overview
The User Management API provides endpoints for managing user websites, crawling operations, and retrieving user statistics. All endpoints require authentication.

## Base URL
```
http://localhost:3000/user
```

## Authentication
All endpoints require the `Authorization` header with a valid JWT token:
```
Authorization: Bearer <jwt_token>
```

---

## Website Management Endpoints

### 1. Get User's Websites
Retrieve all websites associated with the authenticated user with pagination and filtering.

**Endpoint**: `GET /user/websites`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `status` (optional): Filter by website status (`pending`, `crawling`, `completed`, `failed`)
- `limit` (optional): Number of results per page (default: 10)
- `page` (optional): Page number (default: 1)

**Success Response** (200):
```json
{
  "websites": [
    {
      "_id": "64f5a1b2c3d4e5f6a7b8c9d1",
      "url": "https://example.com",
      "title": "Example Website",
      "domain": "example.com",
      "status": "completed",
      "crawledAt": "2025-09-11T08:30:00.000Z",
      "completedAt": "2025-09-11T08:45:00.000Z",
      "pagesCrawled": 25,
      "chunksProcessed": 156,
      "jobId": "job-abc123",
      "errorMessage": null
    },
    {
      "_id": "64f5a1b2c3d4e5f6a7b8c9d2",
      "url": "https://another-site.com",
      "title": "Another Site",
      "domain": "another-site.com",
      "status": "failed",
      "crawledAt": "2025-09-11T09:15:00.000Z",
      "completedAt": null,
      "pagesCrawled": 0,
      "chunksProcessed": 0,
      "jobId": "job-def456",
      "errorMessage": "Connection timeout"
    }
  ],
  "pagination": {
    "current": 1,
    "total": 3,
    "count": 15,
    "perPage": 10
  },
  "stats": {
    "total": 15,
    "pending": 2,
    "crawling": 1,
    "completed": 10,
    "failed": 2
  }
}
```

**Error Responses**:
```json
// 500 - Internal server error
{
  "error": "Failed to get websites",
  "message": "Internal server error"
}
```

**cURL Example**:
```bash
curl -X GET "http://localhost:3000/user/websites?status=completed&limit=5&page=1" \
  -H "Authorization: Bearer <token>"
```

---

### 2. Get Specific Website Details
Retrieve detailed information about a specific website.

**Endpoint**: `GET /user/websites/:websiteId`

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**:
- `websiteId`: MongoDB ObjectId of the website

**Success Response** (200):
```json
{
  "website": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d1",
    "url": "https://example.com",
    "title": "Example Website",
    "domain": "example.com",
    "status": "completed",
    "crawledAt": "2025-09-11T08:30:00.000Z",
    "completedAt": "2025-09-11T08:45:00.000Z",
    "pagesCrawled": 25,
    "chunksProcessed": 156,
    "jobId": "job-abc123",
    "errorMessage": null,
    "crawlStats": {
      "totalPages": 25,
      "successfulPages": 25,
      "failedPages": 0,
      "totalChunks": 156,
      "processedChunks": 156,
      "averageChunkSize": 512
    },
    "metadata": {
      "description": "A comprehensive example website",
      "language": "en",
      "sitemap": "https://example.com/sitemap.xml",
      "robotsAllowed": true
    },
    "owner": {
      "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Error Responses**:
```json
// 404 - Website not found
{
  "error": "Website not found",
  "message": "Website not found in your crawled websites"
}

// 500 - Internal server error
{
  "error": "Failed to get website",
  "message": "Internal server error"
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:3000/user/websites/64f5a1b2c3d4e5f6a7b8c9d1 \
  -H "Authorization: Bearer <token>"
```

---

### 3. Add Website to Crawl
Add a new website to the user's crawling queue.

**Endpoint**: `POST /user/websites`

**Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body**:
```json
{
  "url": "https://newsite.com",
  "title": "New Website",
  "description": "A new website to crawl"
}
```

**Validation Rules**:
- `url`: Required, must be valid URL
- `title`: Optional, max 200 characters
- `description`: Optional, max 500 characters

**Success Response** (201):
```json
{
  "message": "Website added successfully",
  "website": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d3",
    "url": "https://newsite.com",
    "title": "New Website",
    "description": "A new website to crawl",
    "status": "pending",
    "crawledAt": "2025-09-11T10:30:00.000Z",
    "pagesCrawled": 0,
    "chunksProcessed": 0,
    "jobId": null,
    "errorMessage": null
  }
}
```

**Error Responses**:
```json
// 400 - Missing URL
{
  "error": "Missing URL",
  "message": "Website URL is required"
}

// 409 - Website already exists
{
  "error": "Website already exists",
  "message": "This website is already in your crawled websites list"
}

// 400 - Limit reached
{
  "error": "Limit reached",
  "message": "You can only crawl up to 10 websites"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/user/websites \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://newsite.com",
    "title": "New Website",
    "description": "A new website to crawl"
  }'
```

---

### 4. Update Website Details
Update information for an existing website.

**Endpoint**: `PUT /user/websites/:websiteId`

**Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Path Parameters**:
- `websiteId`: MongoDB ObjectId of the website

**Request Body** (partial updates allowed):
```json
{
  "title": "Updated Website Title",
  "description": "Updated description",
  "status": "completed",
  "pagesCrawled": 30,
  "errorMessage": null,
  "jobId": "job-new123",
  "metadata": {
    "custom_field": "custom_value"
  }
}
```

**Allowed Updates**: 
`title`, `description`, `status`, `pagesCrawled`, `errorMessage`, `jobId`, `vectorIds`, `metadata`

**Success Response** (200):
```json
{
  "message": "Website updated successfully",
  "website": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d1",
    "url": "https://example.com",
    "title": "Updated Website Title",
    "description": "Updated description",
    "status": "completed",
    "pagesCrawled": 30,
    "jobId": "job-new123",
    "metadata": {
      "custom_field": "custom_value"
    }
  }
}
```

**Error Responses**:
```json
// 400 - Invalid updates
{
  "error": "Invalid updates",
  "message": "Allowed updates: title, description, status, pagesCrawled, errorMessage, jobId, vectorIds, metadata"
}

// 404 - Website not found
{
  "error": "Website not found",
  "message": "Website not found in your crawled websites"
}
```

**cURL Example**:
```bash
curl -X PUT http://localhost:3000/user/websites/64f5a1b2c3d4e5f6a7b8c9d1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Website Title",
    "status": "completed"
  }'
```

---

### 5. Delete Website
Remove a website from the user's crawled websites.

**Endpoint**: `DELETE /user/websites/:websiteId`

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**:
- `websiteId`: MongoDB ObjectId of the website

**Success Response** (200):
```json
{
  "message": "Website deleted successfully"
}
```

**Error Responses**:
```json
// 404 - Website not found
{
  "error": "Website not found",
  "message": "Website not found in your crawled websites"
}

// 500 - Internal server error
{
  "error": "Failed to delete website",
  "message": "Internal server error"
}
```

**cURL Example**:
```bash
curl -X DELETE http://localhost:3000/user/websites/64f5a1b2c3d4e5f6a7b8c9d1 \
  -H "Authorization: Bearer <token>"
```

---

## User Statistics Endpoint

### 6. Get User Statistics
Retrieve comprehensive statistics for the authenticated user.

**Endpoint**: `GET /user/stats`

**Headers**: `Authorization: Bearer <token>`

**Success Response** (200):
```json
{
  "stats": {
    "totalWebsitesCrawled": 15,
    "totalQueries": 487,
    "lastLogin": "2025-09-11T10:30:00.000Z",
    "websites": {
      "total": 15,
      "active": 12,
      "pending": 2,
      "crawling": 1,
      "completed": 10,
      "failed": 2
    },
    "account": {
      "createdAt": "2025-08-15T14:22:00.000Z",
      "isEmailVerified": true,
      "provider": "local"
    }
  }
}
```

**Response Fields**:
- `totalWebsitesCrawled`: Total number of websites ever crawled
- `totalQueries`: Total number of queries processed across all websites
- `lastLogin`: Timestamp of last login
- `websites.total`: Total websites in user's collection
- `websites.active`: Websites that are successfully crawled and active
- `websites.pending`: Websites waiting to be crawled
- `websites.crawling`: Websites currently being processed
- `websites.completed`: Successfully crawled websites
- `websites.failed`: Failed crawling attempts
- `account.createdAt`: User registration date
- `account.isEmailVerified`: Email verification status
- `account.provider`: Authentication provider (local/google)

**Error Responses**:
```json
// 500 - Internal server error
{
  "error": "Failed to get statistics",
  "message": "Internal server error"
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:3000/user/stats \
  -H "Authorization: Bearer <token>"
```

---

## Error Handling

### Common Error Responses

**Authentication Errors**:
```json
// 401 - No token provided
{
  "error": "Access token required",
  "message": "Please provide a valid authentication token"
}

// 401 - Invalid/expired token
{
  "error": "Token expired",
  "message": "Please log in again"
}

// 403 - Access denied
{
  "error": "Access denied",
  "message": "You can only access your own resources"
}
```

**Validation Errors**:
```json
// 400 - Missing required fields
{
  "error": "Missing URL",
  "message": "Website URL is required"
}

// 400 - Invalid data
{
  "error": "Invalid updates",
  "message": "Allowed updates: title, description, status"
}
```

**Resource Errors**:
```json
// 404 - Resource not found
{
  "error": "Website not found",
  "message": "Website not found in your crawled websites"
}

// 409 - Conflict
{
  "error": "Website already exists",
  "message": "This website is already in your crawled websites list"
}
```

**Server Errors**:
```json
// 500 - Internal server error
{
  "error": "Failed to get websites",
  "message": "Internal server error"
}
```

---

## Usage Examples

### Frontend Integration

```javascript
// Get user's websites with pagination
const getUserWebsites = async (page = 1, status = null, limit = 10) => {
  const token = localStorage.getItem('token');
  
  let url = `/user/websites?page=${page}&limit=${limit}`;
  if (status) url += `&status=${status}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching websites:', error);
    throw error;
  }
};

// Add a new website
const addWebsite = async (websiteData) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch('/user/websites', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(websiteData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding website:', error);
    throw error;
  }
};

// Update website status
const updateWebsiteStatus = async (websiteId, status) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`/user/websites/${websiteId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating website:', error);
    throw error;
  }
};

// Get user statistics
const getUserStats = async () => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch('/user/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.stats;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};
```

### Batch Operations

```bash
#!/bin/bash
# Batch website management script

TOKEN="your_jwt_token_here"
BASE_URL="http://localhost:3000/user"

# Add multiple websites
websites=(
  '{"url":"https://example1.com","title":"Example 1"}'
  '{"url":"https://example2.com","title":"Example 2"}'
  '{"url":"https://example3.com","title":"Example 3"}'
)

echo "Adding websites..."
for website in "${websites[@]}"; do
  curl -X POST "$BASE_URL/websites" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$website"
  echo ""
done

# Get all websites
echo "Fetching all websites..."
curl -X GET "$BASE_URL/websites" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Get statistics
echo "Fetching user statistics..."
curl -X GET "$BASE_URL/stats" \
  -H "Authorization: Bearer $TOKEN" | jq '.stats'
```

---

## Rate Limiting

User management endpoints have the following rate limits:
- **Website operations**: 30 requests per minute per user
- **Statistics**: 10 requests per minute per user
- **Bulk operations**: Special handling for batch requests

Rate limit headers:
```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 29
X-RateLimit-Reset: 1694436600
```

---

## Best Practices

### 1. Pagination
Always use pagination for large datasets:
```javascript
// Good
const websites = await getUserWebsites(1, null, 20);

// Better - with infinite scroll
let page = 1;
let allWebsites = [];
while (true) {
  const result = await getUserWebsites(page, null, 20);
  allWebsites = [...allWebsites, ...result.websites];
  if (page >= result.pagination.total) break;
  page++;
}
```

### 2. Status Filtering
Use status filters to optimize queries:
```javascript
// Get only completed websites
const completedWebsites = await getUserWebsites(1, 'completed');

// Get only failed websites for troubleshooting
const failedWebsites = await getUserWebsites(1, 'failed');
```

### 3. Error Handling
Implement comprehensive error handling:
```javascript
try {
  const website = await addWebsite(websiteData);
  showSuccessMessage('Website added successfully!');
} catch (error) {
  if (error.message.includes('already exists')) {
    showErrorMessage('Website already in your collection');
  } else if (error.message.includes('Limit reached')) {
    showErrorMessage('Maximum website limit reached');
  } else {
    showErrorMessage('Failed to add website. Please try again.');
  }
}
```

### 4. Real-time Updates
Consider implementing WebSocket connections for real-time status updates:
```javascript
// WebSocket connection for real-time website status updates
const ws = new WebSocket('ws://localhost:3000/ws');
ws.on('website-status-update', (data) => {
  updateWebsiteInUI(data.websiteId, data.status);
});
```

---

## Security Considerations

### Resource Ownership
All endpoints verify that users can only access their own resources:
- Website IDs are validated against the authenticated user
- Cross-user resource access is prevented
- Proper authorization middleware is implemented

### Input Validation
- URL validation prevents malicious URLs
- Title and description length limits prevent abuse
- Status values are validated against allowed enums

### Rate Limiting
- Per-user rate limits prevent API abuse
- Progressive throttling for repeated violations
- Whitelist functionality for trusted users

---

## Troubleshooting

### Common Issues

**1. Website Not Found Error**
```json
{
  "error": "Website not found",
  "message": "Website not found in your crawled websites"
}
```
**Cause**: Website ID doesn't exist or belongs to another user  
**Solution**: Verify website ID and user ownership

**2. Limit Reached Error**
```json
{
  "error": "Limit reached",
  "message": "You can only crawl up to 10 websites"
}
```
**Cause**: User has reached maximum website limit  
**Solution**: Delete unused websites or upgrade account

**3. Empty Website List**
**Cause**: User hasn't added any websites yet  
**Solution**: Use POST `/user/websites` to add first website

**4. Pagination Issues**
**Cause**: Requesting page beyond available pages  
**Solution**: Check `pagination.total` in response

### Debug Mode
Enable debug logging:
```bash
DEBUG=user:* npm run dev
```

---

**Last Updated**: September 2025  
**API Version**: 1.0.0
