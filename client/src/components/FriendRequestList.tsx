import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Clock, Music, MapPin, Calendar, MessageSquare, UserPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FriendRequest {
  id: number;
  senderId: number;
  receiverId: number;
  status: string;
  didWeDance: boolean;
  danceLocation?: string;
  danceEventId?: number;
  danceStory?: string;
  mediaUrls?: string[];
  senderMessage?: string;
  sentAt: string;
  sender: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
    city?: string;
    country?: string;
  };
  media?: Array<{
    id: number;
    mediaUrl: string;
    mediaType: string;
    caption?: string;
  }>;
}

export function FriendRequestList() {
  const [selectedRequest, setSelectedRequest] = useState<FriendRequest | null>(null);
  const [acceptMessage, setAcceptMessage] = useState('');
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: friendRequests = [], isLoading } = useQuery({
    queryKey: ['/api/friend-requests/received'],
    queryFn: async () => {
      const response = await apiRequest('/api/friend-requests/received');
      return response.data || [];
    },
  });

  const acceptMutation = useMutation({
    mutationFn: ({ requestId, message }: { requestId: number; message: string }) =>
      apiRequest(`/api/friend-requests/${requestId}/accept`, {
        method: 'POST',
        body: JSON.stringify({ receiverMessage: message }),
      }),
    onSuccess: (_, { requestId }) => {
      toast({
        title: "Friend Request Accepted!",
        description: "You are now connected.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/friend-requests/received'] });
      queryClient.invalidateQueries({ queryKey: ['/api/friends'] });
      setShowAcceptDialog(false);
      setSelectedRequest(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId: number) =>
      apiRequest(`/api/friend-requests/${requestId}/reject`, {
        method: 'POST',
      }),
    onSuccess: () => {
      toast({
        title: "Friend Request Declined",
        description: "The request has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/friend-requests/received'] });
    },
  });

  const snoozeMutation = useMutation({
    mutationFn: ({ requestId, days }: { requestId: number; days: number }) => {
      const snoozedUntil = new Date();
      snoozedUntil.setDate(snoozedUntil.getDate() + days);
      return apiRequest(`/api/friend-requests/${requestId}/snooze`, {
        method: 'POST',
        body: JSON.stringify({ snoozedUntil: snoozedUntil.toISOString() }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Request Snoozed",
        description: "You'll be reminded later.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/friend-requests/received'] });
    },
  });

  const handleAccept = () => {
    if (selectedRequest) {
      acceptMutation.mutate({
        requestId: selectedRequest.id,
        message: acceptMessage,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="glassmorphic-card animate-pulse">
            <CardContent className="h-32" />
          </Card>
        ))}
      </div>
    );
  }

  if (friendRequests.length === 0) {
    return (
      <Card className="glassmorphic-card">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <UserPlus className="h-12 w-12 text-turquoise-400/50 mb-4" />
          <p className="text-muted-foreground">No pending friend requests</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {friendRequests.map((request: FriendRequest) => (
          <Card key={request.id} className="glassmorphic-card hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 ring-2 ring-turquoise-200/50">
                  <AvatarImage src={request.sender.profileImage} />
                  <AvatarFallback className="bg-gradient-to-br from-turquoise-400 to-cyan-500 text-white">
                    {request.sender.name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{request.sender.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      @{request.sender.username} • {request.sender.city}, {request.sender.country}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(request.sentAt), { addSuffix: true })}
                    </p>
                  </div>

                  {request.didWeDance && (
                    <div className="bg-gradient-to-r from-turquoise-50/50 to-cyan-50/50 p-3 rounded-lg border border-turquoise-200/30">
                      <div className="flex items-center gap-2 mb-1">
                        <Music className="h-4 w-4 text-turquoise-600" />
                        <span className="text-sm font-medium text-turquoise-700">We danced together!</span>
                      </div>
                      {request.danceLocation && (
                        <p className="text-sm text-turquoise-600 flex items-center gap-1 ml-6">
                          <MapPin className="h-3 w-3" />
                          {request.danceLocation}
                        </p>
                      )}
                      {request.danceStory && (
                        <p className="text-sm text-gray-600 mt-2 ml-6 italic">
                          "{request.danceStory}"
                        </p>
                      )}
                    </div>
                  )}

                  {request.senderMessage && (
                    <div className="bg-white/50 p-3 rounded-lg border border-gray-200/50">
                      <p className="text-sm flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span>{request.senderMessage}</span>
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowAcceptDialog(true);
                      }}
                      className="bg-gradient-to-r from-turquoise-500 to-cyan-600 text-white hover:shadow-md"
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectMutation.mutate(request.id)}
                    >
                      <X className="mr-1 h-4 w-4" />
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => snoozeMutation.mutate({ requestId: request.id, days: 7 })}
                    >
                      <Clock className="mr-1 h-4 w-4" />
                      Snooze
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent className="glassmorphic-card">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
              Accept Friend Request
            </DialogTitle>
            <DialogDescription>
              Add a message to {selectedRequest?.sender.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Add a welcome message (optional)..."
              value={acceptMessage}
              onChange={(e) => setAcceptMessage(e.target.value)}
              className="glassmorphic-input min-h-[100px]"
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAcceptDialog(false);
                  setAcceptMessage('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAccept}
                disabled={acceptMutation.isPending}
                className="bg-gradient-to-r from-turquoise-500 to-cyan-600 text-white"
              >
                Accept Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}