import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, 
  Users, 
  Brain, 
  Clock, 
  CheckCircle, 
  Lock,
  Settings,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import LifeCEORoleService from '@/services/lifeCEORoleService';
// import LifeCEOAgentChat from './LifeCEOAgentChat';

const LifeCEOPortal: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Check if user has Life CEO admin access - simplified check
  const hasLifeCEOAccess = user?.roles && (
    user.roles.includes('super_admin') || 
    user.roles.includes('admin') ||
    user.roles.some(role => typeof role === 'string' && role.startsWith('life_ceo_'))
  );
  
  // Get user's Life CEO role - simplified
  const userRoleInfo = { icon: '👑', color: 'text-purple-600', badge: 'Admin' };

  // Mock data
  const systemStats = {
    totalAgents: 12,
    activeAgents: 8,
    memoryEntries: 1247,
    dailyReviewTime: '10:00 AM',
    systemUptime: '99.9%',
    tasksCompleted: 284,
    activeTasks: 47,
    projectProgress: 45
  };

  const activeAgents = [
    { id: 1, name: 'Health Agent', type: 'health_wellness', status: 'active', lastActive: '2 min ago', taskCount: 12 },
    { id: 2, name: 'Finance Agent', type: 'financial_planning', status: 'active', lastActive: '5 min ago', taskCount: 8 },
    { id: 3, name: 'Social Agent', type: 'social_relationships', status: 'paused', lastActive: '1 hour ago', taskCount: 5 },
    { id: 4, name: 'Career Agent', type: 'career_development', status: 'active', lastActive: '10 min ago', taskCount: 15 },
    { id: 5, name: 'Learning Agent', type: 'personal_learning', status: 'active', lastActive: 'Just now', taskCount: 20 },
    { id: 6, name: 'Home Agent', type: 'home_management', status: 'active', lastActive: '30 min ago', taskCount: 7 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!hasLifeCEOAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <Lock className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to access the Life CEO Portal. 
            Please contact your administrator for access.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header with Role Badge */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-lg p-6 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Crown className="w-8 h-8" />
                <h1 className="text-3xl font-bold">Life CEO Portal</h1>
                <Badge className="bg-white/20 text-white border-white/30">
                  <span className="mr-1">{userRoleInfo.icon}</span>
                  {userRoleInfo.badge}
                </Badge>
              </div>
              <p className="text-purple-100">
                Comprehensive life management system with AI-driven agents
              </p>
            </div>
            <div className="text-right mt-4 md:mt-0">
              <div className="text-3xl font-bold">{systemStats.systemUptime}</div>
              <div className="text-sm text-purple-100">System Uptime</div>
              <Badge className="bg-green-500 text-white mt-2">
                <CheckCircle className="w-3 h-3 mr-1" />
                Operational
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="chat">AI Chat</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="text-2xl font-bold">{systemStats.activeAgents}/{systemStats.totalAgents}</div>
                      <div className="text-sm text-gray-600">Active Agents</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-purple-500" />
                    <div>
                      <div className="text-2xl font-bold">{systemStats.memoryEntries}</div>
                      <div className="text-sm text-gray-600">Memory Entries</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="text-2xl font-bold">{systemStats.dailyReviewTime}</div>
                      <div className="text-sm text-gray-600">Daily Review</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-orange-500" />
                    <div>
                      <div className="text-2xl font-bold">{systemStats.tasksCompleted}</div>
                      <div className="text-sm text-gray-600">Tasks Completed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Overview */}
            <Card>
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Overall System Health</span>
                    <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Active Tasks</span>
                    <span className="font-medium">{systemStats.activeTasks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Project Progress</span>
                    <span className="font-medium">{systemStats.projectProgress}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agent Status Overview</CardTitle>
                <CardDescription>
                  Monitor and manage your Life CEO AI agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeAgents.map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <div>
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-sm text-gray-500">{agent.lastActive}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(agent.status)}>
                          {agent.status}
                        </Badge>
                        <span className="text-sm text-gray-500">{agent.taskCount} tasks</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            {/* <LifeCEOAgentChat agentId="life-manager" /> */}
            <div className="text-center py-8 text-gray-500">
              Chat component temporarily disabled for debugging
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">CPU Usage</span>
                        <span className="text-sm font-medium">45%</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Memory Usage</span>
                        <span className="text-sm font-medium">68%</span>
                      </div>
                      <Progress value={68} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Agent Efficiency</span>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Task Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completed Today</span>
                      <Badge className="bg-green-100 text-green-800">47</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">In Progress</span>
                      <Badge className="bg-blue-100 text-blue-800">23</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pending Review</span>
                      <Badge className="bg-yellow-100 text-yellow-800">12</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Blocked</span>
                      <Badge className="bg-red-100 text-red-800">3</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LifeCEOPortal;