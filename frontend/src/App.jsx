import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute, { PublicRoute } from './components/ProtectedRoute.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Navbar from "./components/Navbar"; 
import HeroSection  from "./components/HeroSection";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import WebsiteDetail from "./components/WebsiteDetail";
import WidgetConfig from "./components/WidgetConfig";
import ScrapingPage from "./components/ScrapingPage";

function AppContent() {
  const location = useLocation();
  
  // Don't show navbar on login/signup/dashboard pages and related protected pages
  const hideNavbar = ['/login', '/signup', '/dashboard', '/scraping'].includes(location.pathname) || 
                     location.pathname.startsWith('/website/') ||
                     location.pathname.startsWith('/widget/');

  return (
    <div>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={
          <div>
            <HeroSection />
            <LandingPage />
          </div>
        } />
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/scraping" element={
          <ProtectedRoute>
            <ScrapingPage />
          </ProtectedRoute>
        } />
        <Route path="/website/:websiteId" element={
          <ProtectedRoute>
            <WebsiteDetail />
          </ProtectedRoute>
        } />
        <Route path="/widget/:websiteId/config" element={
          <ProtectedRoute>
            <WidgetConfig />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
