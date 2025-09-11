# Authentication API Documentation

## Overview
The Authentication API provides secure user registration, login, and session management for the ASKit platform. It supports both email/password authentication and Google OAuth integration.

## Base URL
```
http://localhost:3000/auth
```

## Authentication Methods
- **Local Authentication**: Email and password
- **Google OAuth 2.0**: Social login integration
- **JWT Tokens**: Stateless session management

---

## Public Endpoints

### 1. User Registration
Register a new user with email and password.

**Endpoint**: `POST /auth/register`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Validation Rules**:
- `name`: Required, max 50 characters
- `email`: Required, valid email format, unique
- `password`: Required, minimum 6 characters

**Success Response** (201):
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "email": "john@example.com",
    "provider": "local",
    "isActive": true,
    "isEmailVerified": false,
    "crawledWebsites": [],
    "preferences": {
      "maxWebsites": 10,
      "theme": "auto",
      "notifications": {
        "email": true,
        "browser": true
      }
    },
    "stats": {
      "totalWebsitesCrawled": 0,
      "totalQueries": 0,
      "lastLogin": "2025-09-11T10:30:00.000Z"
    },
    "createdAt": "2025-09-11T10:30:00.000Z",
    "updatedAt": "2025-09-11T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**:
```json
// 400 - Missing fields
{
  "error": "Missing required fields",
  "message": "Email, password, and name are required"
}

// 409 - User exists
{
  "error": "User already exists",
  "message": "A user with this email already exists"
}

// 400 - Validation error
{
  "error": "Validation error",
  "message": "Password must be at least 6 characters"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

---

### 2. User Login
Authenticate user with email and password.

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response** (200):
```json
{
  "message": "Login successful",
  "user": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "email": "john@example.com",
    "provider": "local",
    "isActive": true,
    "isEmailVerified": false,
    "crawledWebsites": [],
    "preferences": {
      "maxWebsites": 10,
      "theme": "auto",
      "notifications": {
        "email": true,
        "browser": true
      }
    },
    "stats": {
      "totalWebsitesCrawled": 0,
      "totalQueries": 0,
      "lastLogin": "2025-09-11T10:35:00.000Z"
    },
    "createdAt": "2025-09-11T10:30:00.000Z",
    "updatedAt": "2025-09-11T10:35:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**:
```json
// 400 - Missing fields
{
  "error": "Missing required fields",
  "message": "Email and password are required"
}

// 401 - Invalid credentials
{
  "error": "Invalid credentials",
  "message": "Email or password is incorrect"
}

// 401 - Account inactive
{
  "error": "Account deactivated",
  "message": "Your account has been deactivated"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

---

### 3. Google OAuth Authentication

#### Initiate Google OAuth
**Endpoint**: `GET /auth/google`

Redirects user to Google OAuth consent screen.

**Response**: Redirects to Google OAuth consent page

**Error Response** (501):
```json
{
  "error": "Google OAuth not configured",
  "message": "Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file"
}
```

#### Google OAuth Callback
**Endpoint**: `GET /auth/google/callback`

Handles Google OAuth callback and creates/logs in user.

**Success**: Redirects to frontend with JWT token
- Production: `https://yourapp.com/auth/success?token=<jwt_token>`
- Development: `http://localhost:3001/auth/success?token=<jwt_token>`

**Error**: Redirects to error page
- Production: `https://yourapp.com/auth/error`
- Development: `http://localhost:3001/auth/error`

---

## Protected Endpoints
All protected endpoints require the `Authorization` header with a valid JWT token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Get Current User Profile
Retrieve the authenticated user's profile information.

**Endpoint**: `GET /auth/me`

**Headers**: `Authorization: Bearer <token>`

**Success Response** (200):
```json
{
  "user": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "email": "john@example.com",
    "provider": "local",
    "isActive": true,
    "isEmailVerified": false,
    "crawledWebsites": [
      {
        "_id": "64f5a1b2c3d4e5f6a7b8c9d1",
        "url": "https://example.com",
        "title": "Example Website",
        "status": "completed",
        "pagesCrawled": 25,
        "createdAt": "2025-09-11T09:00:00.000Z"
      }
    ],
    "preferences": {
      "maxWebsites": 10,
      "theme": "dark",
      "notifications": {
        "email": true,
        "browser": false
      }
    },
    "stats": {
      "totalWebsitesCrawled": 1,
      "totalQueries": 45,
      "lastLogin": "2025-09-11T10:35:00.000Z"
    }
  }
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 5. Update User Profile
Update the authenticated user's profile information.

**Endpoint**: `PUT /auth/profile`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "name": "John Smith",
  "avatar": "https://example.com/avatar.jpg",
  "preferences": {
    "theme": "dark",
    "maxWebsites": 15,
    "notifications": {
      "email": false,
      "browser": true
    }
  }
}
```

**Allowed Updates**: `name`, `avatar`, `preferences`

**Success Response** (200):
```json
{
  "message": "Profile updated successfully",
  "user": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "name": "John Smith",
    "email": "john@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "preferences": {
      "theme": "dark",
      "maxWebsites": 15,
      "notifications": {
        "email": false,
        "browser": true
      }
    }
  }
}
```

**Error Responses**:
```json
// 400 - Invalid updates
{
  "error": "Invalid updates",
  "message": "Allowed updates: name, avatar, preferences"
}
```

**cURL Example**:
```bash
curl -X PUT http://localhost:3000/auth/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "preferences": {
      "theme": "dark"
    }
  }'
```

---

### 6. Change Password
Change the authenticated user's password.

**Endpoint**: `PUT /auth/change-password`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Success Response** (200):
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses**:
```json
// 400 - Missing passwords
{
  "error": "Missing passwords",
  "message": "Current password and new password are required"
}

// 400 - Google OAuth user
{
  "error": "Password change not allowed",
  "message": "Users who signed up with Google cannot change password"
}

// 400 - Invalid current password
{
  "error": "Invalid current password",
  "message": "Current password is incorrect"
}

// 400 - Weak new password
{
  "error": "Weak password",
  "message": "New password must be at least 6 characters long"
}
```

**cURL Example**:
```bash
curl -X PUT http://localhost:3000/auth/change-password \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldpassword123",
    "newPassword": "newpassword456"
  }'
```

---

## Error Handling

### Authentication Errors
```json
// 401 - No token provided
{
  "error": "Access token required",
  "message": "Please provide a valid authentication token"
}

// 401 - Invalid token
{
  "error": "Invalid token",
  "message": "Please provide a valid authentication token"
}

// 401 - Token expired
{
  "error": "Token expired",
  "message": "Please log in again"
}

// 401 - User not found
{
  "error": "User not found",
  "message": "Invalid authentication token"
}

// 401 - Account deactivated
{
  "error": "Account deactivated",
  "message": "Your account has been deactivated"
}
```

### Validation Errors
```json
// MongoDB validation error
{
  "error": "Validation error",
  "message": "Email must be valid, Password must be at least 6 characters"
}

// Duplicate key error
{
  "error": "Email already exists",
  "message": "A user with this email already exists"
}
```

### Server Errors
```json
// 500 - Internal server error
{
  "error": "Registration failed",
  "message": "Internal server error during registration"
}
```

---

## Security Features

### JWT Token Security
- **Algorithm**: HS256
- **Expiration**: 7 days (configurable)
- **Secret**: Environment variable `JWT_SECRET`
- **Payload**: Only user ID, no sensitive data

### Password Security
- **Hashing**: bcrypt with salt rounds
- **Minimum Length**: 6 characters
- **Validation**: Server-side validation

### OAuth Security
- **Provider**: Google OAuth 2.0
- **Scopes**: Profile and email only
- **State Parameter**: CSRF protection
- **Secure Cookies**: httpOnly, secure flags

### Rate Limiting
- **Login Attempts**: 5 attempts per 15 minutes per IP
- **Registration**: 3 attempts per hour per IP
- **Password Changes**: 3 attempts per hour per user

---

## Environment Configuration

Required environment variables for authentication:

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Session Configuration
SESSION_SECRET=your-session-secret-key

# Database
MONGODB_URI=mongodb://localhost:27017/askit

# Environment
NODE_ENV=development
```

---

## Testing Examples

### Frontend Integration
```javascript
// Login example
const loginUser = async (email, password) => {
  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (response.ok) {
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      return data.user;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Authenticated request example
const getProfile = async () => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch('/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      return data.user;
    } else {
      // Token might be expired
      if (response.status === 401) {
        localStorage.removeItem('token');
        // Redirect to login
      }
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Profile error:', error);
    throw error;
  }
};
```

### Testing with cURL
```bash
# Complete authentication flow
# 1. Register
TOKEN=$(curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }' | jq -r '.token')

# 2. Get profile
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer $TOKEN"

# 3. Update profile
curl -X PUT http://localhost:3000/auth/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'

# 4. Change password
curl -X PUT http://localhost:3000/auth/change-password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword456"
  }'
```

---

## Common Use Cases

### 1. User Registration Flow
1. User submits registration form
2. Validate input on frontend
3. Send POST request to `/auth/register`
4. Handle success: store token, redirect to dashboard
5. Handle errors: display validation messages

### 2. User Login Flow
1. User submits login form
2. Send POST request to `/auth/login`
3. Handle success: store token, update UI state
4. Handle errors: display error message
5. Redirect to intended page or dashboard

### 3. Google OAuth Flow
1. User clicks "Login with Google"
2. Redirect to `/auth/google`
3. User authorizes on Google
4. Google redirects to `/auth/google/callback`
5. Backend processes OAuth response
6. Redirect to frontend with JWT token
7. Frontend extracts token and stores it

### 4. Protected Route Access
1. Check if token exists in localStorage
2. Include token in Authorization header
3. Send request to protected endpoint
4. Handle 401 responses (redirect to login)
5. Handle successful responses

### 5. Token Refresh Strategy
Since tokens have a 7-day expiration:
1. Check token expiration before requests
2. Implement automatic token refresh
3. Handle expired tokens gracefully
4. Force re-authentication when needed

---

## Troubleshooting

### Common Issues

**1. Token Expired Error**
```json
{
  "error": "Token expired",
  "message": "Please log in again"
}
```
**Solution**: Re-authenticate user, clear stored token

**2. Google OAuth Not Configured**
```json
{
  "error": "Google OAuth not configured",
  "message": "Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET"
}
```
**Solution**: Set up Google OAuth credentials in `.env`

**3. CORS Issues with Google OAuth**
**Solution**: Ensure frontend and backend domains are properly configured

**4. Session Issues**
**Solution**: Check `SESSION_SECRET` environment variable

**5. Database Connection Issues**
**Solution**: Verify `MONGODB_URI` and database connectivity

### Debug Mode
Enable debug logging:
```bash
DEBUG=auth:* npm run dev
```

---

**Last Updated**: September 2025  
**API Version**: 1.0.0
