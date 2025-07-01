import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import TrangoTechSidebar from '@/components/TrangoTechSidebar';
import { 
  Users, 
  Activity, 
  Settings, 
  Shield, 
  BarChart3, 
  Database,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Eye,
  Lock,
  Globe,
  Zap,
  ArrowLeft,
  Calendar,
  AlertCircle,
  Ban,
  UserX,
  MessageSquare,
  Flag,
  Monitor,
  Server,
  HardDrive,
  Wifi
} from 'lucide-react';

interface AdminStats {
  // User Management
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  completedOnboarding: number;
  suspendedUsers: number;
  pendingApproval: number;
  
  // Content & Engagement
  totalPosts: number;
  postsToday: number;
  totalLikes: number;
  totalComments: number;
  flaggedContent: number;
  pendingReports: number;
  autoModerated: number;
  appeals: number;
  
  // Events
  totalEvents: number;
  eventsThisMonth: number;
  totalRsvps: number;
  eventCategories: Record<string, number>;
  featuredEvents: number;
  
  // Community
  totalGroups: number;
  totalGroupMembers: number;
  totalFollows: number;
  
  // Analytics
  dailyActiveUsers: number;
  pageViews: number;
  engagementRate: number;
  topLocations: Array<{ location: string; userCount: number }>;
  
  // System Health & Performance
  systemHealth: number;
  responseTime: string;
  uptime: string;
  databaseLoad: number;
  storageUsed: number;
  errorLogs: number;
  securityEvents: number;
  apiRequests: number;
  warnings: number;
}

interface ComplianceMetrics {
  gdprScore: number;
  soc2Score: number;
  enterpriseScore: number;
  multiTenantScore: number;
  overallScore: number;
  lastAudit: string;
  criticalIssues: number;
  warnings: number;
}

