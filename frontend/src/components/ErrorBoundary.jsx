import React from 'react';

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
        <div className="min-h-screen bg-white p-8 flex items-center justify-center">
          <div className="max-w-lg mx-auto text-center">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <div className="text-6xl mb-6">⚠️</div>
              <h3 className="text-2xl font-light text-black mb-4 tracking-tight">Something went wrong</h3>
              <p className="text-lg text-gray-600 font-light mb-8 leading-relaxed">
                An unexpected error occurred. Please refresh the page or try again later.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-8 text-left">
                  <summary className="text-sm text-gray-500 font-light cursor-pointer hover:text-gray-700 transition-colors">
                    Error details (development mode)
                  </summary>
                  <pre className="mt-4 text-xs bg-gray-50 p-4 rounded-lg text-gray-700 overflow-auto font-mono">
                    {this.state.error.toString()}
                    <br />
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
              <button 
                onClick={() => window.location.reload()} 
                className="bg-black text-white px-8 py-4 rounded-full font-medium text-base
                           hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
};

// Loading component
export const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="min-h-screen bg-white p-8 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-black mx-auto"></div>
      <p className="mt-6 text-lg text-gray-600 font-light">{message}</p>
    </div>
  </div>
);

// Error message component
export const ErrorMessage = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
    <div className="flex justify-between items-center">
      <div className="flex items-center">
        <span className="text-red-600 mr-3">⚠️</span>
        <span className="text-red-800 font-light">{message}</span>
      </div>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium
                     hover:bg-red-700 transition-colors duration-200"
        >
          Retry
        </button>
      )}
    </div>
  </div>
);

// Empty state component
export const EmptyState = ({ 
  icon = "🌐", 
  title = "No data found", 
  description = "There's nothing to show here yet.", 
  action = null 
}) => (
  <div className="text-center py-16">
    <div className="text-6xl mb-6">{icon}</div>
    <h3 className="text-2xl font-light text-black mb-4 tracking-tight">{title}</h3>
    <p className="text-lg text-gray-600 font-light mb-8 max-w-md mx-auto leading-relaxed">{description}</p>
    {action}
  </div>
);

export default ErrorBoundary;
