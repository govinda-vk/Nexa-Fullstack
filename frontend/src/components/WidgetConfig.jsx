import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Alert, Spinner, TextInput, Label, Textarea, Select, Badge, Modal } from "flowbite-react";
import { widgetService, dashboardService } from '../utils/apiServices.js';

const WidgetConfig = () => {
  const { websiteId } = useParams();
  const navigate = useNavigate();
  
  const [websiteData, setWebsiteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [widgetStats, setWidgetStats] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  
  // Widget configuration state
  const [config, setConfig] = useState({
    isActive: true,
    config: {
      theme: 'light',
      primaryColor: '#007bff',
      position: 'bottom-right',
      size: 'medium',
      autoOpen: false,
      showWelcomeMessage: true,
      welcomeMessage: 'Hello! How can I help you today?',
      placeholder: 'Type your message...',
      title: 'AI Assistant',
      subtitle: 'Ask me anything about this website',
      avatar: '',
      showPoweredBy: true,
      maxMessages: 50,
      sessionTimeout: 1800,
      allowFileUploads: false,
      allowFeedback: true
    },
    rateLimits: {
      messagesPerMinute: 10,
      messagesPerHour: 100
    },
    allowedDomains: []
  });

  // Load widget configuration
  const loadWidgetConfig = async () => {
    try {
      setLoading(true);
      
      // Use the proper widget endpoint from the guide
      const response = await fetch(`http://localhost:3000/widget/website/${websiteId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const stats = await widgetService.getWidgetStats(websiteId).catch(() => null);
        
        // Structure the data to match expected format
        setWebsiteData({
          website: { 
            _id: websiteId,
            url: data.widget?.config?.title || 'Website' 
          },
          widget: data.widget
        });
        setWidgetStats(stats);
        
        if (data.widget) {
          setConfig({
            isActive: data.widget.isActive,
            config: data.widget.config,
            rateLimits: data.widget.rateLimits,
            allowedDomains: data.widget.allowedDomains || []
          });
        }
      } else if (response.status === 404) {
        setError('Widget not found. The website may still be processing or widget creation failed.');
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error loading widget config:', err);
      setError('Failed to load widget configuration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (websiteId) {
      loadWidgetConfig();
    }
  }, [websiteId]);

  // Save widget configuration
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      // Use the proper PUT endpoint from the guide
      const response = await fetch(`http://localhost:3000/widget/website/${websiteId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        await loadWidgetConfig();
        alert('Widget configuration saved successfully!');
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      console.error('Error saving configuration:', err);
      alert(`Error saving configuration: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Regenerate API key
  const handleRegenerateApiKey = async () => {
    if (window.confirm('Are you sure you want to regenerate the API key? The old key will stop working immediately.')) {
      try {
        await widgetService.regenerateApiKey(websiteId);
        await loadWidgetConfig();
        alert('API key regenerated successfully!');
      } catch (err) {
        alert(`Error regenerating API key: ${err.message}`);
      }
    }
  };

  // Create widget for website
  const handleCreateWidget = async () => {
    try {
      setLoading(true);
      await widgetService.createWidget(websiteId);
      await loadWidgetConfig();
      alert('Widget created successfully!');
    } catch (err) {
      alert(`Error creating widget: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Test widget
  const handleTestWidget = async () => {
    try {
      const testMessage = { message: 'This is a test message from the configuration panel.' };
      await widgetService.testWidget(websiteId, testMessage);
      alert('Test message sent successfully!');
    } catch (err) {
      alert(`Error testing widget: ${err.message}`);
    }
  };

  // Add domain to allowed list
  const handleAddDomain = () => {
    const domain = prompt('Enter domain (e.g., example.com):');
    if (domain && domain.trim()) {
      setConfig(prev => ({
        ...prev,
        allowedDomains: [...prev.allowedDomains, domain.trim()]
      }));
    }
  };

  // Remove domain from allowed list
  const handleRemoveDomain = (index) => {
    setConfig(prev => ({
      ...prev,
      allowedDomains: prev.allowedDomains.filter((_, i) => i !== index)
    }));
  };

  // Generate embed code
  const generateEmbedCode = () => {
    // If we have embedCode from the API response, use it
    if (websiteData?.widget?.embedCode) {
      return websiteData.widget.embedCode;
    }
    
    // Fallback to manual generation if embedCode is not available
    if (!websiteData?.widget?.widgetId) return '';
    
    return `<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'http://localhost:3000/widget/${websiteData.widget.widgetId}/script.js';
    script.async = true;
    document.head.appendChild(script);
  })();
</script>`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] p-8 flex items-center justify-center">
        <div className="text-white text-center">
          <Spinner size="xl" />
          <p className="mt-4">Loading widget configuration...</p>
        </div>
      </div>
    );
  }

  if (error || !websiteData?.widget) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] p-8">
        <div className="max-w-4xl mx-auto">
          <Alert color="failure" className="mb-6">
            {error || 'Widget not found for this website.'}
          </Alert>
          <div className="space-y-4">
            <p className="text-white">
              It looks like a widget hasn't been created for this website yet. 
              Click the button below to create one automatically.
            </p>
            <div className="space-x-4">
              <Button 
                onClick={handleCreateWidget}
                className="bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? <Spinner size="sm" className="mr-2" /> : null}
                Create Widget
              </Button>
              <Button onClick={() => navigate(`/website/${websiteId}`)}>
                Back to Website
              </Button>
              <Button onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Button color="gray" onClick={() => navigate(`/website/${websiteId}`)} className="mb-4">
              ← Back to Website
            </Button>
            <h1 className="text-4xl font-bold text-white mb-2">
              Widget Configuration
            </h1>
            <p className="text-white/80">{websiteData.website.title || websiteData.website.url}</p>
          </div>
          <div className="text-right space-y-2">
            <div>
              <Badge color={config.isActive ? 'success' : 'gray'} size="lg">
                {config.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="space-x-2">
              <Button size="sm" onClick={handleTestWidget}>
                Test Widget
              </Button>
              <Button size="sm" color="purple" onClick={() => setShowPreview(true)}>
                Preview
              </Button>
            </div>
          </div>
        </div>

        {/* Custom Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-white/20">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('general')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'general'
                    ? 'border-white text-white'
                    : 'border-transparent text-white/60 hover:text-white hover:border-white/50'
                }`}
              >
                General Settings
              </button>
              <button
                onClick={() => setActiveTab('advanced')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'advanced'
                    ? 'border-white text-white'
                    : 'border-transparent text-white/60 hover:text-white hover:border-white/50'
                }`}
              >
                Advanced Settings
              </button>
              <button
                onClick={() => setActiveTab('integration')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'integration'
                    ? 'border-white text-white'
                    : 'border-transparent text-white/60 hover:text-white hover:border-white/50'
                }`}
              >
                Integration
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-white text-white'
                    : 'border-transparent text-white/60 hover:text-white hover:border-white/50'
                }`}
              >
                Analytics
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'general' && (
          <form onSubmit={handleSaveConfig}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Configuration */}
              <Card>
                <h3 className="text-xl font-semibold mb-4">Basic Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Widget Active</Label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={config.isActive}
                          onChange={(e) => setConfig(prev => ({ ...prev, isActive: e.target.checked }))}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div>
                      <Label htmlFor="title" value="Widget Title" />
                      <TextInput
                        id="title"
                        value={config.config.title}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          config: { ...prev.config, title: e.target.value }
                        }))}
                        placeholder="AI Assistant"
                      />
                    </div>

                    <div>
                      <Label htmlFor="subtitle" value="Subtitle" />
                      <TextInput
                        id="subtitle"
                        value={config.config.subtitle}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          config: { ...prev.config, subtitle: e.target.value }
                        }))}
                        placeholder="Ask me anything about this website"
                      />
                    </div>

                    <div>
                      <Label htmlFor="welcomeMessage" value="Welcome Message" />
                      <Textarea
                        id="welcomeMessage"
                        value={config.config.welcomeMessage}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          config: { ...prev.config, welcomeMessage: e.target.value }
                        }))}
                        placeholder="Hello! How can I help you today?"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="placeholder" value="Input Placeholder" />
                      <TextInput
                        id="placeholder"
                        value={config.config.placeholder}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          config: { ...prev.config, placeholder: e.target.value }
                        }))}
                        placeholder="Type your message..."
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Show Welcome Message</Label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={config.config.showWelcomeMessage}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            config: { ...prev.config, showWelcomeMessage: e.target.checked }
                          }))}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Allow Feedback</Label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={config.config.allowFeedback}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            config: { ...prev.config, allowFeedback: e.target.checked }
                          }))}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </Card>

                {/* Appearance Settings */}
                <Card>
                  <h3 className="text-xl font-semibold mb-4">Appearance</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="theme" value="Theme" />
                      <Select
                        id="theme"
                        value={config.config.theme}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          config: { ...prev.config, theme: e.target.value }
                        }))}
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="primaryColor" value="Primary Color" />
                      <div className="flex gap-2">
                        <TextInput
                          id="primaryColor"
                          type="color"
                          value={config.config.primaryColor}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            config: { ...prev.config, primaryColor: e.target.value }
                          }))}
                          className="w-16"
                        />
                        <TextInput
                          value={config.config.primaryColor}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            config: { ...prev.config, primaryColor: e.target.value }
                          }))}
                          placeholder="#007bff"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="position" value="Position" />
                      <Select
                        id="position"
                        value={config.config.position}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          config: { ...prev.config, position: e.target.value }
                        }))}
                      >
                        <option value="bottom-right">Bottom Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="top-right">Top Right</option>
                        <option value="top-left">Top Left</option>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="size" value="Size" />
                      <Select
                        id="size"
                        value={config.config.size}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          config: { ...prev.config, size: e.target.value }
                        }))}
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="avatar" value="Avatar URL (Optional)" />
                      <TextInput
                        id="avatar"
                        value={config.config.avatar}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          config: { ...prev.config, avatar: e.target.value }
                        }))}
                        placeholder="https://example.com/avatar.png"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Auto Open on Page Load</Label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={config.config.autoOpen}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            config: { ...prev.config, autoOpen: e.target.checked }
                          }))}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Show "Powered by NEXA"</Label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={config.config.showPoweredBy}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            config: { ...prev.config, showPoweredBy: e.target.checked }
                          }))}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="mt-8 flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? <Spinner size="sm" className="mr-2" /> : null}
                  Save Configuration
                </Button>
              </div>
            </form>
          )}

          {activeTab === 'advanced' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Rate Limits */}
              <Card>
                <h3 className="text-xl font-semibold mb-4">Rate Limits</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="messagesPerMinute" value="Messages per Minute" />
                    <TextInput
                      id="messagesPerMinute"
                      type="number"
                      min="1"
                      max="100"
                      value={config.rateLimits.messagesPerMinute}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        rateLimits: { ...prev.rateLimits, messagesPerMinute: parseInt(e.target.value) }
                      }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="messagesPerHour" value="Messages per Hour" />
                    <TextInput
                      id="messagesPerHour"
                      type="number"
                      min="10"
                      max="1000"
                      value={config.rateLimits.messagesPerHour}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        rateLimits: { ...prev.rateLimits, messagesPerHour: parseInt(e.target.value) }
                      }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxMessages" value="Max Messages per Session" />
                    <TextInput
                      id="maxMessages"
                      type="number"
                      min="5"
                      max="200"
                      value={config.config.maxMessages}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        config: { ...prev.config, maxMessages: parseInt(e.target.value) }
                      }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="sessionTimeout" value="Session Timeout (seconds)" />
                    <TextInput
                      id="sessionTimeout"
                      type="number"
                      min="300"
                      max="7200"
                      value={config.config.sessionTimeout}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        config: { ...prev.config, sessionTimeout: parseInt(e.target.value) }
                      }))}
                    />
                  </div>
                </div>
              </Card>

              {/* Domain Settings */}
              <Card>
                <h3 className="text-xl font-semibold mb-4">Allowed Domains</h3>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Restrict widget usage to specific domains. Leave empty to allow all domains.
                  </p>
                  
                  <div className="space-y-2">
                    {config.allowedDomains.map((domain, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="font-mono text-sm">{domain}</span>
                        <Button size="xs" color="failure" onClick={() => handleRemoveDomain(index)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button color="gray" onClick={handleAddDomain} className="w-full">
                    Add Domain
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'integration' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* API Key */}
              <Card>
                <h3 className="text-xl font-semibold mb-4">API Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <Label value="Widget API Key" />
                    <div className="flex gap-2">
                      <TextInput
                        value={websiteData.widget.apiKey || ''}
                        readOnly
                        className="flex-1 font-mono"
                      />
                      <Button color="gray" onClick={handleRegenerateApiKey}>
                        Regenerate
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Keep this key secure. It's used to authenticate widget requests.
                    </p>
                  </div>

                  <div>
                    <Label value="Widget ID" />
                    <TextInput
                      value={websiteData.widget.widgetId || 'default'}
                      readOnly
                      className="font-mono"
                    />
                  </div>
                </div>
              </Card>

              {/* Widget Script Tag */}
              <Card className="border-2 border-green-200 bg-green-50">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h3 className="text-xl font-semibold text-green-800">Your Widget Script Tag</h3>
                </div>
                <div className="space-y-4">
                  <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                    <p className="text-sm text-green-700 font-medium">
                      ✅ Your website has been successfully scraped and your AI chatbot widget is ready!
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      Copy the script tag below and paste it before the closing &lt;/body&gt; tag on your website to activate your AI assistant.
                    </p>
                  </div>
                  
                  <div className="relative">
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                      <code>{generateEmbedCode()}</code>
                    </pre>
                    <Button
                      size="xs"
                      className="absolute top-2 right-2 bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        navigator.clipboard.writeText(generateEmbedCode());
                        alert('Script tag copied to clipboard!');
                      }}
                    >
                      Copy Script
                    </Button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-700 font-medium">💡 Installation Instructions:</p>
                    <ol className="text-sm text-blue-600 mt-1 ml-4 list-decimal">
                      <li>Copy the script tag above</li>
                      <li>Paste it before the &lt;/body&gt; tag in your website's HTML</li>
                      <li>Save and refresh your website</li>
                      <li>Your AI chatbot widget will appear automatically!</li>
                    </ol>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'analytics' && (
            <Card>
              <h3 className="text-xl font-semibold mb-4">Widget Statistics</h3>
              {widgetStats ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{widgetStats.totalMessages || 0}</div>
                    <div className="text-sm text-gray-600">Total Messages</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{widgetStats.activeSessions || 0}</div>
                    <div className="text-sm text-gray-600">Active Sessions</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{widgetStats.avgResponseTime || 0}ms</div>
                    <div className="text-sm text-gray-600">Avg Response Time</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{widgetStats.satisfaction || 0}%</div>
                    <div className="text-sm text-gray-600">Satisfaction Rate</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No statistics available yet</p>
                  <p className="text-sm text-gray-500 mt-2">Statistics will appear once users start interacting with your widget</p>
                </div>
              )}
            </Card>
          )}

        {/* Preview Modal */}
        <Modal show={showPreview} onClose={() => setShowPreview(false)} size="xl">
          <Modal.Header>Widget Preview</Modal.Header>
          <Modal.Body>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Widget preview functionality coming soon!</p>
              <p className="text-sm text-gray-500">
                For now, you can test the widget directly on your website using the embedded code.
              </p>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default WidgetConfig;
