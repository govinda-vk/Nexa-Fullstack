import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import LogoAnimation from './LogoAnimation';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  const handleDashboard = () => {
    navigate('/dashboard');
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleNavClick = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleLogoClick = () => {
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-purple-700 to-indigo-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}

          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={handleLogoClick}>
            <span className="text-black text-2xl font-bold tracking-tight mr-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              NEXA
            </span>
            <div className="w-10 h-10">
              <LogoAnimation style={{ width: '100%', height: '100%' }} />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              <button
                onClick={() => handleNavClick('/about')}
                className="text-black hover:text-black px-3 py-2 rounded-md text-sm font-medium transition duration-150"
              >
                About Us
              </button>
              <button
                onClick={() => handleNavClick('/contact')}
                className="text-black hover:text-black px-3 py-2 rounded-md text-sm font-medium transition duration-150"
              >
                Contact Us
              </button>
              <button
                onClick={() => handleNavClick('/pricing')}
                className="text-black hover:text-black px-3 py-2 rounded-md text-sm font-medium transition duration-150"
              >
                Pricing
              </button>
              <button
                onClick={() => handleNavClick('/embed-guide')}
                className="text-black hover:text-black px-3 py-2 rounded-md text-sm font-medium transition duration-150"
              >
                Embed Guide
              </button>
            </div>
          </div>

          {/* Auth Buttons - Show different content based on authentication */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-black text-sm font-medium">
                    Welcome, {user?.name || user?.email || 'User'}
                  </span>
                  <button 
                    onClick={handleDashboard}
                    className="text-black hover:text-black px-3 py-2 rounded-md text-sm font-medium transition duration-150"
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-150"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={handleLogin}
                    className="text-black hover:text-black px-3 py-2 rounded-md text-sm font-medium transition duration-150"
                  >
                    Login
                  </button>
                  <button 
                    onClick={handleSignup}
                    className="bg-indigo-600 hover:bg-indigo-500 text-black px-4 py-2 rounded-md text-sm font-medium transition duration-150"
                  >
                    Sign Up for Free
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-black hover:text-black focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-indigo-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button
              onClick={() => handleNavClick('/about')}
              className="w-full text-left text-black hover:text-black block px-3 py-2 rounded-md text-base font-medium"
            >
              About Us
            </button>
            <button
              onClick={() => handleNavClick('/contact')}
              className="w-full text-left text-black hover:text-black block px-3 py-2 rounded-md text-base font-medium"
            >
              Contact Us
            </button>
            <button
              onClick={() => handleNavClick('/pricing')}
              className="w-full text-left text-black hover:text-black block px-3 py-2 rounded-md text-base font-medium"
            >
              Pricing
            </button>
            <button
              onClick={() => handleNavClick('/embed-guide')}
              className="w-full text-left text-black hover:text-black block px-3 py-2 rounded-md text-base font-medium"
            >
              Embed Guide
            </button>
            <div className="pt-4 pb-3 border-t border-indigo-700">
              {isAuthenticated ? (
                <>
                  <div className="text-black px-3 py-2 text-sm font-medium">
                    Welcome, {user?.name || user?.email || 'User'}
                  </div>
                  <button 
                    onClick={handleDashboard}
                    className="w-full text-left text-black hover:text-black block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full mt-2 bg-red-600 hover:bg-red-500 text-white block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={handleLogin}
                    className="w-full text-left text-black hover:text-black block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Login
                  </button>
                  <button 
                    onClick={handleSignup}
                    className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-black block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Sign Up for Free
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;