import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with full error information
    this.setState({
      error,
      errorInfo
    });

    // You could also log to an error reporting service here
    // e.g., Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="mx-auto mt-8 max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              {this.props.fallbackMessage || 
               'An unexpected error occurred. The application has been prevented from crashing.'}
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="space-y-2">
                <h3 className="font-semibold">Error Details:</h3>
                <pre className="rounded bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200 overflow-auto">
                  {this.state.error.toString()}
                </pre>
                
                {this.state.errorInfo && (
                  <>
                    <h3 className="font-semibold">Component Stack:</h3>
                    <pre className="rounded bg-gray-100 p-4 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300 overflow-auto max-h-48">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </>
                )}
              </div>
            )}
            
            <div className="flex gap-4">
              <Button 
                onClick={this.handleReset}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;