import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import TrangoTechSidebar from '@/components/TrangoTechSidebar';
import { 
  Users, 
  BarChart3, 
  FileText, 
  TrendingUp, 
  Calendar, 
  Eye, 
  Shield, 
  Lock, 
  Activity, 
  Settings,
  UserCheck,
  Award,
  Database,
  AlertTriangle
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalEvents: number;
  totalGroups: number;
  systemHealth: number;
  responseTime: string;
  uptime: string;
  eventCategories: Record<string, number>;
}

interface RBACData {
  totalRoles: number;
  activeRoles: number;
  roleDistribution: Array<{ roleName: string; userCount: number }>;
  recentAssignments: Array<{ username: string; role: string; assignedAt: string }>;
  permissionChecks: Array<{ resource: string; action: string; allowed: boolean }>;
}

const AdminCenterFixed: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch admin statistics
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stats', {
        credentials: 'include'
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch admin stats');
      }
      return response.json();
    },
    retry: 1
  });

  // Fetch RBAC data
  const { data: rbacData, isLoading: rbacLoading, error: rbacError } = useQuery<RBACData>({
    queryKey: ['/api/rbac/analytics'],
    queryFn: async () => {
      const response = await fetch('/api/rbac/analytics', {
        credentials: 'include'
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch RBAC data');
      }
      return response.json();
    },
    retry: 1
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'users', label: 'User Management', icon: <Users className="w-4 h-4" /> },
    { id: 'rbac', label: 'RBAC/ABAC Manager', icon: <Lock className="w-4 h-4" /> },
    { id: 'system', label: 'System Health', icon: <Activity className="w-4 h-4" /> },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Overview</h2>
        
        {statsError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">Stats Error: {statsError.message}</span>
            </div>
          </div>
        ) : statsLoading ? (
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-900">Total Users</p>
                  <p className="text-2xl font-bold text-blue-600">{stats?.totalUsers || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-900">Total Posts</p>
                  <p className="text-2xl font-bold text-green-600">{stats?.totalPosts || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-900">Total Events</p>
                  <p className="text-2xl font-bold text-purple-600">{stats?.totalEvents || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-orange-900">Total Groups</p>
                  <p className="text-2xl font-bold text-orange-600">{stats?.totalGroups || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Event Categories */}
      {stats?.eventCategories && Object.keys(stats.eventCategories).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.eventCategories).map(([category, count]) => (
              <div key={category} className="text-center p-3 border rounded-lg">
                <p className="text-sm text-gray-600 capitalize">{category}</p>
                <p className="text-xl font-bold text-gray-900">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderRBAC = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">RBAC/ABAC Management</h2>
        
        {rbacError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">RBAC Error: {rbacError.message}</span>
            </div>
            <p className="text-sm text-red-600 mt-2">
              This may be due to insufficient permissions or missing role assignments.
            </p>
          </div>
        ) : rbacLoading ? (
          <div className="animate-pulse">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Shield className="w-8 h-8 text-indigo-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-indigo-900">Total Roles</p>
                    <p className="text-2xl font-bold text-indigo-600">{rbacData?.totalRoles || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-cyan-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <UserCheck className="w-8 h-8 text-cyan-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-cyan-900">Active Roles</p>
                    <p className="text-2xl font-bold text-cyan-600">{rbacData?.activeRoles || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-emerald-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Award className="w-8 h-8 text-emerald-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-emerald-900">Role Assignments</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {rbacData?.recentAssignments?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Role Distribution */}
            {rbacData?.roleDistribution && rbacData.roleDistribution.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Role Distribution</h3>
                <div className="space-y-2">
                  {rbacData.roleDistribution.map((role, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                      <span className="font-medium text-gray-900">{role.roleName}</span>
                      <span className="text-gray-600">{role.userCount} users</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">User Management</h2>
        <div className="text-gray-600">
          <p>User management interface - showing {stats?.totalUsers || 0} total users</p>
          <p className="mt-2">Active users: {stats?.activeUsers || 0}</p>
        </div>
      </div>
    </div>
  );

  const renderSystem = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-900">System Health</p>
                <p className="text-2xl font-bold text-green-600">{stats?.systemHealth || 100}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Database className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-900">Response Time</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.responseTime || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-900">Uptime</p>
                <p className="text-2xl font-bold text-purple-600">{stats?.uptime || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (selectedTab) {
      case 'overview':
        return renderOverview();
      case 'users':
        return renderUsers();
      case 'rbac':
        return renderRBAC();
      case 'system':
        return renderSystem();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <TrangoTechSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <TrangoTechSidebar isOpen={true} setIsOpen={setIsSidebarOpen} />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Admin Center</h1>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Open sidebar</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
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
  );
};

export default AdminCenterFixed;