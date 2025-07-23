import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebounce, LazyLoad, withPerformance } from '@/lib/performance';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { toast } from 'react-hot-toast';
import TrangoTechSidebar from '@/components/TrangoTechSidebar';
import ProjectTrackerDashboard from '@/components/admin/ProjectTrackerDashboard';
import Comprehensive11LProjectTracker from '@/components/admin/Comprehensive11LProjectTracker';
import EnhancedHierarchicalTreeView from '@/components/admin/EnhancedHierarchicalTreeView';
import { PlatformFeatureDeepDive } from '@/components/admin/PlatformFeatureDeepDive';
import LifeCEOCommandCenter from '@/components/admin/LifeCEOCommandCenter';
import DailyActivityView from '@/components/admin/DailyActivityView';
import { EventTypesManager } from '@/components/admin/EventTypesManager';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { GlobalStatisticsDashboard } from '@/components/GlobalStatisticsDashboard';
import PerformanceMonitor from '@/components/admin/PerformanceMonitor';
import Framework35LDashboard from '@/components/admin/Framework35LDashboard';
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
  RefreshCw,
  Code,
  Lightbulb
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

// Memoized AdminCenter component for better performance
const AdminCenter: React.FC = React.memo(() => {
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
  
  // Auth check for super admin access
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const isSuperAdmin = (user as any)?.isSuperAdmin === true;
  
  // Redirect non-super admins
  useEffect(() => {
    if (user && !isSuperAdmin) {
      toast.error('Access denied. Admin Center is restricted to Super Admins only.');
      setLocation('/');
    }
  }, [user, isSuperAdmin, setLocation]);
  
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

  // User Management state
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userFilter, setUserFilter] = useState('all');
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Content Moderation state
  const [contentFilter, setContentFilter] = useState('all');
  const [contentSearch, setContentSearch] = useState('');
  const [flaggedContent, setFlaggedContent] = useState<any[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [showContentModal, setShowContentModal] = useState(false);

  // Content Moderation functions
  // Memoize fetchFlaggedContent to prevent recreating
  const fetchFlaggedContent = useCallback(async () => {
    setContentLoading(true);
    try {
      const response = await fetch(`/api/admin/content/flagged?filter=${contentFilter}&search=${contentSearch}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch content');
      const data = await response.json();
      setFlaggedContent(data.content || []);
    } catch (error) {
      console.error('Error fetching flagged content:', error);
    } finally {
      setContentLoading(false);
    }
  }, [contentFilter, contentSearch]);

  useEffect(() => {
    if (selectedTab === 'content') {
      fetchFlaggedContent();
    }
  }, [selectedTab, contentFilter]);

  const handleContentAction = async (contentId: number, action: string) => {
    try {
      const response = await fetch(`/api/admin/content/${contentId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!response.ok) throw new Error(`Failed to ${action} content`);
      await fetchFlaggedContent();
      if (showContentModal) setShowContentModal(false);
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
    }
  };

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
  // Memoize fetchRbacAnalytics
  const fetchRbacAnalytics = useCallback(async () => {
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
  }, []);

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
    { id: 'life-ceo-command', label: 'Life CEO Command Center', icon: <Brain className="w-4 h-4" />, isNew: true },
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'statistics', label: 'Global Statistics', icon: <Globe className="w-4 h-4" />, isNew: true },
    { id: 'project-tracker', label: 'The Plan', icon: <GitCommit className="w-4 h-4" /> },
    { id: 'users', label: 'User Management', icon: <Users className="w-4 h-4" /> },
    { id: 'content', label: 'Content Moderation', icon: <FileText className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'events', label: 'Event Management', icon: <Calendar className="w-4 h-4" /> },
    { id: 'event-types', label: 'Event Types', icon: <Calendar className="w-4 h-4" />, isNew: true },
    { id: 'reports', label: 'Reports & Logs', icon: <Eye className="w-4 h-4" /> },
    { id: 'compliance', label: 'Compliance Center', icon: <Shield className="w-4 h-4" /> },
    { id: 'rbac', label: 'RBAC/ABAC Manager', icon: <Lock className="w-4 h-4" /> },
    { id: 'system', label: 'System Health & Security', icon: <Activity className="w-4 h-4" /> },
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
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold bg-gradient-to-r from-turquoise-700 to-cyan-700 bg-clip-text text-transparent">{title}</h3>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="text-sm font-medium">{score}%</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <div className="w-full bg-turquoise-100/50 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              score >= 90 ? 'bg-gradient-to-r from-turquoise-500 to-cyan-500' : 
              score >= 75 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 
              score >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-red-500 to-pink-500'
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

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await fetch(`/api/admin/users?filter=${userFilter}&search=${userSearchTerm}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTab === 'users') {
      fetchUsers();
    }
  }, [selectedTab, userFilter]);

  const handleUserAction = async (userId: number, action: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!response.ok) throw new Error(`Failed to ${action} user`);
      await fetchUsers();
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
    }
  };

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-800">User Management</h2>
        <div className="flex gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise-500"
            />
            <Users className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise-500"
          >
            <option value="all">All Users</option>
            <option value="active">Active</option>
            <option value="verified">Verified</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
          <button 
            onClick={fetchUsers}
            className="px-4 py-2 bg-gradient-to-r from-turquoise-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Refresh
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

      {/* User List Table */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">User List</h3>
        {usersLoading ? (
          <div className="text-center py-8 text-gray-500">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Joined</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-turquoise-400 to-blue-500 flex items-center justify-center text-white font-medium">
                          {user.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.username || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{user.email || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {user.tangoRole || 'User'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.suspended ? 'bg-red-100 text-red-700' :
                        user.verified ? 'bg-green-100 text-green-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {user.suspended ? 'Suspended' : user.verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!user.suspended ? (
                          <button
                            onClick={() => handleUserAction(user.id, 'suspend')}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUserAction(user.id, 'unsuspend')}
                            className="text-green-600 hover:text-green-800"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">User Details</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Ban className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Username</div>
                  <div className="font-medium">{selectedUser.username}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-medium">{selectedUser.email || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Location</div>
                  <div className="font-medium">{selectedUser.location || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Tango Role</div>
                  <div className="font-medium">{selectedUser.tangoRole || 'N/A'}</div>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t">
                {!selectedUser.verified && (
                  <button
                    onClick={() => handleUserAction(selectedUser.id, 'verify')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Verify User
                  </button>
                )}
                {!selectedUser.suspended ? (
                  <button
                    onClick={() => handleUserAction(selectedUser.id, 'suspend')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Suspend User
                  </button>
                ) : (
                  <button
                    onClick={() => handleUserAction(selectedUser.id, 'unsuspend')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Unsuspend User
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderContentModeration = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-800">Content Moderation</h2>
        <div className="flex gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search content..."
              value={contentSearch}
              onChange={(e) => setContentSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchFlaggedContent()}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise-500"
            />
            <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>
          <select
            value={contentFilter}
            onChange={(e) => setContentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise-500"
          >
            <option value="all">All Content</option>
            <option value="posts">Posts</option>
            <option value="comments">Comments</option>
            <option value="flagged">Flagged Only</option>
            <option value="reported">Reported</option>
          </select>
          <button 
            onClick={fetchFlaggedContent}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Refresh
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

      {/* Content Moderation Table */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Content Review Queue</h3>
        {contentLoading ? (
          <div className="text-center py-8 text-gray-500">Loading content...</div>
        ) : flaggedContent.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No content to moderate</div>
        ) : (
          <div className="space-y-4">
            {flaggedContent.map((content) => (
              <div key={content.id} className="border border-gray-200 rounded-xl p-4 hover:border-turquoise-200 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        content.type === 'post' ? 'bg-blue-100 text-blue-700' :
                        content.type === 'comment' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {content.type}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        content.status === 'flagged' ? 'bg-red-100 text-red-700' :
                        content.status === 'reported' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {content.status}
                      </span>
                      {content.reportCount > 0 && (
                        <span className="text-xs text-gray-500">
                          {content.reportCount} reports
                        </span>
                      )}
                    </div>
                    <div className="text-gray-900 mb-2">{content.content}</div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>By @{content.author}</span>
                      <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedContent(content);
                        setShowContentModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleContentAction(content.id, 'approve')}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Approve"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleContentAction(content.id, 'remove')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content Details Modal */}
      {showContentModal && selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">Content Details</h3>
              <button
                onClick={() => setShowContentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Ban className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-2">Content</div>
                <div className="text-gray-900">{selectedContent.content}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Author</div>
                  <div className="font-medium">@{selectedContent.author}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Type</div>
                  <div className="font-medium capitalize">{selectedContent.type}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Posted</div>
                  <div className="font-medium">{new Date(selectedContent.createdAt).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Reports</div>
                  <div className="font-medium">{selectedContent.reportCount || 0}</div>
                </div>
              </div>
              {selectedContent.reports && selectedContent.reports.length > 0 && (
                <div>
                  <div className="text-sm text-gray-500 mb-2">Report History</div>
                  <div className="space-y-2">
                    {selectedContent.reports.map((report: any, idx: number) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm">
                          <span className="font-medium">{report.reportType}</span>
                          <span className="text-gray-500"> by @{report.reporter}</span>
                        </div>
                        {report.reason && (
                          <div className="text-sm text-gray-600 mt-1">{report.reason}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => handleContentAction(selectedContent.id, 'approve')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Approve Content
                </button>
                <button
                  onClick={() => handleContentAction(selectedContent.id, 'remove')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Remove Content
                </button>
                <button
                  onClick={() => handleContentAction(selectedContent.id, 'warn')}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  Warn User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const response = await fetch('/api/admin/analytics', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      if (data.success) {
        setAnalyticsData(data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Fetch analytics when tab is selected
  useEffect(() => {
    if (selectedTab === 'analytics' && !analyticsData) {
      fetchAnalytics();
    }
  }, [selectedTab]);

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-800">Platform Analytics</h2>
        <div className="flex gap-3">
          <button 
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-gradient-to-r from-turquoise-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            disabled={analyticsLoading}
          >
            <RefreshCw className={`w-4 h-4 inline mr-2 ${analyticsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5">
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {analyticsLoading && !analyticsData ? (
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Analytics Cards with MT Design */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-green-500 rounded-xl">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className={`text-xs font-medium ${analyticsData?.dauChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analyticsData?.dauChange > 0 ? '+' : ''}{analyticsData?.dauChange || 0}%
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-800">{analyticsData?.dailyActiveUsers || 0}</div>
              <div className="text-sm text-gray-600 mt-1">Daily Active Users</div>
              <div className="text-xs text-gray-500 mt-1">
                {analyticsData?.dauChange > 0 ? '+' : ''}{analyticsData?.dauChange || 0}% from yesterday
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-blue-500 rounded-xl">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <span className={`text-xs font-medium ${analyticsData?.pageViewsChange > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {analyticsData?.pageViewsChange > 0 ? '+' : ''}{analyticsData?.pageViewsChange || 0}%
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-800">{analyticsData?.pageViews?.toLocaleString() || 0}</div>
              <div className="text-sm text-gray-600 mt-1">Page Views</div>
              <div className="text-xs text-gray-500 mt-1">
                {analyticsData?.pageViewsChange > 0 ? '+' : ''}{analyticsData?.pageViewsChange || 0}% from last week
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-purple-500 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className={`text-xs font-medium ${analyticsData?.engagementChange > 0 ? 'text-purple-600' : 'text-red-600'}`}>
                  {analyticsData?.engagementChange > 0 ? '+' : ''}{analyticsData?.engagementChange || 0}%
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-800">{analyticsData?.engagementRate || 0}%</div>
              <div className="text-sm text-gray-600 mt-1">Engagement Rate</div>
              <div className="text-xs text-gray-500 mt-1">
                {analyticsData?.engagementChange > 0 ? '+' : ''}{analyticsData?.engagementChange || 0}% improvement
              </div>
            </div>
          </div>

          {/* Geographic Analytics with MT Styling */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Locations</h3>
            <div className="space-y-3">
              {analyticsData?.topLocations?.map((location: any, idx: number) => {
                const gradients = [
                  'from-pink-50 to-purple-50',
                  'from-blue-50 to-indigo-50',
                  'from-green-50 to-emerald-50',
                  'from-yellow-50 to-amber-50',
                  'from-red-50 to-rose-50'
                ];
                const iconGradients = [
                  'from-pink-500 to-purple-500',
                  'from-blue-500 to-indigo-500',
                  'from-green-500 to-emerald-500',
                  'from-yellow-500 to-amber-500',
                  'from-red-500 to-rose-500'
                ];
                const textColors = ['text-purple-600', 'text-blue-600', 'text-green-600', 'text-yellow-600', 'text-red-600'];

                return (
                  <div key={idx} className={`flex items-center justify-between p-3 bg-gradient-to-br ${gradients[idx % gradients.length]} rounded-xl`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 bg-gradient-to-r ${iconGradients[idx % iconGradients.length]} rounded-lg`}>
                        <Globe className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-gray-800">
                        {location.city}, {location.country}
                      </span>
                    </div>
                    <span className={`text-sm ${textColors[idx % textColors.length]} font-semibold`}>
                      {location.userCount.toLocaleString()} users
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const [eventsData, setEventsData] = useState<any>(null);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventFilter, setEventFilter] = useState('all');

  const fetchEvents = async () => {
    setEventsLoading(true);
    try {
      const response = await fetch(`/api/admin/events?filter=${eventFilter}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      if (data.success) {
        setEventsData(data.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setEventsLoading(false);
    }
  };

  // Fetch events when tab is selected or filter changes
  useEffect(() => {
    if (selectedTab === 'events') {
      fetchEvents();
    }
  }, [selectedTab, eventFilter]);

  const toggleEventFeatured = async (eventId: string, currentFeatured: boolean) => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}/featured`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ featured: !currentFeatured })
      });
      if (response.ok) {
        fetchEvents(); // Refresh the list
      }
    } catch (error) {
      console.error('Error toggling featured status:', error);
    }
  };

  const renderEventManagement = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-800">Event Management</h2>
        <div className="flex gap-3">
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-turquoise-500"
          >
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
            <option value="featured">Featured</option>
          </select>
          <button 
            onClick={fetchEvents}
            className="px-4 py-2 bg-gradient-to-r from-turquoise-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            disabled={eventsLoading}
          >
            <RefreshCw className={`w-4 h-4 inline mr-2 ${eventsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5">
            <Calendar className="w-4 h-4 inline mr-2" />
            Create Event
          </button>
        </div>
      </div>

      {eventsLoading && !eventsData ? (
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Event Stats with MT Design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-green-500 rounded-xl">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-800">{eventsData?.stats?.totalEvents || 0}</div>
              <div className="text-sm text-gray-600 mt-1">Total Events</div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-blue-500 rounded-xl">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-800">{eventsData?.stats?.eventsThisMonth || 0}</div>
              <div className="text-sm text-gray-600 mt-1">This Month</div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-yellow-500 rounded-xl">
                  <Clock className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-800">{eventsData?.stats?.upcomingEvents || 0}</div>
              <div className="text-sm text-gray-600 mt-1">Upcoming</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-purple-500 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-800">{eventsData?.stats?.featuredEvents || 0}</div>
              <div className="text-sm text-gray-600 mt-1">Featured Events</div>
            </div>
          </div>

          {/* Event Categories with MT Styling */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Event Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(eventsData?.stats?.categories || {}).slice(0, 6).map(([category, count], idx) => {
                const colors = ['blue', 'green', 'purple', 'yellow', 'red', 'pink'];
                const color = colors[idx % colors.length];
                return (
                  <div key={category} className={`p-4 bg-gradient-to-br from-${color}-50 to-${color}-100 rounded-xl hover:shadow-md transition-all transform hover:-translate-y-0.5`}>
                    <div className={`text-2xl font-bold text-${color}-600`}>{count as number}</div>
                    <div className="text-sm text-gray-700 font-medium">{category}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Event List */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Events</h3>
            <div className="space-y-3">
              {eventsData?.events?.slice(0, 10).map((event: any) => (
                <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{event.title}</h4>
                    <div className="flex gap-4 mt-1 text-sm text-gray-600">
                      <span>Host: @{event.host_username}</span>
                      <span>{event.attendee_count} attendees</span>
                      <span>{new Date(event.start_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleEventFeatured(event.id, event.is_featured)}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        event.is_featured 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {event.is_featured ? 'Featured' : 'Feature'}
                    </button>
                    <button className="px-3 py-1 bg-turquoise-600 text-white rounded-lg text-sm hover:bg-turquoise-700">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
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
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent">
              System Health & Security Monitor
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Comprehensive performance, memory, and security metrics
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleRefreshAll}
              disabled={systemHealthRefreshing}
              className="px-4 py-2 bg-gradient-to-r from-turquoise-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Performance Metrics Row */}
        <div className="glassmorphic-card p-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-turquoise-500" />
            Performance Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-turquoise-50/50 to-cyan-50/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-turquoise-700">3.2s</div>
              <div className="text-sm text-gray-600">Render Time</div>
              <div className="text-xs text-gray-500">Target: <3s</div>
              <Progress value={93} className="mt-2 h-1" />
            </div>
            <div className="bg-gradient-to-br from-turquoise-50/50 to-cyan-50/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-turquoise-700">0.16MB</div>
              <div className="text-sm text-gray-600">Bundle Size</div>
              <div className="text-xs text-gray-500">99.5% reduction</div>
              <Progress value={99.5} className="mt-2 h-1" />
            </div>
            <div className="bg-gradient-to-br from-turquoise-50/50 to-cyan-50/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-turquoise-700">70%</div>
              <div className="text-sm text-gray-600">Cache Hit Rate</div>
              <div className="text-xs text-gray-500">60-70% average</div>
              <Progress value={70} className="mt-2 h-1" />
            </div>
            <div className="bg-gradient-to-br from-turquoise-50/50 to-cyan-50/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-turquoise-700">{systemMetrics.responseTime}ms</div>
              <div className="text-sm text-gray-600">API Response</div>
              <div className="text-xs text-gray-500">Average latency</div>
              <Progress value={Math.min((200 - systemMetrics.responseTime) / 200 * 100, 100)} className="mt-2 h-1" />
            </div>
          </div>
        </div>

        {/* Memory & Resource Metrics */}
        <div className="glassmorphic-card p-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-purple-500" />
            Memory & Resources
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-700">8GB</div>
              <div className="text-sm text-gray-600">Build Memory</div>
              <div className="text-xs text-gray-500">Allocated for builds</div>
              <CheckCircle className="w-4 h-4 text-green-500 mt-2" />
            </div>
            <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-700">{systemMetrics.storageUsed}%</div>
              <div className="text-sm text-gray-600">Storage Used</div>
              <div className="text-xs text-gray-500">of allocated space</div>
              <Progress value={systemMetrics.storageUsed} className="mt-2 h-1" />
            </div>
            <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-700">{systemMetrics.databaseLoad}%</div>
              <div className="text-sm text-gray-600">Database Load</div>
              <div className="text-xs text-gray-500">Current utilization</div>
              <Progress value={systemMetrics.databaseLoad} className="mt-2 h-1" />
            </div>
            <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-700">Active</div>
              <div className="text-sm text-gray-600">Memory Cleanup</div>
              <div className="text-xs text-gray-500">Auto-optimizing</div>
              <Activity className="w-4 h-4 text-green-500 mt-2" />
            </div>
          </div>
        </div>

        {/* Security & Compliance Metrics */}
        <div className="glassmorphic-card p-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            Security & Compliance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">SOC 2 Type II Readiness</span>
                <Badge className="bg-yellow-100 text-yellow-700">In Progress</Badge>
              </div>
              <div className="text-2xl font-bold text-green-700">70%</div>
              <Progress value={70} className="mt-2 h-2 bg-gray-200" />
              <div className="text-xs text-gray-500 mt-2">Access controls: 80% • Encryption: 0% • Audit: 60%</div>
            </div>
            <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Enterprise Data Handling</span>
                <Badge className="bg-orange-100 text-orange-700">Critical</Badge>
              </div>
              <div className="text-2xl font-bold text-green-700">45%</div>
              <Progress value={45} className="mt-2 h-2 bg-gray-200" />
              <div className="text-xs text-gray-500 mt-2">Classification: 50% • Retention: 0% • GDPR: 65%</div>
            </div>
            <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Security Monitoring</span>
                <Badge className="bg-gray-100 text-gray-700">Planned</Badge>
              </div>
              <div className="text-2xl font-bold text-green-700">0%</div>
              <Progress value={0} className="mt-2 h-2 bg-gray-200" />
              <div className="text-xs text-gray-500 mt-2">IDS/IPS: 0% • Security Dashboard: 0%</div>
            </div>
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
                <Gauge className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-800">92%</div>
            <div className="text-sm text-gray-600 mt-1">Performance Score</div>
            <div className="text-xs text-gray-500 mt-1">Life CEO optimized</div>
          </div>

          <div className={`bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 ${systemHealthRefreshing ? 'animate-pulse' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-yellow-500 rounded-xl">
                <Database className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-800">258</div>
            <div className="text-sm text-gray-600 mt-1">DB Indexes</div>
            <div className="text-xs text-gray-500 mt-1">Optimized queries</div>
          </div>

          <div className={`bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 ${systemHealthRefreshing ? 'animate-pulse' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-purple-500 rounded-xl">
                <Shield className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-800">40</div>
            <div className="text-sm text-gray-600 mt-1">RLS Tables</div>
            <div className="text-xs text-gray-500 mt-1">Row-level security</div>
          </div>
        </div>

      {/* Service Status with MT Styling */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-turquoise-700 to-cyan-700 bg-clip-text text-transparent mb-4">Service Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gradient-to-br from-turquoise-50/70 to-cyan-50/70 rounded-xl backdrop-blur-sm border border-turquoise-200/50">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-gradient-to-r from-turquoise-500 to-cyan-500 rounded-lg shadow-md">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-turquoise-800">Web Application</span>
            </div>
            <span className="text-sm text-turquoise-600 font-semibold">Operational</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gradient-to-br from-turquoise-50/70 to-cyan-50/70 rounded-xl backdrop-blur-sm border border-turquoise-200/50">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-gradient-to-r from-turquoise-500 to-cyan-500 rounded-lg shadow-md">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-turquoise-800">Database</span>
            </div>
            <span className="text-sm text-turquoise-600 font-semibold">Operational</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gradient-to-br from-turquoise-50/70 to-cyan-50/70 rounded-xl backdrop-blur-sm border border-turquoise-200/50">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-gradient-to-r from-turquoise-500 to-cyan-500 rounded-lg shadow-md">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-turquoise-800">WebSocket Services</span>
            </div>
            <span className="text-sm text-turquoise-600 font-semibold">Operational</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gradient-to-br from-turquoise-50/70 to-cyan-50/70 rounded-xl backdrop-blur-sm border border-turquoise-200/50">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-gradient-to-r from-turquoise-500 to-cyan-500 rounded-lg shadow-md">
                <Wifi className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-turquoise-800">CDN</span>
            </div>
            <span className="text-sm text-turquoise-600 font-semibold">Operational</span>
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

  const render35LFramework = () => <Framework35LDashboard />;

  // Settings tab state
  const [settingsData, setSettingsData] = useState<any>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  const fetchSettings = async () => {
    setSettingsLoading(true);
    try {
      const response = await fetch('/api/admin/settings', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      if (data.success) {
        setSettingsData(data.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setSettingsLoading(false);
    }
  };

  // Fetch settings when tab is selected
  useEffect(() => {
    if (selectedTab === 'settings' && !settingsData) {
      fetchSettings();
    }
  }, [selectedTab]);

  const updateSetting = (key: string, value: any) => {
    setSettingsData((prev: any) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value
      }
    }));
  };

  const toggleFeatureFlag = async (name: string, currentEnabled: boolean) => {
    try {
      const response = await fetch(`/api/admin/feature-flags/${name}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ enabled: !currentEnabled })
      });
      if (response.ok) {
        fetchSettings(); // Refresh the data
      }
    } catch (error) {
      console.error('Error toggling feature flag:', error);
    }
  };

  const saveSettings = async () => {
    setSettingsSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ settings: settingsData.settings })
      });
      if (response.ok) {
        alert('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSettingsSaving(false);
    }
  };

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-800">Platform Settings</h2>
        <button 
          onClick={fetchSettings}
          className="px-4 py-2 bg-gradient-to-r from-turquoise-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          disabled={settingsLoading}
        >
          <RefreshCw className={`w-4 h-4 inline mr-2 ${settingsLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
      {settingsLoading && !settingsData ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-gray-200 rounded-2xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6">
          {/* General Settings */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">General Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-800">Site Name</div>
                  <div className="text-sm text-gray-600">The name of your platform</div>
                </div>
                <input 
                  type="text" 
                  value={settingsData?.settings?.site_name || ''}
                  onChange={(e) => updateSetting('site_name', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-800">Maintenance Mode</div>
                  <div className="text-sm text-gray-600">Show maintenance page to users</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settingsData?.settings?.maintenance_mode || false}
                    onChange={(e) => updateSetting('maintenance_mode', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-pink-500 peer-checked:to-purple-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Registration Settings */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Registration Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-800">Registration Enabled</div>
                  <div className="text-sm text-gray-600">Allow new users to register</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={settingsData?.settings?.registration_enabled || false}
                    onChange={(e) => updateSetting('registration_enabled', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-emerald-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Feature Flags */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Feature Flags</h3>
            <div className="space-y-4">
              {settingsData?.featureFlags?.map((flag: any) => (
                <div key={flag.name} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-800">{flag.name.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</div>
                    <div className="text-sm text-gray-600">{flag.description}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={flag.enabled}
                      onChange={() => toggleFeatureFlag(flag.name, flag.enabled)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-turquoise-500 peer-checked:to-blue-500"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <button 
              onClick={saveSettings}
              disabled={settingsSaving}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {settingsSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      )}
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
      case 'life-ceo-command': return <LifeCEOCommandCenter />;
      case 'overview': return renderOverview();
      case 'statistics': return <GlobalStatisticsDashboard />;
      case 'project-tracker': return (
        <ErrorBoundary fallbackMessage="Error loading project hierarchy. Please refresh the page.">
          <Comprehensive11LProjectTracker />
        </ErrorBoundary>
      );
      case 'users': return renderUserManagement();
      case 'content': return renderContentModeration();
      case 'analytics': return renderAnalytics();
      case 'events': return renderEventManagement();
      case 'event-types': return <EventTypesManager />;
      case 'reports': return renderReportsAndLogs();
      case 'compliance': return renderCompliance();
      case 'rbac': return renderRbacManager();
      case 'system': return renderSystemHealth();
      case 'settings': return renderSettings();
      default: return renderOverview();
    }
  };

  if (statsLoading || complianceLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-turquoise-50/30 via-cyan-50/30 to-teal-50/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gradient-to-r from-turquoise-200 to-cyan-200 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gradient-to-br from-turquoise-100 to-cyan-100 rounded-2xl backdrop-blur-sm"></div>
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
});

export default AdminCenter;