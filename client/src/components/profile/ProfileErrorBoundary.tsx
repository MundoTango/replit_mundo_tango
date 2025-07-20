import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'wouter';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

// Layer 22: User Safety Net - Error Boundary with Recovery Options
export default class ProfileErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      retryCount: 0
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error('Profile Error Boundary caught:', error, errorInfo);
    
    // Send to error tracking service (e.g., Sentry)
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('Error', {
        props: {
          component: 'Profile',
          error: error.message,
          stack: errorInfo.componentStack
        }
      });
    }

    this.setState({
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    const { retryCount } = this.state;
    
    if (retryCount < 3) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: retryCount + 1
      });
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    const { hasError, error, retryCount } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Custom fallback provided
      if (fallback) {
        return <>{fallback}</>;
      }

      // Default error UI with recovery options
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Oops! Something went wrong
              </h2>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                We encountered an error while loading your profile. Don't worry, your data is safe.
              </p>

              {/* Error details in development */}
              {process.env.NODE_ENV === 'development' && error && (
                <details className="w-full mb-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                    Error details
                  </summary>
                  <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-auto">
                    {error.toString()}
                  </pre>
                </details>
              )}

              {/* Recovery options */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                {retryCount < 3 && (
                  <button
                    onClick={this.handleRetry}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-turquoise-400 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again {retryCount > 0 && `(${3 - retryCount} left)`}
                  </button>
                )}

                <button
                  onClick={this.handleReload}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload Page
                </button>

                <Link href="/">
                  <a className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                    <Home className="w-4 h-4" />
                    Go Home
                  </a>
                </Link>
              </div>

              {/* Support message */}
              <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                If the problem persists, please contact support or try again later.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}