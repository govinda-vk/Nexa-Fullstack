import React, { useState } from 'react';
import { Button, Card, Label, TextInput, Alert } from "flowbite-react";
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
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] p-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your NEXA AI account</p>
            {websiteUrl && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  Ready to scrape: <strong>{websiteUrl}</strong>
                </p>
              </div>
            )}
          </div>

          {loginMessage && (
            <Alert color="info" className="mb-4">
              {loginMessage}
            </Alert>
          )}

          {error && (
            <Alert color="failure" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="email" value="Email Address" />
              </div>
              <TextInput
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="password" value="Password" />
              </div>
              <TextInput
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full bg-slate-800"
              disabled={loading}
              isProcessing={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup', { 
                  state: { 
                    redirectAfterLogin: redirectAfterLogin,
                    websiteUrl: websiteUrl,
                    message: loginMessage || 'Create your account to continue with website scraping'
                  }
                })}
                className="text-blue-600 hover:underline font-medium"
              >
                Sign up here
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;