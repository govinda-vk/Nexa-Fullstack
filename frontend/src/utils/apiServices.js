import { apiRequest, API_ENDPOINTS } from '../config/api.js';

// User and Website Management Services
export const userService = {
  // Get user's websites with optional filtering
  getWebsites: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.page) queryParams.append('page', params.page);
    
    try {
      // First try the user-specific endpoint
      const endpoint = `${API_ENDPOINTS.USER.WEBSITES}${queryParams.toString() ? `?${queryParams}` : ''}`;
      return await apiRequest(endpoint, { requireAuth: true });
    } catch (error) {
      console.warn('User websites endpoint failed, trying server endpoint:', error.message);
      // Fallback to server endpoint
      const serverEndpoint = `${API_ENDPOINTS.SERVER.WEBSITES}${queryParams.toString() ? `?${queryParams}` : ''}`;
      return await apiRequest(serverEndpoint, { requireAuth: true });
    }
  },

  // Get specific website details
  getWebsiteDetails: async (websiteId) => {
    try {
      // First try the user-specific endpoint
      return await apiRequest(API_ENDPOINTS.USER.WEBSITE_DETAILS(websiteId), { requireAuth: true });
    } catch (error) {
      console.warn('User endpoint failed, trying server endpoint:', error.message);
      // Fallback to server endpoint if user endpoint fails
      return await apiRequest(API_ENDPOINTS.SERVER.WEBSITE_DETAILS(websiteId), { requireAuth: true });
    }
  },

  // Add new website to crawl
  addWebsite: async (websiteData) => {
    return apiRequest(API_ENDPOINTS.USER.ADD_WEBSITE, {
      method: 'POST',
      body: JSON.stringify(websiteData),
      requireAuth: true
    });
  },

  // Update website information
  updateWebsite: async (websiteId, updateData) => {
    return apiRequest(API_ENDPOINTS.USER.UPDATE_WEBSITE(websiteId), {
      method: 'PUT',
      body: JSON.stringify(updateData),
      requireAuth: true
    });
  },

  // Delete website
  deleteWebsite: async (websiteId) => {
    return apiRequest(API_ENDPOINTS.USER.DELETE_WEBSITE(websiteId), {
      method: 'DELETE',
      requireAuth: true
    });
  },

  // Get user statistics
  getUserStats: async () => {
    return apiRequest(API_ENDPOINTS.USER.STATS, { requireAuth: true });
  }
};

// Website Crawling and Ingestion Services
export const crawlingService = {
  // Start website crawl
  startCrawl: async (crawlOptions) => {
    return apiRequest(API_ENDPOINTS.CRAWLING.START_CRAWL, {
      method: 'POST',
      body: JSON.stringify(crawlOptions),
      requireAuth: true
    });
  },

  // Get crawl job status
  getJobStatus: async (jobId) => {
    return apiRequest(API_ENDPOINTS.CRAWLING.JOB_STATUS(jobId), { requireAuth: true });
  },

  // Get queue statistics
  getQueueStats: async () => {
    return apiRequest(API_ENDPOINTS.CRAWLING.QUEUE_STATS, { requireAuth: true });
  },

  // Clear crawling queue
  clearQueue: async () => {
    return apiRequest(API_ENDPOINTS.CRAWLING.CLEAR_QUEUE, {
      method: 'DELETE',
      requireAuth: true
    });
  }
};

// RAG Query Services
export const queryService = {
  // Query knowledge base
  queryKnowledgeBase: async (queryData) => {
    return apiRequest(API_ENDPOINTS.QUERY.KNOWLEDGE_BASE, {
      method: 'POST',
      body: JSON.stringify(queryData),
      requireAuth: true
    });
  }
};

// Widget Management Services
export const widgetService = {
  // Get widget configuration
  getWidgetConfig: async (websiteId) => {
    return apiRequest(API_ENDPOINTS.WIDGET.GET_CONFIG(websiteId), { requireAuth: true });
  },

  // Update widget configuration
  updateWidgetConfig: async (websiteId, configData) => {
    return apiRequest(API_ENDPOINTS.WIDGET.UPDATE_CONFIG(websiteId), {
      method: 'PUT',
      body: JSON.stringify(configData),
      requireAuth: true
    });
  },

  // Create widget for website
  createWidget: async (websiteId) => {
    return apiRequest(API_ENDPOINTS.WIDGET.CREATE_WIDGET(websiteId), {
      method: 'POST',
      body: JSON.stringify({}),
      requireAuth: true
    });
  },

  // Regenerate widget API key
  regenerateApiKey: async (websiteId) => {
    return apiRequest(API_ENDPOINTS.WIDGET.REGENERATE_KEY(websiteId), {
      method: 'POST',
      requireAuth: true
    });
  },

  // Get widget statistics
  getWidgetStats: async (websiteId) => {
    return apiRequest(API_ENDPOINTS.WIDGET.STATS(websiteId), { requireAuth: true });
  },

  // Test widget functionality
  testWidget: async (websiteId, testData) => {
    return apiRequest(API_ENDPOINTS.WIDGET.TEST(websiteId), {
      method: 'POST',
      body: JSON.stringify(testData),
      requireAuth: true
    });
  }
};

// Widget Public API Services (for embedded widgets)
export const widgetApiService = {
  // Send chat message to widget
  sendChatMessage: async (messageData, apiKey) => {
    return apiRequest(API_ENDPOINTS.WIDGET_API.CHAT, {
      method: 'POST',
      body: JSON.stringify(messageData),
      headers: {
        'X-Widget-API-Key': apiKey
      }
    });
  },

  // Get widget configuration for embedding
  getWidgetPublicConfig: async (apiKey) => {
    return apiRequest(API_ENDPOINTS.WIDGET_API.CONFIG, {
      headers: {
        'X-Widget-API-Key': apiKey
      }
    });
  },

  // Send widget statistics
  sendWidgetStats: async (statsData, apiKey) => {
    return apiRequest(API_ENDPOINTS.WIDGET_API.STATS, {
      method: 'POST',
      body: JSON.stringify(statsData),
      headers: {
        'X-Widget-API-Key': apiKey
      }
    });
  },

  // Submit widget feedback
  submitFeedback: async (feedbackData, apiKey) => {
    return apiRequest(API_ENDPOINTS.WIDGET_API.FEEDBACK, {
      method: 'POST',
      body: JSON.stringify(feedbackData),
      headers: {
        'X-Widget-API-Key': apiKey
      }
    });
  },

  // Check widget health
  checkHealth: async (apiKey) => {
    return apiRequest(API_ENDPOINTS.WIDGET_API.HEALTH, {
      headers: {
        'X-Widget-API-Key': apiKey
      }
    });
  }
};

// Server Direct Access Services
export const serverService = {
  // Get all websites (server endpoint)
  getAllWebsites: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.page) queryParams.append('page', params.page);
    
    const endpoint = `${API_ENDPOINTS.SERVER.WEBSITES}${queryParams.toString() ? `?${queryParams}` : ''}`;
    return apiRequest(endpoint, { requireAuth: true });
  },

  // Get website details (server endpoint)
  getWebsiteDetails: async (websiteId) => {
    return apiRequest(API_ENDPOINTS.SERVER.WEBSITE_DETAILS(websiteId), { requireAuth: true });
  },

  // Delete website (server endpoint)
  deleteWebsite: async (websiteId) => {
    return apiRequest(API_ENDPOINTS.SERVER.DELETE_WEBSITE(websiteId), {
      method: 'DELETE',
      requireAuth: true
    });
  },

  // Health check
  healthCheck: async () => {
    return apiRequest(API_ENDPOINTS.SERVER.HEALTH);
  }
};

// Utility functions for common operations
export const dashboardService = {
  // Get complete dashboard data
  getDashboardData: async () => {
    try {
      // Try to get user stats first to check if API is working
      let stats = {};
      let queueStats = {};
      let websites = { websites: [], totalWebsites: 0 };

      try {
        stats = await userService.getUserStats();
      } catch (err) {
        console.warn('Failed to load user stats:', err.message);
      }

      try {
        queueStats = await crawlingService.getQueueStats();
      } catch (err) {
        console.warn('Failed to load queue stats:', err.message);
        queueStats = { active: 0, waiting: 0, completed: 0 };
      }

      try {
        websites = await userService.getWebsites({ limit: 10 });
      } catch (err) {
        console.warn('Failed to load websites:', err.message);
        websites = { websites: [], totalWebsites: 0 };
      }

      return {
        websites: websites.websites || [],
        totalWebsites: websites.totalWebsites || 0,
        stats: stats || {},
        queueStats: queueStats || {}
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Return safe default data structure
      return {
        websites: [],
        totalWebsites: 0,
        stats: {},
        queueStats: { active: 0, waiting: 0, completed: 0 }
      };
    }
  },

  // Get website with widget configuration
  getWebsiteWithWidget: async (websiteId) => {
    try {
      const [websiteDetails, widgetConfig] = await Promise.all([
        userService.getWebsiteDetails(websiteId),
        widgetService.getWidgetConfig(websiteId).catch(() => null)
      ]);

      return {
        website: websiteDetails,
        widget: widgetConfig
      };
    } catch (error) {
      console.error('Error fetching website with widget:', error);
      throw error;
    }
  }
};

export default {
  userService,
  crawlingService,
  queryService,
  widgetService,
  widgetApiService,
  serverService,
  dashboardService
};
