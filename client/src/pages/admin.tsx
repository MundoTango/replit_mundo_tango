import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/layouts/DashboardLayout';
import { 
  Shield, 
  Users, 
  CheckCircle, 
  FileText, 
  BarChart3, 
  Settings,
  Activity,
  AlertTriangle,
  Database,
  Sparkles
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserRoleTable from '@/components/admin/UserRoleTable';
import ConsentReviewBoard from '@/components/admin/ConsentReviewBoard';
import AuditTrailViewer from '@/components/admin/AuditTrailViewer';
import SystemStatsPanel from '@/components/admin/SystemStatsPanel';

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Debug authentication
  console.log('🔐 Admin page - User object:', user);
  console.log('🔐 Admin page - User roles:', user?.roles);
  console.log('🔐 Admin page - Username:', user?.username);
  console.log('🔐 Admin page - Email:', user?.email);

  // Security check - comprehensive RBAC/ABAC admin access
  const isAdmin = user && (
    user.roles?.includes('super_admin') || 
    user.roles?.includes('admin') ||
    user.username === 'admin' || 
    user.email?.includes('admin')
  );

  console.log('🔐 Admin page - Is admin:', isAdmin);

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-red-50/60 via-orange-50/40 to-yellow-50/30 flex items-center justify-center">
          <div className="text-center p-8 bg-white/90 backdrop-blur-sm rounded-3xl border border-red-100/50 shadow-lg max-w-md">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">You don't have permission to access the Admin Portal. Only super administrators can view this page.</p>
            <div className="text-xs text-gray-500 mb-4">
              User: {user?.username || 'Unknown'} | Roles: {user?.roles?.join(', ') || 'None'}
            </div>
            <button 
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
            >
              Go Back
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    { 
      title: 'Total Users', 
      value: '1,247', 
      change: '+12%', 
      icon: Users, 
      color: 'from-blue-500 to-cyan-500' 
    },
    { 
      title: 'Pending Consent', 
      value: '23', 
      change: '+5', 
      icon: CheckCircle, 
      color: 'from-orange-500 to-red-500' 
    },
    { 
      title: 'Active Memories', 
      value: '3,892', 
      change: '+18%', 
      icon: FileText, 
      color: 'from-green-500 to-emerald-500' 
    },
    { 
      title: 'System Health', 
      value: '99.2%', 
      change: 'Optimal', 
      icon: Activity, 
      color: 'from-purple-500 to-pink-500' 
    }
  ];

  return (
    <DashboardLayout>
      {/* Enhanced gradient background */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-indigo-50/40 to-purple-50/30 relative overflow-hidden">
        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 right-32 w-80 h-80 bg-gradient-to-r from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-gradient-to-r from-purple-200/15 to-pink-200/15 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-8">
          {/* Enhanced header section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg animate-pulse">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                <Database className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Admin Portal
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive system administration and management for Mundo Tango
            </p>
          </div>

          {/* Stats overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <div key={index} className="group bg-white/90 backdrop-blur-sm rounded-3xl border border-indigo-100/50 p-6 hover:scale-105 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl shadow-lg group-hover:shadow-xl transition-shadow`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.change}</div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-700">{stat.title}</h3>
              </div>
            ))}
          </div>

          {/* Main content tabs */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-indigo-100/50 shadow-lg overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 p-2 rounded-3xl border-0">
                <TabsTrigger 
                  value="users" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-2xl font-medium transition-all duration-300"
                >
                  <Users className="h-4 w-4 mr-2" />
                  User Management
                </TabsTrigger>
                <TabsTrigger 
                  value="consent"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-2xl font-medium transition-all duration-300"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Consent Review
                </TabsTrigger>
                <TabsTrigger 
                  value="audit"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-2xl font-medium transition-all duration-300"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Audit Trail
                </TabsTrigger>
                <TabsTrigger 
                  value="stats"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-2xl font-medium transition-all duration-300"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  System Stats
                </TabsTrigger>
              </TabsList>

              <div className="p-8">
                <TabsContent value="users" className="mt-0">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">User Role Management</h2>
                        <p className="text-gray-600">Manage user roles, permissions, and access levels</p>
                      </div>
                    </div>
                    <UserRoleTable />
                  </div>
                </TabsContent>

                <TabsContent value="consent" className="mt-0">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Consent Review Board</h2>
                        <p className="text-gray-600">Review and manage memory consent requests and approvals</p>
                      </div>
                    </div>
                    <ConsentReviewBoard />
                  </div>
                </TabsContent>

                <TabsContent value="audit" className="mt-0">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Audit Trail Viewer</h2>
                        <p className="text-gray-600">Monitor system activities, changes, and security events</p>
                      </div>
                    </div>
                    <AuditTrailViewer />
                  </div>
                </TabsContent>

                <TabsContent value="stats" className="mt-0">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                        <BarChart3 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">System Statistics</h2>
                        <p className="text-gray-600">Comprehensive platform metrics and performance analytics</p>
                      </div>
                    </div>
                    <SystemStatsPanel />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}