import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  HelpCircle,
  Flag,
  Heart,
  Users,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  MessageSquare,
  ThumbsUp,
  User,
  Calendar,
  MapPin,
  Tag,
  Zap,
  TrendingUp,
  Shield,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';

// Help request categories
const HELP_CATEGORIES = [
  { value: 'housing', label: 'Housing / Accommodation', icon: MapPin },
  { value: 'dance_partner', label: 'Dance Partner', icon: Users },
  { value: 'practice_space', label: 'Practice Space', icon: MapPin },
  { value: 'lessons', label: 'Lessons / Teaching', icon: User },
  { value: 'event_info', label: 'Event Information', icon: Calendar },
  { value: 'transportation', label: 'Transportation', icon: MapPin },
  { value: 'emergency', label: 'Emergency', icon: AlertTriangle },
  { value: 'other', label: 'Other', icon: HelpCircle }
];

// Report categories for memories
const REPORT_CATEGORIES = [
  { value: 'harassment', label: 'Harassment', severity: 'high' },
  { value: 'inappropriate', label: 'Inappropriate Content', severity: 'medium' },
  { value: 'spam', label: 'Spam', severity: 'low' },
  { value: 'misinformation', label: 'Misinformation', severity: 'medium' },
  { value: 'impersonation', label: 'Impersonation', severity: 'high' },
  { value: 'other', label: 'Other', severity: 'medium' }
];

interface HelpRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  location?: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  userId: number;
  user?: {
    name: string;
    username: string;
    profileImage?: string;
  };
  responses?: number;
  lastActivity?: string;
}

interface MemoryReport {
  id: string;
  memoryId: string;
  reportType: string;
  description: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  createdAt: string;
  memory?: {
    content: string;
    user: {
      name: string;
      username: string;
    };
  };
}

