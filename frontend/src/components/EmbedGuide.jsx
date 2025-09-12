import React, { useState } from 'react';

const EmbedGuide = () => {
  const [selectedWidget, setSelectedWidget] = useState('chatbot');
  const [customization, setCustomization] = useState({
    primaryColor: '#000000',
    position: 'bottom-right',
    size: 'medium',
    welcomeMessage: 'Hello! How can I help you today?'
  });

  const widgetTypes = [
    {
      id: 'chatbot',
      name: 'AI Chatbot',
      description: 'Interactive chatbot widget for customer support',
      icon: '🤖'
    },
    {
      id: 'feedback',
      name: 'Feedback Widget',
      description: 'Collect user feedback and ratings',
      icon: '💬'
    },
    {
      id: 'search',
      name: 'Search Widget',
      description: 'Smart search functionality for your site',
      icon: '🔍'
    }
  ];

  const positions = [
    { value: 'bottom-right', label: 'Bottom Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'top-left', label: 'Top Left' }
  ];

  const sizes = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' }
  ];

  const generateEmbedCode = () => {
    return `<!-- ASKit Widget Embed Code -->
<script>
  (function() {
    var askitConfig = {
      widgetId: 'your-widget-id',
      type: '${selectedWidget}',
      position: '${customization.position}',
      size: '${customization.size}',
      primaryColor: '${customization.primaryColor}',
      welcomeMessage: '${customization.welcomeMessage}'
    };
    
    var script = document.createElement('script');
    script.src = 'https://widget.askit.ai/embed.js';
    script.async = true;
    script.onload = function() {
      window.ASKit.init(askitConfig);
    };
    document.head.appendChild(script);
  })();
</script>`;
  };

  const integrationSteps = [
    {
      step: 1,
      title: 'Get Your Widget ID',
      description: 'Log into your ASKit dashboard and navigate to the Widgets section. Copy your unique widget ID.',
      code: 'widgetId: "your-widget-id-here"'
    },
    {
      step: 2,
      title: 'Customize Settings',
      description: 'Use the customization options below to configure your widget appearance and behavior.',
      code: null
    },
    {
      step: 3,
      title: 'Copy Embed Code',
      description: 'Copy the generated embed code and paste it into your website\'s HTML, preferably before the closing </body> tag.',
      code: null
    },
    {
      step: 4,
      title: 'Test & Go Live',
      description: 'Refresh your website to see the widget in action. Make sure it\'s working correctly before going live.',
      code: null
    }
  ];

  const platformGuides = [
    {
      platform: 'WordPress',
      icon: '🏢',
      steps: [
        'Go to your WordPress admin dashboard',
        'Navigate to Appearance > Theme Editor',
        'Open your theme\'s footer.php file',
        'Paste the embed code before the closing </body> tag',
        'Click "Update File"'
      ]
    },
    {
      platform: 'Shopify',
      icon: '🛒',
      steps: [
        'From your Shopify admin, go to Online Store > Themes',
        'Click "Actions" > "Edit code"',
        'Open the theme.liquid file',
        'Paste the embed code before the closing </body> tag',
        'Click "Save"'
      ]
    },
    {
      platform: 'Wix',
      icon: '🎨',
      steps: [
        'Open your Wix Editor',
        'Click the "Add" button (+)',
        'Select "Embed" > "Custom Element"',
        'Paste the embed code in the code box',
        'Position the widget on your page'
      ]
    },
    {
      platform: 'Squarespace',
      icon: '⬜',
      steps: [
        'In your Squarespace panel, go to Settings > Advanced > Code Injection',
        'Paste the embed code in the "Footer" section',
        'Click "Save"',
        'The widget will appear on all pages'
      ]
    }
  ];

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-black mb-6">
              Widget Embed Guide
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Learn how to easily embed ASKit widgets on your website. No coding experience required.
            </p>
          </div>
        </div>
      </div>

      {/* Widget Selection */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-6">Choose Your Widget</h2>
            <p className="text-gray-600">Select the type of widget you want to embed</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {widgetTypes.map((widget) => (
              <div
                key={widget.id}
                onClick={() => setSelectedWidget(widget.id)}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedWidget === widget.id
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 bg-white text-black hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-4">{widget.icon}</div>
                  <h3 className="text-lg font-bold mb-2">{widget.name}</h3>
                  <p className={`text-sm ${selectedWidget === widget.id ? 'text-gray-300' : 'text-gray-600'}`}>
                    {widget.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customization Panel */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Customization Options */}
            <div>
              <h2 className="text-3xl font-bold text-black mb-8">Customize Your Widget</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={customization.primaryColor}
                      onChange={(e) => setCustomization({...customization, primaryColor: e.target.value})}
                      className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customization.primaryColor}
                      onChange={(e) => setCustomization({...customization, primaryColor: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position
                  </label>
                  <select
                    value={customization.position}
                    onChange={(e) => setCustomization({...customization, position: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none"
                  >
                    {positions.map((position) => (
                      <option key={position.value} value={position.value}>
                        {position.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size
                  </label>
                  <select
                    value={customization.size}
                    onChange={(e) => setCustomization({...customization, size: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none"
                  >
                    {sizes.map((size) => (
                      <option key={size.value} value={size.value}>
                        {size.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Welcome Message
                  </label>
                  <input
                    type="text"
                    value={customization.welcomeMessage}
                    onChange={(e) => setCustomization({...customization, welcomeMessage: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none"
                    placeholder="Enter welcome message"
                  />
                </div>
              </div>
            </div>

            {/* Generated Code */}
            <div>
              <h2 className="text-3xl font-bold text-black mb-8">Generated Embed Code</h2>
              
              <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
                <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                  {generateEmbedCode()}
                </pre>
              </div>
              
              <button
                onClick={() => copyToClipboard(generateEmbedCode())}
                className="mt-4 w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Steps */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-6">Integration Steps</h2>
            <p className="text-gray-600">Follow these simple steps to add the widget to your website</p>
          </div>

          <div className="space-y-8">
            {integrationSteps.map((step, index) => (
              <div key={index} className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold">
                  {step.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-black mb-2">{step.title}</h3>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  {step.code && (
                    <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                      {step.code}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform-Specific Guides */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-6">Platform-Specific Guides</h2>
            <p className="text-gray-600">Detailed instructions for popular website builders</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {platformGuides.map((guide, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">{guide.icon}</span>
                  <h3 className="text-xl font-bold text-black">{guide.platform}</h3>
                </div>
                <ol className="space-y-2">
                  {guide.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full text-xs flex items-center justify-center mr-3 mt-0.5">
                        {stepIndex + 1}
                      </span>
                      <span className="text-gray-700 text-sm">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="bg-black py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Need Help?</h2>
          <p className="text-gray-300 mb-8 text-lg">
            Our support team is here to help you get your widget up and running smoothly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-black px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Contact Support
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-black transition-colors">
              Watch Tutorial Video
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmbedGuide;