import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  Brain, 
  Crown, 
  Zap, 
  Calendar, 
  Activity, 
  Database,
  Settings,
  Eye,
  Users,
  GitCommit,
  Play,
  Pause,
  RefreshCw,
  Clock,
  BarChart3,
  Shield,
  CheckCircle,
  UserCheck,
  Lock,
  AlertCircle,
  MessageSquare,
  TrendingUp,
  FileText,
  Target,
  ChevronRight,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import LifeCEOProjectHierarchy from './LifeCEOProjectHierarchy';
import LifeCEORoleService from '@/services/lifeCEORoleService';

const LifeCEOPortalNew: React.FC = () => {
  const { user } = useAuth();
  const [agentStatus, setAgentStatus] = useState('active');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Check if user has Life CEO admin access
  const hasLifeCEOAccess = user?.roles && LifeCEORoleService.canAccessLifeCEOAdmin(user.roles);
  
  // Get user's Life CEO role
  const userLifeCEORole = user?.roles?.find(role => role.startsWith('life_ceo_')) || 'life_ceo_viewer';
  const userRoleInfo = LifeCEORoleService.getRoleInfo(userLifeCEORole);

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

  const rolePermissions = [
    { role: 'Life CEO Super Admin', users: 1, permissions: 'Full system control', color: 'text-purple-600' },
    { role: 'Life CEO Admin', users: 2, permissions: 'Manage projects & users', color: 'text-blue-600' },
    { role: 'Project Admin', users: 4, permissions: 'Manage own projects', color: 'text-green-600' },
    { role: 'Team Lead', users: 8, permissions: 'Manage team tasks', color: 'text-orange-600' },
    { role: 'Contributor', users: 15, permissions: 'Update own tasks', color: 'text-indigo-600' },
    { role: 'Viewer', users: 5, permissions: 'Read-only access', color: 'text-gray-600' }
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
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="roles">Roles & Access</TabsTrigger>
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
                    <Database className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="text-2xl font-bold">{systemStats.memoryEntries.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Memory Entries</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-purple-500" />
                    <div>
                      <div className="text-2xl font-bold">{systemStats.tasksCompleted}</div>
                      <div className="text-sm text-gray-600">Tasks Completed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <div>
                      <div className="text-2xl font-bold">{systemStats.activeTasks}</div>
                      <div className="text-sm text-gray-600">Active Tasks</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Project Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Life CEO System Progress</CardTitle>
                <CardDescription>Overall completion across all projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Overall Progress</span>
                    <span className="text-sm font-medium">{systemStats.projectProgress}%</span>
                  </div>
                  <Progress value={systemStats.projectProgress} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Agent Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Active Agents</CardTitle>
                <CardDescription>Real-time status of Life CEO agents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeAgents.slice(0, 4).map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                          {agent.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-sm text-gray-600">{agent.taskCount} tasks</div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(agent.status)}>
                        {agent.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <LifeCEOProjectHierarchy />
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agent Management</CardTitle>
                <CardDescription>Monitor and control Life CEO agents</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Tasks</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeAgents.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell className="font-medium">{agent.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{agent.type.replace(/_/g, ' ')}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(agent.status)}>
                            {agent.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{agent.lastActive}</TableCell>
                        <TableCell>{agent.taskCount}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              {agent.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roles & Access Tab */}
          <TabsContent value="roles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Role-Based Access Control</CardTitle>
                <CardDescription>Manage user roles and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rolePermissions.map((role, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Shield className={`w-4 h-4 ${role.color}`} />
                            <span className="font-medium">{role.role}</span>
                          </div>
                        </TableCell>
                        <TableCell>{role.users}</TableCell>
                        <TableCell>{role.permissions}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Permission Matrix */}
            <Card>
              <CardHeader>
                <CardTitle>Your Permissions</CardTitle>
                <CardDescription>Based on your role: {userRoleInfo.badge}</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    You have {userRoleInfo.badge} access to the Life CEO system. 
                    This grants you permissions to manage projects, view analytics, and control agent operations.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
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
                        <span className="text-sm font-medium">42%</span>
                      </div>
                      <Progress value={42} className="h-2" />
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

export default LifeCEOPortalNew;