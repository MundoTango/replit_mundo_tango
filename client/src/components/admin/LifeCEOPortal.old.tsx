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
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import LifeCEOProjectHierarchy from './LifeCEOProjectHierarchy';
import LifeCEORoleService from '../../services/lifeCEORoleService';

const LifeCEOPortal: React.FC = () => {
  const { user } = useAuth();
  const [agentStatus, setAgentStatus] = useState('active');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock data for Life CEO system status
  const systemStats = {
    totalAgents: 12,
    activeAgents: 11,
    memoryEntries: 1847,
    dailyReviewTime: '10:00 AM',
    lastReview: '2025-07-02 10:00:00',
    systemUptime: '99.8%'
  };

  const activeAgents = [
    { id: 'life_ceo', name: 'Life CEO', status: 'active', type: 'orchestrator' },
    { id: 'mundo_tango_ceo', name: 'Mundo Tango CEO', status: 'active', type: 'project_manager' },
    { id: 'finance_ceo', name: 'Finance CEO', status: 'active', type: 'financial_manager' },
    { id: 'travel_ceo', name: 'Travel CEO', status: 'active', type: 'travel_manager' },
    { id: 'modeling_agent', name: 'Modeling Agent', status: 'active', type: 'content_manager' },
    { id: 'security_agent', name: 'Security Agent', status: 'active', type: 'security_manager' },
    { id: 'memory_agent', name: 'Memory Agent', status: 'active', type: 'memory_manager' },
    { id: 'voice_agent', name: 'Voice Agent', status: 'paused', type: 'voice_manager' }
  ];

  const recentActivity = [
    { time: '10:00 AM', agent: 'Life CEO', action: 'Daily review initiated', type: 'system' },
    { time: '09:45 AM', agent: 'Memory Agent', action: 'Indexed 15 new memories', type: 'data' },
    { time: '09:30 AM', agent: 'Finance CEO', action: 'Budget analysis completed', type: 'analysis' },
    { time: '09:15 AM', agent: 'Travel CEO', action: 'Flight options researched', type: 'research' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Life CEO Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Life CEO System</h1>
              <p className="text-purple-100">AI-Powered Life Management Platform</p>
              <div className="flex items-center space-x-2 mt-2">
                <Crown className="w-4 h-4" />
                <span className="text-sm">Orchestrating {user?.name}'s Life</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{systemStats.systemUptime}</div>
            <div className="text-sm text-purple-100">System Uptime</div>
            <Badge className="bg-green-500 text-white mt-2">
              <CheckCircle className="w-3 h-3 mr-1" />
              Operational
            </Badge>
          </div>
        </div>
      </div>

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
              <Clock className="w-5 h-5 text-purple-500" />
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
              <BarChart3 className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">47</div>
                <div className="text-sm text-gray-600">Tasks Today</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Agent Status</span>
            </CardTitle>
            <CardDescription>Real-time status of all Life CEO agents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeAgents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                      {agent.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{agent.name}</div>
                      <div className="text-sm text-gray-600">{agent.type.replace(/_/g, ' ')}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(agent.status)}>
                      {agent.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      {agent.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>Latest actions from your AI agents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{activity.action}</div>
                    <div className="text-xs text-gray-600">{activity.agent} • {activity.time}</div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>System Controls</span>
          </CardTitle>
          <CardDescription>Manage your Life CEO system operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700">
              <Calendar className="w-4 h-4 mr-2" />
              Trigger Daily Review
            </Button>
            
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync All Agents
            </Button>
            
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View Memory Store
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Access</CardTitle>
          <CardDescription>Navigate to key Life CEO functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <GitCommit className="w-6 h-6" />
              <span className="text-sm">Agent Logs</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Database className="w-6 h-6" />
              <span className="text-sm">Memory Bank</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Shield className="w-6 h-6" />
              <span className="text-sm">Security</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <BarChart3 className="w-6 h-6" />
              <span className="text-sm">Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LifeCEOPortal;