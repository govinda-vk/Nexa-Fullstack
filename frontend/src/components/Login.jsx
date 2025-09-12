import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get the intended destination or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';
  const redirectAfterLogin = location.state?.redirectAfterLogin || from;
  const websiteUrl = location.state?.websiteUrl || localStorage.getItem('pendingScrapeUrl');
  const loginMessage = location.state?.message;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form data
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields');
        return;
      }

      // Call the login function from context
      await login(formData);
      
      // Clear the saved URL from localStorage since we're processing it
      localStorage.removeItem('pendingScrapeUrl');
      
      // Navigate to intended destination with preserved state
      if (redirectAfterLogin === '/scraping' && websiteUrl) {
        console.log('Redirecting to scraping page with URL:', websiteUrl);
        navigate('/scraping', { 
          state: { websiteUrl: websiteUrl.trim() },
          replace: true 
        });
      } else if (websiteUrl && redirectAfterLogin !== '/dashboard') {
        // If we have a websiteUrl but redirectAfterLogin isn't explicitly scraping, still go to scraping
        console.log('Redirecting to scraping page (fallback) with URL:', websiteUrl);
        navigate('/scraping', { 
          state: { websiteUrl: websiteUrl.trim() },
          replace: true 
        });
      } else {
        console.log('Redirecting to:', redirectAfterLogin);
        navigate(redirectAfterLogin, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-light text-black mb-4 tracking-tight">Welcome Back</h1>
            <p className="text-lg text-gray-600 font-light">Sign in to your NEXA AI account</p>
            {websiteUrl && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-700 font-light">
                  Ready to scrape: <strong className="font-medium">{websiteUrl}</strong>
                </p>
              </div>
            )}
          </div>

          {loginMessage && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-center">
                <span className="text-blue-600 mr-3">ℹ️</span>
                <span className="text-blue-800 font-light">{loginMessage}</span>
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

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="mr-3 w-4 h-4 text-black bg-gray-50 border-gray-300 rounded focus:ring-black focus:ring-2" />
                <span className="text-sm text-gray-600 font-light">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-black hover:text-gray-600 font-light transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-full font-medium text-base
                         hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-600 font-light">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup', { 
                  state: { 
                    redirectAfterLogin: redirectAfterLogin,
                    websiteUrl: websiteUrl,
                    message: loginMessage || 'Create your account to continue with website scraping'
                  }
                })}
                className="text-black hover:text-gray-600 font-medium transition-colors"
              >
                Sign up here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;