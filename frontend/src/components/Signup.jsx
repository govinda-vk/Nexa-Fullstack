import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  
  const redirectAfterSignup = location.state?.redirectAfterLogin || '/dashboard';
  const websiteUrl = location.state?.websiteUrl || localStorage.getItem('pendingScrapeUrl');
  const signupMessage = location.state?.message;
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    role: '',
    agreeToTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Client-side validation
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        setError('Please fill in all required fields');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      if (!formData.agreeToTerms) {
        setError('Please agree to the terms and conditions');
        return;
      }

      // Call the register function from context
      await register(formData);
      
      // Clear the saved URL from localStorage since we're processing it
      localStorage.removeItem('pendingScrapeUrl');
      
      // Navigate to intended destination with preserved state
      if (redirectAfterSignup === '/scraping' && websiteUrl) {
        console.log('Redirecting to scraping page with URL:', websiteUrl);
        navigate('/scraping', { 
          state: { websiteUrl: websiteUrl.trim() },
          replace: true 
        });
      } else if (websiteUrl && redirectAfterSignup !== '/dashboard') {
        // If we have a websiteUrl but redirectAfterSignup isn't explicitly scraping, still go to scraping
        console.log('Redirecting to scraping page (fallback) with URL:', websiteUrl);
        navigate('/scraping', { 
          state: { websiteUrl: websiteUrl.trim() },
          replace: true 
        });
      } else {
        console.log('Redirecting to:', redirectAfterSignup);
        navigate(redirectAfterSignup, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Account creation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8 flex items-center justify-center">
      <div className="w-full max-w-lg">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-light text-black mb-4 tracking-tight">Join NEXA AI</h1>
            <p className="text-lg text-gray-600 font-light">Create your account to get started</p>
            {websiteUrl && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-700 font-light">
                  Ready to scrape: <strong className="font-medium">{websiteUrl}</strong>
                </p>
              </div>
            )}
          </div>

          {signupMessage && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-center">
                <span className="text-blue-600 mr-3">ℹ️</span>
                <span className="text-blue-800 font-light">{signupMessage}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-center">
                <span className="text-red-600 mr-3">⚠️</span>
                <span className="text-red-800 font-light">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-light text-gray-600 mb-3">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="John"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 text-black border border-gray-300 
                             focus:border-black focus:ring-1 focus:ring-black outline-none
                             placeholder-gray-400 font-light transition-colors"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-light text-gray-600 mb-3">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 text-black border border-gray-300 
                             focus:border-black focus:ring-1 focus:ring-black outline-none
                             placeholder-gray-400 font-light transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-light text-gray-600 mb-3">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 text-black border border-gray-300 
                           focus:border-black focus:ring-1 focus:ring-black outline-none
                           placeholder-gray-400 font-light transition-colors"
              />
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-light text-gray-600 mb-3">
                Company (Optional)
              </label>
              <input
                id="company"
                name="company"
                type="text"
                placeholder="Your company name"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 text-black border border-gray-300 
                           focus:border-black focus:ring-1 focus:ring-black outline-none
                           placeholder-gray-400 font-light transition-colors"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-light text-gray-600 mb-3">
                Role
              </label>
              <select
                id="role"
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 text-black border border-gray-300 
                           focus:border-black focus:ring-1 focus:ring-black outline-none
                           font-light transition-colors"
              >
                <option value="">Select your role</option>
                <option value="business-owner">Business Owner</option>
                <option value="developer">Developer</option>
                <option value="marketing">Marketing</option>
                <option value="sales">Sales</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-light text-gray-600 mb-3">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="your-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 text-black border border-gray-300 
                             focus:border-black focus:ring-1 focus:ring-black outline-none
                             placeholder-gray-400 font-light transition-colors"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-light text-gray-600 mb-3">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="confirm-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 text-black border border-gray-300 
                             focus:border-black focus:ring-1 focus:ring-black outline-none
                             placeholder-gray-400 font-light transition-colors"
                />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                required
                className="mt-1 w-4 h-4 text-black bg-gray-50 border-gray-300 rounded focus:ring-black focus:ring-2"
              />
              <label htmlFor="agreeToTerms" className="text-sm font-light text-gray-600 leading-relaxed">
                I agree to the{' '}
                <button type="button" className="text-black hover:text-gray-600 font-medium transition-colors">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="text-black hover:text-gray-600 font-medium transition-colors">
                  Privacy Policy
                </button>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-full font-medium text-base
                         hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-600 font-light">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login', { 
                  state: { 
                    redirectAfterLogin: redirectAfterSignup,
                    websiteUrl: websiteUrl,
                    message: signupMessage || 'Sign in to continue with website scraping'
                  }
                })}
                className="text-black hover:text-gray-600 font-medium transition-colors"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;