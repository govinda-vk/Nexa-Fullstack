import React, { useState } from 'react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitMessage('Thank you for your message! We\'ll get back to you within 24 hours.');
      setFormData({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setSubmitMessage('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: '📧',
      title: 'Email Support',
      description: 'Get help with your account or technical issues',
      contact: 'support@askit.ai',
      subtitle: 'Response within 24 hours'
    },
    {
      icon: '💼',
      title: 'Sales Inquiries',
      description: 'Questions about pricing or enterprise solutions',
      contact: 'sales@askit.ai',
      subtitle: 'Response within 4 hours'
    },
    {
      icon: '📞',
      title: 'Phone Support',
      description: 'Speak directly with our support team',
      contact: '+91 98765 43210',
      subtitle: 'Mon-Fri, 9 AM - 6 PM IST'
    },
    {
      icon: '🏢',
      title: 'Office Address',
      description: 'Visit us at our headquarters',
      contact: 'Bangalore, Karnataka, India',
      subtitle: 'By appointment only'
    }
  ];

  const faqs = [
    {
      question: 'How quickly can I get started?',
      answer: 'You can start using ASKit within minutes! Simply sign up for a free account and follow our quick setup guide.'
    },
    {
      question: 'Do you offer custom integrations?',
      answer: 'Yes, we offer custom integrations for Enterprise customers. Contact our sales team to discuss your specific requirements.'
    },
    {
      question: 'What kind of support do you provide?',
      answer: 'We offer email support for all users, with priority support for Pro and Enterprise customers. Enterprise customers also get dedicated account management.'
    },
    {
      question: 'Can I migrate from another platform?',
      answer: 'Absolutely! Our team can help you migrate your existing chatbot configurations and data from other platforms.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-black mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions about ASKit? Need help getting started? Our team is here to help you succeed.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-6">How Can We Help?</h2>
            <p className="text-gray-600">Choose the best way to reach us</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactMethods.map((method, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
                <div className="text-3xl mb-4">{method.icon}</div>
                <h3 className="text-lg font-bold text-black mb-2">{method.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{method.description}</p>
                <p className="text-black font-semibold mb-1">{method.contact}</p>
                <p className="text-gray-500 text-xs">{method.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-6">Send Us a Message</h2>
            <p className="text-gray-600">Fill out the form below and we'll get back to you as soon as possible</p>
          </div>

          {submitMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">{submitMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-colors"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  Company (Optional)
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-colors"
                  placeholder="Your company name"
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-colors"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="sales">Sales Question</option>
                  <option value="partnership">Partnership</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-colors resize-none"
                placeholder="Tell us about your inquiry..."
              />
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-black text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-6">Frequently Asked Questions</h2>
            <p className="text-gray-600">Quick answers to common questions</p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-black mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Office Hours */}
      <div className="bg-black py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Office Hours</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Support</h3>
              <p className="text-gray-300">Monday - Friday</p>
              <p className="text-gray-300">9:00 AM - 6:00 PM IST</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Sales</h3>
              <p className="text-gray-300">Monday - Saturday</p>
              <p className="text-gray-300">9:00 AM - 8:00 PM IST</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Emergency</h3>
              <p className="text-gray-300">24/7 for Enterprise</p>
              <p className="text-gray-300">Critical issues only</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;