import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../utils/auth.js';

// Create authentication context
const AuthContext = createContext({});

// Custom hook to use authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Authentication provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if user is authenticated
        const authenticated = authService.isAuthenticated();
        setIsAuthenticated(authenticated);

        if (authenticated) {
          // Get stored user data
          const storedUser = authService.getStoredUser();
          setUser(storedUser);

          // Optionally fetch fresh user data
          try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser.user);
          } catch (err) {
            // If API fails, use stored data
            console.warn('Failed to fetch current user:', err);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update user data
  const updateUser = (userData) => {
    setUser({ ...user, ...userData });
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    refreshUser: async () => {
      if (isAuthenticated) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser.user);
          return currentUser.user;
        } catch (error) {
          console.error('Failed to refresh user:', error);
          throw error;
        }
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