const AdminCenter: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch admin statistics
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stats', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch admin stats');
      }
      return response.json();
    }
  });

  // Fetch compliance metrics
  const { data: compliance, isLoading: complianceLoading } = useQuery<ComplianceMetrics>({
    queryKey: ['/api/admin/compliance'],
    queryFn: async () => {
      const response = await fetch('/api/admin/compliance', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch compliance metrics');
      }
      return response.json();
    }
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'users', label: 'User Management', icon: <Users className="w-4 h-4" /> },
    { id: 'content', label: 'Content Moderation', icon: <FileText className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'events', label: 'Event Management', icon: <Calendar className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports & Logs', icon: <Eye className="w-4 h-4" /> },
    { id: 'compliance', label: 'Compliance Center', icon: <Shield className="w-4 h-4" /> },
    { id: 'system', label: 'System Health', icon: <Activity className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    trend = null,
    bgColor = "bg-white" 
  }: { 
    title: string; 
    value: string | number; 
    subtitle?: string; 
    icon: React.ReactNode; 
    trend?: string | null;
    bgColor?: string;
  }) => (
    <div className={`${bgColor} rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              {icon}
            </div>
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600">{trend}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const ComplianceCard = ({ 
    title, 
    score, 
    description, 
    status 
  }: { 
    title: string; 
    score: number; 
    description: string; 
    status: 'excellent' | 'good' | 'warning' | 'critical';
  }) => {
    const getStatusColor = () => {
      switch (status) {
        case 'excellent': return 'text-green-600 bg-green-50';
        case 'good': return 'text-blue-600 bg-blue-50';
        case 'warning': return 'text-yellow-600 bg-yellow-50';
        case 'critical': return 'text-red-600 bg-red-50';
        default: return 'text-gray-600 bg-gray-50';
      }
    };

    const getStatusIcon = () => {
      switch (status) {
        case 'excellent': return <CheckCircle className="w-5 h-5" />;
        case 'good': return <CheckCircle className="w-5 h-5" />;
        case 'warning': return <AlertTriangle className="w-5 h-5" />;
        case 'critical': return <AlertTriangle className="w-5 h-5" />;
        default: return <Clock className="w-5 h-5" />;
      }
    };

    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="text-sm font-medium">{score}%</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              score >= 90 ? 'bg-green-500' : 
              score >= 75 ? 'bg-blue-500' : 
              score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    );
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Platform Statistics */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers?.toLocaleString() || '0'}
            subtitle="Registered members"
            icon={<Users className="w-5 h-5 text-blue-600" />}
            trend="+12% this month"
          />
          <StatCard
            title="Active Users"
            value={stats?.activeUsers?.toLocaleString() || '0'}
            subtitle="Last 30 days"
            icon={<Activity className="w-5 h-5 text-green-600" />}
            trend="+8% this month"
          />
          <StatCard
            title="Total Events"
            value={stats?.totalEvents?.toLocaleString() || '0'}
            subtitle="All time"
            icon={<Globe className="w-5 h-5 text-purple-600" />}
            trend="+15% this month"
          />
          <StatCard
            title="System Health"
            value={`${stats?.systemHealth || 95}%`}
            subtitle="Overall performance"
            icon={<Zap className="w-5 h-5 text-orange-600" />}
            trend="Excellent"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setSelectedTab('users')}
            className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all text-left group"
          >
            <Users className="w-8 h-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900 mb-1">Manage Users</h3>
            <p className="text-sm text-gray-600">View and manage user accounts</p>
          </button>

          <button 
            onClick={() => setSelectedTab('compliance')}
            className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all text-left group"
          >
            <Shield className="w-8 h-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900 mb-1">Compliance Center</h3>
            <p className="text-sm text-gray-600">Monitor GDPR and security compliance</p>
          </button>

          <button 
            onClick={() => setSelectedTab('system')}
            className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all text-left group"
          >
            <Activity className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900 mb-1">System Health</h3>
            <p className="text-sm text-gray-600">Check performance and logs</p>
          </button>
        </div>
      </div>
    </div>
  );

  const renderCompliance = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Compliance Center</h2>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">
            Last audit: {compliance?.lastAudit || 'Never'}
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Run Audit
          </button>
        </div>
      </div>

      {/* Overall Compliance Score */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Overall Compliance Score</h3>
            <p className="text-sm text-gray-600">Comprehensive security and privacy assessment</p>
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {compliance?.overallScore || 78}%
          </div>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-3">
          <div 
            className="h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${compliance?.overallScore || 78}%` }}
          />
        </div>
      </div>

      {/* Individual Compliance Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ComplianceCard
          title="GDPR Compliance"
          score={compliance?.gdprScore || 90}
          description="Data subject rights, consent management, and privacy controls"
          status={compliance?.gdprScore >= 85 ? 'excellent' : 'good'}
        />
        <ComplianceCard
          title="SOC 2 Type II"
          score={compliance?.soc2Score || 75}
          description="Security controls, availability, and confidentiality standards"
          status={compliance?.soc2Score >= 80 ? 'good' : 'warning'}
        />
        <ComplianceCard
          title="Enterprise Data"
          score={compliance?.enterpriseScore || 70}
          description="Data governance, retention policies, and access controls"
          status={compliance?.enterpriseScore >= 75 ? 'good' : 'warning'}
        />
        <ComplianceCard
          title="Multi-tenant Security"
          score={compliance?.multiTenantScore || 78}
          description="Tenant isolation, resource allocation, and security boundaries"
          status={compliance?.multiTenantScore >= 80 ? 'good' : 'warning'}
        />
      </div>

      {/* Issues Summary */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Issues & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <div className="font-semibold text-red-900">{compliance?.criticalIssues || 0}</div>
              <div className="text-sm text-red-600">Critical Issues</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg">
            <Clock className="w-5 h-5 text-yellow-600" />
            <div>
              <div className="font-semibold text-yellow-900">{compliance?.warnings || 2}</div>
              <div className="text-sm text-yellow-600">Warnings</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <div className="font-semibold text-green-900">Active</div>
              <div className="text-sm text-green-600">Monitoring</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">User Management</h2>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Users className="w-4 h-4 inline mr-2" />
            Export Users
          </button>
        </div>
      </div>

      {/* User Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={<Users className="w-5 h-5" />}
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Active Today"
          value={stats?.activeUsers || 0}
          icon={<Activity className="w-5 h-5" />}
          bgColor="bg-green-50"
        />
        <StatCard
          title="Suspended"
          value="3"
          icon={<Ban className="w-5 h-5" />}
          bgColor="bg-red-50"
        />
        <StatCard
          title="Pending Approval"
          value="7"
          icon={<Clock className="w-5 h-5" />}
          bgColor="bg-yellow-50"
        />
      </div>

      {/* User Actions */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <UserX className="w-5 h-5 text-orange-600" />
            <div className="text-left">
              <div className="font-medium">Moderate Users</div>
              <div className="text-sm text-gray-500">Review flagged accounts</div>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Shield className="w-5 h-5 text-blue-600" />
            <div className="text-left">
              <div className="font-medium">Manage Roles</div>
              <div className="text-sm text-gray-500">Assign admin permissions</div>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Database className="w-5 h-5 text-green-600" />
            <div className="text-left">
              <div className="font-medium">Bulk Operations</div>
              <div className="text-sm text-gray-500">Mass user actions</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderContentModeration = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Content Moderation</h2>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            <Flag className="w-4 h-4 inline mr-2" />
            Review Reports
          </button>
        </div>
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Posts"
          value={stats?.totalPosts || 0}
          icon={<FileText className="w-5 h-5" />}
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Flagged Content"
          value="12"
          icon={<Flag className="w-5 h-5" />}
          bgColor="bg-red-50"
        />
        <StatCard
          title="Auto-Moderated"
          value="89"
          icon={<Shield className="w-5 h-5" />}
          bgColor="bg-green-50"
        />
        <StatCard
          title="Appeals"
          value="4"
          icon={<MessageSquare className="w-5 h-5" />}
          bgColor="bg-yellow-50"
        />
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <div className="font-medium">Inappropriate content reported</div>
                <div className="text-sm text-gray-500">Post ID: #1234 • 2 hours ago</div>
              </div>
            </div>
            <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
              Review
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="font-medium">Spam detection triggered</div>
                <div className="text-sm text-gray-500">User: @user123 • 4 hours ago</div>
              </div>
            </div>
            <button className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700">
              Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Platform Analytics</h2>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Daily Active Users"
          value="2,847"
          subtitle="+12% from yesterday"
          icon={<Users className="w-5 h-5" />}
          trend="+12%"
          bgColor="bg-green-50"
        />
        <StatCard
          title="Page Views"
          value="18,392"
          subtitle="+8.2% from last week"
          icon={<Eye className="w-5 h-5" />}
          trend="+8.2%"
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Engagement Rate"
          value="74.3%"
          subtitle="+2.1% improvement"
          icon={<TrendingUp className="w-5 h-5" />}
          trend="+2.1%"
          bgColor="bg-purple-50"
        />
      </div>

      {/* Geographic Analytics */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Locations</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-blue-600" />
              <span>Buenos Aires, Argentina</span>
            </div>
            <span className="text-sm text-gray-500">1,247 users</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-blue-600" />
              <span>Barcelona, Spain</span>
            </div>
            <span className="text-sm text-gray-500">892 users</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-blue-600" />
              <span>Paris, France</span>
            </div>
            <span className="text-sm text-gray-500">634 users</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEventManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Event Management</h2>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Calendar className="w-4 h-4 inline mr-2" />
            Create Event
          </button>
        </div>
      </div>

      {/* Event Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Events"
          value={stats?.totalEvents || 0}
          icon={<Calendar className="w-5 h-5" />}
          bgColor="bg-green-50"
        />
        <StatCard
          title="This Month"
          value="47"
          icon={<Calendar className="w-5 h-5" />}
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Pending Approval"
          value="8"
          icon={<Clock className="w-5 h-5" />}
          bgColor="bg-yellow-50"
        />
        <StatCard
          title="Featured Events"
          value="12"
          icon={<TrendingUp className="w-5 h-5" />}
          bgColor="bg-purple-50"
        />
      </div>

      {/* Event Categories */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">15</div>
            <div className="text-sm text-gray-600">Milongas</div>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-green-600">8</div>
            <div className="text-sm text-gray-600">Workshops</div>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">6</div>
            <div className="text-sm text-gray-600">Festivals</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReportsAndLogs = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Reports & System Logs</h2>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Eye className="w-4 h-4 inline mr-2" />
            View All Logs
          </button>
        </div>
      </div>

      {/* Log Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Error Logs"
          value="23"
          icon={<AlertTriangle className="w-5 h-5" />}
          bgColor="bg-red-50"
        />
        <StatCard
          title="Security Events"
          value="156"
          icon={<Shield className="w-5 h-5" />}
          bgColor="bg-blue-50"
        />
        <StatCard
          title="API Requests"
          value="47.2K"
          icon={<Database className="w-5 h-5" />}
          bgColor="bg-green-50"
        />
        <StatCard
          title="Warnings"
          value="8"
          icon={<AlertCircle className="w-5 h-5" />}
          bgColor="bg-yellow-50"
        />
      </div>

      {/* Recent Logs */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent System Events</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <div className="font-medium">Database backup completed</div>
              <div className="text-sm text-gray-500">2 hours ago • Size: 2.4GB</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div className="flex-1">
              <div className="font-medium">High memory usage detected</div>
              <div className="text-sm text-gray-500">4 hours ago • 87% utilization</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <Database className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <div className="font-medium">Scheduled maintenance completed</div>
              <div className="text-sm text-gray-500">Yesterday • Duration: 15 minutes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemHealth = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">System Health Monitor</h2>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Monitor className="w-4 h-4 inline mr-2" />
            Refresh Status
          </button>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Server Uptime"
          value="99.9%"
          subtitle="30-day average"
          icon={<Server className="w-5 h-5" />}
          bgColor="bg-green-50"
        />
        <StatCard
          title="Response Time"
          value="127ms"
          subtitle="Average API response"
          icon={<Zap className="w-5 h-5" />}
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Database Load"
          value="23%"
          subtitle="Current utilization"
          icon={<Database className="w-5 h-5" />}
          bgColor="bg-yellow-50"
        />
        <StatCard
          title="Storage Used"
          value="67%"
          subtitle="of allocated space"
          icon={<HardDrive className="w-5 h-5" />}
          bgColor="bg-purple-50"
        />
      </div>

      {/* Service Status */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Web Application</span>
            </div>
            <span className="text-sm text-green-600 font-medium">Operational</span>
          </div>
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Database</span>
            </div>
            <span className="text-sm text-green-600 font-medium">Operational</span>
          </div>
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>WebSocket Services</span>
            </div>
            <span className="text-sm text-green-600 font-medium">Operational</span>
          </div>
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Wifi className="w-5 h-5 text-green-600" />
              <span>CDN</span>
            </div>
            <span className="text-sm text-green-600 font-medium">Operational</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Admin Settings</h2>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Settings className="w-4 h-4 inline mr-2" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Platform Settings */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Configuration</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">User Registration</div>
              <div className="text-sm text-gray-500">Allow new user signups</div>
            </div>
            <button className="w-12 h-6 bg-green-500 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Content Moderation</div>
              <div className="text-sm text-gray-500">Auto-moderate flagged content</div>
            </div>
            <button className="w-12 h-6 bg-green-500 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Email Notifications</div>
              <div className="text-sm text-gray-500">Send system notifications via email</div>
            </div>
            <button className="w-12 h-6 bg-gray-300 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="font-medium mb-2">Session Timeout</div>
            <select className="w-full p-2 border border-gray-300 rounded-lg">
              <option>30 minutes</option>
              <option>1 hour</option>
              <option>4 hours</option>
              <option>24 hours</option>
            </select>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="font-medium mb-2">Password Policy</div>
            <select className="w-full p-2 border border-gray-300 rounded-lg">
              <option>Standard</option>
              <option>Strong</option>
              <option>Enterprise</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (selectedTab) {
      case 'overview': return renderOverview();
      case 'users': return renderUserManagement();
      case 'content': return renderContentModeration();
      case 'analytics': return renderAnalytics();
      case 'events': return renderEventManagement();
      case 'reports': return renderReportsAndLogs();
      case 'compliance': return renderCompliance();
      case 'system': return renderSystemHealth();
      case 'settings': return renderSettings();
      default: return renderOverview();
    }
  };

  if (statsLoading || complianceLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-300 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-cyan-50 flex">
      <TrangoTechSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : ''}`}>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Center</h1>
                    <p className="text-sm text-gray-500">Mundo Tango Platform Administration</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {/* Back to App Button */}
                  <button 
                    onClick={() => window.location.href = '/moments'}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm"
                  >
                    <ArrowLeft className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700 font-medium">Back to App</span>
                  </button>
                  
                  <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    System Healthy
                  </div>
                </div>
              </div>
            </div>
          </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {renderContent()}
        </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCenter;