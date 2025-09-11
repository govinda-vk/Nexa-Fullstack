import React, { useState } from 'react';
import { Button, Card, Label, TextInput, Alert, Select } from "flowbite-react";
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
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] p-8 flex items-center justify-center">
      <div className="w-full max-w-lg">
        <Card className="shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Join NEXA AI</h1>
            <p className="text-gray-600">Create your account to get started</p>
            {websiteUrl && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  Ready to scrape: <strong>{websiteUrl}</strong>
                </p>
              </div>
            )}
          </div>

          {signupMessage && (
            <Alert color="info" className="mb-4">
              {signupMessage}
            </Alert>
          )}

          {error && (
            <Alert color="failure" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="firstName" value="First Name" />
                </div>
                <TextInput
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="lastName" value="Last Name" />
                </div>
                <TextInput
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

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
                <Label htmlFor="company" value="Company (Optional)" />
              </div>
              <TextInput
                id="company"
                name="company"
                type="text"
                placeholder="Your company name"
                value={formData.company}
                onChange={handleChange}
              />
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="role" value="Role" />
              </div>
              <Select
                id="role"
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
              >
                <option value="">Select your role</option>
                <option value="business-owner">Business Owner</option>
                <option value="developer">Developer</option>
                <option value="marketing">Marketing</option>
                <option value="sales">Sales</option>
                <option value="other">Other</option>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="confirmPassword" value="Confirm Password" />
                </div>
                <TextInput
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                required
              />
              <Label htmlFor="agreeToTerms" className="text-sm">
                I agree to the{' '}
                <button type="button" className="text-blue-600 hover:underline">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="text-blue-600 hover:underline">
                  Privacy Policy
                </button>
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full bg-slate-800"
              disabled={loading}
              isProcessing={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login', { 
                  state: { 
                    redirectAfterLogin: redirectAfterSignup,
                    websiteUrl: websiteUrl,
                    message: signupMessage || 'Sign in to continue with website scraping'
                  }
                })}
                className="text-blue-600 hover:underline font-medium"
              >
                Sign in here
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Signup;