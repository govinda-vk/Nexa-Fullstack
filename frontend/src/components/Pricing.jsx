import React from 'react';

const Pricing = () => {
  const plans = [
    {
      name: 'Free',
      price: '₹0',
      period: 'Forever',
      description: 'Perfect for individuals & hobbyists',
      features: [
        { name: 'Websites', value: '1' },
        { name: 'Max Pages per Website', value: '50' },
        { name: 'AI Chatbots', value: '1' },
        { name: 'Monthly Chat Sessions', value: '100' },
        { name: 'RAG System', value: 'Standard' },
        { name: 'Cashflow Analysis', value: '-' },
        { name: 'Widget Customization', value: 'Basic' },
        { name: 'Email Support', value: '-' },
        { name: 'Dedicated Support', value: '-' }
      ],
      buttonText: 'Get Started Free',
      buttonStyle: 'bg-gray-900 text-white hover:bg-gray-800',
      popular: false
    },
    {
      name: 'Pro',
      price: '₹2,500',
      period: 'per month',
      description: 'Ideal for small to medium businesses',
      features: [
        { name: 'Websites', value: '5' },
        { name: 'Max Pages per Website', value: '500' },
        { name: 'AI Chatbots', value: '5' },
        { name: 'Monthly Chat Sessions', value: '2,500' },
        { name: 'RAG System', value: 'Advanced' },
        { name: 'Cashflow Analysis', value: '5 analyses/month' },
        { name: 'Widget Customization', value: 'Full' },
        { name: 'Email Support', value: 'Standard' },
        { name: 'Dedicated Support', value: '-' }
      ],
      buttonText: 'Start Pro Trial',
      buttonStyle: 'bg-black text-white hover:bg-gray-800',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'Built for large-scale operations',
      features: [
        { name: 'Websites', value: 'Unlimited' },
        { name: 'Max Pages per Website', value: 'Custom' },
        { name: 'AI Chatbots', value: 'Unlimited' },
        { name: 'Monthly Chat Sessions', value: 'Custom' },
        { name: 'RAG System', value: 'Premium' },
        { name: 'Cashflow Analysis', value: 'Unlimited' },
        { name: 'Widget Customization', value: 'Bespoke' },
        { name: 'Email Support', value: 'Priority' },
        { name: 'Dedicated Support', value: 'Yes' }
      ],
      buttonText: 'Contact Sales',
      buttonStyle: 'bg-white text-black border-2 border-black hover:bg-gray-50',
      popular: false
    }
  ];

  const getFeatureDisplay = (value) => {
    if (value === '-') {
      return <span className="text-gray-400">✗</span>;
    }
    return <span className="text-gray-900">{value}</span>;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-black mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the perfect plan for your business needs. Start free and scale as you grow.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl shadow-sm border ${
                  plan.popular 
                    ? 'border-black ring-2 ring-black' 
                    : 'border-gray-200'
                } overflow-hidden`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-black text-white text-center py-2 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                
                <div className={`p-8 ${plan.popular ? 'pt-16' : ''}`}>
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-black mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-black">{plan.price}</span>
                      {plan.period && (
                        <span className="text-gray-600 ml-2">/{plan.period}</span>
                      )}
                    </div>
                    <p className="text-gray-600">{plan.description}</p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex justify-between items-center">
                        <span className="text-sm text-gray-700 font-medium">
                          {feature.name}
                        </span>
                        <span className="text-sm font-semibold">
                          {getFeatureDisplay(feature.value)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-200 ${plan.buttonStyle}`}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="space-y-8">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-black mb-3">
                Can I upgrade or downgrade my plan anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can change your plan at any time. Upgrades take effect immediately, 
                while downgrades take effect at the next billing cycle.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-black mb-3">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards, debit cards, and UPI payments. 
                Enterprise customers can also pay via bank transfer.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-black mb-3">
                Is there a free trial for paid plans?
              </h3>
              <p className="text-gray-600">
                Yes, we offer a 14-day free trial for the Pro plan. No credit card required to start.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-black mb-3">
                What happens to my data if I cancel?
              </h3>
              <p className="text-gray-600">
                Your data remains safe for 30 days after cancellation. You can reactivate 
                your account anytime during this period without losing any data.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-black py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            Join thousands of businesses already using ASKit to enhance their customer experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-black px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Start Free Trial
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-black transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;