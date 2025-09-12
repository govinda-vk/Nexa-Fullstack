import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { crawlingService, userService } from '../utils/apiServices';
import LogoAnimation from './LogoAnimation.jsx';
import { 
  XMarkIcon,
  Bars3Icon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  EyeIcon,
  ChartBarIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const ScrapingPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Custom Button Component
  const Button = ({ children, onClick, color = 'black', className = '', size = 'md', loading = false, disabled = false, ...props }) => {
    const baseClasses = 'font-medium rounded-lg transition-all duration-200 flex items-center justify-center';
    
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };
    
    const colorClasses = {
      black: 'bg-black text-white hover:bg-gray-800 focus:ring-4 focus:ring-gray-300',
      gray: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-4 focus:ring-gray-300',
      red: 'bg-red-600 text-white hover:bg-red-700 focus:ring-4 focus:ring-red-300',
      green: 'bg-green-600 text-white hover:bg-green-700 focus:ring-4 focus:ring-green-300',
      blue: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300'
    };
    
    return (
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`${baseClasses} ${sizeClasses[size]} ${colorClasses[color]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        {...props}
      >
        {loading && <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />}
        {children}
      </button>
    );
  };

  // State for mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Performance Analytics Card Component (adapted to black/white theme)
  const PerformanceAnalyticsCard = () => {
    return (
      <div className="group relative flex w-full flex-col rounded-xl bg-black p-4 shadow-2xl transition-all">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-400 via-gray-600 to-gray-800 opacity-20 blur-sm transition-opacity duration-300 group-hover:opacity-30"></div>
        <div className="absolute inset-px rounded-[11px] bg-black"></div>

        <div className="relative">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-gray-700 to-black">
                <ChartBarIcon className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-white"><strong>Scraping Analytics</strong></h3>
            </div>

            <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
              <strong>Live</strong>
            </span>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-900/50 p-3">
              <p className="text-xs font-medium text-gray-400">Pages Found</p>
              <p className="text-lg font-semibold text-white">{scrapeStatus.totalPagesFound || '0'}</p>
              <span className="text-xs font-medium text-green-500">+{scrapeStatus.progress || 0}%</span>
            </div>

            <div className="rounded-lg bg-gray-900/50 p-3">
              <p className="text-xs font-medium text-gray-400">Processed</p>
              <p className="text-lg font-semibold text-white">{scrapeStatus.chunksProcessed || '0'}</p>
              <span className="text-xs font-medium text-green-500">+{Math.round((scrapeStatus.chunksProcessed / Math.max(scrapeStatus.pagesCrawled, 1)) * 100) || 0}%</span>
            </div>
          </div>

          <div className="mb-4 h-24 w-full overflow-hidden rounded-lg bg-gray-900/50 p-3">
            <div className="flex h-full w-full items-end justify-between gap-1">
              {[40, 60, 75, 45, 85, 65, 95].map((height, index) => (
                <div key={index} className={`h-[${height}%] w-3 rounded-sm bg-gray-600/30`}>
                  <div className={`h-[${Math.min(height + 20, 100)}%] w-full rounded-sm bg-white transition-all duration-300`}></div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-400">Current Phase</span>
              <span className="text-xs font-medium text-white">{scrapeStatus.currentPhase || 'Setup'}</span>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-gray-600 to-black px-3 py-1 text-xs font-medium text-white transition-all duration-300 hover:from-gray-700 hover:to-gray-900"
            >
              <strong>View Dashboard</strong>
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };
  
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
    currentPhase: null, // Backend phase: 'initializing', 'crawling', 'processing', 'completed', 'failed'
    phaseDescription: null,
    jobId: null,
    websiteId: null,
    progress: 0,
    pagesCrawled: 0,
    chunksProcessed: 0,
    totalPagesFound: 0,
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

  // Map backend phase names to frontend phase names
  const mapBackendPhaseToFrontend = (backendPhase, status) => {
    if (status === 'completed') return 'completed';
    if (status === 'failed' || backendPhase === 'failed') return 'error';
    
    switch (backendPhase) {
      case 'initializing': return 'scraping';
      case 'crawling': return 'scraping';
      case 'processing': return 'scraping';
      case 'completed': return 'completed';
      case 'failed': return 'error';
      default: return 'scraping';
    }
  };

  // Get emoji for backend phase
  const getPhaseEmoji = (backendPhase) => {
    switch (backendPhase) {
      case 'initializing': return '🚀';
      case 'crawling': return '🔍';
      case 'processing': return '⚙️';
      case 'completed': return '🎉';
      case 'failed': return '❌';
      default: return '📊';
    }
  };

  // Get detailed phase description for display
  const getDetailedPhaseInfo = () => {
    const { currentPhase, phaseDescription, progress } = scrapeStatus;
    
    if (!currentPhase) return { title: 'Processing...', description: 'Please wait...' };
    
    switch (currentPhase) {
      case 'initializing':
        return {
          title: 'Initializing',
          description: phaseDescription || 'Preparing to crawl website...',
          emoji: '🚀',
          color: 'blue'
        };
      case 'crawling':
        return {
          title: 'Crawling',
          description: phaseDescription || 'Discovering and crawling website pages...',
          emoji: '🔍',
          color: 'indigo'
        };
      case 'processing':
        return {
          title: 'Processing',
          description: phaseDescription || 'Processing content and creating embeddings...',
          emoji: '⚙️',
          color: 'purple'
        };
      case 'completed':
        return {
          title: 'Completed',
          description: 'All tasks completed successfully!',
          emoji: '🎉',
          color: 'green'
        };
      case 'failed':
        return {
          title: 'Failed',
          description: 'Job encountered an error and failed',
          emoji: '❌',
          color: 'red'
        };
      default:
        return {
          title: 'Processing',
          description: 'Working on your website...',
          emoji: '📊',
          color: 'blue'
        };
    }
  };

  const startScraping = async () => {
    if (!websiteUrl.trim()) {
      addLog('Please enter a valid website URL', 'error');
      return;
    }

    setLoading(true);
    setScrapeStatus(prev => ({ 
      ...prev, 
      phase: 'scraping', 
      currentPhase: 'initializing',
      phaseDescription: 'Preparing to crawl website...',
      progress: 0 
    }));
    addLog('🚀 Starting website scraping process...', 'info');

    try {
      // Step 1: Start the crawl using the backend API
      addLog(`🔗 Initiating crawl for: ${websiteUrl}`, 'info');
      
      const crawlResponse = await crawlingService.startCrawl({
        websiteUrl: websiteUrl  // Backend expects 'websiteUrl' not 'url'
        // User email will be extracted from JWT token on backend
        // All other settings will use backend defaults
      });

      addLog('✅ Crawl job started successfully!', 'success');
      
      setScrapeStatus(prev => ({
        ...prev,
        jobId: crawlResponse.jobId,
        websiteId: crawlResponse.websiteId,
        currentPhase: 'initializing',
        progress: 5
      }));

      // Step 2: Monitor the job status
      addLog('📊 Monitoring crawl progress...', 'info');
      monitorCrawlProgress(crawlResponse.jobId);

    } catch (error) {
      console.error('Error starting crawl:', error);
      addLog(`❌ Error starting crawl: ${error.message}`, 'error');
      setScrapeStatus(prev => ({ 
        ...prev, 
        phase: 'error',
        currentPhase: 'failed',
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
        
        // Enhanced logging with phase information
        const phaseEmoji = getPhaseEmoji(statusResponse.phase);
        const currentProgress = statusResponse.progress !== undefined ? statusResponse.progress : scrapeStatus.progress;
        addLog(`${phaseEmoji} ${statusResponse.phaseDescription || statusResponse.message} - ${currentProgress}%`, 'info');
        
        console.log('Progress Update:', {
          phase: statusResponse.phase,
          progress: statusResponse.progress,
          currentProgress,
          status: statusResponse.status
        });
        
        setScrapeStatus(prev => ({
          ...prev,
          progress: statusResponse.progress !== undefined ? statusResponse.progress : prev.progress,
          phase: mapBackendPhaseToFrontend(statusResponse.phase, statusResponse.status),
          currentPhase: statusResponse.phase,
          phaseDescription: statusResponse.phaseDescription,
          pagesCrawled: statusResponse.result?.pagesIngested || statusResponse.pagesCrawled || prev.pagesCrawled || 0,
          chunksProcessed: statusResponse.result?.chunksProcessed || statusResponse.chunksProcessed || prev.chunksProcessed || 0,
          totalPagesFound: statusResponse.result?.crawlStats?.pagesFound || prev.totalPagesFound || 0
        }));

        if (statusResponse.status === 'completed') {
          addLog('🎉 Website scraping completed successfully!', 'success');
          addLog('🤖 AI widget is being auto-generated for your website...', 'info');
          setScrapeStatus(prev => ({ 
            ...prev, 
            phase: 'completed',
            currentPhase: 'completed',
            progress: 100,
            websiteId: statusResponse.result?.websiteId || prev.websiteId
          }));
          setLoading(false);
          
          // Redirect to dashboard or website details
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
          
        } else if (statusResponse.status === 'failed' || statusResponse.phase === 'failed') {
          addLog(`❌ Scraping failed: ${statusResponse.message || statusResponse.error || 'Unknown error'}`, 'error');
          setScrapeStatus(prev => ({ 
            ...prev, 
            phase: 'error',
            currentPhase: 'failed',
            error: statusResponse.message || statusResponse.error || 'Scraping failed'
          }));
          setLoading(false);
          
        } else if (attempts >= maxAttempts) {
          addLog('⏰ Scraping timeout - taking longer than expected', 'error');
          setScrapeStatus(prev => ({ 
            ...prev, 
            phase: 'error', 
            currentPhase: 'timeout',
            error: 'Timeout - scraping is taking too long'
          }));
          setLoading(false);
          
        } else {
          // Continue polling
          setTimeout(pollStatus, pollInterval);
        }
      } catch (error) {
        console.error('Error checking job status:', error);
        addLog(`❌ Error checking progress: ${error.message}`, 'error');
        
        if (attempts >= 3) { // Stop after 3 consecutive errors
          setScrapeStatus(prev => ({ 
            ...prev, 
            phase: 'error', 
            currentPhase: 'error',
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
    if (scrapeStatus.currentPhase) {
      return getDetailedPhaseInfo().emoji;
    }
    
    switch (scrapeStatus.phase) {
      case 'setup': return '⚙️';
      case 'scraping': return '�';
      case 'completed': return '✅';
      case 'error': return '❌';
      default: return '⚙️';
    }
  };

  const getPhaseTitle = () => {
    if (scrapeStatus.currentPhase && scrapeStatus.phase === 'scraping') {
      const phaseInfo = getDetailedPhaseInfo();
      return `${phaseInfo.title} - ${phaseInfo.description}`;
    }
    
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="animate-spin h-8 w-8 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
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
                    // logout(); // Uncomment when logout function is available
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
                    // logout(); // Uncomment when logout function is available
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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black mb-4">
            {getPhaseIcon()} {getPhaseTitle()}
          </h1>
          <p className="text-gray-600">
            Welcome back, <strong>{user?.name || user?.email}</strong>! Let's scrape your website and build your AI assistant.
          </p>
        </div>

        {/* Analytics Card */}
        <div className="mb-8 max-w-sm mx-auto">
          <PerformanceAnalyticsCard />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold text-black mb-4"><strong>Website Configuration</strong></h3>
              
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
                    className="flex-1"
                    loading={loading}
                  >
                    Start Scraping
                  </Button>
                )}
                
                {scrapeStatus.phase === 'completed' && (
                  <div className="flex gap-2 flex-1">
                    <Button 
                      onClick={() => navigate(`/widget/${scrapeStatus.websiteId}/config`)}
                      className="flex-1"
                      color="blue"
                    >
                      Next: Configure Widget
                    </Button>
                    <Button 
                      onClick={() => navigate('/dashboard')} 
                      color="gray"
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
                        phase: 'setup', 
                        currentPhase: null,
                        phaseDescription: null,
                        jobId: null, 
                        websiteId: null, 
                        progress: 0, 
                        pagesCrawled: 0, 
                        chunksProcessed: 0,
                        totalPagesFound: 0,
                        error: null, 
                        logs: [] 
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
            </div>
          </div>

          {/* Status Panel */}
          <div>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold text-black mb-4"><strong>Scraping Status</strong></h3>
              
              {/* Current Phase Display */}
              {(scrapeStatus.phase === 'scraping' || scrapeStatus.phase === 'completed') && scrapeStatus.currentPhase && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getDetailedPhaseInfo().emoji}</span>
                      <span className="font-medium text-gray-700"><strong>{getDetailedPhaseInfo().title}</strong></span>
                    </div>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                      getDetailedPhaseInfo().color === 'blue' ? 'bg-blue-100 text-blue-800' :
                      getDetailedPhaseInfo().color === 'indigo' ? 'bg-indigo-100 text-indigo-800' :
                      getDetailedPhaseInfo().color === 'purple' ? 'bg-purple-100 text-purple-800' :
                      getDetailedPhaseInfo().color === 'green' ? 'bg-green-100 text-green-800' :
                      getDetailedPhaseInfo().color === 'red' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      <strong>{scrapeStatus.currentPhase}</strong>
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {getDetailedPhaseInfo().description}
                  </p>
                </div>
              )}

              {/* Progress Bar */}
              {(scrapeStatus.phase === 'scraping' || scrapeStatus.phase === 'completed') && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700"><strong>Progress</strong></span>
                    <span className="text-gray-700"><strong>{scrapeStatus.progress || 0}%</strong></span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-black h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${scrapeStatus.progress || 0}%` }}
                    ></div>
                  </div>
                  {/* Progress Phase Indicator */}
                  <div className="flex justify-between text-xs text-gray-500">
                    <span className={(scrapeStatus.progress || 0) >= 5 ? 'text-blue-600 font-medium' : ''}>
                      🚀 Initialize
                    </span>
                    <span className={(scrapeStatus.progress || 0) >= 40 ? 'text-indigo-600 font-medium' : ''}>
                      🔍 Crawl
                    </span>
                    <span className={(scrapeStatus.progress || 0) >= 100 ? 'text-green-600 font-medium' : ''}>
                      ⚙️ Process
                    </span>
                  </div>
                </div>
              )}

              {/* Enhanced Statistics */}
              {(scrapeStatus.pagesCrawled > 0 || scrapeStatus.chunksProcessed > 0 || scrapeStatus.totalPagesFound > 0) && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {scrapeStatus.totalPagesFound > 0 && (
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{scrapeStatus.totalPagesFound}</div>
                      <div className="text-xs text-blue-600">Found</div>
                    </div>
                  )}
                  {scrapeStatus.pagesCrawled > 0 && (
                    <div className="text-center p-2 bg-indigo-50 rounded-lg">
                      <div className="text-lg font-bold text-indigo-600">{scrapeStatus.pagesCrawled}</div>
                      <div className="text-xs text-indigo-600">Crawled</div>
                    </div>
                  )}
                  {scrapeStatus.chunksProcessed > 0 && (
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{scrapeStatus.chunksProcessed}</div>
                      <div className="text-xs text-green-600">Chunks</div>
                    </div>
                  )}
                </div>
              )}

              {/* Error Display */}
              {scrapeStatus.error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                    <strong className="text-red-800">Error:</strong>
                  </div>
                  <p className="text-red-700 mt-1">{scrapeStatus.error}</p>
                </div>
              )}

              {/* Activity Logs */}
              <div>
                <h4 className="font-medium text-black mb-2"><strong>Activity Log</strong></h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {scrapeStatus.logs.length > 0 ? (
                    scrapeStatus.logs.slice(-10).reverse().map((log, index) => (
                      <div 
                        key={index} 
                        className={`text-xs p-2 rounded-lg ${
                          log.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                          log.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                          'bg-gray-50 text-gray-700 border border-gray-200'
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrapingPage;
