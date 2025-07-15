import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import TrangoTechSidebar from '@/components/TrangoTechSidebar';
import ProjectTrackerDashboard from '@/components/admin/ProjectTrackerDashboard';
import Comprehensive11LProjectTracker from '@/components/admin/Comprehensive11LProjectTracker';
import EnhancedHierarchicalTreeView from '@/components/admin/EnhancedHierarchicalTreeView';
import { PlatformFeatureDeepDive } from '@/components/admin/PlatformFeatureDeepDive';
import LifeCEOPortal from '@/components/admin/LifeCEOPortal';
import DailyActivityView from '@/components/admin/DailyActivityView';
import { EventTypesManager } from '@/components/admin/EventTypesManager';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { GlobalStatisticsDashboard } from '@/components/GlobalStatisticsDashboard';
import PerformanceMonitor from '@/components/admin/PerformanceMonitor';
import Framework23LDashboard from '@/components/admin/Framework23LDashboard';
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
  Wifi,
  GitCommit,
  Brain,
  RefreshCw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Layers } from 'lucide-react';

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
  const [selectedTab, setSelectedTab] = useState('life-ceo');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [rbacData, setRbacData] = useState<any>(null);
  const [rbacLoading, setRbacLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [permissionTest, setPermissionTest] = useState({
    resource: '',
    action: '',
    result: null as any
  });
  
  // System Health state - moved here to avoid hooks error
  const [systemHealthRefreshing, setSystemHealthRefreshing] = useState(false);
  
  // Compliance state - must be declared at top level
  const [complianceRefreshing, setComplianceRefreshing] = useState(false);
  const [auditHistory, setAuditHistory] = useState([]);
  const [monitoringStatus, setMonitoringStatus] = useState(null);
  const [performanceKey, setPerformanceKey] = useState(0);
  const [systemMetrics, setSystemMetrics] = useState({
    uptime: 99.9,
    responseTime: 127,
    databaseLoad: 23,
    storageUsed: 67
  });

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

  // RBAC/ABAC Management Functions
  const fetchRbacAnalytics = async () => {
    setRbacLoading(true);
    try {
      const response = await fetch('/api/rbac/analytics', {
        credentials: 'include'
      });
      const data = await response.json();
      setRbacData(data);
    } catch (error) {
      console.error('Error fetching RBAC analytics:', error);
    } finally {
      setRbacLoading(false);
    }
  };

  const testPermission = async () => {
    if (!selectedUserId || !permissionTest.resource || !permissionTest.action) return;
    
    try {
      const response = await fetch('/api/rbac/check-permission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: selectedUserId,
          resource: permissionTest.resource,
          action: permissionTest.action
        })
      });
      const result = await response.json();
      setPermissionTest(prev => ({ ...prev, result }));
    } catch (error) {
      console.error('Error testing permission:', error);
    }
  };

  const triggerAutoAssignment = async () => {
    try {
      await fetch('/api/rbac/auto-assign', {
        method: 'POST',
        credentials: 'include'
      });
      await fetchRbacAnalytics(); // Refresh data
    } catch (error) {
      console.error('Error triggering auto-assignment:', error);
    }
  };

  const runComplianceAudit = async () => {
    try {
      const response = await fetch('/api/rbac/compliance-audit', {
        method: 'POST',
        credentials: 'include'
      });
      const result = await response.json();
      setRbacData(prev => ({ ...prev, auditResults: result }));
    } catch (error) {
      console.error('Error running compliance audit:', error);
    }
  };

  const tabs = [
    { id: 'life-ceo', label: 'Life CEO Portal', icon: <Brain className="w-4 h-4" /> },
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'statistics', label: 'Global Statistics', icon: <Globe className="w-4 h-4" />, isNew: true },
    { id: 'daily-activity', label: 'Daily Activity', icon: <Calendar className="w-4 h-4" />, isNew: true },
    { id: 'project-tracker', label: 'The Plan', icon: <GitCommit className="w-4 h-4" /> },
    { id: 'feature-deep-dive', label: 'Feature Deep Dive', icon: <Database className="w-4 h-4" /> },
    { id: 'users', label: 'User Management', icon: <Users className="w-4 h-4" /> },
    { id: 'content', label: 'Content Moderation', icon: <FileText className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'events', label: 'Event Management', icon: <Calendar className="w-4 h-4" /> },
    { id: 'event-types', label: 'Event Types', icon: <Calendar className="w-4 h-4" />, isNew: true },
    { id: 'reports', label: 'Reports & Logs', icon: <Eye className="w-4 h-4" /> },
    { id: 'compliance', label: 'Compliance Center', icon: <Shield className="w-4 h-4" /> },
    { id: 'rbac', label: 'RBAC/ABAC Manager', icon: <Lock className="w-4 h-4" /> },
    { id: 'system', label: 'System Health', icon: <Activity className="w-4 h-4" /> },
    { id: '23l-framework', label: '23L Framework', icon: <Layers className="w-4 h-4" />, isNew: true },
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
      {/* Platform Statistics with MT Design */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Platform Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-blue-500 rounded-xl">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-blue-600">+12%</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats?.totalUsers?.toLocaleString() || '0'}</div>
            <div className="text-sm text-gray-600 mt-1">Total Users</div>
            <div className="text-xs text-gray-500 mt-1">Registered members</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-green-500 rounded-xl">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-green-600">+8%</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats?.activeUsers?.toLocaleString() || '0'}</div>
            <div className="text-sm text-gray-600 mt-1">Active Users</div>
            <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-purple-500 rounded-xl">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-purple-600">+15%</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats?.totalEvents?.toLocaleString() || '0'}</div>
            <div className="text-sm text-gray-600 mt-1">Total Events</div>
            <div className="text-xs text-gray-500 mt-1">All time</div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-orange-500 rounded-xl">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-orange-600">Excellent</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats?.systemHealth || 95}%</div>
            <div className="text-sm text-gray-600 mt-1">System Health</div>
            <div className="text-xs text-gray-500 mt-1">Overall performance</div>
          </div>
        </div>
      </div>

      {/* Quick Actions with MT Styling */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => setSelectedTab('users')}
            className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl hover:shadow-xl transition-all text-left group transform hover:-translate-y-1"
          >
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl inline-flex mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Manage Users</h3>
            <p className="text-sm text-gray-600">View and manage user accounts</p>
          </button>

          <button 
            onClick={() => setSelectedTab('compliance')}
            className="p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl hover:shadow-xl transition-all text-left group transform hover:-translate-y-1"
          >
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl inline-flex mb-3 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Compliance Center</h3>
            <p className="text-sm text-gray-600">Monitor GDPR and security</p>
          </button>

          <button 
            onClick={() => setSelectedTab('system')}
            className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl hover:shadow-xl transition-all text-left group transform hover:-translate-y-1"
          >
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl inline-flex mb-3 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">System Health</h3>
            <p className="text-sm text-gray-600">Check performance and logs</p>
          </button>

          <a 
            href="/ttfiles-demo"
            className="p-5 bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-2xl hover:shadow-xl transition-all text-left group block transform hover:-translate-y-1"
          >
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl inline-flex mb-3 group-hover:scale-110 transition-transform">
              <Code className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-white mb-1">TTfiles Demo</h3>
            <p className="text-sm text-white/90">View TrangoTech vintage components</p>
          </a>
        </div>
      </div>
    </div>
  );

  const refreshCompliance = async () => {
    setComplianceRefreshing(true);
    try {
      const response = await fetch('/api/admin/compliance/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Update compliance data
        setCompliance(result.data);
        
        // Show success message
        console.log('Compliance audit refreshed successfully');
        
        // Refresh all data
        await loadData();
      } else {
        console.error('Failed to refresh compliance:', result.message);
      }
    } catch (error) {
      console.error('Error refreshing compliance:', error);
    } finally {
      setComplianceRefreshing(false);
    }
  };

  const loadComplianceHistory = async () => {
    try {
      const response = await fetch('/api/admin/compliance/history?limit=10');
      const result = await response.json();
      if (result.success) {
        setAuditHistory(result.data);
      }
    } catch (error) {
      console.error('Error loading compliance history:', error);
    }
  };

  const loadMonitoringStatus = async () => {
    try {
      const response = await fetch('/api/admin/compliance/monitoring-status');
      const result = await response.json();
      if (result.success) {
        setMonitoringStatus(result.data);
      }
    } catch (error) {
      console.error('Error loading monitoring status:', error);
    }
  };

  useEffect(() => {
    if (selectedTab === 'compliance') {
      loadComplianceHistory();
      loadMonitoringStatus();
    }
  }, [selectedTab]);

  const renderCompliance = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-800">Compliance Center</h2>
        <div className="flex flex-col sm:flex-row items-end gap-3">
          <div className="text-sm text-gray-600">
            Last audit: {compliance?.lastAudit || 'Never'}
            {compliance?.auditType && (
              <span className="ml-2 px-2 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-purple-700 text-xs rounded-full font-medium">
                {compliance.auditType}
              </span>
            )}
          </div>
          <button 
            onClick={refreshCompliance}
            disabled={complianceRefreshing}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform hover:-translate-y-0.5"
          >
            {complianceRefreshing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Running...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Run Audit
              </>
            )}
          </button>
        </div>
      </div>

      {/* Monitoring Status with MT Styling */}
      {monitoringStatus && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-5 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
              <div>
                <h3 className="font-semibold text-green-900">Automated Monitoring Active</h3>
                <p className="text-sm text-green-700">
                  Next scheduled audit: {new Date(monitoringStatus.nextScheduledAudit).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-sm text-green-600 font-medium">
              {compliance?.executionTimeMs && `Last audit: ${compliance.executionTimeMs}ms`}
            </div>
          </div>
        </div>
      )}

      {/* Audit History with MT Styling */}
      {auditHistory.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Audit History</h3>
          <div className="space-y-3">
            {auditHistory.slice(0, 5).map((audit, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    audit.overallScore >= 85 ? 'bg-green-500 shadow-lg shadow-green-500/50' : 
                    audit.overallScore >= 70 ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50' : 'bg-red-500 shadow-lg shadow-red-500/50'
                  }`}></div>
                  <div>
                    <div className="font-medium text-gray-800">
                      {new Date(audit.timestamp).toLocaleDateString()} at{' '}
                      {new Date(audit.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {audit.auditType} audit • {audit.executionTimeMs}ms
                    </div>
                  </div>
                </div>
                <div className={`text-lg font-bold ${
                  audit.overallScore >= 85 ? 'text-green-600' : 
                  audit.overallScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {audit.overallScore}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overall Compliance Score with MT Styling */}
      <div className="bg-gradient-to-r from-turquoise-50 to-blue-100 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Overall Compliance Score</h3>
            <p className="text-sm text-gray-600">Comprehensive security and privacy assessment</p>
          </div>
          <div className="text-3xl font-bold text-turquoise-600">
            {compliance?.overallScore || 78}%
          </div>
        </div>
        <div className="w-full bg-turquoise-200 rounded-full h-3">
          <div 
            className="h-3 bg-gradient-to-r from-turquoise-500 to-blue-600 rounded-full transition-all duration-500"
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

      {/* Issues Summary with MT Styling */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Issues & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl hover:shadow-md transition-all">
            <div className="p-2 bg-red-500 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-red-800 text-xl">{compliance?.criticalIssues || 0}</div>
              <div className="text-sm text-red-700">Critical Issues</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl hover:shadow-md transition-all">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-yellow-800 text-xl">{compliance?.warnings || 2}</div>
              <div className="text-sm text-yellow-700">Warnings</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:shadow-md transition-all">
            <div className="p-2 bg-green-500 rounded-lg">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-green-800 text-xl">Active</div>
              <div className="text-sm text-green-700">Monitoring</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-800">User Management</h2>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-gradient-to-r from-turquoise-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5">
            <Users className="w-4 h-4 inline mr-2" />
            Export Users
          </button>
        </div>
      </div>

      {/* User Stats Cards with MT Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-blue-500 rounded-xl">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats?.totalUsers || 0}</div>
          <div className="text-sm text-gray-600 mt-1">Total Users</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-green-500 rounded-xl">
              <Activity className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats?.activeUsers || 0}</div>
          <div className="text-sm text-gray-600 mt-1">Active Today</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-red-500 rounded-xl">
              <Ban className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-800">3</div>
          <div className="text-sm text-gray-600 mt-1">Suspended</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-yellow-500 rounded-xl">
              <Clock className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-800">7</div>
          <div className="text-sm text-gray-600 mt-1">Pending Approval</div>
        </div>
      </div>

      {/* User Actions with MT Styling */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl hover:shadow-md transition-all transform hover:-translate-y-0.5 group">
            <div className="p-2 bg-orange-500 rounded-lg group-hover:scale-110 transition-transform">
              <UserX className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-800">Moderate Users</div>
              <div className="text-sm text-gray-600">Review flagged accounts</div>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:shadow-md transition-all transform hover:-translate-y-0.5 group">
            <div className="p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-800">Manage Roles</div>
              <div className="text-sm text-gray-600">Assign admin permissions</div>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:shadow-md transition-all transform hover:-translate-y-0.5 group">
            <div className="p-2 bg-green-500 rounded-lg group-hover:scale-110 transition-transform">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-800">Bulk Operations</div>
              <div className="text-sm text-gray-600">Mass user actions</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderContentModeration = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-800">Content Moderation</h2>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5">
            <Flag className="w-4 h-4 inline mr-2" />
            Review Reports
          </button>
        </div>
      </div>

      {/* Content Stats with MT Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-blue-500 rounded-xl">
              <FileText className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats?.totalPosts || 0}</div>
          <div className="text-sm text-gray-600 mt-1">Total Posts</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-red-500 rounded-xl">
              <Flag className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-800">12</div>
          <div className="text-sm text-gray-600 mt-1">Flagged Content</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-green-500 rounded-xl">
              <Shield className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-800">89</div>
          <div className="text-sm text-gray-600 mt-1">Auto-Moderated</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-yellow-500 rounded-xl">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-800">4</div>
          <div className="text-sm text-gray-600 mt-1">Appeals</div>
        </div>
      </div>

      {/* Recent Reports with MT Styling */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Reports</h3>
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
            <div className="flex items-start gap-3 mb-3 md:mb-0">
              <div className="p-2 bg-red-500 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-medium text-gray-800">Inappropriate content reported</div>
                <div className="text-sm text-gray-600">Post ID: #1234 • 2 hours ago</div>
              </div>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-sm hover:shadow-md transition-all">
              Review
            </button>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl">
            <div className="flex items-start gap-3 mb-3 md:mb-0">
              <div className="p-2 bg-yellow-500 rounded-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-medium text-gray-800">Spam detection triggered</div>
                <div className="text-sm text-gray-600">User: @user123 • 4 hours ago</div>
              </div>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-lg text-sm hover:shadow-md transition-all">
              Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-800">Platform Analytics</h2>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5">
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Analytics Cards with MT Design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-green-500 rounded-xl">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-green-600">+12%</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">2,847</div>
          <div className="text-sm text-gray-600 mt-1">Daily Active Users</div>
          <div className="text-xs text-gray-500 mt-1">+12% from yesterday</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-blue-500 rounded-xl">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-blue-600">+8.2%</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">18,392</div>
          <div className="text-sm text-gray-600 mt-1">Page Views</div>
          <div className="text-xs text-gray-500 mt-1">+8.2% from last week</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-purple-500 rounded-xl">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-purple-600">+2.1%</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">74.3%</div>
          <div className="text-sm text-gray-600 mt-1">Engagement Rate</div>
          <div className="text-xs text-gray-500 mt-1">+2.1% improvement</div>
        </div>
      </div>

      {/* Geographic Analytics with MT Styling */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Locations</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-gray-800">Buenos Aires, Argentina</span>
            </div>
            <span className="text-sm text-purple-600 font-semibold">1,247 users</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-gray-800">Barcelona, Spain</span>
            </div>
            <span className="text-sm text-blue-600 font-semibold">892 users</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-gray-800">Paris, France</span>
            </div>
            <span className="text-sm text-green-600 font-semibold">634 users</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEventManagement = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-800">Event Management</h2>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5">
            <Calendar className="w-4 h-4 inline mr-2" />
            Create Event
          </button>
        </div>
      </div>

      {/* Event Stats with MT Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-green-500 rounded-xl">
              <Calendar className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats?.totalEvents || 0}</div>
          <div className="text-sm text-gray-600 mt-1">Total Events</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-blue-500 rounded-xl">
              <Calendar className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-800">47</div>
          <div className="text-sm text-gray-600 mt-1">This Month</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-yellow-500 rounded-xl">
              <Clock className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-800">8</div>
          <div className="text-sm text-gray-600 mt-1">Pending Approval</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-purple-500 rounded-xl">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-800">12</div>
          <div className="text-sm text-gray-600 mt-1">Featured Events</div>
        </div>
      </div>

      {/* Event Categories with MT Styling */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Event Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:shadow-md transition-all transform hover:-translate-y-0.5">
            <div className="text-2xl font-bold text-blue-600">15</div>
            <div className="text-sm text-gray-700 font-medium">Milongas</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:shadow-md transition-all transform hover:-translate-y-0.5">
            <div className="text-2xl font-bold text-green-600">8</div>
            <div className="text-sm text-gray-700 font-medium">Workshops</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:shadow-md transition-all transform hover:-translate-y-0.5">
            <div className="text-2xl font-bold text-purple-600">6</div>
            <div className="text-sm text-gray-700 font-medium">Festivals</div>
          </div>
        </div>
      </div>
    </div>
  );

  const [reports, setReports] = useState<any[]>([]);
  const [reportFilter, setReportFilter] = useState('unresolved');
  const [reportLoading, setReportLoading] = useState(false);

  const fetchReports = async () => {
    setReportLoading(true);
    try {
      const response = await fetch(`/api/admin/reports?status=${reportFilter}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch reports');
      const data = await response.json();
      if (data.code === 200) {
        setReports(data.data.reports || []);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setReportLoading(false);
    }
  };

  const updateReportStatus = async (reportId: number, status: string) => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('Failed to update report');
      
      // Refresh reports
      await fetchReports();
    } catch (error) {
      console.error('Error updating report:', error);
    }
  };

  useEffect(() => {
    if (selectedTab === 'reports') {
      fetchReports();
    }
  }, [selectedTab, reportFilter]);

  const renderReportsAndLogs = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">User Reports & Moderation</h2>
        <div className="flex gap-3">
          <select
            value={reportFilter}
            onChange={(e) => setReportFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="unresolved">Unresolved</option>
            <option value="resolved">Resolved</option>
            <option value="investigating">Investigating</option>
            <option value="dismissed">Dismissed</option>
            <option value="">All Reports</option>
          </select>
          <button 
            onClick={fetchReports}
            disabled={reportLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Eye className="w-4 h-4 inline mr-2" />
            {reportLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Report Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Pending Reports"
          value={reports.filter(r => r.status === 'unresolved').length}
          icon={<Flag className="w-5 h-5 text-red-600" />}
          bgColor="bg-red-50"
        />
        <StatCard
          title="Investigating"
          value={reports.filter(r => r.status === 'investigating').length}
          icon={<AlertTriangle className="w-5 h-5 text-yellow-600" />}
          bgColor="bg-yellow-50"
        />
        <StatCard
          title="Resolved Today"
          value={reports.filter(r => r.status === 'resolved' && new Date(r.resolved_at).toDateString() === new Date().toDateString()).length}
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
          bgColor="bg-green-50"
        />
        <StatCard
          title="Total Reports"
          value={reports.length}
          icon={<Eye className="w-5 h-5 text-blue-600" />}
          bgColor="bg-blue-50"
        />
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Reports</h3>
        {reportLoading ? (
          <div className="text-center py-8 text-gray-500">
            Loading reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No reports found
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        report.report_type_name === 'Harassment' ? 'bg-red-100 text-red-800' :
                        report.report_type_name === 'Inappropriate' ? 'bg-orange-100 text-orange-800' :
                        report.report_type_name === 'Spam' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {report.report_type_name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {report.instance_type} #{report.instance_id}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        report.status === 'unresolved' ? 'bg-red-100 text-red-700' :
                        report.status === 'investigating' ? 'bg-yellow-100 text-yellow-700' :
                        report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 mb-2">{report.description || 'No description provided'}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Reported by: {report.reporter_name}</span>
                      <span>•</span>
                      <span>{new Date(report.created_at).toLocaleString()}</span>
                      {report.resolved_at && (
                        <>
                          <span>•</span>
                          <span>Resolved: {new Date(report.resolved_at).toLocaleString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {report.status === 'unresolved' && (
                      <>
                        <button
                          onClick={() => updateReportStatus(report.id, 'investigating')}
                          className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
                        >
                          Investigate
                        </button>
                        <button
                          onClick={() => updateReportStatus(report.id, 'resolved')}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => updateReportStatus(report.id, 'dismissed')}
                          className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                          Dismiss
                        </button>
                      </>
                    )}
                    {report.status === 'investigating' && (
                      <>
                        <button
                          onClick={() => updateReportStatus(report.id, 'resolved')}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => updateReportStatus(report.id, 'dismissed')}
                          className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                          Dismiss
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderSystemHealth = () => {
    const handleRefreshAll = async () => {
      setSystemHealthRefreshing(true);
      
      try {
        // Force PerformanceMonitor to re-mount and collect fresh metrics
        setPerformanceKey(prev => prev + 1);
        
        // Simulate fetching updated system metrics
        // In production, this would call actual API endpoints
        setSystemMetrics({
          uptime: 99.8 + Math.random() * 0.2,
          responseTime: 120 + Math.floor(Math.random() * 20),
          databaseLoad: 20 + Math.floor(Math.random() * 10),
          storageUsed: 65 + Math.floor(Math.random() * 5)
        });
        
        // Add a small delay to show loading state
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error refreshing metrics:', error);
      } finally {
        setSystemHealthRefreshing(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-800">System Health Monitor</h2>
          <div className="flex gap-3">
            <button 
              onClick={handleRefreshAll}
              disabled={systemHealthRefreshing}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {systemHealthRefreshing ? (
                <>
                  <RefreshCw className="w-4 h-4 inline mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 inline mr-2" />
                  Refresh Status
                </>
              )}
            </button>
          </div>
        </div>

        {/* System Stats with MT Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className={`bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 ${systemHealthRefreshing ? 'animate-pulse' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-green-500 rounded-xl">
                <Server className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-800">{systemMetrics.uptime.toFixed(1)}%</div>
            <div className="text-sm text-gray-600 mt-1">Server Uptime</div>
            <div className="text-xs text-gray-500 mt-1">30-day average</div>
          </div>

          <div className={`bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 ${systemHealthRefreshing ? 'animate-pulse' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-blue-500 rounded-xl">
                <Zap className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-800">{systemMetrics.responseTime}ms</div>
            <div className="text-sm text-gray-600 mt-1">Response Time</div>
            <div className="text-xs text-gray-500 mt-1">Average API response</div>
          </div>

          <div className={`bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 ${systemHealthRefreshing ? 'animate-pulse' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-yellow-500 rounded-xl">
                <Database className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-800">{systemMetrics.databaseLoad}%</div>
            <div className="text-sm text-gray-600 mt-1">Database Load</div>
            <div className="text-xs text-gray-500 mt-1">Current utilization</div>
          </div>

          <div className={`bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 ${systemHealthRefreshing ? 'animate-pulse' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-purple-500 rounded-xl">
                <HardDrive className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-800">{systemMetrics.storageUsed}%</div>
            <div className="text-sm text-gray-600 mt-1">Storage Used</div>
            <div className="text-xs text-gray-500 mt-1">of allocated space</div>
          </div>
        </div>

      {/* Service Status with MT Styling */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-green-500 rounded-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-gray-800">Web Application</span>
            </div>
            <span className="text-sm text-green-600 font-semibold">Operational</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-green-500 rounded-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-gray-800">Database</span>
            </div>
            <span className="text-sm text-green-600 font-semibold">Operational</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-green-500 rounded-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-gray-800">WebSocket Services</span>
            </div>
            <span className="text-sm text-green-600 font-semibold">Operational</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-green-500 rounded-lg">
                <Wifi className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-gray-800">CDN</span>
            </div>
            <span className="text-sm text-green-600 font-semibold">Operational</span>
          </div>
        </div>
      </div>

      {/* Integrated Performance Monitor with MT Ocean Theme */}
      <div className="mt-6">
        <PerformanceMonitor key={performanceKey} />
      </div>
    </div>
    );
  };

  const render23LFramework = () => {
    const [frameworkData, setFrameworkData] = useState<any>({
      layers: [
        // Foundation Layers (1-4)
        { id: 1, name: 'Expertise & Technical Proficiency', status: 'active', progress: 95 },
        { id: 2, name: 'Research & Discovery', status: 'active', progress: 90 },
        { id: 3, name: 'Legal & Compliance', status: 'active', progress: 85 },
        { id: 4, name: 'UX/UI Design', status: 'active', progress: 88 },
        
        // Architecture Layers (5-8)
        { id: 5, name: 'Data Architecture', status: 'active', progress: 92 },
        { id: 6, name: 'Backend Development', status: 'active', progress: 94 },
        { id: 7, name: 'Frontend Development', status: 'active', progress: 91 },
        { id: 8, name: 'API & Integration', status: 'active', progress: 89 },
        
        // Operational Layers (9-12)
        { id: 9, name: 'Security & Authentication', status: 'active', progress: 93 },
        { id: 10, name: 'Deployment & Infrastructure', status: 'active', progress: 87 },
        { id: 11, name: 'Analytics & Monitoring', status: 'active', progress: 82 },
        { id: 12, name: 'Continuous Improvement', status: 'active', progress: 78 },
        
        // AI & Intelligence Layers (13-16)
        { id: 13, name: 'AI Agent Orchestration', status: 'active', progress: 85 },
        { id: 14, name: 'Context & Memory Management', status: 'active', progress: 88 },
        { id: 15, name: 'Voice & Environmental Intelligence', status: 'active', progress: 76 },
        { id: 16, name: 'Ethics & Behavioral Alignment', status: 'active', progress: 90 },
        
        // Human-Centric Layers (17-20)
        { id: 17, name: 'Emotional Intelligence', status: 'active', progress: 83 },
        { id: 18, name: 'Cultural Awareness', status: 'active', progress: 87 },
        { id: 19, name: 'Energy Management', status: 'active', progress: 79 },
        { id: 20, name: 'Proactive Intelligence', status: 'active', progress: 81 },
        
        // Production Engineering Layers (21-23)
        { id: 21, name: 'Production Resilience Engineering', status: 'partial', progress: 65 },
        { id: 22, name: 'User Safety Net', status: 'partial', progress: 58 },
        { id: 23, name: 'Business Continuity', status: 'partial', progress: 52 }
      ],
      overallProgress: 87
    });
    
    const [selectedLayer, setSelectedLayer] = useState<any>(null);
    const [editMode, setEditMode] = useState(false);
    
    const updateLayerProgress = (layerId: number, newProgress: number) => {
      setFrameworkData((prev: any) => ({
        ...prev,
        layers: prev.layers.map((layer: any) => 
          layer.id === layerId ? { ...layer, progress: newProgress } : layer
        ),
        overallProgress: Math.round(
          prev.layers.reduce((acc: number, l: any) => acc + (l.id === layerId ? newProgress : l.progress), 0) / prev.layers.length
        )
      }));
    };
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <Layers className="w-6 h-6 text-purple-600" />
                23L Framework Management
                <Badge className="bg-purple-100 text-purple-800 text-xs">V4.0</Badge>
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Comprehensive 23-Layer production validation system for continuous improvement
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setEditMode(!editMode)}
                className={`px-4 py-2 ${editMode ? 'bg-red-600' : 'bg-blue-600'} text-white rounded-lg hover:opacity-90 transition-colors`}
              >
                {editMode ? 'Save Changes' : 'Edit Mode'}
              </button>
            </div>
          </div>
          
          {/* Overall Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Overall Production Readiness</span>
              <span className="font-bold text-purple-600">{frameworkData.overallProgress}%</span>
            </div>
            <Progress value={frameworkData.overallProgress} className="h-3" />
          </div>
        </div>
        
        {/* Layer Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Foundation & Architecture */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Foundation & Architecture (Layers 1-8)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {frameworkData.layers.slice(0, 8).map((layer: any) => (
                  <div key={layer.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {layer.id}. {layer.name}
                      </span>
                      {editMode ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={layer.progress}
                          onChange={(e) => updateLayerProgress(layer.id, parseInt(e.target.value))}
                          className="w-16 px-2 py-1 border rounded text-sm"
                        />
                      ) : (
                        <span className="text-sm font-bold">{layer.progress}%</span>
                      )}
                    </div>
                    <Progress value={layer.progress} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
            
            {/* Human-Centric & Production */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Human-Centric & Production (Layers 17-23)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {frameworkData.layers.slice(16, 23).map((layer: any) => (
                  <div key={layer.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {layer.id}. {layer.name}
                      </span>
                      {editMode ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={layer.progress}
                          onChange={(e) => updateLayerProgress(layer.id, parseInt(e.target.value))}
                          className="w-16 px-2 py-1 border rounded text-sm"
                        />
                      ) : (
                        <span className="text-sm font-bold">{layer.progress}%</span>
                      )}
                    </div>
                    <Progress value={layer.progress} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          
          {/* Operational & AI */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Operational & AI Intelligence (Layers 9-16)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {frameworkData.layers.slice(8, 16).map((layer: any) => (
                  <div key={layer.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {layer.id}. {layer.name}
                      </span>
                      {editMode ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={layer.progress}
                          onChange={(e) => updateLayerProgress(layer.id, parseInt(e.target.value))}
                          className="w-16 px-2 py-1 border rounded text-sm"
                        />
                      ) : (
                        <span className="text-sm font-bold">{layer.progress}%</span>
                      )}
                    </div>
                    <Progress value={layer.progress} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
            
            {/* Framework Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Framework Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate 23L Analysis Report
                </Button>
                <Button className="w-full" variant="outline">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Run Self-Reprompting Analysis
                </Button>
                <Button className="w-full" variant="outline">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Historical Progress
                </Button>
                <Button className="w-full" variant="outline">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Identify Critical Gaps
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Documentation Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">23L Framework Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <a href="#" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-semibold mb-1">Master Document V4</h4>
                <p className="text-sm text-gray-600">Complete 23-layer framework guide</p>
              </a>
              <a href="#" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-semibold mb-1">Implementation Checklist</h4>
                <p className="text-sm text-gray-600">Step-by-step validation guide</p>
              </a>
              <a href="#" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-semibold mb-1">Prevention Patterns</h4>
                <p className="text-sm text-gray-600">Common issues and solutions</p>
              </a>
              <a href="#" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-semibold mb-1">Evolution Summary</h4>
                <p className="text-sm text-gray-600">24-hour framework evolution</p>
              </a>
              <a href="#" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-semibold mb-1">TypeScript Methodology</h4>
                <p className="text-sm text-gray-600">Error resolution patterns</p>
              </a>
              <a href="#" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-semibold mb-1">React Hooks Prevention</h4>
                <p className="text-sm text-gray-600">Best practices guide</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

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

  const renderRbacManager = () => (
    <div className="space-y-6">
      {/* RBAC/ABAC Header */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <Lock className="w-6 h-6 text-blue-600" />
              Automated RBAC/ABAC Management System
            </h2>
            <p className="text-sm text-gray-600 mt-1">Centralized role-based and attribute-based access control with automated permission management</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchRbacAnalytics}
              disabled={rbacLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              {rbacLoading ? 'Loading...' : 'Refresh Analytics'}
            </button>
            <button
              onClick={triggerAutoAssignment}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Auto-Assign Roles
            </button>
            <button
              onClick={runComplianceAudit}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Run Audit
            </button>
          </div>
        </div>
      </div>

      {/* RBAC Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Role Distribution */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Role Distribution & Assignment
            </h3>
            {rbacData?.roleDistribution ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(rbacData.roleDistribution).map(([role, count]) => (
                  <div key={role} className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900">{count as number}</div>
                    <div className="text-sm text-gray-600 capitalize">{role.replace('_', ' ')}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Click "Refresh Analytics" to load role distribution data
              </div>
            )}
          </div>

          {/* Permission Testing Tool */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Permission Testing & Validation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                <input
                  type="number"
                  value={selectedUserId || ''}
                  onChange={(e) => setSelectedUserId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter user ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resource</label>
                <select
                  value={permissionTest.resource}
                  onChange={(e) => setPermissionTest(prev => ({ ...prev, resource: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select resource</option>
                  <option value="posts">Posts</option>
                  <option value="events">Events</option>
                  <option value="users">Users</option>
                  <option value="groups">Groups</option>
                  <option value="admin">Admin Panel</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                <select
                  value={permissionTest.action}
                  onChange={(e) => setPermissionTest(prev => ({ ...prev, action: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select action</option>
                  <option value="create">Create</option>
                  <option value="read">Read</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                  <option value="moderate">Moderate</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Test</label>
                <button
                  onClick={testPermission}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  disabled={!selectedUserId || !permissionTest.resource || !permissionTest.action}
                >
                  Test Permission
                </button>
              </div>
            </div>
            {permissionTest.result && (
              <div className={`p-4 rounded-lg ${
                permissionTest.result.granted ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className={`flex items-center gap-2 ${
                  permissionTest.result.granted ? 'text-green-800' : 'text-red-800'
                }`}>
                  {permissionTest.result.granted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Ban className="w-5 h-5" />
                  )}
                  <span className="font-medium">
                    {permissionTest.result.granted ? 'Permission Granted' : 'Permission Denied'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{permissionTest.result.reason}</p>
                {permissionTest.result.appliedPolicies?.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs font-medium text-gray-500">Applied Policies:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {permissionTest.result.appliedPolicies.map((policy: string, idx: number) => (
                        <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">{policy}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* System Performance */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Performance Metrics
            </h3>
            {rbacData?.performance ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Average Evaluation Time</span>
                    <span className="font-medium">{rbacData.performance.avgEvaluationTime}ms</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(rbacData.performance.avgEvaluationTime / 10, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Cache Hit Rate</span>
                    <span className="font-medium">{rbacData.performance.cacheHitRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${rbacData.performance.cacheHitRate}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No performance data available
              </div>
            )}
          </div>

          {/* Security Events */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Security Events
            </h3>
            {rbacData?.securityEvents ? (
              <div className="space-y-3">
                {rbacData.securityEvents.slice(0, 5).map((event: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{event.type}</div>
                      <div className="text-xs text-gray-500">{event.timestamp}</div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs ${
                      event.severity === 'high' ? 'bg-red-100 text-red-800' :
                      event.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {event.severity}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No security events detected
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Automated Assignment Rules */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-600" />
          Automated Assignment Rules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Location-Based Assignment</h4>
            <p className="text-sm text-blue-700">Users automatically assigned city-specific roles based on location data</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-900 mb-2">Experience-Based Roles</h4>
            <p className="text-sm text-green-700">Roles assigned based on user experience levels and specializations</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-medium text-purple-900 mb-2">Activity-Based Promotion</h4>
            <p className="text-sm text-purple-700">Users promoted to higher roles based on community contributions</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (selectedTab) {
      case 'life-ceo': return <LifeCEOPortal />;
      case 'overview': return renderOverview();
      case 'statistics': return <GlobalStatisticsDashboard />;
      case 'daily-activity': return <DailyActivityView />;
      case 'project-tracker': return (
        <ErrorBoundary fallbackMessage="Error loading project hierarchy. Please refresh the page.">
          <Comprehensive11LProjectTracker />
        </ErrorBoundary>
      );
      case 'feature-deep-dive': return <PlatformFeatureDeepDive />;
      case 'users': return renderUserManagement();
      case 'content': return renderContentModeration();
      case 'analytics': return renderAnalytics();
      case 'events': return renderEventManagement();
      case 'event-types': return <EventTypesManager />;
      case 'reports': return renderReportsAndLogs();
      case 'compliance': return renderCompliance();
      case 'rbac': return renderRbacManager();
      case 'system': return renderSystemHealth();
      case '23l-framework': return render23LFramework();
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
    <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-blue-50 to-cyan-50 flex">
      <TrangoTechSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : ''}`}>
        <div className="min-h-screen">
          {/* MT Style Header */}
          <div className="bg-gradient-to-r from-turquoise-600 to-blue-600 sticky top-0 z-10 shadow-xl">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">Admin Center</h1>
                    <p className="text-sm text-white/80">Mundo Tango Platform Administration</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Back to App Button */}
                  <button 
                    onClick={() => window.location.href = '/moments'}
                    className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl hover:bg-white transition-all duration-200 shadow-lg group"
                  >
                    <ArrowLeft className="w-4 h-4 text-gray-700 group-hover:text-pink-600 transition-colors" />
                    <span className="text-gray-700 font-medium">Back to App</span>
                  </button>
                  
                  <div className="px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-full text-sm font-medium shadow-lg">
                    System Healthy
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MT Style Navigation Tabs */}
          <div className="bg-white/80 backdrop-blur-sm border-b border-pink-200/50 shadow-md">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
              <nav className="flex flex-nowrap md:flex-wrap gap-2 md:gap-6 overflow-x-auto py-2 md:py-0">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`flex items-center gap-2 py-3 md:py-4 px-3 md:px-4 border-b-3 font-medium text-xs md:text-sm transition-all whitespace-nowrap rounded-t-xl ${
                      selectedTab === tab.id
                        ? 'border-turquoise-500 text-turquoise-600 bg-gradient-to-t from-turquoise-50 to-transparent'
                        : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <span className={selectedTab === tab.id ? 'text-turquoise-600' : 'text-gray-500'}>
                      {tab.icon}
                    </span>
                    <span className="hidden md:inline">{tab.label}</span>
                    <span className="md:hidden">{tab.label.split(' ')[0]}</span>
                    {tab.isNew && (
                      <Badge className="bg-gradient-to-r from-green-400 to-emerald-400 text-white text-xs ml-1 shadow-sm">NEW</Badge>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content Area with MT Styling */}
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 md:p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCenter;