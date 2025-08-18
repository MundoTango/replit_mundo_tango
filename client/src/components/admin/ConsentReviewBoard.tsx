import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar,
  Eye,
  MessageSquare,
  Heart,
  AlertTriangle,
  Filter,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';

interface ConsentRequest {
  id: number;
  memory: {
    id: number;
    title: string;
    content: string;
    emotionTags: string[];
    trustLevel: number;
    author: {
      id: number;
      name: string;
      username: string;
    };
  };
  requester: {
    id: number;
    name: string;
    username: string;
  };
  status: 'pending' | 'approved' | 'denied';
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: {
    id: number;
    name: string;
  };
  reviewNotes?: string;
  reason: string;
}

export default function ConsentReviewBoard() {
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ConsentRequest | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock data for demonstration
  const mockConsentRequests: ConsentRequest[] = [
    {
      id: 1,
      memory: {
        id: 101,
        title: "My first milonga experience",
        content: "Last night was magical. I went to my first milonga and felt the connection...",
        emotionTags: ["joy", "excitement", "love"],
        trustLevel: 3,
        author: {
          id: 4,
          name: "Maria Rodriguez",
          username: "maria_tango"
        }
      },
      requester: {
        id: 5,
        name: "Carlos Martinez",
        username: "carlos_dj"
      },
      status: 'pending',
      requestedAt: '2025-06-30T10:30:00Z',
      reason: "Would like to feature this story in the community spotlight"
    },
    {
      id: 2,
      memory: {
        id: 102,
        title: "Overcoming fear on the dance floor",
        content: "I used to be terrified of making mistakes, but tango taught me to embrace them...",
        emotionTags: ["vulnerability", "growth", "courage"],
        trustLevel: 4,
        author: {
          id: 6,
          name: "Elena Fernandez",
          username: "elena_performer"
        }
      },
      requester: {
        id: 7,
        name: "David Kim",
        username: "david_teacher"
      },
      status: 'approved',
      requestedAt: '2025-06-29T14:15:00Z',
      reviewedAt: '2025-06-29T16:20:00Z',
      reviewedBy: {
        id: 3,
        name: "Scott Boddye"
      },
      reviewNotes: "Beautiful story that will inspire other dancers. Approved for community sharing.",
      reason: "Perfect example for teaching beginners about vulnerability in dance"
    },
    {
      id: 3,
      memory: {
        id: 103,
        title: "Argentina memories",
        content: "Walking through Buenos Aires, feeling the history in every cobblestone...",
        emotionTags: ["nostalgia", "wonder", "connection"],
        trustLevel: 2,
        author: {
          id: 8,
          name: "Ana Silva",
          username: "ana_traveler"
        }
      },
      requester: {
        id: 9,
        name: "Roberto Santos",
        username: "roberto_guide"
      },
      status: 'denied',
      requestedAt: '2025-06-28T09:45:00Z',
      reviewedAt: '2025-06-28T11:30:00Z',
      reviewedBy: {
        id: 3,
        name: "Scott Boddye"
      },
      reviewNotes: "Content too personal and trust level too low for public sharing.",
      reason: "Want to include in travel guide for tango tourists"
    }
  ];

  // Review mutation
  const reviewConsentMutation = useMutation({
    mutationFn: async ({ id, action, notes }: { id: number; action: 'approve' | 'deny'; notes: string }) => {
      return apiRequest('PUT', `/api/admin/consent/${id}/review`, {
        action,
        notes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/consent'] });
      toast({
        title: "Success",
        description: "Consent request reviewed successfully"
      });
      setIsReviewDialogOpen(false);
      setSelectedRequest(null);
      setReviewNotes('');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to review consent request",
        variant: "destructive"
      });
    }
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      'pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'approved': 'bg-green-100 text-green-700 border-green-200',
      'denied': 'bg-red-100 text-red-700 border-red-200'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'approved': return <CheckCircle className="h-3 w-3" />;
      case 'denied': return <XCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const getTrustLevelColor = (level: number) => {
    if (level <= 1) return 'bg-red-100 text-red-700';
    if (level <= 2) return 'bg-orange-100 text-orange-700';
    if (level <= 3) return 'bg-yellow-100 text-yellow-700';
    if (level <= 4) return 'bg-green-100 text-green-700';
    return 'bg-blue-100 text-blue-700';
  };

  const filteredRequests = mockConsentRequests.filter(request => {
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesSearch = 
      request.memory.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.memory.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requester.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const handleReview = (action: 'approve' | 'deny') => {
    if (!selectedRequest) return;
    
    reviewConsentMutation.mutate({
      id: selectedRequest.id,
      action,
      notes: reviewNotes
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by memory title, author, or requester..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 rounded-xl border-gray-200">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requests</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="denied">Denied</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-200 rounded-xl">
              <Clock className="h-5 w-5 text-yellow-700" />
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-900">
                {mockConsentRequests.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-sm font-medium text-yellow-700">Pending Review</div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-200 rounded-xl">
              <CheckCircle className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-900">
                {mockConsentRequests.filter(r => r.status === 'approved').length}
              </div>
              <div className="text-sm font-medium text-green-700">Approved</div>
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
                {mockConsentRequests.filter(r => r.status === 'denied').length}
              </div>
              <div className="text-sm font-medium text-red-700">Denied</div>
            </div>
          </div>
        </div>
      </div>

      {/* Consent requests list */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <div key={request.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Badge className={`${getStatusBadge(request.status)} border font-medium`}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(request.status)}
                    <span className="capitalize">{request.status}</span>
                  </div>
                </Badge>
                <Badge className={`${getTrustLevelColor(request.memory.trustLevel)} border`}>
                  Trust Level {request.memory.trustLevel}
                </Badge>
              </div>
              
              <div className="text-sm text-gray-500">
                {format(new Date(request.requestedAt), 'MMM d, yyyy h:mm a')}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{request.memory.title}</h3>
                <p className="text-gray-600 line-clamp-2">{request.memory.content}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {request.memory.emotionTags.map((tag, index) => (
                  <Badge key={index} className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Author:</span>
                  <span className="font-medium">{request.memory.author.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Requester:</span>
                  <span className="font-medium">{request.requester.name}</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm font-medium text-gray-700 mb-1">Reason for Request:</div>
                <div className="text-sm text-gray-600">{request.reason}</div>
              </div>

              {request.status !== 'pending' && request.reviewNotes && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Review Notes</span>
                    <span className="text-xs text-blue-600">by {request.reviewedBy?.name}</span>
                  </div>
                  <div className="text-sm text-blue-800">{request.reviewNotes}</div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedRequest(request);
                    setIsReviewDialogOpen(true);
                  }}
                  className="rounded-lg"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  {request.status === 'pending' ? 'Review' : 'View Details'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Review dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Review Consent Request</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{selectedRequest.memory.title}</h3>
                <p className="text-gray-700 mb-4 leading-relaxed">{selectedRequest.memory.content}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Author:</span>
                    <span className="font-medium ml-2">{selectedRequest.memory.author.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Trust Level:</span>
                    <Badge className={`${getTrustLevelColor(selectedRequest.memory.trustLevel)} border ml-2`}>
                      Level {selectedRequest.memory.trustLevel}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-600">Requester:</span>
                    <span className="font-medium ml-2">{selectedRequest.requester.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Requested:</span>
                    <span className="ml-2">{format(new Date(selectedRequest.requestedAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Review Notes</label>
                <Textarea
                  placeholder="Add your review notes here..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="rounded-xl border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
                  rows={4}
                />
              </div>

              {selectedRequest.status === 'pending' && (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleReview('deny')}
                    disabled={reviewConsentMutation.isPending}
                    className="flex-1 rounded-xl text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Deny Request
                  </Button>
                  <Button
                    onClick={() => handleReview('approve')}
                    disabled={reviewConsentMutation.isPending}
                    className="flex-1 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Request
                  </Button>
                </div>
              )}

              {selectedRequest.status !== 'pending' && (
                <Button
                  variant="outline"
                  onClick={() => setIsReviewDialogOpen(false)}
                  className="w-full rounded-xl"
                >
                  Close
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}