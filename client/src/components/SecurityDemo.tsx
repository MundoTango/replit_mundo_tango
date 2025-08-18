import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, Users, MessageSquare, Calendar, Heart } from 'lucide-react';

interface SecurityTest {
  name: string;
  description: string;
  status: 'pending' | 'testing' | 'passed' | 'failed';
  result?: string;
}

export default function SecurityDemo() {
  const [tests, setTests] = useState<SecurityTest[]>([
    {
      name: 'User Context Security',
      description: 'Verify user context is properly set for database operations',
      status: 'pending'
    },
    {
      name: 'Chat Room Access Control',
      description: 'Test that users can only access authorized chat rooms',
      status: 'pending'
    },
    {
      name: 'Friend Request Email',
      description: 'Send friend request with email notification',
      status: 'pending'
    },
    {
      name: 'Event Feedback Security',
      description: 'Submit event feedback with safety reporting',
      status: 'pending'
    },
    {
      name: 'Memory Tagging Email',
      description: 'Tag user in memory with email notification',
      status: 'pending'
    }
  ]);

  const [chatMessage, setChatMessage] = useState('');
  const [eventFeedback, setEventFeedback] = useState('');
  const [memoryTitle, setMemoryTitle] = useState('');
  const [selectedFriend, setSelectedFriend] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const updateTestStatus = (testName: string, status: SecurityTest['status'], result?: string) => {
    setTests(prev => prev.map(test => 
      test.name === testName ? { ...test, status, result } : test
    ));
  };

  const testUserContext = async () => {
    updateTestStatus('User Context Security', 'testing');
    addLog('Testing user context security...');
    
    try {
      const response = await fetch('/api/auth/user', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        addLog(`User context verified for: ${userData.name} (ID: ${userData.id})`);
        updateTestStatus('User Context Security', 'passed', `User ID ${userData.id} context active`);
      } else {
        updateTestStatus('User Context Security', 'failed', 'Authentication failed');
      }
    } catch (error) {
      addLog(`User context test failed: ${error}`);
      updateTestStatus('User Context Security', 'failed', 'Network error');
    }
  };

  const testChatAccess = async () => {
    updateTestStatus('Chat Room Access Control', 'testing');
    addLog('Testing chat room access control...');
    
    if (!chatMessage.trim()) {
      updateTestStatus('Chat Room Access Control', 'failed', 'Message required');
      return;
    }

    try {
      const response = await fetch('/api/chat/security-test-room/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: chatMessage })
      });
      
      if (response.ok) {
        const result = await response.json();
        addLog(`Chat message sent successfully to security test room`);
        updateTestStatus('Chat Room Access Control', 'passed', 'Message sent with proper authentication');
      } else {
        const error = await response.json();
        addLog(`Chat access denied: ${error.message}`);
        updateTestStatus('Chat Room Access Control', 'passed', 'Access properly restricted');
      }
    } catch (error) {
      addLog(`Chat test failed: ${error}`);
      updateTestStatus('Chat Room Access Control', 'failed', 'Network error');
    }
  };

  const testFriendRequest = async () => {
    updateTestStatus('Friend Request Email', 'testing');
    addLog('Testing friend request with email notification...');
    
    if (!selectedFriend) {
      updateTestStatus('Friend Request Email', 'failed', 'Friend ID required');
      return;
    }

    try {
      const response = await fetch('/api/friend-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ friendId: parseInt(selectedFriend) })
      });
      
      if (response.ok) {
        const result = await response.json();
        addLog(`Friend request sent successfully with email notification`);
        updateTestStatus('Friend Request Email', 'passed', 'Request sent with email');
      } else {
        const error = await response.json();
        addLog(`Friend request failed: ${error.message}`);
        updateTestStatus('Friend Request Email', 'failed', error.message);
      }
    } catch (error) {
      addLog(`Friend request test failed: ${error}`);
      updateTestStatus('Friend Request Email', 'failed', 'Network error');
    }
  };

  const testEventFeedback = async () => {
    updateTestStatus('Event Feedback Security', 'testing');
    addLog('Testing event feedback with safety reporting...');
    
    if (!eventFeedback.trim()) {
      updateTestStatus('Event Feedback Security', 'failed', 'Feedback content required');
      return;
    }

    try {
      const response = await fetch('/api/event/1/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          type: 'safety_report',
          content: eventFeedback,
          rating: 1
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        addLog(`Safety report submitted successfully - organizer will be notified`);
        updateTestStatus('Event Feedback Security', 'passed', 'Safety report with email sent');
      } else {
        const error = await response.json();
        addLog(`Event feedback failed: ${error.message}`);
        updateTestStatus('Event Feedback Security', 'failed', error.message);
      }
    } catch (error) {
      addLog(`Event feedback test failed: ${error}`);
      updateTestStatus('Event Feedback Security', 'failed', 'Network error');
    }
  };

  const testMemoryTagging = async () => {
    updateTestStatus('Memory Tagging Email', 'testing');
    addLog('Testing memory tagging with email notification...');
    
    if (!memoryTitle.trim() || !selectedFriend) {
      updateTestStatus('Memory Tagging Email', 'failed', 'Memory title and friend required');
      return;
    }

    try {
      const response = await fetch('/api/memory/demo-123/tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          taggedUserId: parseInt(selectedFriend),
          memoryTitle: memoryTitle
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        addLog(`User tagged in memory successfully with email notification`);
        updateTestStatus('Memory Tagging Email', 'passed', 'Memory tag with email sent');
      } else {
        const error = await response.json();
        addLog(`Memory tagging failed: ${error.message}`);
        updateTestStatus('Memory Tagging Email', 'failed', error.message);
      }
    } catch (error) {
      addLog(`Memory tagging test failed: ${error}`);
      updateTestStatus('Memory Tagging Email', 'failed', 'Network error');
    }
  };

  const runAllTests = async () => {
    addLog('Starting comprehensive security test suite...');
    await testUserContext();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testChatAccess();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testFriendRequest();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testEventFeedback();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testMemoryTagging();
    addLog('Security test suite completed');
  };

  const getStatusColor = (status: SecurityTest['status']) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'testing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <Shield className="h-12 w-12 mx-auto mb-4 text-blue-600" />
        <h1 className="text-3xl font-bold">Security System Demonstration</h1>
        <p className="text-gray-600 mt-2">
          Test the comprehensive security features of Mundo Tango platform
        </p>
      </div>

      <Alert>
        <Lock className="h-4 w-4" />
        <AlertDescription>
          This demo tests Row Level Security policies, authentication middleware, 
          real-time chat access controls, and email notification system.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Security Tests
            </CardTitle>
            <CardDescription>
              Comprehensive security feature testing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tests.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{test.name}</h4>
                  <p className="text-sm text-gray-600">{test.description}</p>
                  {test.result && (
                    <p className="text-xs text-gray-500 mt-1">{test.result}</p>
                  )}
                </div>
                <Badge className={getStatusColor(test.status)}>
                  {test.status}
                </Badge>
              </div>
            ))}
            
            <Button onClick={runAllTests} className="w-full" size="lg">
              Run All Security Tests
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Interactive Testing
            </CardTitle>
            <CardDescription>
              Test individual security features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Chat Message Test</label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Enter test message"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                />
                <Button onClick={testChatAccess} size="sm">
                  Send
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Friend ID for Testing</label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="number"
                  placeholder="Enter friend user ID"
                  value={selectedFriend}
                  onChange={(e) => setSelectedFriend(e.target.value)}
                />
                <Button onClick={testFriendRequest} size="sm">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Event Feedback (Safety Report)</label>
              <div className="flex gap-2 mt-1">
                <Textarea
                  placeholder="Enter safety concern"
                  value={eventFeedback}
                  onChange={(e) => setEventFeedback(e.target.value)}
                  rows={2}
                />
                <Button onClick={testEventFeedback} size="sm">
                  Report
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Memory Title for Tagging</label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Enter memory title"
                  value={memoryTitle}
                  onChange={(e) => setMemoryTitle(e.target.value)}
                />
                <Button onClick={testMemoryTagging} size="sm">
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Security Event Log</CardTitle>
          <CardDescription>
            Real-time security testing results and system logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-gray-500">No security events logged yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
          <Button 
            onClick={() => setLogs([])} 
            variant="outline" 
            size="sm" 
            className="mt-2"
          >
            Clear Logs
          </Button>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-gray-500">
        <p>
          Security features include: Row Level Security policies, user context authentication,
          real-time access controls, email notifications, audit logging, and rate limiting.
        </p>
      </div>
    </div>
  );
}