export default function TTfilesHelpCenter() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('help-requests');
  const [showCreateHelp, setShowCreateHelp] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('');
  
  const [newHelpRequest, setNewHelpRequest] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    urgency: 'medium' as const
  });
  
  const [reportData, setReportData] = useState({
    memoryId: '',
    reportType: '',
    description: ''
  });

  // Fetch help requests
  const { data: helpRequests, isLoading: helpLoading } = useQuery({
    queryKey: ['/api/ttfiles/help-requests', searchQuery, selectedCategory, selectedUrgency],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedUrgency) params.append('urgency', selectedUrgency);
      
      const response = await fetch(`/api/ttfiles/help-requests?${params}`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch help requests');
      const result = await response.json();
      return result.data || [];
    }
  });

  // Fetch my help requests
  const { data: myHelpRequests } = useQuery({
    queryKey: ['/api/ttfiles/my-help-requests'],
    queryFn: async () => {
      const response = await fetch('/api/ttfiles/my-help-requests', {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch my help requests');
      const result = await response.json();
      return result.data || [];
    }
  });

  // Fetch reported memories
  const { data: reportedMemories, isLoading: reportsLoading } = useQuery({
    queryKey: ['/api/ttfiles/reported-memories'],
    queryFn: async () => {
      const response = await fetch('/api/ttfiles/reported-memories', {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch reported memories');
      const result = await response.json();
      return result.data || [];
    }
  });

  // Create help request mutation
  const createHelpMutation = useMutation({
    mutationFn: async (data: typeof newHelpRequest) => {
      return apiRequest('POST', '/api/ttfiles/help-requests', data);
    },
    onSuccess: () => {
      toast({
        title: "Help request created",
        description: "Your request has been posted to the community.",
      });
      setShowCreateHelp(false);
      setNewHelpRequest({
        title: '',
        description: '',
        category: '',
        location: '',
        urgency: 'medium'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ttfiles/help-requests'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create help request. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Report memory mutation
  const reportMemoryMutation = useMutation({
    mutationFn: async (data: typeof reportData) => {
      return apiRequest('POST', '/api/ttfiles/report-memory', data);
    },
    onSuccess: () => {
      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our community safe.",
      });
      setShowReportDialog(false);
      setReportData({
        memoryId: '',
        reportType: '',
        description: ''
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ttfiles/reported-memories'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleCreateHelpRequest = () => {
    if (!newHelpRequest.title || !newHelpRequest.category) {
      toast({
        title: "Missing information",
        description: "Please provide a title and category for your request.",
        variant: "destructive",
      });
      return;
    }
    
    createHelpMutation.mutate(newHelpRequest);
  };

  const handleReportMemory = () => {
    if (!reportData.memoryId || !reportData.reportType) {
      toast({
        title: "Missing information",
        description: "Please select a memory and report type.",
        variant: "destructive",
      });
      return;
    }
    
    reportMemoryMutation.mutate(reportData);
  };

  const getUrgencyBadge = (urgency: string) => {
    const styles = {
      emergency: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    
    return (
      <Badge className={cn('border', styles[urgency as keyof typeof styles])}>
        {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      resolved: 'bg-gray-100 text-gray-800',
      closed: 'bg-gray-100 text-gray-600'
    };
    
    const icons = {
      open: <Clock className="h-3 w-3" />,
      in_progress: <Zap className="h-3 w-3" />,
      resolved: <CheckCircle className="h-3 w-3" />,
      closed: <X className="h-3 w-3" />
    };
    
    return (
      <Badge className={cn('gap-1', styles[status as keyof typeof styles])}>
        {icons[status as keyof typeof icons]}
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">TTfiles Help Center</h1>
              <p className="text-gray-600 mt-1">
                Community support for dancers - ask for help or report issues
              </p>
            </div>
            <div className="flex gap-3">
              {/* Create Help Request */}
              <Dialog open={showCreateHelp} onOpenChange={setShowCreateHelp}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                    <HelpCircle className="h-4 w-4" />
                    Ask for Help
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Help Request</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Title *</label>
                      <Input
                        placeholder="Brief description of what you need help with"
                        value={newHelpRequest.title}
                        onChange={(e) => setNewHelpRequest({ ...newHelpRequest, title: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Category *</label>
                      <Select
                        value={newHelpRequest.category}
                        onValueChange={(value) => setNewHelpRequest({ ...newHelpRequest, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {HELP_CATEGORIES.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>
                              <div className="flex items-center gap-2">
                                <cat.icon className="h-4 w-4" />
                                {cat.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Description</label>
                      <Textarea
                        placeholder="Provide more details about your request..."
                        value={newHelpRequest.description}
                        onChange={(e) => setNewHelpRequest({ ...newHelpRequest, description: e.target.value })}
                        rows={4}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Location (optional)</label>
                      <Input
                        placeholder="e.g., Buenos Aires, Paris, New York"
                        value={newHelpRequest.location}
                        onChange={(e) => setNewHelpRequest({ ...newHelpRequest, location: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Urgency Level</label>
                      <Select
                        value={newHelpRequest.urgency}
                        onValueChange={(value: any) => setNewHelpRequest({ ...newHelpRequest, urgency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low - Can wait a few days</SelectItem>
                          <SelectItem value="medium">Medium - Need help soon</SelectItem>
                          <SelectItem value="high">High - Need help today</SelectItem>
                          <SelectItem value="emergency">Emergency - Urgent help needed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setShowCreateHelp(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateHelpRequest}
                        disabled={createHelpMutation.isPending}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                      >
                        {createHelpMutation.isPending ? 'Creating...' : 'Post Request'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Report Memory */}
              <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Flag className="h-4 w-4" />
                    Report Content
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Report Inappropriate Content</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Memory ID *</label>
                      <Input
                        placeholder="Enter the ID of the memory to report"
                        value={reportData.memoryId}
                        onChange={(e) => setReportData({ ...reportData, memoryId: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Report Type *</label>
                      <Select
                        value={reportData.reportType}
                        onValueChange={(value) => setReportData({ ...reportData, reportType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select report type" />
                        </SelectTrigger>
                        <SelectContent>
                          {REPORT_CATEGORIES.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>
                              <div className="flex items-center justify-between w-full">
                                <span>{cat.label}</span>
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    'ml-2 text-xs',
                                    cat.severity === 'high' && 'border-red-300 text-red-700',
                                    cat.severity === 'medium' && 'border-yellow-300 text-yellow-700',
                                    cat.severity === 'low' && 'border-blue-300 text-blue-700'
                                  )}
                                >
                                  {cat.severity}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Additional Details</label>
                      <Textarea
                        placeholder="Please provide any additional context..."
                        value={reportData.description}
                        onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setShowReportDialog(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleReportMemory}
                        disabled={reportMemoryMutation.isPending}
                        variant="destructive"
                      >
                        {reportMemoryMutation.isPending ? 'Submitting...' : 'Submit Report'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="help-requests">Community Requests</TabsTrigger>
              <TabsTrigger value="my-requests">My Requests</TabsTrigger>
              <TabsTrigger value="reported">Reported Content</TabsTrigger>
            </TabsList>

            {/* Community Help Requests */}
            <TabsContent value="help-requests" className="space-y-4">
              {/* Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search help requests..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {HELP_CATEGORIES.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
                      <SelectTrigger className="w-full sm:w-[150px]">
                        <SelectValue placeholder="All Urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Urgency</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Help Request List */}
              {helpLoading ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center gap-2 text-gray-500">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                    Loading help requests...
                  </div>
                </div>
              ) : helpRequests?.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No help requests found</p>
                    <p className="text-gray-400 text-sm mt-1">Be the first to ask for help!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {helpRequests?.map((request: HelpRequest) => (
                    <Card key={request.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getUrgencyBadge(request.urgency)}
                              {getStatusBadge(request.status)}
                              <Badge variant="outline">
                                {HELP_CATEGORIES.find(c => c.value === request.category)?.label || request.category}
                              </Badge>
                              {request.location && (
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {request.location}
                                </span>
                              )}
                            </div>
                            
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {request.title}
                            </h3>
                            
                            {request.description && (
                              <p className="text-gray-600 mb-3 line-clamp-2">
                                {request.description}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                  {request.user?.name?.[0] || '?'}
                                </div>
                                <span>{request.user?.name || 'Anonymous'}</span>
                              </div>
                              <span>•</span>
                              <span>{format(new Date(request.createdAt), 'MMM d, h:mm a')}</span>
                              {request.responses && request.responses > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <MessageSquare className="h-3 w-3" />
                                    {request.responses} responses
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <Button variant="outline" size="sm" className="ml-4">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Respond
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* My Requests */}
            <TabsContent value="my-requests" className="space-y-4">
              {myHelpRequests?.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">You haven't created any help requests yet</p>
                    <Button 
                      className="mt-4" 
                      variant="outline"
                      onClick={() => setShowCreateHelp(true)}
                    >
                      Create your first request
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {myHelpRequests?.map((request: HelpRequest) => (
                    <Card key={request.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getUrgencyBadge(request.urgency)}
                              {getStatusBadge(request.status)}
                              <Badge variant="outline">
                                {HELP_CATEGORIES.find(c => c.value === request.category)?.label || request.category}
                              </Badge>
                            </div>
                            
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {request.title}
                            </h3>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>Created {format(new Date(request.createdAt), 'MMM d, h:mm a')}</span>
                              {request.responses && request.responses > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <MessageSquare className="h-3 w-3" />
                                    {request.responses} responses
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            {request.status === 'open' && (
                              <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                                Mark Resolved
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Reported Content */}
            <TabsContent value="reported" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Reported Memories</CardTitle>
                </CardHeader>
                <CardContent>
                  {reportsLoading ? (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center gap-2 text-gray-500">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                        Loading reports...
                      </div>
                    </div>
                  ) : reportedMemories?.length === 0 ? (
                    <div className="text-center py-8">
                      <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No reported content</p>
                      <p className="text-gray-400 text-sm mt-1">Our community is keeping it clean!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reportedMemories?.map((report: MemoryReport) => (
                        <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Badge 
                                  variant="outline"
                                  className={cn(
                                    report.reportType === 'harassment' && 'border-red-300 text-red-700',
                                    report.reportType === 'inappropriate' && 'border-orange-300 text-orange-700',
                                    report.reportType === 'spam' && 'border-yellow-300 text-yellow-700'
                                  )}
                                >
                                  {REPORT_CATEGORIES.find(c => c.value === report.reportType)?.label || report.reportType}
                                </Badge>
                                <Badge variant="outline">
                                  {report.status}
                                </Badge>
                              </div>
                              
                              {report.memory && (
                                <div className="bg-gray-50 rounded p-3 mb-3">
                                  <p className="text-sm text-gray-600 line-clamp-2">
                                    "{report.memory.content}"
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    by @{report.memory.user.username}
                                  </p>
                                </div>
                              )}
                              
                              {report.description && (
                                <p className="text-sm text-gray-600 mb-2">
                                  Report reason: {report.description}
                                </p>
                              )}
                              
                              <p className="text-xs text-gray-500">
                                Reported on {format(new Date(report.createdAt), 'MMM d, yyyy')}
                              </p>
                            </div>
                            
                            {report.status === 'pending' && user?.roles?.includes('admin') && (
                              <Button variant="outline" size="sm" className="ml-4">
                                Review
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}