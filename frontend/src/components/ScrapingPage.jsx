import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Button, Alert, Spinner, Badge, Progress } from "flowbite-react";
import { useAuth } from '../contexts/AuthContext';
import { crawlingService, userService } from '../utils/apiServices';

const ScrapingPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [scrapeData, setScrapeData] = useState({
    title: '',
    description: '',
    maxPages: 50,
    respectRobots: true,
    includeImages: false,
    excludePatterns: [],
    waitTime: 1000
  });
  
  const [scrapeStatus, setScrapeStatus] = useState({
    phase: 'setup', // 'setup', 'scraping', 'completed', 'error'
    jobId: null,
    websiteId: null,
    progress: 0,
    pagesCrawled: 0,
    chunksProcessed: 0,
    error: null,
    logs: []
  });
  
  const [loading, setLoading] = useState(false);

  // Get URL from navigation state or URL params
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Get URL from navigation state or URL params
    const savedUrl = location.state?.websiteUrl || 
                    new URLSearchParams(location.search).get('url') || 
                    localStorage.getItem('pendingScrapeUrl');
    
    if (savedUrl) {
      setWebsiteUrl(savedUrl);
      setScrapeData(prev => ({ ...prev, title: extractTitleFromUrl(savedUrl) }));
      localStorage.removeItem('pendingScrapeUrl'); // Clean up
    }
  }, [isAuthenticated, location, navigate]);

  const extractTitleFromUrl = (url) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    } catch {
      return 'Website';
    }
  };

  const addLog = (message, type = 'info') => {
    setScrapeStatus(prev => ({
      ...prev,
      logs: [...prev.logs, { 
        message, 
        type, 
        timestamp: new Date().toISOString() 
      }]
    }));
  };

  const startScraping = async () => {
    if (!websiteUrl.trim()) {
      addLog('Please enter a valid website URL', 'error');
      return;
    }

    setLoading(true);
    setScrapeStatus(prev => ({ ...prev, phase: 'scraping', progress: 0 }));
    addLog('Starting website scraping process...', 'info');

    try {
      // Step 1: Start the crawl using the backend API
      addLog(`Initiating crawl for: ${websiteUrl}`, 'info');
      
      const crawlResponse = await crawlingService.startCrawl({
        websiteUrl: websiteUrl  // Backend expects 'websiteUrl' not 'url'
        // User email will be extracted from JWT token on backend
        // All other settings will use backend defaults
      });

      addLog('Crawl job started successfully!', 'success');
      
      setScrapeStatus(prev => ({
        ...prev,
        jobId: crawlResponse.jobId,
        websiteId: crawlResponse.websiteId,
        progress: 10
      }));

      // Step 2: Monitor the job status
      addLog('Monitoring crawl progress...', 'info');
      monitorCrawlProgress(crawlResponse.jobId);

    } catch (error) {
      console.error('Error starting crawl:', error);
      addLog(`Error starting crawl: ${error.message}`, 'error');
      setScrapeStatus(prev => ({ 
        ...prev, 
        phase: 'error', 
        error: error.message 
      }));
      setLoading(false);
    }
  };

  const monitorCrawlProgress = async (jobId) => {
    const pollInterval = 2000; // Poll every 2 seconds
    let attempts = 0;
    const maxAttempts = 150; // 5 minutes max (150 * 2 seconds)

    const pollStatus = async () => {
      try {
        attempts++;
        const statusResponse = await crawlingService.getJobStatus(jobId);
        
        addLog(`Job status: ${statusResponse.status} - Progress: ${statusResponse.progress}%`, 'info');
        
        setScrapeStatus(prev => ({
          ...prev,
          progress: statusResponse.progress || 0,
          pagesCrawled: statusResponse.pagesCrawled || 0,
          chunksProcessed: statusResponse.chunksProcessed || 0
        }));

        if (statusResponse.status === 'completed') {
          addLog('Website scraping completed successfully!', 'success');
          addLog('AI widget is being auto-generated for your website...', 'info');
          setScrapeStatus(prev => ({ 
            ...prev, 
            phase: 'completed',
            progress: 100
          }));
          setLoading(false);
          
          // Redirect to dashboard or website details
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
          
        } else if (statusResponse.status === 'failed' || statusResponse.status === 'error') {
          addLog(`Scraping failed: ${statusResponse.error || 'Unknown error'}`, 'error');
          setScrapeStatus(prev => ({ 
            ...prev, 
            phase: 'error', 
            error: statusResponse.error || 'Scraping failed'
          }));
          setLoading(false);
          
        } else if (attempts >= maxAttempts) {
          addLog('Scraping timeout - taking longer than expected', 'error');
          setScrapeStatus(prev => ({ 
            ...prev, 
            phase: 'error', 
            error: 'Timeout - scraping is taking too long'
          }));
          setLoading(false);
          
        } else {
          // Continue polling
          setTimeout(pollStatus, pollInterval);
        }
      } catch (error) {
        console.error('Error checking job status:', error);
        addLog(`Error checking progress: ${error.message}`, 'error');
        
        if (attempts >= 3) { // Stop after 3 consecutive errors
          setScrapeStatus(prev => ({ 
            ...prev, 
            phase: 'error', 
            error: 'Failed to monitor scraping progress'
          }));
          setLoading(false);
        } else {
          setTimeout(pollStatus, pollInterval * 2); // Retry with longer interval
        }
      }
    };

    pollStatus();
  };

  const handleInputChange = (field, value) => {
    setScrapeData(prev => ({ ...prev, [field]: value }));
  };

  const addExcludePattern = () => {
    const pattern = prompt('Enter URL pattern to exclude (e.g., /admin/, /private/):');
    if (pattern && pattern.trim()) {
      setScrapeData(prev => ({
        ...prev,
        excludePatterns: [...prev.excludePatterns, pattern.trim()]
      }));
    }
  };

  const removeExcludePattern = (index) => {
    setScrapeData(prev => ({
      ...prev,
      excludePatterns: prev.excludePatterns.filter((_, i) => i !== index)
    }));
  };

  const getPhaseIcon = () => {
    switch (scrapeStatus.phase) {
      case 'setup': return '⚙️';
      case 'scraping': return '🕷️';
      case 'completed': return '✅';
      case 'error': return '❌';
      default: return '⚙️';
    }
  };

  const getPhaseTitle = () => {
    switch (scrapeStatus.phase) {
      case 'setup': return 'Setup Website Scraping';
      case 'scraping': return 'Scraping in Progress';
      case 'completed': return 'Scraping Complete - Widget Auto-Generated';
      case 'error': return 'Scraping Failed';
      default: return 'Setup Website Scraping';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] p-8 flex items-center justify-center">
        <div className="text-white text-center">
          <Spinner size="xl" />
          <p className="mt-4">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            {getPhaseIcon()} {getPhaseTitle()}
          </h1>
          <p className="text-white/80">
            Welcome back, {user?.name || user?.email}! Let's scrape your website and build your AI assistant.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-2">
            <Card>
              <h3 className="text-xl font-semibold mb-4">Website Configuration</h3>
              
              {/* Information Alert */}
              <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <strong>Quick Setup:</strong> Just enter your website URL below. Our system will automatically handle all crawling settings and optimization for the best results.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Website URL */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Website URL *</label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={scrapeStatus.phase === 'scraping'}
                />
              </div>

              {/* Website Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Website Title (Optional)</label>
                <input
                  type="text"
                  value={scrapeData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="My Website"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={scrapeStatus.phase === 'scraping'}
                />
                <p className="text-xs text-gray-500 mt-1">This is for your reference only and won't affect the crawling process.</p>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                <textarea
                  value={scrapeData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of your website..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={scrapeStatus.phase === 'scraping'}
                />
                <p className="text-xs text-gray-500 mt-1">This is for your reference only and won't affect the crawling process.</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                {scrapeStatus.phase === 'setup' && (
                  <Button 
                    onClick={startScraping}
                    disabled={!websiteUrl.trim() || loading}
                    className="flex-1 bg-slate-800 p-4 rounded-lg"
                  >
                    {loading ? <Spinner size="sm" className="mr-2" /> : null}
                    Start Scraping
                  </Button>
                )}
                
                {scrapeStatus.phase === 'completed' && (
                  <div className="flex gap-2 flex-1">
                    <Button 
                      onClick={() => navigate(`/widget/${scrapeStatus.websiteId}/config`)}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      Next: Configure Widget
                    </Button>
                    <Button 
                      onClick={() => navigate('/dashboard')} 
                      variant="outline"
                      className="flex-1"
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                )}
                
                {scrapeStatus.phase === 'error' && (
                  <Button 
                    onClick={() => {
                      setScrapeStatus({ 
                        phase: 'setup', jobId: null, websiteId: null, 
                        progress: 0, pagesCrawled: 0, chunksProcessed: 0, 
                        error: null, logs: [] 
                      });
                      setLoading(false);
                    }}
                    className="flex-1"
                  >
                    Try Again
                  </Button>
                )}
                
                <Button color="gray" onClick={() => navigate('/dashboard')}>
                  Back to Dashboard
                </Button>
              </div>
            </Card>
          </div>

          {/* Status Panel */}
          <div>
            <Card>
              <h3 className="text-xl font-semibold mb-4">Scraping Status</h3>
              
              {/* Progress Bar */}
              {scrapeStatus.phase === 'scraping' && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{scrapeStatus.progress}%</span>
                  </div>
                  <Progress progress={scrapeStatus.progress} color="blue" />
                </div>
              )}

              {/* Statistics */}
              {(scrapeStatus.pagesCrawled > 0 || scrapeStatus.chunksProcessed > 0) && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{scrapeStatus.pagesCrawled}</div>
                    <div className="text-sm text-blue-600">Pages</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{scrapeStatus.chunksProcessed}</div>
                    <div className="text-sm text-green-600">Chunks</div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {scrapeStatus.error && (
                <Alert color="failure" className="mb-4">
                  <strong>Error:</strong> {scrapeStatus.error}
                </Alert>
              )}

              {/* Activity Logs */}
              <div>
                <h4 className="font-medium mb-2">Activity Log</h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {scrapeStatus.logs.length > 0 ? (
                    scrapeStatus.logs.slice(-10).reverse().map((log, index) => (
                      <div 
                        key={index} 
                        className={`text-xs p-2 rounded-lg ${
                          log.type === 'error' ? 'bg-red-50 text-red-700' :
                          log.type === 'success' ? 'bg-green-50 text-green-700' :
                          'bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="font-medium">{log.message}</div>
                        <div className="text-xs opacity-75">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No activity yet</p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrapingPage;
