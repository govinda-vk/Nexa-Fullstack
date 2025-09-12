// API Configuration
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-domain.com' 
  : 'http://localhost:3000';

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
    GOOGLE: '/auth/google',
    GOOGLE_CALLBACK: '/auth/google/callback'
  },
  USER: {
    WEBSITES: '/user/websites',
    WEBSITE_DETAILS: (id) => `/user/websites/${id}`,
    ADD_WEBSITE: '/user/websites',
    UPDATE_WEBSITE: (id) => `/user/websites/${id}`,
    DELETE_WEBSITE: (id) => `/user/websites/${id}`,
    STATS: '/user/stats'
  },
  CRAWLING: {
    START_CRAWL: '/ingest',
    JOB_STATUS: (jobId) => `/job-status/${jobId}`,
    WEBHOOK_STATUS: '/webhook/job-status',
    QUEUE_STATS: '/queue-stats',
    CLEAR_QUEUE: '/queue/clear'
  },
  QUERY: {
    KNOWLEDGE_BASE: '/query'
  },
  WIDGET: {
    GET_CONFIG: (websiteId) => `/widget/website/${websiteId}`,
    UPDATE_CONFIG: (websiteId) => `/widget/website/${websiteId}`,
    CREATE_WIDGET: (websiteId) => `/widget/website/${websiteId}/create`,
    REGENERATE_KEY: (websiteId) => `/widget/website/${websiteId}/regenerate-key`,
    STATS: (websiteId) => `/widget/website/${websiteId}/stats`,
    TEST: (websiteId) => `/widget/website/${websiteId}/test`
  },
  WIDGET_API: {
    CHAT: '/widget-api/chat',
    CONFIG: '/widget-api/config',
    STATS: '/widget-api/stats',
    FEEDBACK: '/widget-api/feedback',
    HEALTH: '/widget-api/health'
  },
  SERVER: {
    WEBSITES: '/websites',
    WEBSITE_DETAILS: (id) => `/websites/${id}`,
    DELETE_WEBSITE: (id) => `/websites/${id}`,
    HEALTH: '/health',
    WIDGET_DEMO: '/widget-demo',
    WIDGET_TEST: '/widget-test',
    WIDGET_SCRIPT: (widgetId) => `/widget/${widgetId}/script.js`
  }
};

// Default headers for API requests
export const getHeaders = (includeAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// API request wrapper with error handling and retry logic
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const maxRetries = options.retries || 0;
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...getHeaders(options.requireAuth),
          ...options.headers,
        },
      });

      // Handle different response types
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (!response.ok) {
        // Handle specific HTTP errors
        const error = new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.response = data;
        
        // Handle authentication errors
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        
        throw error;
      }

      return data;
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (error.status >= 400 && error.status < 500 && error.status !== 429) {
        break;
      }
      
      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

export default API_BASE_URL;
