import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileText, 
  User, 
  Calendar,
  Shield,
  Edit3,
  Trash2,
  Plus,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

interface AuditEvent {
  id: number;
  action: string;
  resource: string;
  resourceId: number;
  actor: {
    id: number;
    name: string;
    username: string;
  };
  timestamp: string;
  details: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress: string;
  userAgent: string;
}

export default function AuditTrailViewer() {
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<string>('7days');

  // Mock audit data for demonstration
  const mockAuditEvents: AuditEvent[] = [
    {
      id: 1,
      action: 'user_role_updated',
      resource: 'user',
      resourceId: 4,
      actor: {
        id: 3,
        name: 'Scott Boddye',
        username: 'admin'
      },
      timestamp: '2025-06-30T14:30:00Z',
      details: {
        targetUser: 'Maria Rodriguez',
        oldRoles: ['dancer'],
        newRoles: ['dancer', 'teacher'],
        reason: 'Promoted to teacher status'
      },
      severity: 'medium',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    },
    {
      id: 2,
      action: 'consent_approved',
      resource: 'memory_consent',
      resourceId: 102,
      actor: {
        id: 3,
        name: 'Scott Boddye',
        username: 'admin'
      },
      timestamp: '2025-06-30T13:45:00Z',
      details: {
        memoryTitle: 'Overcoming fear on the dance floor',
        memoryAuthor: 'Elena Fernandez',
        requester: 'David Kim',
        reviewNotes: 'Beautiful story that will inspire other dancers'
      },
      severity: 'low',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    },
    {
      id: 3,
      action: 'failed_login_attempt',
      resource: 'authentication',
      resourceId: 0,
      actor: {
        id: 0,
        name: 'Unknown',
        username: 'unknown'
      },
      timestamp: '2025-06-30T12:15:00Z',
      details: {
        attemptedUsername: 'admin',
        failureReason: 'invalid_password',
        attempts: 3
      },
      severity: 'high',
      ipAddress: '45.123.456.789',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    {
      id: 4,
      action: 'memory_created',
      resource: 'memory',
      resourceId: 105,
      actor: {
        id: 5,
        name: 'Carlos Martinez',
        username: 'carlos_dj'
      },
      timestamp: '2025-06-30T11:20:00Z',
      details: {
        title: 'DJ set memories from last night',
        emotionTags: ['joy', 'excitement'],
        trustLevel: 2
      },
      severity: 'low',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)'
    },
    {
      id: 5,
      action: 'system_backup',
      resource: 'system',
      resourceId: 0,
      actor: {
        id: 1,
        name: 'System',
        username: 'system'
      },
      timestamp: '2025-06-30T02:00:00Z',
      details: {
        backupType: 'full',
        dataSize: '2.3GB',
        duration: '45 minutes',
        status: 'completed'
      },
      severity: 'low',
      ipAddress: '127.0.0.1',
      userAgent: 'System/1.0'
    },
    {
      id: 6,
      action: 'suspicious_activity_detected',
      resource: 'security',
      resourceId: 0,
      actor: {
        id: 0,
        name: 'Security System',
        username: 'security'
      },
      timestamp: '2025-06-29T23:45:00Z',
      details: {
        type: 'unusual_login_pattern',
        description: 'Multiple failed login attempts from different IPs',
        riskScore: 85,
        blocked: true
      },
      severity: 'critical',
      ipAddress: 'Multiple',
      userAgent: 'Various'
    }
  ];

  const getSeverityBadge = (severity: string) => {
    const styles = {
      'low': 'bg-green-100 text-green-700 border-green-200',
      'medium': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'high': 'bg-orange-100 text-orange-700 border-orange-200',
      'critical': 'bg-red-100 text-red-700 border-red-200'
    };
    return styles[severity as keyof typeof styles] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <CheckCircle className="h-3 w-3" />;
      case 'medium': return <Eye className="h-3 w-3" />;
      case 'high': return <AlertTriangle className="h-3 w-3" />;
      case 'critical': return <XCircle className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('create')) return <Plus className="h-4 w-4 text-green-600" />;
    if (action.includes('update') || action.includes('edit')) return <Edit3 className="h-4 w-4 text-blue-600" />;
    if (action.includes('delete') || action.includes('remove')) return <Trash2 className="h-4 w-4 text-red-600" />;
    if (action.includes('login') || action.includes('auth')) return <Shield className="h-4 w-4 text-purple-600" />;
    if (action.includes('view') || action.includes('access')) return <Eye className="h-4 w-4 text-gray-600" />;
    return <FileText className="h-4 w-4 text-gray-600" />;
  };

  const filteredEvents = mockAuditEvents.filter(event => {
    const matchesAction = actionFilter === 'all' || event.action.includes(actionFilter);
    const matchesSeverity = severityFilter === 'all' || event.severity === severityFilter;
    const matchesSearch = 
      event.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.actor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.resource.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesAction && matchesSeverity && matchesSearch;
  });

  const exportAuditLog = () => {
    const csvContent = [
      'Timestamp,Action,Resource,Actor,Severity,IP Address,Details',
      ...filteredEvents.map(event => 
        `"${event.timestamp}","${event.action}","${event.resource}","${event.actor.name}","${event.severity}","${event.ipAddress}","${JSON.stringify(event.details).replace(/"/g, '""')}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Filters and controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by action, actor, or resource..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
          />
        </div>
        
        <div className="flex gap-3">
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-48 rounded-xl border-gray-200">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
              <SelectItem value="login">Authentication</SelectItem>
              <SelectItem value="consent">Consent</SelectItem>
            </SelectContent>
          </Select>

          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-48 rounded-xl border-gray-200">
              <SelectValue placeholder="Filter by severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={exportAuditLog}
            variant="outline"
            className="rounded-xl border-gray-200 hover:bg-indigo-50 hover:border-indigo-300"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-200 rounded-xl">
              <CheckCircle className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-900">
                {mockAuditEvents.filter(e => e.severity === 'low').length}
              </div>
              <div className="text-sm font-medium text-green-700">Low</div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-200 rounded-xl">
              <Eye className="h-5 w-5 text-yellow-700" />
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-900">
                {mockAuditEvents.filter(e => e.severity === 'medium').length}
              </div>
              <div className="text-sm font-medium text-yellow-700">Medium</div>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-200 rounded-xl">
              <AlertTriangle className="h-5 w-5 text-orange-700" />
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-900">
                {mockAuditEvents.filter(e => e.severity === 'high').length}
              </div>
              <div className="text-sm font-medium text-orange-700">High</div>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-200 rounded-xl">
              <XCircle className="h-5 w-5 text-red-700" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-900">
                {mockAuditEvents.filter(e => e.severity === 'critical').length}
              </div>
              <div className="text-sm font-medium text-red-700">Critical</div>
            </div>
          </div>
        </div>
      </div>

      {/* Audit events list */}
      <div className="space-y-3">
        {filteredEvents.map((event) => (
          <div key={event.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-xl">
                  {getActionIcon(event.action)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{event.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
                    <Badge className={`${getSeverityBadge(event.severity)} border`}>
                      <div className="flex items-center gap-1">
                        {getSeverityIcon(event.severity)}
                        <span className="capitalize">{event.severity}</span>
                      </div>
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    Resource: <span className="font-medium">{event.resource}</span>
                    {event.resourceId > 0 && <span className="ml-1">#{event.resourceId}</span>}
                  </div>
                </div>
              </div>
              
              <div className="text-right text-sm text-gray-500">
                <div>{format(new Date(event.timestamp), 'MMM d, yyyy')}</div>
                <div>{format(new Date(event.timestamp), 'h:mm a')}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Actor:</span>
                <span className="font-medium">{event.actor.name}</span>
                <span className="text-gray-500">(@{event.actor.username})</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">IP:</span>
                <span className="font-mono text-xs">{event.ipAddress}</span>
              </div>
            </div>

            {event.details && Object.keys(event.details).length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Event Details:</div>
                <div className="space-y-1">
                  {Object.entries(event.details).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-medium ml-2">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No audit events found</h3>
          <p className="text-gray-600">Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
  );
}