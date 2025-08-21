import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useToast } from '../hooks/use-toast';
import { 
  Shield, 
  Lock, 
  Eye,
  Database,
  CheckCircle,
  AlertTriangle,
  Activity,
  FileCheck,
  Users,
  Key,
  Server,
  RefreshCw,
  AlertCircle,
  Zap,
  BarChart3,
  ShieldCheck,
  History,
  UserCheck
} from 'lucide-react';

interface SecurityMetrics {
  rlsEnabled: number;
  totalTables: number;
  auditLogsEnabled: number;
  healthChecksPassed: boolean;
  lastHealthCheck: string;
  activeConnections: number;
  maxConnections: number;
  databaseSize: string;
  cacheHitRatio: number;
  indexCount: number;
  gdprCompliant: boolean;
}

interface AuditLog {
  id: string;
  table_name: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  user_id: number;
  timestamp: string;
  changed_fields?: any;
  old_values?: any;
  new_values?: any;
}

interface RLSPolicy {
  table_name: string;
  policy_name: string;
  permissive: boolean;
  roles: string[];
  using_expression: string;
  with_check_expression?: string;
  enabled: boolean;
}

export default function DatabaseSecurity() {
  const [selectedTable, setSelectedTable] = useState<string>('');
  const { toast } = useToast();

  // Mock security metrics
  const mockMetrics: SecurityMetrics = {
    rlsEnabled: 24,
    totalTables: 64,
    auditLogsEnabled: 7,
    healthChecksPassed: true,
    lastHealthCheck: new Date().toISOString(),
    activeConnections: 22,
    maxConnections: 100,
    databaseSize: '12.4 MB',
    cacheHitRatio: 94.5,
    indexCount: 151,
    gdprCompliant: true
  };

  // Mock audit logs
  const mockAuditLogs: AuditLog[] = [
    {
      id: '1',
      table_name: 'users',
      action: 'UPDATE',
      user_id: 1,
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      changed_fields: ['profile_image', 'bio'],
    },
    {
      id: '2',
      table_name: 'posts',
      action: 'INSERT',
      user_id: 2,
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      id: '3',
      table_name: 'events',
      action: 'UPDATE',
      user_id: 3,
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      changed_fields: ['start_date', 'location'],
    }
  ];

  // Mock RLS policies
  const mockRLSPolicies: RLSPolicy[] = [
    {
      table_name: 'posts',
      policy_name: 'posts_select_policy',
      permissive: true,
      roles: ['authenticated'],
      using_expression: 'visibility = \'public\' OR user_id = get_current_user_id()',
      enabled: true
    },
    {
      table_name: 'memories',
      policy_name: 'memories_select_policy',
      permissive: true,
      roles: ['authenticated'],
      using_expression: 'emotion != \'private\' OR user_id = get_current_user_id()',
      enabled: true
    },
    {
      table_name: 'events',
      policy_name: 'events_update_policy',
      permissive: true,
      roles: ['authenticated'],
      using_expression: 'organizer_id = get_current_user_id()',
      with_check_expression: 'organizer_id = get_current_user_id()',
      enabled: true
    }
  ];

  // Tables with security status
  const securityTables = [
    { name: 'users', rls: true, audit: true, sensitive: true },
    { name: 'posts', rls: true, audit: true, sensitive: false },
    { name: 'memories', rls: true, audit: true, sensitive: true },
    { name: 'events', rls: true, audit: true, sensitive: false },
    { name: 'user_roles', rls: true, audit: true, sensitive: true },
    { name: 'event_participants', rls: true, audit: true, sensitive: false },
    { name: 'media_assets', rls: true, audit: true, sensitive: false },
    { name: 'friends', rls: false, audit: false, sensitive: true },
    { name: 'chat_messages', rls: false, audit: false, sensitive: true },
    { name: 'notifications', rls: true, audit: false, sensitive: false }
  ];

  // Run health check
  const runHealthCheckMutation = useMutation({
    mutationFn: async () => {
      // In a real app, this would call the health check API
      return new Promise(resolve => setTimeout(resolve, 2000));
    },
    onSuccess: () => {
      toast({
        title: 'Health check completed',
        description: 'All security systems are functioning properly.'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/security/metrics'] });
    }
  });

  // Export GDPR data
  const exportGDPRDataMutation = useMutation({
    mutationFn: async (userId: number) => {
      // In a real app, this would call the GDPR export API
      return { userId };
    },
    onSuccess: () => {
      toast({
        title: 'GDPR export initiated',
        description: 'User data export has been queued. Check your email shortly.'
      });
    }
  });

  const getStatusColor = (ratio: number) => {
    if (ratio >= 90) return 'text-green-600';
    if (ratio >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-8 h-8 text-indigo-600" />
                Database Security Center
              </h1>
              <p className="text-gray-600 mt-2">Monitor and manage database security policies, audit logs, and compliance</p>
            </div>
            <Button
              onClick={() => runHealthCheckMutation.mutate()}
              disabled={runHealthCheckMutation.isPending}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${runHealthCheckMutation.isPending ? 'animate-spin' : ''}`} />
              Run Health Check
            </Button>
          </div>

          {/* Security Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">RLS Coverage</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockMetrics.rlsEnabled}/{mockMetrics.totalTables}
                  </p>
                  <p className={`text-sm font-medium ${getStatusColor((mockMetrics.rlsEnabled / mockMetrics.totalTables) * 100)}`}>
                    {((mockMetrics.rlsEnabled / mockMetrics.totalTables) * 100).toFixed(1)}% Protected
                  </p>
                </div>
                <Lock className="w-8 h-8 text-indigo-600" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Audit Logging</p>
                  <p className="text-2xl font-bold text-gray-900">{mockMetrics.auditLogsEnabled}</p>
                  <p className="text-sm text-gray-600">Critical tables</p>
                </div>
                <FileCheck className="w-8 h-8 text-green-600" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Health Status</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockMetrics.healthChecksPassed ? 
                      <span className="text-green-600">Healthy</span> : 
                      <span className="text-red-600">Issues</span>
                    }
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatTimestamp(mockMetrics.lastHealthCheck)}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">GDPR Status</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockMetrics.gdprCompliant ? 
                      <span className="text-green-600">Compliant</span> : 
                      <span className="text-red-600">Review</span>
                    }
                  </p>
                  <p className="text-sm text-gray-600">All functions ready</p>
                </div>
                <ShieldCheck className="w-8 h-8 text-green-600" />
              </div>
            </Card>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <Server className="w-6 h-6 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-600">Connections</p>
                  <p className="text-lg font-bold text-gray-900">
                    {mockMetrics.activeConnections}/{mockMetrics.maxConnections}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-emerald-600" />
                <div>
                  <p className="text-sm text-gray-600">Cache Hit Ratio</p>
                  <p className="text-lg font-bold text-gray-900">{mockMetrics.cacheHitRatio}%</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-r from-purple-50 to-violet-50">
              <div className="flex items-center gap-3">
                <Database className="w-6 h-6 text-violet-600" />
                <div>
                  <p className="text-sm text-gray-600">Database Size</p>
                  <p className="text-lg font-bold text-gray-900">{mockMetrics.databaseSize}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="policies" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="policies">RLS Policies</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            <TabsTrigger value="tables">Table Security</TabsTrigger>
            <TabsTrigger value="gdpr">GDPR Tools</TabsTrigger>
          </TabsList>

          {/* RLS Policies Tab */}
          <TabsContent value="policies" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Row Level Security Policies</h3>
              <div className="space-y-4">
                {mockRLSPolicies.map(policy => (
                  <div key={`${policy.table_name}-${policy.policy_name}`} 
                       className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-900">{policy.policy_name}</h4>
                          <Badge variant={policy.enabled ? 'default' : 'secondary'}>
                            {policy.enabled ? 'Active' : 'Disabled'}
                          </Badge>
                          <Badge variant="outline">{policy.table_name}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Using:</span> {policy.using_expression}
                        </p>
                        {policy.with_check_expression && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Check:</span> {policy.with_check_expression}
                          </p>
                        )}
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        Test
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Audit Logs</h3>
              <div className="space-y-3">
                {mockAuditLogs.map(log => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        log.action === 'INSERT' ? 'bg-green-100' :
                        log.action === 'UPDATE' ? 'bg-blue-100' :
                        'bg-red-100'
                      }`}>
                        <History className={`w-4 h-4 ${
                          log.action === 'INSERT' ? 'text-green-600' :
                          log.action === 'UPDATE' ? 'text-blue-600' :
                          'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {log.action} on {log.table_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          User #{log.user_id} • {formatTimestamp(log.timestamp)}
                          {log.changed_fields && ` • Fields: ${log.changed_fields.join(', ')}`}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline">
                  View All Audit Logs
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Table Security Tab */}
          <TabsContent value="tables" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Table Security Status</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4 font-medium text-gray-700">Table Name</th>
                      <th className="text-center py-2 px-4 font-medium text-gray-700">RLS</th>
                      <th className="text-center py-2 px-4 font-medium text-gray-700">Audit</th>
                      <th className="text-center py-2 px-4 font-medium text-gray-700">Sensitive</th>
                      <th className="text-center py-2 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {securityTables.map(table => (
                      <tr key={table.name} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Database className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{table.name}</span>
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          {table.rls ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-yellow-600 mx-auto" />
                          )}
                        </td>
                        <td className="text-center py-3 px-4">
                          {table.audit ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-gray-400 mx-auto" />
                          )}
                        </td>
                        <td className="text-center py-3 px-4">
                          {table.sensitive && (
                            <Badge variant="destructive" className="text-xs">
                              Sensitive
                            </Badge>
                          )}
                        </td>
                        <td className="text-center py-3 px-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedTable(table.name)}
                          >
                            Configure
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* GDPR Tools Tab */}
          <TabsContent value="gdpr" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-600" />
                  Data Export
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Export all user data for GDPR compliance. The export includes all personal data,
                  posts, events, and associated content.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User ID or Email
                    </label>
                    <input
                      type="text"
                      placeholder="Enter user ID or email"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <Button
                    onClick={() => exportGDPRDataMutation.mutate(1)}
                    disabled={exportGDPRDataMutation.isPending}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                  >
                    Export User Data
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Key className="w-5 h-5 text-red-600" />
                  Data Deletion
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Anonymize user data for GDPR right to be forgotten. This action cannot be undone
                  and will anonymize all personal information.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User ID or Email
                    </label>
                    <input
                      type="text"
                      placeholder="Enter user ID or email"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    className="w-full"
                    disabled
                  >
                    Anonymize User Data
                  </Button>
                  <p className="text-xs text-red-600 text-center">
                    This action requires additional authorization
                  </p>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">GDPR Compliance Checklist</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Data export function implemented</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Data anonymization function ready</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Audit logging enabled for compliance tracking</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">User consent tracking implemented</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Privacy policy and terms updated</span>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}