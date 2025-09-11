# Frontend Authentication Integration

This document outlines the authentication system integration with the backend API.

## Overview

The frontend now includes a complete authentication system that integrates with the backend API routes for user registration, login, and session management.

## Files Added/Modified

### New Files:
1. **`src/config/api.js`** - API configuration and request wrapper
2. **`src/utils/auth.js`** - Authentication service functions
3. **`src/contexts/AuthContext.jsx`** - React context for authentication state management
4. **`src/components/ProtectedRoute.jsx`** - Route protection components

### Modified Files:
1. **`src/components/Login.jsx`** - Updated to use real API calls
2. **`src/components/Signup.jsx`** - Updated to use real API calls
3. **`src/components/Dashboard.jsx`** - Updated to use authentication context
4. **`src/components/Navbar.jsx`** - Added authentication-aware UI
5. **`src/App.jsx`** - Added AuthProvider and route protection

## Authentication Flow

### Registration Flow:
1. User fills out signup form
2. Client-side validation (required fields, password match, terms agreement)
3. API call to `POST /auth/register` with user data
4. JWT token and user data stored in localStorage
5. User redirected to dashboard

### Login Flow:
1. User enters credentials
2. API call to `POST /auth/login`
3. JWT token and user data stored in localStorage
4. User redirected to dashboard (or intended destination)

### Logout Flow:
1. User clicks logout button
2. JWT token and user data removed from localStorage
3. Authentication context updated
4. User redirected to home page

## API Integration

### Backend API Base URL:
- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com` (update in `src/config/api.js`)

### Authentication Endpoints Used:
- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication
- `GET /auth/me` - Get current user profile (optional)

### Data Storage:
- **JWT Token**: Stored in `localStorage` with key `'token'`
- **User Data**: Stored in `localStorage` with key `'user'`

## Route Protection

### Protected Routes:
- `/dashboard` - Requires authentication

### Public Routes (redirect if authenticated):
- `/login` - Redirects to dashboard if already logged in
- `/signup` - Redirects to dashboard if already logged in

### Public Routes (always accessible):
- `/` - Home page

## Authentication Context

The `AuthContext` provides the following state and methods:
- `user` - Current user object
- `isAuthenticated` - Boolean authentication status
- `loading` - Loading state during initialization
- `login(credentials)` - Login function
- `register(userData)` - Registration function
- `logout()` - Logout function
- `refreshUser()` - Refresh user data from API

## Security Features

1. **JWT Token Management**: Tokens are stored in localStorage and automatically included in authenticated requests
2. **Route Protection**: Protected routes redirect unauthenticated users to login
3. **Auth Context**: Centralized authentication state management
4. **Auto-redirect**: Already authenticated users are redirected away from login/signup pages
5. **Form Validation**: Client-side validation for better UX
6. **Error Handling**: Comprehensive error handling with user-friendly messages

## Usage Examples

### Using Authentication in Components:
```jsx
import { useAuth } from '../contexts/AuthContext.jsx';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please login</div>;
  }
  
  return (
    <div>
      <p>Welcome, {user.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Making Authenticated API Calls:
```jsx
import { apiRequest, API_ENDPOINTS } from '../config/api.js';

// Make authenticated request
const data = await apiRequest('/some-endpoint', {
  method: 'GET',
  requireAuth: true
});
```

## Error Handling

The system handles various error scenarios:
- Network errors
- Invalid credentials
- Server errors
- Token expiration
- Missing authentication

## Next Steps

1. **Update API Base URL**: Change the production URL in `src/config/api.js`
2. **Add Token Refresh**: Implement automatic token refresh logic
3. **Add Remember Me**: Implement persistent login option
4. **Add Password Reset**: Integrate forgot password functionality
5. **Add Email Verification**: Handle email verification flow
6. **Add Social Login**: Integrate Google OAuth if needed

## Testing the Integration

1. Start your backend server on `http://localhost:3000`
2. Start the frontend development server
3. Try registering a new user
4. Try logging in with the created user
5. Navigate to dashboard and verify user data
6. Try logging out and verify redirect to home page
7. Try accessing protected routes without authentication
