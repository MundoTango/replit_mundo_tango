import React, { useState } from 'react';
import { AlertTriangle, Bug, Zap, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

// 40x20s Layer 8: Frontend Error Testing Component
export function SentryErrorTester() {
  const [loading, setLoading] = useState(false);
  const [sentryStatus, setSentryStatus] = useState<any>(null);

  // Check Sentry status
  const checkSentryStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test/sentry-status');
      const data = await response.json();
      setSentryStatus(data);
      toast({
        title: "Sentry Status Retrieved",
        description: data.message || "Status check complete",
      });
    } catch (error) {
      console.error('Failed to check Sentry status:', error);
      toast({
        title: "Status Check Failed",
        description: "Could not retrieve Sentry status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Trigger different types of errors
  const triggerError = async (errorType: string) => {
    setLoading(true);
    try {
      switch (errorType) {
        case 'sync':
          // Synchronous error
          throw new Error('40x20s Test: Synchronous error from UI');
          
        case 'async':
          // Asynchronous error
          setTimeout(() => {
            throw new Error('40x20s Test: Async error after 1 second');
          }, 1000);
          toast({
            title: "Async Error Triggered",
            description: "Error will be thrown in 1 second",
          });
          break;
          
        case 'api':
          // API error
          const response = await fetch('/api/test/error');
          const data = await response.json();
          toast({
            title: "API Error Logged",
            description: data.message || "Error sent to server",
          });
          break;
          
        case 'reference':
          // Reference error
          // @ts-ignore - Intentional error
          nonExistentFunction();
          break;
          
        case 'promise':
          // Unhandled promise rejection
          Promise.reject(new Error('40x20s Test: Unhandled promise rejection'));
          toast({
            title: "Promise Rejection Triggered",
            description: "Check console for unhandled rejection",
          });
          break;
      }
    } catch (error: any) {
      console.error('Test error:', error);
      toast({
        title: "Error Triggered",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glassmorphic-card p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Bug className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-semibold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
              40x20s Sentry Error Testing - Layer 8
            </h2>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400">
            Test Sentry error tracking integration by triggering different types of errors.
            All errors are intentional and for testing purposes only.
          </p>

          {/* Sentry Status */}
          {sentryStatus && (
            <div className="bg-gradient-to-br from-turquoise-50/50 to-cyan-50/50 dark:from-turquoise-900/20 dark:to-cyan-900/20 rounded-lg p-4">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Sentry Configuration
              </h3>
              <div className="space-y-1 text-sm">
                <p>Status: {sentryStatus.sentryEnabled ? 
                  <span className="text-green-600">✅ Enabled</span> : 
                  <span className="text-yellow-600">⚠️ Disabled</span>
                }</p>
                <p>Environment: {sentryStatus.environment}</p>
                <p>Sample Rate: {sentryStatus.sampleRate}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={checkSentryStatus}
              disabled={loading}
              className="bg-gradient-to-r from-turquoise-400 to-cyan-500 hover:from-turquoise-500 hover:to-cyan-600"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Check Sentry Status
            </Button>

            <Button
              onClick={() => triggerError('sync')}
              disabled={loading}
              variant="destructive"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Trigger Sync Error
            </Button>

            <Button
              onClick={() => triggerError('async')}
              disabled={loading}
              variant="destructive"
            >
              <Zap className="mr-2 h-4 w-4" />
              Trigger Async Error
            </Button>

            <Button
              onClick={() => triggerError('api')}
              disabled={loading}
              variant="destructive"
            >
              <Bug className="mr-2 h-4 w-4" />
              Trigger API Error
            </Button>

            <Button
              onClick={() => triggerError('reference')}
              disabled={loading}
              variant="destructive"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Trigger Reference Error
            </Button>

            <Button
              onClick={() => triggerError('promise')}
              disabled={loading}
              variant="destructive"
            >
              <Zap className="mr-2 h-4 w-4" />
              Trigger Promise Rejection
            </Button>
          </div>

          {/* Instructions */}
          <div className="mt-6 text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p className="font-medium">🔍 Testing Instructions:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Click "Check Sentry Status" to verify configuration</li>
              <li>Click any error button to trigger that type of error</li>
              <li>Check browser console for error details</li>
              <li>If Sentry is enabled, errors will be sent to Sentry dashboard</li>
              <li>All errors are intentional for testing purposes</li>
            </ol>
          </div>
        </div>
      </Card>
    </div>
  );
}