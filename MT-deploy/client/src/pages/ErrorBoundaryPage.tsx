import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, FileQuestion, Bug, Mail } from 'lucide-react';
import { useLocation } from 'wouter';

interface ErrorBoundaryPageProps {
  error?: Error;
  resetError?: () => void;
}

export default function ErrorBoundaryPage({ error, resetError }: ErrorBoundaryPageProps) {
  const [, setLocation] = useLocation();
  const [reportSent, setReportSent] = React.useState(false);

  const handleReload = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    setLocation('/');
  };

  const handleReportError = async () => {
    try {
      // In a real app, this would send error details to your error tracking service
      const errorReport = {
        message: error?.message || 'Unknown error',
        stack: error?.stack || 'No stack trace',
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        url: window.location.href
      };
      
      // Simulate sending report
      console.error('Error Report:', errorReport);
      
      // For now, just mark as sent
      setReportSent(true);
      
      // In production, you would send to Sentry or similar:
      // await fetch('/api/error-reports', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // });
      
    } catch (err) {
      console.error('Failed to send error report:', err);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50 p-4">
      <Card className="w-full max-w-2xl glassmorphic-card">
        <CardHeader className="text-center pb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Oops! Something went wrong
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              We're sorry, but something unexpected happened. Don't worry, your data is safe!
            </p>
            <p className="text-sm text-gray-500">
              The error has been logged and our team will look into it.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                <Bug className="w-4 h-4" />
                Error Details
              </h4>
              <p className="text-sm text-red-700 font-mono break-all">
                {error.message || 'An unexpected error occurred'}
              </p>
              {process.env.NODE_ENV === 'development' && error.stack && (
                <details className="mt-2">
                  <summary className="text-xs text-red-600 cursor-pointer hover:underline">
                    View Stack Trace
                  </summary>
                  <pre className="mt-2 text-xs text-red-600 overflow-auto max-h-40 p-2 bg-red-100 rounded">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}

          <div className="grid gap-3">
            <Button
              onClick={handleReload}
              className="w-full bg-gradient-to-r from-turquoise-600 to-cyan-600 hover:from-turquoise-700 hover:to-cyan-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="w-full border-turquoise-200 hover:bg-turquoise-50"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
            
            <Button
              onClick={handleReportError}
              variant="ghost"
              className="w-full hover:bg-turquoise-50"
              disabled={reportSent}
            >
              {reportSent ? (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2 text-green-600" />
                  Error Report Sent
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Report This Error
                </>
              )}
            </Button>
          </div>

          <div className="border-t pt-6">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <FileQuestion className="w-5 h-5 text-turquoise-600" />
              Common Solutions
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-turquoise-600 mt-0.5">•</span>
                <span>Clear your browser cache and cookies</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-turquoise-600 mt-0.5">•</span>
                <span>Check your internet connection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-turquoise-600 mt-0.5">•</span>
                <span>Try using a different browser</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-turquoise-600 mt-0.5">•</span>
                <span>Disable browser extensions temporarily</span>
              </li>
            </ul>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-500">
              Need more help? Contact us at{' '}
              <a href="mailto:support@mundotango.life" className="text-turquoise-600 hover:underline">
                support@mundotango.life
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}