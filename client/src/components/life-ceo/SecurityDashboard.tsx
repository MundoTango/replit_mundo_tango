import { useState, useEffect } from 'react';
import { Shield, Lock, AlertTriangle, CheckCircle, Activity, UserX, Clock, FileText, Database, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';

interface SecurityMetrics {
  totalAuditLogs: number;
  recentSecurityEvents: AuditLog[];
  blockedIPs: string[];
  activeSessions: number;
  failedLoginAttempts: number;
  dataExportRequests: number;
  securityScore: number;
  vulnerabilities: Vulnerability[];
}

interface AuditLog {
  id: number;
  action: string;
  resource: string;
  userId: number;
  timestamp: string;
  ipAddress: string;
  details: any;
}

interface Vulnerability {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  status: 'open' | 'resolved';
}

export function SecurityDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');

  const { data: metrics, isLoading, error } = useQuery<SecurityMetrics>({
    queryKey: ['/api/security/metrics'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getSecurityScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-turquoise-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load security metrics</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Score Overview */}
      <Card className="glassmorphic-card border-turquoise-200/50">
        <CardHeader className="bg-gradient-to-r from-turquoise-50 via-cyan-50 to-blue-50">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-2">
            <Shield className="h-6 w-6 text-turquoise-600" />
            Security Dashboard
          </CardTitle>
          <CardDescription>Real-time security monitoring and threat protection</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Security Score */}
            <Card className="glassmorphic-card hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getSecurityScoreColor(metrics?.securityScore || 0)}`}>
                    {metrics?.securityScore || 0}%
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Security Score</p>
                  <Progress 
                    value={metrics?.securityScore || 0} 
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Active Threats */}
            <Card className="glassmorphic-card hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-600">
                    {metrics?.vulnerabilities.filter(v => v.status === 'open').length || 0}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Active Threats</p>
                  <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mt-2" />
                </div>
              </CardContent>
            </Card>

            {/* Blocked IPs */}
            <Card className="glassmorphic-card hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-600">
                    {metrics?.blockedIPs.length || 0}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Blocked IPs</p>
                  <UserX className="h-8 w-8 text-orange-500 mx-auto mt-2" />
                </div>
              </CardContent>
            </Card>

            {/* Active Sessions */}
            <Card className="glassmorphic-card hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-turquoise-600">
                    {metrics?.activeSessions || 0}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Active Sessions</p>
                  <Activity className="h-8 w-8 text-turquoise-500 mx-auto mt-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Security Information */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="threats">Threats</TabsTrigger>
          <TabsTrigger value="protection">Protection</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="glassmorphic-card">
            <CardHeader>
              <CardTitle className="text-xl bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent">
                Security Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-turquoise-50/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-turquoise-600" />
                    <span className="font-medium">SSL/TLS Encryption</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-cyan-50/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-cyan-600" />
                    <span className="font-medium">Helmet.js Protection</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Session Timeout</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">30 minutes</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-purple-50/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">Database Encryption</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">AES-256</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit-logs" className="space-y-4">
          <Card className="glassmorphic-card">
            <CardHeader>
              <CardTitle className="text-xl bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent">
                Recent Security Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metrics?.recentSecurityEvents.map((log) => (
                  <div key={log.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{log.action}</p>
                        <p className="text-sm text-gray-600">Resource: {log.resource}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(log.timestamp).toLocaleString()} • IP: {log.ipAddress || 'Unknown'}
                        </p>
                      </div>
                      <Eye className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Threats Tab */}
        <TabsContent value="threats" className="space-y-4">
          <Card className="glassmorphic-card">
            <CardHeader>
              <CardTitle className="text-xl bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent">
                Security Vulnerabilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics?.vulnerabilities.map((vuln, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{vuln.type}</span>
                          <Badge className={getSeverityColor(vuln.severity)}>
                            {vuln.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{vuln.description}</p>
                      </div>
                      <Badge variant={vuln.status === 'resolved' ? 'default' : 'destructive'}>
                        {vuln.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Protection Tab */}
        <TabsContent value="protection" className="space-y-4">
          <Card className="glassmorphic-card">
            <CardHeader>
              <CardTitle className="text-xl bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent">
                Active Protection Measures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-turquoise-50 to-cyan-50 rounded-lg">
                  <h3 className="font-semibold text-turquoise-800 mb-2">Authentication</h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>✓ OAuth 2.0 Integration</li>
                    <li>✓ Session-based Authentication</li>
                    <li>✓ CSRF Protection</li>
                    <li>✓ Rate Limiting</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg">
                  <h3 className="font-semibold text-cyan-800 mb-2">Data Protection</h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>✓ Row Level Security (40+ tables)</li>
                    <li>✓ Audit Logging</li>
                    <li>✓ Encrypted Storage</li>
                    <li>✓ GDPR Compliance</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Infrastructure</h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>✓ DDoS Protection</li>
                    <li>✓ CDN Integration</li>
                    <li>✓ Automated Backups</li>
                    <li>✓ Health Monitoring</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">Compliance</h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>✓ GDPR Ready</li>
                    <li>✓ CCPA Compliant</li>
                    <li>✓ Data Export API</li>
                    <li>✓ Right to be Forgotten</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}