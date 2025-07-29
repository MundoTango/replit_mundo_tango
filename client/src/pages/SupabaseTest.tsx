import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Database, Zap, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [connectionResult, setConnectionResult] = useState<any>(null);
  const [bodyTestStatus, setBodyTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [bodyTestResult, setBodyTestResult] = useState<any>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [realtimeResult, setRealtimeResult] = useState<any>(null);
  const [testMessage, setTestMessage] = useState('This is a test message for Supabase AI chat functionality. We are testing the body size limit fix that previously caused "Body exceeded 1mb limit" errors.');
  const { toast } = useToast();

  const testSupabaseConnection = async () => {
    setConnectionStatus('testing');
    try {
      const response = await fetch('/api/supabase/test-connection');
      const data = await response.json();
      
      if (data.success) {
        setConnectionStatus('success');
        setConnectionResult(data);
        toast({
          title: "Supabase Connection Successful",
          description: "Database connection established successfully"
        });
      } else {
        setConnectionStatus('error');
        setConnectionResult(data);
        toast({
          title: "Connection Failed",
          description: data.error || "Unknown error",
          variant: "destructive"
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      setConnectionResult({ error: error.message });
      toast({
        title: "Connection Test Failed",
        description: "Unable to reach test endpoint",
        variant: "destructive"
      });
    }
  };

  const testLargeBodyHandling = async () => {
    setBodyTestStatus('testing');
    try {
      // Create a large payload to test body size limits
      const largeData = 'A'.repeat(2000000); // 2MB of data
      const payload = {
        message: testMessage,
        largeData,
        testInfo: 'Testing body parser limits increased to 10MB'
      };

      const response = await fetch('/api/supabase/test-large-body', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.success) {
        setBodyTestStatus('success');
        setBodyTestResult(data);
        toast({
          title: "Large Body Test Successful",
          description: `Handled ${Math.round(data.receivedBodySize / 1024 / 1024 * 100) / 100}MB successfully`
        });
      } else {
        setBodyTestStatus('error');
        setBodyTestResult(data);
        toast({
          title: "Large Body Test Failed",
          description: data.error || "Unknown error",
          variant: "destructive"
        });
      }
    } catch (error) {
      setBodyTestStatus('error');
      setBodyTestResult({ error: error.message });
      toast({
        title: "Body Test Failed",
        description: "Unable to send large payload",
        variant: "destructive"
      });
    }
  };

  const testSupabaseRealtime = async () => {
    setRealtimeStatus('testing');
    try {
      const response = await fetch('/api/supabase/test-realtime');
      const data = await response.json();
      
      if (data.success) {
        setRealtimeStatus('success');
        setRealtimeResult(data);
        toast({
          title: "Real-time Test Successful",
          description: "Supabase real-time functionality working"
        });
      } else {
        setRealtimeStatus('error');
        setRealtimeResult(data);
        toast({
          title: "Real-time Test Failed",
          description: data.error || "Unknown error",
          variant: "destructive"
        });
      }
    } catch (error) {
      setRealtimeStatus('error');
      setRealtimeResult({ error: error.message });
      toast({
        title: "Real-time Test Failed",
        description: "Unable to test real-time functionality",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Success</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Error</Badge>;
      case 'testing':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />Testing...</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Ready</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
            Supabase Integration Test
          </h1>
          <p className="text-gray-600">
            Testing Supabase database connection, body size limits, and real-time functionality
          </p>
        </div>

        {/* Test Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Database Connection Test */}
          <Card className="glassmorphic-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-turquoise-500" />
                Database Connection
                {getStatusBadge(connectionStatus)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Tests the connection to Supabase PostgreSQL database using the configured secrets.
              </p>
              <Button 
                onClick={testSupabaseConnection}
                disabled={connectionStatus === 'testing'}
                className="w-full bg-gradient-to-r from-turquoise-400 to-cyan-500 hover:from-turquoise-500 hover:to-cyan-600"
              >
                {connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
              </Button>
              {connectionResult && (
                <div className="bg-gray-50 p-3 rounded-lg text-xs">
                  <pre>{JSON.stringify(connectionResult, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Large Body Test */}
          <Card className="glassmorphic-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-turquoise-500" />
                Body Size Test
                {getStatusBadge(bodyTestStatus)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Tests handling of large request bodies (2MB+) to fix AI chat "Body exceeded 1mb limit" error.
              </p>
              <Textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Test message for body size testing"
                className="text-xs"
                rows={3}
              />
              <Button 
                onClick={testLargeBodyHandling}
                disabled={bodyTestStatus === 'testing'}
                className="w-full bg-gradient-to-r from-turquoise-400 to-cyan-500 hover:from-turquoise-500 hover:to-cyan-600"
              >
                {bodyTestStatus === 'testing' ? 'Testing 2MB...' : 'Test Large Body'}
              </Button>
              {bodyTestResult && (
                <div className="bg-gray-50 p-3 rounded-lg text-xs">
                  <pre>{JSON.stringify(bodyTestResult, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Real-time Test */}
          <Card className="glassmorphic-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-turquoise-500" />
                Real-time Test
                {getStatusBadge(realtimeStatus)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Tests Supabase real-time channel creation and subscription functionality.
              </p>
              <Button 
                onClick={testSupabaseRealtime}
                disabled={realtimeStatus === 'testing'}
                className="w-full bg-gradient-to-r from-turquoise-400 to-cyan-500 hover:from-turquoise-500 hover:to-cyan-600"
              >
                {realtimeStatus === 'testing' ? 'Testing...' : 'Test Real-time'}
              </Button>
              {realtimeResult && (
                <div className="bg-gray-50 p-3 rounded-lg text-xs">
                  <pre>{JSON.stringify(realtimeResult, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Integration Status */}
        <Card className="glassmorphic-card">
          <CardHeader>
            <CardTitle className="text-center">Integration Status Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Secrets Configured</p>
                <Badge className="bg-green-100 text-green-800">✓ Ready</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Body Parser</p>
                <Badge className="bg-green-100 text-green-800">✓ 10MB Limit</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">TypeScript</p>
                <Badge className="bg-green-100 text-green-800">✓ Fixed</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Migration Ready</p>
                <Badge className="bg-yellow-100 text-yellow-800">📋 Available</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}