import { apiRequest, API_ENDPOINTS } from '../config/api.js';

// Authentication service functions
export const authService = {
  // User registration
  register: async (userData) => {
    const { firstName, lastName, email, password } = userData;
    
    // Combine first and last name as required by the API
    const name = `${firstName} ${lastName}`.trim();
    
    const response = await apiRequest(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        name
      })
    });

    // Store JWT token and user data
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  },

  // User login
  login: async (credentials) => {
    const response = await apiRequest(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    // Store JWT token and user data
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  },

  // Get current user profile
  getCurrentUser: async () => {
    return await apiRequest(API_ENDPOINTS.AUTH.ME, {
      method: 'GET',
      requireAuth: true
    });
  },

  // Update user profile
  updateProfile: async (updateData) => {
    return await apiRequest(API_ENDPOINTS.AUTH.PROFILE, {
      method: 'PUT',
      requireAuth: true,
      body: JSON.stringify(updateData)
    });
  },

  // Change password
  changePassword: async (passwordData) => {
    return await apiRequest(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      method: 'PUT',
      requireAuth: true,
      body: JSON.stringify(passwordData)
    });
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Get stored user data
  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get stored token
  getStoredToken: () => {
    return localStorage.getItem('token');
  }
};

export default authService;
