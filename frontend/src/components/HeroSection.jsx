import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CashflowSupplyChain from './CashflowSupplyChain';
import CashflowCard from './cashFLow';
const HeroSection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [currentPhase, setCurrentPhase] = useState('input'); // 'input', 'loading', 'options', 'site-loading', 'embedded-setup', 'cashflow-management', 'signup', 'get-code'
  const [selectedOption, setSelectedOption] = useState('');

  // Check URL params for direct navigation
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const option = params.get('option');
    if (option) {
      setCurrentPhase('options');
      setTimeout(() => handleOptionSelect(option), 100);
    }
  }, [location]);

  const handleTryNEXA = () => {
    if (!websiteUrl.trim()) {
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      // Save the URL for after login and redirect to login
      console.log('User not authenticated, saving URL and redirecting to login:', websiteUrl.trim());
      localStorage.setItem('pendingScrapeUrl', websiteUrl.trim());
      navigate('/login', { 
        state: { 
          redirectAfterLogin: '/scraping',
          websiteUrl: websiteUrl.trim(),
          message: 'Please log in to start scraping your website'
        }
      });
      return;
    }

    // User is authenticated, proceed directly to scraping
    console.log('User authenticated, starting scraping for:', websiteUrl);
    navigate('/scraping', { 
      state: { 
        websiteUrl: websiteUrl.trim() 
      }
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleTryNEXA();
    }
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    console.log('Selected option:', option);
    
    // Check authentication before proceeding with any option
    if (!isAuthenticated) {
      localStorage.setItem('pendingScrapeUrl', websiteUrl.trim());
      navigate('/login', { 
        state: { 
          redirectAfterLogin: '/scraping',
          websiteUrl: websiteUrl.trim(),
          selectedOption: option,
          message: 'Please log in to continue with your website setup'
        }
      });
      return;
    }
    
    if (option === 'embedded-chatbot') {
      // Authenticated user - go directly to scraping page
      navigate('/scraping', { 
        state: { 
          websiteUrl: websiteUrl.trim(),
          selectedOption: option
        }
      });
    } else if (option === 'cashflow-management') {
      // Go directly to cashflow management
      setCurrentPhase('cashflow-management');
    }
  };

  const resetToInput = () => {
    setCurrentPhase('input');
    setWebsiteUrl('');
    setSelectedOption('');
  };

  // Render different content based on current phase
  const renderContent = () => {
    switch (currentPhase) {
      case 'input':
        return (
          <>
            {/* Left Content */}
            <div className="text-white">
              <p className="mb-4 text-xl font-semibold text-white/90">
                <strong className="text-2xl text-white">Got a Question? AskIt.</strong> 
              </p>
              
              <h1 className="mb-6 text-5xl font-extrabold leading-tight lg:text-6xl">
                AI Chatbot for your site
              </h1>
              
              <p className="mb-10 text-xl leading-relaxed text-white/90">
                NEXA AI chatbot instantly learns from your website and uses that knowledge to answer visitor questions — automatically.
              </p>
              
              <div className="flex flex-col gap-6">
                <div className="relative w-full">
                  {/* Brutalist Input with peer for label interaction */}
                  <input
                    placeholder="www.yourwebsite.com"
                    className="peer brutalist-input w-full rounded-none border-4 border-black bg-white p-4 text-lg font-bold text-black shadow-brutalist transition-all duration-300 placeholder:text-gray-500 focus:outline-none focus:placeholder:text-transparent"
                    type="text"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <label
                    className="absolute -left-1 -top-8 z-10 -rotate-1 bg-black px-2.5 py-1.5 text-sm font-bold text-white transition-all duration-300 peer-focus:rotate-0 peer-focus:scale-105 peer-focus:bg-[#4a90e2]"
                  >
                    YOUR WEBSITE
                  </label>
                </div>
                
                <button
                  onClick={handleTryNEXA}
                  className="w-full border-4 border-black bg-[#4f46e5] p-5 font-mono text-lg font-semibold text-white shadow-brutalist transition-colors duration-200 hover:bg-[#4338ca]"
                >
                  Try NEXA on your website
                </button>
              </div>
              
              <p className="mt-6 text-center text-base text-white/80">
                It's free. No credit card required.
              </p>
            </div>
            <CashflowCard/>
          </>
        );

      case 'loading':
        return (
          <div className="col-span-2 text-center text-white">
            <h2 className="mb-8 text-4xl font-bold">Analyzing your website...</h2>
            <div className="mb-6 text-xl text-white/80">
              Processing: {websiteUrl}
            </div>
            {/* Placeholder for loading animation - you can add your animation here */}
            <div className="flex items-center justify-center">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
            </div>
            <p className="mt-6 text-lg text-white/70">
              This may take a few moments while we analyze your content...
            </p>
          </div>
        );

      case 'options':
        return (
          <div className="col-span-2 text-center text-white">
            <h2 className="mb-4 text-4xl font-bold">Choose Your Solution</h2>
            <p className="mb-8 text-xl text-white/80">
              Website analyzed successfully! Select the option that best fits your needs:
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Embedded Chatbot Option */}
              <div 
                onClick={() => handleOptionSelect('embedded-chatbot')}
                className="cursor-pointer transform transition-all duration-300 hover:scale-105"
              >
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 h-full shadow-2xl hover:bg-white/20">
                  <div className="text-6xl mb-4">🤖</div>
                  <h3 className="text-2xl font-bold mb-4">Embedded Chatbot</h3>
                  <p className="text-white/80 text-lg leading-relaxed mb-6">
                    Add an intelligent chatbot directly to your website. Instantly answer visitor questions using your site's content.
                  </p>
                  <div className="text-sm text-white/60 space-y-2">
                    <div>✓ Easy one-line integration</div>
                    <div>✓ Learns from your website</div>
                    <div>✓ 24/7 customer support</div>
                    <div>✓ No training required</div>
                  </div>
                </div>
              </div>

              {/* Cashflow/Supply Chain Management Option */}
              <div 
                onClick={() => handleOptionSelect('cashflow-management')}
                className="cursor-pointer transform transition-all duration-300 hover:scale-105"
              >
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 h-full shadow-2xl hover:bg-white/20">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-2xl font-bold mb-4">Cashflow / Supply Chain</h3>
                  <p className="text-white/80 text-lg leading-relaxed mb-6">
                    Advanced business intelligence for managing your cashflow and supply chain operations with AI insights.
                  </p>
                  <div className="text-sm text-white/60 space-y-2">
                    <div>✓ Real-time analytics</div>
                    <div>✓ Predictive insights</div>
                    <div>✓ Automated reporting</div>
                    <div>✓ Risk management</div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={resetToInput}
              className="mt-8 border-2 border-white/50 bg-transparent px-6 py-3 text-white hover:bg-white/10 transition-colors duration-200"
            >
              ← Back to URL Input
            </button>
          </div>
        );

      case 'site-loading':
        return (
          <div className="col-span-2 text-center text-white">
            <h2 className="mb-8 text-4xl font-bold">Analyzing your website for chatbot integration...</h2>
            <div className="mb-6 text-xl text-white/80">
              Processing: {websiteUrl}
            </div>
            <div className="flex items-center justify-center mb-6">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
            </div>
            <div className="text-lg text-white/70 space-y-3">
              <p>🔍 Scanning website content...</p>
              <p>🤖 Configuring AI chatbot...</p>
              <p>⚙️ Setting up integration...</p>
            </div>
          </div>
        );

      case 'embedded-setup':
        return (
          <div className="col-span-2 w-full">
            {/* New Navbar with URL */}
            <div className="bg-black text-white p-4 rounded-lg mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 bg-gray-800 px-3 py-1 rounded">
                  <span className="text-gray-400">🌐</span>
                  <span className="text-white">{websiteUrl}</span>
                </div>
                <button 
                  onClick={resetToInput}
                  className="text-gray-400 hover:text-white"
                >
                  ← Back
                </button>
              </div>
            </div>

            {/* Progress Bar with Three Steps */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between relative">
                {/* Progress Line */}
                <div className="absolute top-6 left-0 right-0 h-1 bg-gray-600 rounded">
                  <div className="h-full bg-blue-500 rounded w-1/3 transition-all duration-500"></div>
                </div>
                
                {/* Step 1: Preview */}
                <div className="flex flex-col items-center z-10">
                  <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mb-2">
                    1
                  </div>
                  <span className="text-white font-medium">Preview</span>
                </div>
                
                {/* Step 2: Sign Up */}
                <div className="flex flex-col items-center z-10">
                  <div className="w-12 h-12 bg-gray-500 text-white rounded-full flex items-center justify-center font-bold mb-2">
                    2
                  </div>
                  <span className="text-gray-300">Sign Up</span>
                </div>
                
                {/* Step 3: Get Your Code */}
                <div className="flex flex-col items-center z-10">
                  <div className="w-12 h-12 bg-gray-500 text-white rounded-full flex items-center justify-center font-bold mb-2">
                    3
                  </div>
                  <span className="text-gray-300">Get Your Code</span>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Preview Your Chatbot</h3>
              <p className="text-white/80 mb-6">
                Here's how your NEXA AI chatbot will appear on your website. You can customize the appearance and behavior before proceeding.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Preview Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Chatbot Preview</h4>
                  <div className="bg-white rounded-lg p-4 h-64 flex items-center justify-center">
                    <div className="text-gray-800 text-center">
                      <div className="text-2xl mb-2">🤖</div>
                      <p>NEXA AI Chatbot</p>
                      <p className="text-sm text-gray-600">Ready to help your visitors</p>
                    </div>
                  </div>
                </div>
                
                {/* Configuration Options */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Customization Options</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-white/10 p-3 rounded">
                      <span>Chatbot Position</span>
                      <select className="bg-gray-800 text-white px-3 py-1 rounded">
                        <option>Bottom Right</option>
                        <option>Bottom Left</option>
                        <option>Top Right</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between bg-white/10 p-3 rounded">
                      <span>Theme Color</span>
                      <input type="color" value="#4f46e5" className="w-8 h-8 rounded" />
                    </div>
                    <div className="flex items-center justify-between bg-white/10 p-3 rounded">
                      <span>Welcome Message</span>
                      <input 
                        type="text" 
                        placeholder="Hello! How can I help?" 
                        className="bg-gray-800 text-white px-3 py-1 rounded flex-1 ml-3"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4 mt-8">
                <button 
                  onClick={() => setCurrentPhase('signup')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Continue to Sign Up →
                </button>
                <button 
                  onClick={() => setCurrentPhase('options')}
                  className="border border-white/50 text-white px-6 py-3 rounded-lg hover:bg-white/10 transition-colors"
                >
                  ← Back to Options
                </button>
              </div>
            </div>
          </div>
        );

      case 'signup':
        return (
          <div className="col-span-2 w-full">
            {/* Navbar with URL */}
            <div className="bg-black text-white p-4 rounded-lg mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 bg-gray-800 px-3 py-1 rounded">
                  <span className="text-gray-400">🌐</span>
                  <span className="text-white">{websiteUrl}</span>
                </div>
                <button 
                  onClick={() => setCurrentPhase('embedded-setup')}
                  className="text-gray-400 hover:text-white"
                >
                  ← Back
                </button>
              </div>
            </div>

            {/* Progress Bar - Step 2 Active */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between relative">
                <div className="absolute top-6 left-0 right-0 h-1 bg-gray-600 rounded">
                  <div className="h-full bg-blue-500 rounded w-2/3 transition-all duration-500"></div>
                </div>
                
                <div className="flex flex-col items-center z-10">
                  <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center font-bold mb-2">
                    ✓
                  </div>
                  <span className="text-green-300 font-medium">Preview</span>
                </div>
                
                <div className="flex flex-col items-center z-10">
                  <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mb-2">
                    2
                  </div>
                  <span className="text-white font-medium">Sign Up</span>
                </div>
                
                <div className="flex flex-col items-center z-10">
                  <div className="w-12 h-12 bg-gray-500 text-white rounded-full flex items-center justify-center font-bold mb-2">
                    3
                  </div>
                  <span className="text-gray-300">Get Your Code</span>
                </div>
              </div>
            </div>

            {/* Sign Up Form */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Create Your NEXA AI Account</h3>
              <p className="text-white/80 mb-6">
                Sign up to get your chatbot embed code and start helping your website visitors.
              </p>

              <div className="flex justify-center space-x-4 mt-8">
                <button 
                  onClick={() => navigate('/signup')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold transition-colors text-lg"
                >
                  Create Account →
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className="border border-white/50 text-white px-8 py-4 rounded-lg hover:bg-white/10 transition-colors text-lg"
                >
                  Already have an account? Sign In
                </button>
              </div>
            </div>
          </div>
        );

      case 'get-code':
        return (
          <div className="col-span-2 w-full">
            {/* Navbar with URL */}
            <div className="bg-black text-white p-4 rounded-lg mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 bg-gray-800 px-3 py-1 rounded">
                  <span className="text-gray-400">🌐</span>
                  <span className="text-white">{websiteUrl}</span>
                </div>
                <button 
                  onClick={resetToInput}
                  className="text-gray-400 hover:text-white"
                >
                  ← Back to Home
                </button>
              </div>
            </div>

            {/* Progress Bar - All Steps Complete */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between relative">
                <div className="absolute top-6 left-0 right-0 h-1 bg-green-500 rounded transition-all duration-500"></div>
                
                <div className="flex flex-col items-center z-10">
                  <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center font-bold mb-2">
                    ✓
                  </div>
                  <span className="text-green-300 font-medium">Preview</span>
                </div>
                
                <div className="flex flex-col items-center z-10">
                  <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center font-bold mb-2">
                    ✓
                  </div>
                  <span className="text-green-300 font-medium">Sign Up</span>
                </div>
                
                <div className="flex flex-col items-center z-10">
                  <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center font-bold mb-2">
                    ✓
                  </div>
                  <span className="text-green-300 font-medium">Get Your Code</span>
                </div>
              </div>
            </div>

            {/* Embed Code */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">🎉 Your Chatbot is Ready!</h3>
              <p className="text-white/80 mb-6">
                Copy the embed code below and paste it into your website's HTML. Your NEXA AI chatbot will be live immediately!
              </p>

              <div className="bg-black rounded-lg p-6 mb-6">
                <code className="text-green-400 font-mono text-sm block">
                  {`<!-- NEXA AI Chatbot for ${websiteUrl} -->\n<script\n  src="https://cdn.nexa-ai.com/embed.js"\n  data-website="${websiteUrl}"\n  data-chatbot-id="nx_${websiteUrl.replace(/[^a-zA-Z0-9]/g, '_')}"\n  async\n></script>`}
                </code>
              </div>

              <div className="flex justify-center space-x-4">
                <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                  Copy Code
                </button>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Special case for cashflow management - render without wrapper
  if (currentPhase === 'cashflow-management') {
    return (
      <CashflowSupplyChain 
        websiteUrl={websiteUrl}
        onBack={() => setCurrentPhase('options')}
      />
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2] p-8 font-sans">
      <div className="grid max-w-7xl grid-cols-1 items-center gap-16 md:grid-cols-2">
        {renderContent()}
      </div>
    </div>
  );
};

export default HeroSection;