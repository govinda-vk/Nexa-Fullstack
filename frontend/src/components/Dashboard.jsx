import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Alert, Modal, TextInput, Label, Textarea, Select, Spinner } from "flowbite-react";
import { useAuth } from '../contexts/AuthContext.jsx';
import { dashboardService, userService, crawlingService, widgetService } from '../utils/apiServices.js';
import { API_BASE_URL } from '../config/api.js';

const Dashboard = () => {
  const navigate = useNavigate();
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
  const [crawlingJobs, setCrawlingJobs] = useState({});
  const [showWidgetScript, setShowWidgetScript] = useState(false);
  const [selectedWidgetData, setSelectedWidgetData] = useState(null);
  
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

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getDashboardData();
      setDashboardData(data);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
      // Set default data structure to prevent crashes
      setDashboardData({
        websites: [],
        totalWebsites: 0,
        stats: {},
        queueStats: {}
      });
    } finally {
      setLoading(false);
    }
  };

  // Initialize dashboard
  useEffect(() => {
    if (user) {
      loadDashboardData();
      
      // Poll for crawling job updates every 30 seconds (only if backend is working)
      const interval = setInterval(() => {
        if (!error) { // Only poll if there's no error
          loadDashboardData();
        }
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user, error]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleGetStarted = (option) => {
    navigate(`/?option=${option}`);
  };

  // Add website handler
  const handleAddWebsite = async (e) => {
    e.preventDefault();
    
    try {
      const crawlOptions = {
        url: newWebsite.url,
        maxPages: newWebsite.maxPages,
        respectRobots: newWebsite.respectRobots,
        includeImages: newWebsite.includeImages,
        excludePatterns: newWebsite.excludePatterns.filter(p => p.trim()),
        waitTime: newWebsite.waitTime
      };
      
      // Start crawling
      const response = await crawlingService.startCrawl(crawlOptions);
      
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
      
      // Reload dashboard data
      await loadDashboardData();
      
      alert(`Crawling started! Job ID: ${response.jobId}`);
    } catch (err) {
      alert(`Error starting crawl: ${err.message}`);
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
      <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] p-8 flex items-center justify-center">
        <div className="text-white text-center">
          <Spinner size="xl" />
          <p className="mt-4">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2]">
      {/* Dashboard Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-white text-2xl font-bold">NEXA AI Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-white font-medium">{user.name || user.email}</div>
                <div className="text-white/70 text-sm">{user.email}</div>
              </div>
              <Button 
                size="sm" 
                color="failure"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-white mb-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to NEXA AI Dashboard</h1>
          <p className="text-xl text-white/80">Manage your websites, chatbots, and AI integrations</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert color="failure" className="mb-6">
            <div className="flex justify-between items-center">
              <div>
                <strong>Backend Connection Issue:</strong> {error}
                <br />
                <small className="text-red-600">
                  Make sure your backend server is running on http://localhost:3000
                </small>
              </div>
              <Button size="xs" onClick={loadDashboardData}>
                Retry
              </Button>
            </div>
          </Alert>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-2xl">
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-blue-600">
                {loading ? <Spinner size="sm" /> : dashboardData.totalWebsites}
              </div>
              <div className="text-sm text-gray-600">Total Websites</div>
            </div>
          </Card>
          <Card className="shadow-2xl">
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-green-600">
                {loading ? <Spinner size="sm" /> : (dashboardData.websites?.filter(w => w.status === 'completed')?.length || 0)}
              </div>
              <div className="text-sm text-gray-600">Active Websites</div>
            </div>
          </Card>
          <Card className="shadow-2xl">
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-purple-600">
                {loading ? <Spinner size="sm" /> : (dashboardData.websites?.filter(w => w.widget?.isActive)?.length || 0)}
              </div>
              <div className="text-sm text-gray-600">Active Widgets</div>
            </div>
          </Card>
          <Card className="shadow-2xl">
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-orange-600">
                {loading ? <Spinner size="sm" /> : (dashboardData.queueStats.active || 0)}
              </div>
              <div className="text-sm text-gray-600">Processing Jobs</div>
            </div>
          </Card>
        </div>

        {/* Website Management */}
        <Card className="shadow-2xl mb-8">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Your Websites</h3>
              <Button onClick={() => setShowAddWebsite(true)}>
                Add New Website
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <Spinner size="xl" />
                <p className="mt-4 text-gray-600">Loading your websites...</p>
              </div>
            ) : (dashboardData.websites?.length || 0) === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🌐</div>
                <p className="text-gray-600 mb-4">No websites added yet</p>
                <Button onClick={() => setShowAddWebsite(true)}>
                  Add Your First Website
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="px-6 py-3">Website</th>
                      <th scope="col" className="px-6 py-3">Status</th>
                      <th scope="col" className="px-6 py-3">Pages Crawled</th>
                      <th scope="col" className="px-6 py-3">Last Updated</th>
                      <th scope="col" className="px-6 py-3">Widget</th>
                      <th scope="col" className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(dashboardData.websites || []).map((website) => (
                      <tr key={website._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {website.title || website.url}
                            </div>
                            <div className="text-sm text-gray-500">
                              {website.url}
                            </div>
                            {website.description && (
                              <div className="text-xs text-gray-400 mt-1">
                                {website.description.substring(0, 60)}...
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge color={getStatusColor(website.status)}>
                            {website.status || 'unknown'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div>{website.pagesCrawled || 0} pages</div>
                            {website.chunksProcessed && (
                              <div className="text-gray-500">{website.chunksProcessed} chunks</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            {formatDate(website.updatedAt || website.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {website.widget ? (
                            <div className="space-y-1">
                              <Badge color={website.widget.isActive ? 'success' : 'gray'}>
                                {website.widget.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              {website.widget.isActive && (
                                <div className="text-xs text-green-600">
                                  ✓ Ready
                                </div>
                              )}
                            </div>
                          ) : website.status === 'completed' ? (
                            <Badge color="success">
                              Available
                            </Badge>
                          ) : (
                            <Badge color="gray">
                              Not Ready
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button size="xs" color="info" onClick={() => navigate(`/website/${website._id}`)}>
                              View
                            </Button>
                            {(website.widget || website.status === 'completed') && (
                              <>
                                <Button size="xs" color="purple" onClick={() => navigate(`/widget/${website._id}/config`)}>
                                  Configure
                                </Button>
                                <Button size="xs" color="success" onClick={() => handleGetWidgetScript(website._id)}>
                                  Get Script
                                </Button>
                              </>
                            )}
                            <Button size="xs" color="failure" onClick={() => handleDeleteWebsite(website._id)}>
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Embedded Chatbot Card */}
          <Card className="shadow-2xl">
            <div className="text-center p-6">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Embedded Chatbot</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Add intelligent chatbots to your websites. Powered by your scraped content with RAG technology.
              </p>
              <div className="space-y-2 mb-6 text-sm text-gray-600">
                <div className="flex items-center justify-center">
                  <span className="text-green-600 mr-2">✓</span>
                  Easy one-line integration
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-green-600 mr-2">✓</span>
                  Learns from your website
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-green-600 mr-2">✓</span>
                  24/7 customer support
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-green-600 mr-2">✓</span>
                  No training required
                </div>
              </div>
              <Button 
                onClick={() => handleGetStarted('embedded-chatbot')}
                className="w-full"
              >
                Get Started with Chatbot
              </Button>
            </div>
          </Card>

          {/* Cashflow/Supply Chain Card */}
          <Card className="shadow-2xl">
            <div className="text-center p-6">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Cashflow / Supply Chain</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Advanced business intelligence for managing your cashflow and supply chain operations with AI insights.
              </p>
              <div className="space-y-2 mb-6 text-sm text-gray-600">
                <div className="flex items-center justify-center">
                  <span className="text-green-600 mr-2">✓</span>
                  Real-time analytics
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-green-600 mr-2">✓</span>
                  Predictive insights
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-green-600 mr-2">✓</span>
                  Automated reporting
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-green-600 mr-2">✓</span>
                  Risk management
                </div>
              </div>
              <Button 
                onClick={() => handleGetStarted('cashflow-management')}
                className="w-full"
              >
                Get Started with Analytics
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Add Website Modal */}
      <Modal show={showAddWebsite} onClose={() => setShowAddWebsite(false)} size="lg">
        <Modal.Header>Add New Website</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleAddWebsite} className="space-y-4">
            <div>
              <Label htmlFor="url" value="Website URL *" />
              <TextInput
                id="url"
                type="url"
                required
                placeholder="https://example.com"
                value={newWebsite.url}
                onChange={(e) => setNewWebsite({ ...newWebsite, url: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="title" value="Website Title" />
              <TextInput
                id="title"
                placeholder="My Awesome Website"
                value={newWebsite.title}
                onChange={(e) => setNewWebsite({ ...newWebsite, title: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="description" value="Description" />
              <Textarea
                id="description"
                placeholder="Brief description of the website..."
                rows={3}
                value={newWebsite.description}
                onChange={(e) => setNewWebsite({ ...newWebsite, description: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxPages" value="Max Pages to Crawl" />
                <TextInput
                  id="maxPages"
                  type="number"
                  min="1"
                  max="1000"
                  value={newWebsite.maxPages}
                  onChange={(e) => setNewWebsite({ ...newWebsite, maxPages: parseInt(e.target.value) })}
                />
              </div>
              
              <div>
                <Label htmlFor="waitTime" value="Wait Time (ms)" />
                <TextInput
                  id="waitTime"
                  type="number"
                  min="0"
                  max="10000"
                  value={newWebsite.waitTime}
                  onChange={(e) => setNewWebsite({ ...newWebsite, waitTime: parseInt(e.target.value) })}
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newWebsite.respectRobots}
                  onChange={(e) => setNewWebsite({ ...newWebsite, respectRobots: e.target.checked })}
                  className="mr-2"
                />
                Respect robots.txt
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newWebsite.includeImages}
                  onChange={(e) => setNewWebsite({ ...newWebsite, includeImages: e.target.checked })}
                  className="mr-2"
                />
                Include images
              </label>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button color="gray" onClick={() => setShowAddWebsite(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Start Crawling
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Widget Script Modal */}
      <Modal show={showWidgetScript} onClose={() => setShowWidgetScript(false)} size="xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">
              Widget Script - {selectedWidgetData?.config?.title || 'Your Website'}
            </h3>
            <button
              onClick={() => setShowWidgetScript(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Success Status */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <p className="font-medium text-green-800">Widget Ready!</p>
              </div>
              <p className="text-sm text-green-700">
                Your AI chatbot widget is ready for embedding on your website.
              </p>
            </div>

            {/* Embed Code Section */}
            {selectedWidgetData?.embedCode && (
              <div>
                <Label value="Ready-to-Use Embed Code" className="mb-3 block font-semibold text-lg" />
                <p className="text-sm text-gray-600 mb-3">
                  Copy this complete embed code and paste it before the closing &lt;/body&gt; tag in your website's HTML:
                </p>
                <div className="relative">
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto max-h-40">
                    <code>{selectedWidgetData.embedCode}</code>
                  </pre>
                  <Button
                    size="sm"
                    className="absolute top-2 right-2 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedWidgetData.embedCode);
                      alert('Embed code copied to clipboard!');
                    }}
                  >
                    Copy Script
                  </Button>
                </div>
              </div>
            )}

            {/* Alternative Script URL */}
            {selectedWidgetData?.scriptUrl && (
              <div>
                <Label value="Alternative: Direct Script URL" className="mb-2 block font-medium" />
                <div className="bg-gray-50 p-3 rounded border flex items-center justify-between">
                  <code className="text-sm text-gray-800 flex-1 mr-2">{selectedWidgetData.scriptUrl}</code>
                  <Button
                    size="xs"
                    color="gray"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedWidgetData.scriptUrl);
                      alert('Script URL copied!');
                    }}
                  >
                    Copy URL
                  </Button>
                </div>
              </div>
            )}

            {/* Installation Guide */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="font-medium text-blue-800 mb-3">📋 Quick Integration Guide:</p>
              <ol className="text-sm text-blue-700 space-y-2 ml-4 list-decimal">
                <li>Copy the embed code above</li>
                <li>Open your website's HTML file or template</li>
                <li>Locate the closing <code>&lt;/body&gt;</code> tag</li>
                <li>Paste the embed code just before the closing <code>&lt;/body&gt;</code> tag</li>
                <li>Save your changes and refresh your website</li>
                <li>🎉 Your AI chatbot widget will appear automatically!</li>
              </ol>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button color="gray" onClick={() => setShowWidgetScript(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;