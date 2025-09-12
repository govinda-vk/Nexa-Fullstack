import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Alert, Spinner, Modal, TextInput, Label, Textarea } from "flowbite-react";
import { dashboardService, userService, widgetService, crawlingService } from '../utils/apiServices.js';
import { API_BASE_URL } from '../config/api.js';

const WebsiteDetail = () => {
  const { websiteId } = useParams();
  const navigate = useNavigate();
  
  const [websiteData, setWebsiteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [crawlProgress, setCrawlProgress] = useState(null);
  const [widgetUpdateLoading, setWidgetUpdateLoading] = useState(false);
  const [widgetUpdateError, setWidgetUpdateError] = useState(null);
  const [widgetUpdateSuccess, setWidgetUpdateSuccess] = useState(false);
  
  // Update form state
  const [updateData, setUpdateData] = useState({
    title: '',
    description: '',
    status: ''
  });

  // Widget configuration form state
  const [widgetConfig, setWidgetConfig] = useState({
    isActive: true,
    allowedDomains: [],
    config: {
      theme: 'light',
      primaryColor: '#667eea',
      position: 'bottom-right',
      size: 'medium',
      autoOpen: false,
      showWelcomeMessage: true,
      welcomeMessage: 'Hello! How can I help you today?',
      placeholder: 'Type your message here...',
      title: 'Chat Assistant',
      subtitle: 'AI-powered support',
      avatar: null,
      showPoweredBy: true,
      maxMessages: 50,
      sessionTimeout: 1800,
      allowFileUploads: false,
      allowFeedback: true
    },
    rateLimits: {
      messagesPerMinute: 10,
      messagesPerHour: 100
    }
  });

  // Load website data
  const loadWebsiteData = async () => {
    try {
      setLoading(true);
      
      // Get website details
      const websiteDetails = await userService.getWebsiteDetails(websiteId);
      
      // Get widget data using the proper endpoint
      let widgetData = null;
      try {
        const widgetResponse = await fetch(`${API_BASE_URL}/widget/website/${websiteId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (widgetResponse.ok) {
          const widgetResult = await widgetResponse.json();
          widgetData = widgetResult.widget;
        } else if (widgetResponse.status !== 404) {
          console.warn('Widget fetch failed:', widgetResponse.status);
        }
      } catch (widgetError) {
        console.warn('Widget fetch error:', widgetError);
      }
      
      // Combine the data
      setWebsiteData({
        website: websiteDetails,
        widget: widgetData
      });
      
      setUpdateData({
        title: websiteDetails.title || '',
        description: websiteDetails.description || '',
        status: websiteDetails.status || ''
      });

      // Initialize widget config form if widget exists
      if (widgetData) {
        setWidgetConfig({
          isActive: widgetData.isActive ?? true,
          allowedDomains: widgetData.allowedDomains || [],
          config: {
            theme: widgetData.config?.theme || 'light',
            primaryColor: widgetData.config?.primaryColor || '#667eea',
            position: widgetData.config?.position || 'bottom-right',
            size: widgetData.config?.size || 'medium',
            autoOpen: widgetData.config?.autoOpen ?? false,
            showWelcomeMessage: widgetData.config?.showWelcomeMessage ?? true,
            welcomeMessage: widgetData.config?.welcomeMessage || 'Hello! How can I help you today?',
            placeholder: widgetData.config?.placeholder || 'Type your message here...',
            title: widgetData.config?.title || 'Chat Assistant',
            subtitle: widgetData.config?.subtitle || 'AI-powered support',
            avatar: widgetData.config?.avatar || null,
            showPoweredBy: widgetData.config?.showPoweredBy ?? true,
            maxMessages: widgetData.config?.maxMessages || 50,
            sessionTimeout: widgetData.config?.sessionTimeout || 1800,
            allowFileUploads: widgetData.config?.allowFileUploads ?? false,
            allowFeedback: widgetData.config?.allowFeedback ?? true
          },
          rateLimits: {
            messagesPerMinute: widgetData.rateLimits?.messagesPerMinute || 10,
            messagesPerHour: widgetData.rateLimits?.messagesPerHour || 100
          }
        });
      }
      
      setError(null);
      
      // Check crawl status if crawling
      if (websiteDetails.jobId && websiteDetails.status === 'crawling') {
        checkCrawlProgress(websiteDetails.jobId);
      }
    } catch (err) {
      console.error('Error loading website data:', err);
      setError('Failed to load website data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check crawl progress
  const checkCrawlProgress = async (jobId) => {
    try {
      const progress = await crawlingService.getJobStatus(jobId);
      setCrawlProgress(progress);
    } catch (err) {
      console.error('Error checking crawl progress:', err);
    }
  };

  useEffect(() => {
    if (websiteId) {
      loadWebsiteData();
      
      // Poll for updates every 10 seconds if crawling
      const interval = setInterval(() => {
        if (websiteData?.website?.status === 'crawling') {
          loadWebsiteData();
        }
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [websiteId]);

  // Update website
  const handleUpdateWebsite = async (e) => {
    e.preventDefault();
    try {
      await userService.updateWebsite(websiteId, updateData);
      setShowUpdateModal(false);
      await loadWebsiteData();
      alert('Website updated successfully!');
    } catch (err) {
      alert(`Error updating website: ${err.message}`);
    }
  };

  // Delete website
  const handleDeleteWebsite = async () => {
    if (window.confirm('Are you sure you want to delete this website? This cannot be undone.')) {
      try {
        await userService.deleteWebsite(websiteId);
        navigate('/dashboard');
      } catch (err) {
        alert(`Error deleting website: ${err.message}`);
      }
    }
  };

  // Create widget
  const handleCreateWidget = async () => {
    try {
      await widgetService.createWidget(websiteId);
      await loadWebsiteData();
      alert('Widget created successfully!');
    } catch (err) {
      alert(`Error creating widget: ${err.message}`);
    }
  };

  // Update widget configuration
  const handleUpdateWidget = async (e) => {
    e.preventDefault();
    setWidgetUpdateLoading(true);
    setWidgetUpdateError(null);
    setWidgetUpdateSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/widget/website/${websiteId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(widgetConfig)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      setWidgetUpdateSuccess(true);
      
      // Reload website data to show updated widget configuration
      await loadWebsiteData();
      
      // Hide success message after 3 seconds
      setTimeout(() => setWidgetUpdateSuccess(false), 3000);
      
    } catch (err) {
      console.error('Error updating widget:', err);
      setWidgetUpdateError(err.message);
    } finally {
      setWidgetUpdateLoading(false);
    }
  };

  // Handle widget configuration field changes
  const handleWidgetConfigChange = (field, value, isNestedConfig = false) => {
    if (isNestedConfig) {
      setWidgetConfig(prev => ({
        ...prev,
        config: {
          ...prev.config,
          [field]: value
        }
      }));
    } else if (field === 'rateLimits') {
      setWidgetConfig(prev => ({
        ...prev,
        rateLimits: {
          ...prev.rateLimits,
          ...value
        }
      }));
    } else {
      setWidgetConfig(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Update widget status (activate/deactivate) - kept for backward compatibility
  const handleUpdateWidgetStatus = async () => {
    try {
      const newStatus = !websiteData.widget.isActive;
      const response = await fetch(`${API_BASE_URL}/widget/website/${websiteId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: newStatus,
          config: websiteData.widget.config,
          rateLimits: websiteData.widget.rateLimits,
          allowedDomains: websiteData.widget.allowedDomains || []
        })
      });

      if (response.ok) {
        await loadWebsiteData();
        alert(`Widget ${newStatus ? 'activated' : 'deactivated'} successfully!`);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      console.error('Error updating widget status:', err);
      alert(`Error updating widget status: ${err.message}`);
    }
  };

  // Add allowed domain
  const addAllowedDomain = () => {
    const domain = prompt('Enter allowed domain (e.g., example.com or *.example.com):');
    if (domain && domain.trim()) {
      setWidgetConfig(prev => ({
        ...prev,
        allowedDomains: [...prev.allowedDomains, domain.trim()]
      }));
    }
  };

  // Remove allowed domain
  const removeAllowedDomain = (index) => {
    setWidgetConfig(prev => ({
      ...prev,
      allowedDomains: prev.allowedDomains.filter((_, i) => i !== index)
    }));
  };

  // Get status color
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] p-8 flex items-center justify-center">
        <div className="text-white text-center">
          <Spinner size="xl" />
          <p className="mt-4">Loading website details...</p>
        </div>
      </div>
    );
  }

  if (error || !websiteData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] p-8">
        <div className="max-w-4xl mx-auto">
          <Alert color="failure" className="mb-6">
            {error || 'Website not found'}
          </Alert>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const { website, widget } = websiteData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Button color="gray" onClick={() => navigate('/dashboard')} className="mb-4">
              ← Back to Dashboard
            </Button>
            <h1 className="text-4xl font-bold text-white mb-2">
              {website.title || website.url}
            </h1>
            <p className="text-white/80">{website.url}</p>
            {website.description && (
              <p className="text-white/70 mt-2">{website.description}</p>
            )}
          </div>
          <div className="text-right">
            <Badge color={getStatusColor(website.status)} size="lg" className="mb-2">
              {website.status || 'unknown'}
            </Badge>
            <div className="space-x-2">
              <Button size="sm" onClick={() => setShowUpdateModal(true)}>
                Edit
              </Button>
              <Button size="sm" color="failure" onClick={handleDeleteWebsite}>
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Bar for Crawling */}
        {website.status === 'crawling' && crawlProgress && (
          <Card className="mb-6">
            <div className="p-4">
              <h4 className="text-lg font-semibold mb-2">Crawling Progress</h4>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${crawlProgress.progress || 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{crawlProgress.pagesCrawled || 0} pages crawled</span>
                <span>{crawlProgress.progress || 0}% complete</span>
              </div>
            </div>
          </Card>
        )}

        {/* Custom Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-white/20">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-white text-white'
                    : 'border-transparent text-white/60 hover:text-white hover:border-white/50'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('edit-widget')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'edit-widget'
                    ? 'border-white text-white'
                    : 'border-transparent text-white/60 hover:text-white hover:border-white/50'
                }`}
                disabled={!widget}
              >
                Edit Widget
              </button>
              <button
                onClick={() => setActiveTab('actions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'actions'
                    ? 'border-white text-white'
                    : 'border-transparent text-white/60 hover:text-white hover:border-white/50'
                }`}
              >
                Actions
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 gap-6">
            {/* Widget Integration */}
            <Card>
                <h3 className="text-xl font-semibold mb-4">Widget Integration</h3>
                {websiteData.widget ? (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge color={websiteData.widget.isActive ? 'success' : 'gray'}>
                        {websiteData.widget.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Widget ID:</span>
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {websiteData.widget.widgetId || 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">API Key:</span>
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {websiteData.widget.apiKey ? `${websiteData.widget.apiKey.substring(0, 8)}...` : 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Theme:</span>
                      <span className="font-medium">{websiteData.widget.config?.theme || 'Default'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Position:</span>
                      <span className="font-medium">{websiteData.widget.config?.position || 'bottom-right'}</span>
                    </div>
                    
                    {/* Embed Code Section */}
                    {websiteData.widget.embedCode && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Embed Code:
                        </label>
                        <div className="relative">
                          <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
                            <code>{websiteData.widget.embedCode}</code>
                          </pre>
                          <Button
                            size="xs"
                            className="absolute top-1 right-1 bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              navigator.clipboard.writeText(websiteData.widget.embedCode);
                              alert('Embed code copied to clipboard!');
                            }}
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Script URL Section */}
                    {websiteData.widget.scriptUrl && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Direct Script URL:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={websiteData.widget.scriptUrl}
                            readOnly
                            className="flex-1 text-xs font-mono bg-gray-50 border border-gray-300 rounded px-3 py-2"
                          />
                          <Button
                            size="xs"
                            color="gray"
                            onClick={() => {
                              navigator.clipboard.writeText(websiteData.widget.scriptUrl);
                              alert('Script URL copied to clipboard!');
                            }}
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Button 
                        onClick={() => navigate(`/widget/${websiteId}/config`)}
                        color="purple"
                        size="sm"
                      >
                        Configure Widget
                      </Button>
                      <Button 
                        onClick={() => handleUpdateWidgetStatus()}
                        color={websiteData.widget.isActive ? 'failure' : 'success'}
                        size="sm"
                      >
                        {websiteData.widget.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                    {websiteData.widget.embedCode && (
                      <p className="text-xs text-gray-600 text-center">
                        Paste the embed code before the closing &lt;/body&gt; tag on your website
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-600 mb-4">No widget found for this website.</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Widget should be automatically created after website processing is complete.
                    </p>
                    {websiteData.website.status === 'completed' && (
                      <p className="text-sm text-blue-600">
                        Try refreshing the page or check the dashboard.
                      </p>
                    )}
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'edit-widget' && widget && (
            <Card>
              <h3 className="text-xl font-semibold mb-6">Edit Widget Configuration</h3>
              
              {widgetUpdateSuccess && (
                <Alert color="success" className="mb-4">
                  Widget configuration updated successfully!
                </Alert>
              )}
              
              {widgetUpdateError && (
                <Alert color="failure" className="mb-4">
                  Error: {widgetUpdateError}
                </Alert>
              )}

              <form onSubmit={handleUpdateWidget} className="space-y-6">
                {/* Basic Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="isActive" className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={widgetConfig.isActive}
                        onChange={(e) => handleWidgetConfigChange('isActive', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      Widget Active
                    </Label>
                    <p className="text-sm text-gray-500 mt-1">Enable or disable the widget</p>
                  </div>
                </div>

                {/* Appearance Settings */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium mb-4">Appearance</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="theme" value="Theme" />
                      <select
                        id="theme"
                        value={widgetConfig.config.theme}
                        onChange={(e) => handleWidgetConfigChange('theme', e.target.value, true)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="primaryColor" value="Primary Color" />
                      <div className="flex gap-2 mt-1">
                        <input
                          type="color"
                          id="primaryColor"
                          value={widgetConfig.config.primaryColor}
                          onChange={(e) => handleWidgetConfigChange('primaryColor', e.target.value, true)}
                          className="h-10 w-20 rounded border border-gray-300"
                        />
                        <TextInput
                          value={widgetConfig.config.primaryColor}
                          onChange={(e) => handleWidgetConfigChange('primaryColor', e.target.value, true)}
                          placeholder="#667eea"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="position" value="Position" />
                      <select
                        id="position"
                        value={widgetConfig.config.position}
                        onChange={(e) => handleWidgetConfigChange('position', e.target.value, true)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="bottom-right">Bottom Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="top-right">Top Right</option>
                        <option value="top-left">Top Left</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="size" value="Size" />
                      <select
                        id="size"
                        value={widgetConfig.config.size}
                        onChange={(e) => handleWidgetConfigChange('size', e.target.value, true)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Messages and Content */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium mb-4">Messages & Content</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title" value="Widget Title" />
                        <TextInput
                          id="title"
                          value={widgetConfig.config.title}
                          onChange={(e) => handleWidgetConfigChange('title', e.target.value, true)}
                          placeholder="Chat Assistant"
                          maxLength={50}
                        />
                      </div>

                      <div>
                        <Label htmlFor="subtitle" value="Widget Subtitle" />
                        <TextInput
                          id="subtitle"
                          value={widgetConfig.config.subtitle}
                          onChange={(e) => handleWidgetConfigChange('subtitle', e.target.value, true)}
                          placeholder="AI-powered support"
                          maxLength={100}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="welcomeMessage" value="Welcome Message" />
                      <Textarea
                        id="welcomeMessage"
                        value={widgetConfig.config.welcomeMessage}
                        onChange={(e) => handleWidgetConfigChange('welcomeMessage', e.target.value, true)}
                        placeholder="Hello! How can I help you today?"
                        rows={2}
                        maxLength={200}
                      />
                    </div>

                    <div>
                      <Label htmlFor="placeholder" value="Input Placeholder" />
                      <TextInput
                        id="placeholder"
                        value={widgetConfig.config.placeholder}
                        onChange={(e) => handleWidgetConfigChange('placeholder', e.target.value, true)}
                        placeholder="Type your message here..."
                        maxLength={100}
                      />
                    </div>
                  </div>
                </div>

                {/* Behavior Settings */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium mb-4">Behavior</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={widgetConfig.config.autoOpen}
                          onChange={(e) => handleWidgetConfigChange('autoOpen', e.target.checked, true)}
                          className="rounded border-gray-300"
                        />
                        Auto-open on page load
                      </Label>

                      <Label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={widgetConfig.config.showWelcomeMessage}
                          onChange={(e) => handleWidgetConfigChange('showWelcomeMessage', e.target.checked, true)}
                          className="rounded border-gray-300"
                        />
                        Show welcome message
                      </Label>

                      <Label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={widgetConfig.config.allowFileUploads}
                          onChange={(e) => handleWidgetConfigChange('allowFileUploads', e.target.checked, true)}
                          className="rounded border-gray-300"
                        />
                        Allow file uploads
                      </Label>

                      <Label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={widgetConfig.config.allowFeedback}
                          onChange={(e) => handleWidgetConfigChange('allowFeedback', e.target.checked, true)}
                          className="rounded border-gray-300"
                        />
                        Allow user feedback
                      </Label>

                      <Label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={widgetConfig.config.showPoweredBy}
                          onChange={(e) => handleWidgetConfigChange('showPoweredBy', e.target.checked, true)}
                          className="rounded border-gray-300"
                        />
                        Show "Powered by NEXA"
                      </Label>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="maxMessages" value="Max Messages in History" />
                        <TextInput
                          id="maxMessages"
                          type="number"
                          min="1"
                          max="200"
                          value={widgetConfig.config.maxMessages}
                          onChange={(e) => handleWidgetConfigChange('maxMessages', parseInt(e.target.value) || 50, true)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="sessionTimeout" value="Session Timeout (seconds)" />
                        <TextInput
                          id="sessionTimeout"
                          type="number"
                          min="300"
                          max="7200"
                          value={widgetConfig.config.sessionTimeout}
                          onChange={(e) => handleWidgetConfigChange('sessionTimeout', parseInt(e.target.value) || 1800, true)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rate Limits */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium mb-4">Rate Limits</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="messagesPerMinute" value="Messages Per Minute" />
                      <TextInput
                        id="messagesPerMinute"
                        type="number"
                        min="1"
                        max="60"
                        value={widgetConfig.rateLimits.messagesPerMinute}
                        onChange={(e) => handleWidgetConfigChange('rateLimits', { messagesPerMinute: parseInt(e.target.value) || 10 })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="messagesPerHour" value="Messages Per Hour" />
                      <TextInput
                        id="messagesPerHour"
                        type="number"
                        min="1"
                        max="1000"
                        value={widgetConfig.rateLimits.messagesPerHour}
                        onChange={(e) => handleWidgetConfigChange('rateLimits', { messagesPerHour: parseInt(e.target.value) || 100 })}
                      />
                    </div>
                  </div>
                </div>

                {/* Allowed Domains */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium mb-4">Allowed Domains</h4>
                  <div className="space-y-3">
                    {widgetConfig.allowedDomains.map((domain, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <TextInput
                          value={domain}
                          onChange={(e) => {
                            const newDomains = [...widgetConfig.allowedDomains];
                            newDomains[index] = e.target.value;
                            handleWidgetConfigChange('allowedDomains', newDomains);
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          color="failure"
                          size="sm"
                          onClick={() => removeAllowedDomain(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      color="gray"
                      size="sm"
                      onClick={addAllowedDomain}
                    >
                      Add Domain
                    </Button>
                    <p className="text-sm text-gray-500">
                      Leave empty to allow all domains. Use *.example.com for subdomains.
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="border-t pt-6">
                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      color="gray"
                      onClick={() => setActiveTab('overview')}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={widgetUpdateLoading}
                      className="bg-gradient-to-r from-[#667eea] to-[#764ba2]"
                    >
                      {widgetUpdateLoading ? <Spinner size="sm" className="mr-2" /> : null}
                      {widgetUpdateLoading ? 'Updating...' : 'Update Widget'}
                    </Button>
                  </div>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'edit-widget' && !widget && (
            <Card>
              <div className="text-center py-8">
                <h3 className="text-xl font-semibold mb-4">No Widget Found</h3>
                <p className="text-gray-600 mb-4">
                  This website doesn't have a widget yet. The widget is automatically created after the website processing is complete.
                </p>
                {websiteData?.website?.status === 'completed' && (
                  <Button onClick={handleCreateWidget}>
                    Create Widget Now
                  </Button>
                )}
              </div>
            </Card>
          )}

          {activeTab === 'actions' && (
            <Card>
              <h3 className="text-xl font-semibold mb-4">Website Actions</h3>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium mb-2">Re-crawl Website</h4>
                  <p className="text-gray-600 text-sm mb-3">
                    Start a new crawl to update the content from this website.
                  </p>
                  <Button 
                    color="info"
                    onClick={() => {
                      // Navigate to add website with pre-filled data
                      navigate('/dashboard', { 
                        state: { 
                          recrawl: { 
                            url: websiteData.website.url,
                            title: websiteData.website.title,
                            description: websiteData.website.description 
                          } 
                        } 
                      });
                    }}
                  >
                    Start Re-crawl
                  </Button>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium mb-2">Download Data</h4>
                  <p className="text-gray-600 text-sm mb-3">
                    Export the crawled data and processed chunks.
                  </p>
                  <Button color="gray" disabled>
                    Download (Coming Soon)
                  </Button>
                </div>

                <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                  <h4 className="font-medium mb-2 text-red-800">Danger Zone</h4>
                  <p className="text-red-600 text-sm mb-3">
                    Permanently delete this website and all associated data.
                  </p>
                  <Button color="failure" onClick={handleDeleteWebsite}>
                    Delete Website
                  </Button>
                </div>
              </div>
            </Card>
          )}

        {/* Update Modal */}
        <Modal show={showUpdateModal} onClose={() => setShowUpdateModal(false)}>
          <Modal.Header>Update Website</Modal.Header>
          <Modal.Body>
            <form onSubmit={handleUpdateWebsite} className="space-y-4">
              <div>
                <Label htmlFor="title" value="Title" />
                <TextInput
                  id="title"
                  value={updateData.title}
                  onChange={(e) => setUpdateData({ ...updateData, title: e.target.value })}
                  placeholder="Website title"
                />
              </div>
              
              <div>
                <Label htmlFor="description" value="Description" />
                <Textarea
                  id="description"
                  value={updateData.description}
                  onChange={(e) => setUpdateData({ ...updateData, description: e.target.value })}
                  placeholder="Website description"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <Button color="gray" onClick={() => setShowUpdateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Update
                </Button>
              </div>
            </form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default WebsiteDetail;
