# Nexa Backend API Documentation

## Overview
This document provides comprehensive information about all API routes available in the Nexa backend application. The API provides authentication, user management, website crawling, and RAG (Retrieval-Augmented Generation) query capabilities.

## Base URL
- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format
All API responses follow a consistent format:
- **Success**: Returns requested data or success message
- **Error**: Returns error object with `error` and `message` fields

---

## Authentication Routes (`/auth`)

### POST `/auth/register`
Register a new user account.

**Authentication**: None required

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response** (201):
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "provider": "local",
    "isActive": true,
    "isEmailVerified": false,
    "preferences": {...},
    "stats": {...}
  },
  "token": "jwt_token_here"
}
```

**Error Responses**:
- `400`: Missing required fields or validation error
- `409`: User already exists
- `500`: Internal server error

---

### POST `/auth/login`
Authenticate user and receive JWT token.

**Authentication**: None required

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response** (200):
```json
{
  "message": "Login successful",
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "provider": "local",
    "stats": {
      "lastLogin": "2025-09-11T10:30:00.000Z"
    }
  },
  "token": "jwt_token_here"
}
```

**Error Responses**:
- `400`: Missing credentials
- `401`: Invalid credentials or account deactivated
- `500`: Internal server error

---

### GET `/auth/me`
Get current authenticated user profile.

**Authentication**: Required (JWT token)

**Response** (200):
```json
{
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "provider": "local",
    "preferences": {...},
    "stats": {...}
  }
}
```

**Error Responses**:
- `401`: Authentication required
- `500`: Internal server error

---

### PUT `/auth/profile`
Update user profile information.

**Authentication**: Required (JWT token)

**Request Body** (any combination of allowed fields):
```json
{
  "name": "New Name",
  "avatar": "https://example.com/avatar.jpg",
  "preferences": {
    "theme": "dark",
    "maxWebsites": 10
  }
}
```

**Response** (200):
```json
{
  "message": "Profile updated successfully",
  "user": {
    "_id": "user_id",
    "name": "New Name",
    "avatar": "https://example.com/avatar.jpg",
    "preferences": {...}
  }
}
```

**Error Responses**:
- `400`: Invalid updates or validation error
- `401`: Authentication required
- `500`: Internal server error

---

### GET `/auth/google`
Initiate Google OAuth authentication.

**Authentication**: None required

**Usage**: Redirect user to this URL to start Google OAuth flow

**Response**: Redirects to Google OAuth consent screen

**Error Responses**:
- `501`: Google OAuth not configured

---

### GET `/auth/google/callback`
Google OAuth callback endpoint.

**Authentication**: None required (handled by OAuth flow)

**Usage**: This endpoint is called by Google after user consent

**Response**: Redirects to frontend with JWT token or error

---

### PUT `/auth/change-password`
Change user password (local accounts only).

**Authentication**: Required (JWT token)

**Request Body**:
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Response** (200):
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses**:
- `400`: Missing passwords or not allowed for OAuth users
- `401`: Current password incorrect
- `500`: Internal server error

---

## User Routes (`/user`)

### GET `/user/websites`
Get user's crawled websites with pagination and filtering.

**Authentication**: Required (JWT token)

**Query Parameters**:
- `status` (optional): Filter by status (`pending`, `crawling`, `completed`, `failed`)
- `limit` (optional): Number of results per page (default: 10)
- `page` (optional): Page number (default: 1)

**Response** (200):
```json
{
  "websites": [
    {
      "_id": "website_id",
      "url": "https://example.com",
      "title": "Example Website",
      "domain": "example.com",
      "status": "completed",
      "crawledAt": "2025-09-11T10:30:00.000Z",
      "completedAt": "2025-09-11T10:35:00.000Z",
      "pagesCrawled": 25,
      "chunksProcessed": 150,
      "jobId": "job_id_here",
      "errorMessage": null
    }
  ],
  "pagination": {
    "current": 1,
    "total": 5,
    "count": 50,
    "perPage": 10
  },
  "stats": {
    "total": 50,
    "pending": 2,
    "crawling": 3,
    "completed": 40,
    "failed": 5
  }
}
```

**Error Responses**:
- `401`: Authentication required
- `500`: Internal server error

---

### GET `/user/websites/:websiteId`
Get detailed information about a specific website.

**Authentication**: Required (JWT token)

**URL Parameters**:
- `websiteId`: The website ID

**Response** (200):
```json
{
  "website": {
    "_id": "website_id",
    "url": "https://example.com",
    "title": "Example Website",
    "domain": "example.com",
    "status": "completed",
    "crawledAt": "2025-09-11T10:30:00.000Z",
    "completedAt": "2025-09-11T10:35:00.000Z",
    "pagesCrawled": 25,
    "chunksProcessed": 150,
    "jobId": "job_id_here",
    "crawlStats": {...},
    "metadata": {...},
    "owner": {
      "name": "John Doe",
      "email": "user@example.com"
    }
  }
}
```

**Error Responses**:
- `401`: Authentication required
- `404`: Website not found
- `500`: Internal server error

---

### POST `/user/websites`
Add a new website to crawl (legacy endpoint - use `/ingest` instead).

**Authentication**: Required (JWT token)

**Request Body**:
```json
{
  "url": "https://example.com",
  "title": "Example Website",
  "description": "Optional description"
}
```

**Response** (201):
```json
{
  "message": "Website added successfully",
  "website": {
    "url": "https://example.com",
    "title": "Example Website",
    "status": "pending",
    "crawledAt": "2025-09-11T10:30:00.000Z"
  }
}
```

**Error Responses**:
- `400`: Missing URL or limit reached
- `401`: Authentication required
- `409`: Website already exists
- `500`: Internal server error

---

### PUT `/user/websites/:websiteId`
Update website details.

**Authentication**: Required (JWT token)

**URL Parameters**:
- `websiteId`: The website ID

**Request Body** (any combination of allowed fields):
```json
{
  "title": "New Title",
  "description": "New description",
  "status": "completed",
  "pagesCrawled": 30,
  "errorMessage": null
}
```

**Response** (200):
```json
{
  "message": "Website updated successfully",
  "website": {
    "title": "New Title",
    "description": "New description",
    "status": "completed"
  }
}
```

**Error Responses**:
- `400`: Invalid updates
- `401`: Authentication required
- `404`: Website not found
- `500`: Internal server error

---

### DELETE `/user/websites/:websiteId`
Delete a website from user's list.

**Authentication**: Required (JWT token)

**URL Parameters**:
- `websiteId`: The website ID

**Response** (200):
```json
{
  "message": "Website deleted successfully"
}
```

**Error Responses**:
- `401`: Authentication required
- `404`: Website not found
- `500`: Internal server error

---

### GET `/user/stats`
Get user statistics and account information.

**Authentication**: Required (JWT token)

**Response** (200):
```json
{
  "stats": {
    "totalQueries": 150,
    "totalWebsites": 10,
    "lastLogin": "2025-09-11T10:30:00.000Z",
    "websites": {
      "total": 10,
      "active": 8,
      "pending": 1,
      "crawling": 2,
      "completed": 7,
      "failed": 0
    },
    "account": {
      "createdAt": "2025-08-01T00:00:00.000Z",
      "isEmailVerified": true,
      "provider": "local"
    }
  }
}
```

**Error Responses**:
- `401`: Authentication required
- `500`: Internal server error

---

## Website Ingestion and Query Routes

### POST `/ingest`
Enqueue a website for crawling and indexing.

**Authentication**: Required (JWT token)

**Request Body**:
```json
{
  "websiteUrl": "https://example.com"
}
```

**Response** (200):
```json
{
  "message": "ingest enqueued",
  "jobId": "job_id_here"
}
```

**Error Responses**:
- `400`: Invalid URL, missing URL, or website limit reached
- `401`: Authentication required
- `409`: Website already exists
- `500`: Internal server error

---

### POST `/query`
Query the RAG system for answers based on crawled content.

**Authentication**: Required (JWT token)

**Request Body**:
```json
{
  "question": "What is the main topic of the website?",
  "website": "example.com",
  "topK": 5
}
```

**Response** (200):
```json
{
  "answer": "The main topic of the website is...",
  "sources": [
    {
      "url": "https://example.com/page1",
      "title": "Page Title",
      "content": "Relevant content snippet..."
    }
  ],
  "websites": ["example.com"],
  "websiteFilter": "example.com",
  "context_used": 3,
  "hits": [...]
}
```

**Error Responses**:
- `400`: Missing question or query failed
- `401`: Authentication required
- `500`: Internal server error

---

## Job Management Routes

### GET `/job-status/:jobId`
Get the status of a background job.

**Authentication**: None required

**URL Parameters**:
- `jobId`: The job ID

**Response** (200):
```json
{
  "jobId": "job_id_here",
  "status": "completed",
  "progress": 100,
  "result": {...},
  "error": null
}
```

**Error Responses**:
- `500`: Failed to get job status

---

### POST `/webhook/job-status`
Webhook endpoint for job status updates (internal use).

**Authentication**: None required (webhook)

**Request Body**:
```json
{
  "jobId": "job_id_here",
  "status": "completed",
  "websiteUrl": "https://example.com",
  "pagesCrawled": 25,
  "errorMessage": null,
  "vectorIds": ["vector1", "vector2"]
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Webhook processed"
}
```

---

### GET `/queue-stats`
Get background job queue statistics.

**Authentication**: None required

**Response** (200):
```json
{
  "success": true,
  "stats": {
    "active": 2,
    "waiting": 5,
    "completed": 100,
    "failed": 3
  }
}
```

---

### DELETE `/queue/clear`
Clear all jobs from the queue.

**Authentication**: None required

**Response** (200):
```json
{
  "success": true,
  "message": "All jobs cleared",
  "clearedCount": 15
}
```

---

### DELETE `/queue/clear/:type`
Clear specific job types from the queue.

**Authentication**: None required

**URL Parameters**:
- `type`: The job type to clear

**Query Parameters**:
- `olderThan` (optional): Clear jobs older than X milliseconds

**Response** (200):
```json
{
  "success": true,
  "message": "Jobs cleared",
  "clearedCount": 5
}
```

---

## Website Management Routes

### GET `/websites`
List all websites for the authenticated user.

**Authentication**: Required (JWT token)

**Response** (200):
```json
{
  "userEmail": "user@example.com",
  "websites": [
    {
      "_id": "website_id",
      "url": "https://example.com",
      "title": "Example Website",
      "domain": "example.com",
      "status": "completed",
      "crawledAt": "2025-09-11T10:30:00.000Z",
      "completedAt": "2025-09-11T10:35:00.000Z",
      "pagesCrawled": 25,
      "chunksProcessed": 150,
      "jobId": "job_id_here",
      "errorMessage": null
    }
  ],
  "totalWebsites": 10,
  "stats": {
    "pending": 1,
    "crawling": 2,
    "completed": 7,
    "failed": 0
  }
}
```

**Error Responses**:
- `401`: Authentication required
- `500`: Internal server error

---

### GET `/websites/:websiteId`
Get detailed information about a specific website.

**Authentication**: Required (JWT token)

**URL Parameters**:
- `websiteId`: The website ID

**Response** (200):
```json
{
  "website": {
    "_id": "website_id",
    "url": "https://example.com",
    "title": "Example Website",
    "domain": "example.com",
    "status": "completed",
    "crawledAt": "2025-09-11T10:30:00.000Z",
    "completedAt": "2025-09-11T10:35:00.000Z",
    "pagesCrawled": 25,
    "chunksProcessed": 150,
    "jobId": "job_id_here",
    "crawlStats": {...},
    "metadata": {...},
    "owner": {
      "name": "John Doe",
      "email": "user@example.com"
    }
  }
}
```

**Error Responses**:
- `401`: Authentication required
- `404`: Website not found
- `500`: Internal server error

---

### DELETE `/websites/:websiteId`
Delete a website and its associated data.

**Authentication**: Required (JWT token)

**URL Parameters**:
- `websiteId`: The website ID

**Response** (200):
```json
{
  "message": "Website deleted successfully",
  "deletedWebsite": {
    "_id": "website_id",
    "url": "https://example.com",
    "domain": "example.com"
  }
}
```

**Error Responses**:
- `401`: Authentication required
- `404`: Website not found
- `500`: Internal server error

---

## Utility Routes

### GET `/health`
Health check endpoint to verify API status.

**Authentication**: None required

**Response** (200):
```json
{
  "status": "ok"
}
```

---

## Error Codes

### HTTP Status Codes
- **200**: Success
- **201**: Created successfully
- **400**: Bad request (invalid input, validation errors)
- **401**: Unauthorized (authentication required or failed)
- **403**: Forbidden (access denied)
- **404**: Not found
- **409**: Conflict (resource already exists)
- **500**: Internal server error
- **501**: Not implemented (feature not configured)

### Common Error Response Format
```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

---

## Authentication Requirements Summary

### Public Endpoints (No Authentication Required)
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/google`
- `GET /auth/google/callback`
- `GET /job-status/:jobId`
- `POST /webhook/job-status`
- `GET /queue-stats`
- `DELETE /queue/clear`
- `DELETE /queue/clear/:type`
- `GET /health`

### Protected Endpoints (JWT Token Required)
- `GET /auth/me`
- `PUT /auth/profile`
- `PUT /auth/change-password`
- All `/user/*` routes
- `POST /ingest`
- `POST /query`
- `GET /websites`
- `GET /websites/:websiteId`
- `DELETE /websites/:websiteId`

---

## Rate Limiting
The API implements rate limiting to prevent abuse. Contact support if you encounter rate limit errors.

## CORS Policy
Cross-Origin Resource Sharing (CORS) is configured to allow requests from:
- **Development**: `http://localhost:3000`, `http://localhost:3001`
- **Production**: Your configured domain

## Security Headers
The API uses Helmet.js for security headers and follows security best practices for authentication and data protection.
