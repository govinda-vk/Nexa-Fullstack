import React from 'react';
import { Alert, Button } from 'flowbite-react';

const ErrorBoundary = class extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error for debugging
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] p-8 flex items-center justify-center">
          <div className="max-w-md mx-auto">
            <Alert color="failure" className="mb-4">
              <h3 className="text-lg font-semibold">Something went wrong</h3>
              <p className="mt-2">
                An unexpected error occurred. Please refresh the page or try again later.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-xs">
                  <summary>Error details (development mode)</summary>
                  <pre className="mt-2 whitespace-pre-wrap">
                    {this.state.error.toString()}
                    <br />
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </Alert>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
};

// Loading component
export const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] p-8 flex items-center justify-center">
    <div className="text-white text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
      <p className="mt-4">{message}</p>
    </div>
  </div>
);

// Error message component
export const ErrorMessage = ({ message, onRetry }) => (
  <Alert color="failure" className="mb-6">
    <div className="flex justify-between items-center">
      <span>{message}</span>
      {onRetry && (
        <Button size="xs" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  </Alert>
);

// Empty state component
export const EmptyState = ({ 
  icon = "🌐", 
  title = "No data found", 
  description = "There's nothing to show here yet.", 
  action = null 
}) => (
  <div className="text-center py-12">
    <div className="text-6xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600 mb-6">{description}</p>
    {action}
  </div>
);

export default ErrorBoundary;
