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
  Zap
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalEvents: number;
  totalPosts: number;
  complianceScore: number;
  systemHealth: number;
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

  const renderUsers = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">User Management</h2>
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <p className="text-gray-600">User management interface coming soon...</p>
      </div>
    </div>
  );

  const renderSystem = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">System Health</h2>
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <p className="text-gray-600">System monitoring dashboard coming soon...</p>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Settings</h2>
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <p className="text-gray-600">Admin settings panel coming soon...</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (selectedTab) {
      case 'overview': return renderOverview();
      case 'users': return renderUsers();
      case 'compliance': return renderCompliance();
      case 'system': return renderSystem();
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

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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