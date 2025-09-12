import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import LogoAnimation from './LogoAnimation.jsx';
import { 
  GlobeAltIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  HomeIcon,
  UserCircleIcon,
  Bars3Icon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { dashboardService, userService, crawlingService, widgetService } from '../utils/apiServices.js';
import { API_BASE_URL } from '../config/api.js';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // State management
  const [dashboardData, setDashboardData] = useState({
    websites: [],
    totalWebsites: 0,
    stats: {},
    queueStats: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddWebsite, setShowAddWebsite] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Add website form state
  const [newWebsite, setNewWebsite] = useState({
    url: '',
    title: '',
    description: '',
    maxPages: 50,
    respectRobots: true,
    includeImages: false,
    excludePatterns: [],
    waitTime: 1000
  });

  // Simple Button Component
  const Button = ({ children, onClick, color = 'black', className = '', size = 'md', loading = false, disabled = false, ...props }) => {
    const baseClasses = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const colorClasses = {
      black: 'bg-black hover:bg-gray-800 text-white focus:ring-gray-500',
      gray: 'bg-gray-500 hover:bg-gray-600 text-white focus:ring-gray-500',
      red: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
      green: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
      blue: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
    };

    const sizeClasses = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };

    return (
      <button
        className={`${baseClasses} ${colorClasses[color]} ${sizeClasses[size]} ${className}`}
        onClick={onClick}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
        )}
        {children}
      </button>
    );
  };

  // StatCard Component
  const StatCard = ({ title, value, icon, loading = false }) => {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium text-gray-600"><strong>{title}</strong></div>
          <div className="p-2 rounded-lg bg-black">
            {React.cloneElement(icon, { className: "h-5 w-5 text-white" })}
          </div>
        </div>
        <div className="text-3xl font-bold text-black">
          {loading ? (
            <div className="animate-pulse rounded-md bg-gray-300 h-8 w-16"></div>
          ) : (
            <strong>{value}</strong>
          )}
        </div>
      </div>
    );
  };

  // Load dashboard data
  const loadDashboardData = async (showRetrying = false) => {
    try {
      if (showRetrying) {
        setRetrying(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      // Use the actual backend endpoint that exists
      const response = await fetch('http://localhost:3000/user/websites', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to load dashboard data`);
      }

      const data = await response.json();
      
      // Transform the data to match our component's expectations
      setDashboardData({
        websites: data.websites || [],
        totalWebsites: data.stats?.total || 0,
        stats: {
          totalPages: data.websites?.reduce((total, w) => total + (w.pagesCrawled || 0), 0) || 0,
          totalChunks: data.websites?.reduce((total, w) => total + (w.chunksProcessed || 0), 0) || 0,
          activeWidgets: data.websites?.filter(w => w.status === 'completed')?.length || 0
        },
        queueStats: {
          active: data.stats?.crawling || 0,
          waiting: data.stats?.pending || 0,
          completed: data.stats?.completed || 0
        }
      });
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Failed to connect to backend server');
      
      // Set default data to prevent crashes
      setDashboardData({
        websites: [],
        totalWebsites: 0,
        stats: { totalPages: 0, totalChunks: 0, activeWidgets: 0 },
        queueStats: { active: 0, waiting: 0, completed: 0 }
      });
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  // Initialize dashboard
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const handleGetStarted = (option) => {
    if (option === 'embedded-chatbot') {
      navigate('/scraping');
    } else if (option === 'cashflow-management') {
      alert('Cashflow & Supply Chain Analytics - Coming Soon!');
    }
  };

  const handleAddWebsite = async (e) => {
    e.preventDefault();
    
    if (!newWebsite.url.trim()) {
      alert('Please enter a website URL');
      return;
    }

    try {
      // Navigate to scraping page with the URL
      navigate('/scraping', { state: { websiteUrl: newWebsite.url.trim() } });
      
      // Reset form and close modal
      setNewWebsite({
        url: '',
        title: '',
        description: '',
        maxPages: 50,
        respectRobots: true,
        includeImages: false,
        excludePatterns: [],
        waitTime: 1000
      });
      setShowAddWebsite(false);
      
    } catch (err) {
      console.error('Error preparing crawl:', err);
      alert(`Error: ${err.message || 'Please check your input'}`);
    }
  };

  // Delete website handler
  const handleDeleteWebsite = async (websiteId) => {
    if (window.confirm('Are you sure you want to delete this website?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/user/websites/${websiteId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          await loadDashboardData();
          alert('Website deleted successfully!');
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }
      } catch (err) {
        console.error('Error deleting website:', err);
        alert(`Error deleting website: ${err.message}`);
      }
    }
  };

  // Get widget script for website
  const handleGetWidgetScript = async (websiteId) => {
    try {
      // Use the proper widget endpoint as per the guide
      const response = await fetch(`${API_BASE_URL}/widget/website/${websiteId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.widget?.embedCode) {
          setSelectedWidgetData(data.widget);
          setShowWidgetScript(true);
        } else {
          alert('Widget script not available. The widget may still be processing.');
        }
      } else if (response.status === 404) {
        alert('Widget not found. The website may still be processing or the widget creation failed.');
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      console.error('Error getting widget script:', err);
      alert(`Error getting widget script: ${err.message}`);
    }
  };

  // Handle view website details
  const handleViewWebsite = (websiteId) => {
    navigate(`/website/${websiteId}`);
  };

  // Get status color for badges
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'success';
      case 'crawling': return 'info';
      case 'pending': return 'warning';
      case 'failed': return 'failure';
      default: return 'gray';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-black text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-lg"><strong>Loading...</strong></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  <LogoAnimation />
                </div>
                <span className="text-white text-xl font-bold tracking-tight">NEXA</span>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => navigate('/dashboard')}
                className={`text-white hover:text-gray-300 transition-colors font-medium ${
                  location?.pathname === '/dashboard' ? 'border-b-2 border-white pb-1' : ''
                }`}
              >
                <strong>Dashboard</strong>
              </button>
              <button
                onClick={() => navigate('/scraping')}
                className={`text-white hover:text-gray-300 transition-colors font-medium ${
                  location?.pathname === '/scraping' ? 'border-b-2 border-white pb-1' : ''
                }`}
              >
                <strong>Scraping</strong>
              </button>
              <button
                onClick={() => navigate('/cashflow')}
                className={`text-white hover:text-gray-300 transition-colors font-medium ${
                  location?.pathname === '/cashflow' ? 'border-b-2 border-white pb-1' : ''
                }`}
              >
                <strong>Cashflow</strong>
              </button>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-white font-medium"><strong>{user?.firstName || user?.name || user?.email}</strong></div>
                  <div className="text-white/70 text-sm">{user?.email}</div>
                </div>
                
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  <strong>Logout</strong>
                </button>
              </div>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-white hover:bg-white/10 transition-colors"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-black/90">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {/* Mobile Navigation Links */}
              <button
                onClick={() => {
                  navigate('/dashboard');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-base font-medium text-white hover:bg-white/10 rounded-md transition-colors ${
                  location?.pathname === '/dashboard' ? 'bg-white/20' : ''
                }`}
              >
                <strong>Dashboard</strong>
              </button>
              <button
                onClick={() => {
                  navigate('/scraping');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-base font-medium text-white hover:bg-white/10 rounded-md transition-colors ${
                  location?.pathname === '/scraping' ? 'bg-white/20' : ''
                }`}
              >
                <strong>Scraping</strong>
              </button>
              <button
                onClick={() => {
                  navigate('/cashflow');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-base font-medium text-white hover:bg-white/10 rounded-md transition-colors ${
                  location?.pathname === '/cashflow' ? 'bg-white/20' : ''
                }`}
              >
                <strong>Cashflow</strong>
              </button>
              
              <div className="pt-4 border-t border-white/20">
                <div className="px-3 py-2">
                  <div className="text-white font-medium"><strong>{user?.firstName || user?.name || user?.email}</strong></div>
                  <div className="text-white/70 text-sm">{user?.email}</div>
                </div>
                
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="w-full mt-2 px-3 py-2 text-base font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                >
                  <strong>Logout</strong>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-4">
            <strong>Welcome back, {user?.firstName || user?.name || user?.email}!</strong>
          </h1>
          <p className="text-xl text-gray-600">
            Your AI-powered business automation dashboard
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800"><strong>Connection Error</strong></h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <Button
                  onClick={() => loadDashboardData(true)}
                  loading={retrying}
                  color="red"
                  size="sm"
                  className="mt-3"
                >
                  <strong>Retry Connection</strong>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Websites"
            value={dashboardData.totalWebsites || 0}
            icon={<GlobeAltIcon />}
            loading={loading}
          />
          <StatCard
            title="Active Chatbots"
            value={dashboardData.stats?.activeWidgets || 0}
            icon={<ChatBubbleLeftRightIcon />}
            loading={loading}
          />
          <StatCard
            title="Pages Crawled"
            value={dashboardData.stats?.totalPages || 0}
            icon={<ChartBarIcon />}
            loading={loading}
          />
          <StatCard
            title="Content Chunks"
            value={dashboardData.stats?.totalChunks || 0}
            icon={<Cog6ToothIcon />}
            loading={loading}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Embedded Chatbot Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-black"><strong>AI Website Chatbot</strong></h3>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Create an intelligent chatbot for your website that can answer questions based on your content.
            </p>
            <Button
              onClick={() => handleGetStarted('embedded-chatbot')}
              className="w-full"
              size="lg"
            >
              <strong>Get Started</strong>
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Cashflow/Supply Chain Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black">
                  <ChartBarIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-black"><strong>Cashflow / Supply Chain</strong></h3>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Advanced business intelligence for managing your cashflow and supply chain operations with AI insights.
            </p>
            <Button
              onClick={() => handleGetStarted('cashflow-management')}
              className="w-full"
              size="lg"
            >
              <strong>Get Started</strong>
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Websites List */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-black"><strong>Your Websites</strong></h3>
              <Button onClick={() => setShowAddWebsite(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                <strong>Add Website</strong>
              </Button>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                <p className="text-gray-600"><strong>Loading websites...</strong></p>
              </div>
            ) : dashboardData.websites?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.websites.map((website) => (
                  <div
                    key={website._id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black">
                        <GlobeAltIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-black"><strong>{website.title || website.url}</strong></h4>
                        <p className="text-sm text-gray-600">{website.url}</p>
                        {website.status && (
                          <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                            website.status === 'completed' ? 'bg-green-100 text-green-800' :
                            website.status === 'crawling' ? 'bg-blue-100 text-blue-800' :
                            website.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            <strong>{website.status}</strong>
                          </span>
                        )}
                        {website.pagesCrawled > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            {website.pagesCrawled} pages • {website.chunksProcessed || 0} chunks
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        color="gray"
                        onClick={() => handleViewWebsite(website._id)}
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        <strong>View</strong>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <GlobeAltIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-black mb-2"><strong>No websites yet</strong></h3>
                <p className="text-gray-600 mb-4">Get started by adding your first website to scrape.</p>
                <Button onClick={() => setShowAddWebsite(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  <strong>Add Website</strong>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Website Modal */}
      {showAddWebsite && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-black"><strong>Add New Website</strong></h3>
              <button
                onClick={() => setShowAddWebsite(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddWebsite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  <strong>Website URL *</strong>
                </label>
                <input
                  type="url"
                  value={newWebsite.url}
                  onChange={(e) => setNewWebsite(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Website Title (Optional)</label>
                <input
                  type="text"
                  value={newWebsite.title}
                  onChange={(e) => setNewWebsite(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="My Website"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                >
                  <strong>Start Scraping</strong>
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowAddWebsite(false)}
                  color="gray"
                >
                  <strong>Cancel</strong>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;