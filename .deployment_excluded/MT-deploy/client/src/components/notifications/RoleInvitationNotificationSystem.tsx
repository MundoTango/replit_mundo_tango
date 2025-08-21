import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  MapPin, 
  Users,
  Music,
  Mic,
  Star,
  Camera,
  Globe,
  Award
} from 'lucide-react';

interface RoleInvitation {
  id: number;
  eventId: number;
  userId: number;
  role: string;
  status: 'pending' | 'accepted' | 'declined';
  invitedBy: number;
  invitedAt: string;
  eventTitle: string;
  eventStartDate: string;
  eventLocation: string;
  inviterName: string;
}

const ROLE_ICONS = {
  dj: <Music className="w-4 h-4" />,
  teacher: <Users className="w-4 h-4" />,
  musician: <Mic className="w-4 h-4" />,
  performer: <Star className="w-4 h-4" />,
  host: <Globe className="w-4 h-4" />,
  photographer: <Camera className="w-4 h-4" />,
  organizer: <Calendar className="w-4 h-4" />,
  volunteer: <Award className="w-4 h-4" />,
};

interface RoleInvitationNotificationSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RoleInvitationNotificationSystem({ isOpen, onClose }: RoleInvitationNotificationSystemProps) {
  const queryClient = useQueryClient();

  // Fetch pending invitations
  const { data: invitations, isLoading } = useQuery({
    queryKey: ['/api/users/me/event-invitations', 'pending'],
    queryFn: async () => {
      const response = await fetch('/api/users/me/event-invitations?status=pending');
      if (!response.ok) throw new Error('Failed to fetch invitations');
      const result = await response.json();
      return result.data || [];
    },
    enabled: isOpen,
    refetchInterval: 30000, // Refetch every 30 seconds when open
  });

  // Accept/decline invitation mutation
  const updateInvitationMutation = useMutation({
    mutationFn: async ({ participantId, status }: { participantId: number; status: 'accepted' | 'declined' }) => {
      const response = await fetch(`/api/event-participants/${participantId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update invitation');
      return response.json();
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/me/event-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', 'accepted-roles'] });
      
      toast({ 
        title: status === 'accepted' ? 'Role accepted!' : 'Invitation declined',
        description: status === 'accepted' 
          ? 'The role has been added to your resume and the organizer has been notified.'
          : 'The organizer has been notified of your decision.',
      });

      // Auto-close notification panel if no more pending invitations
      if (invitations?.length === 1) {
        onClose();
      }
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Failed to respond to invitation', 
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  // Show desktop notification for new invitations
  useEffect(() => {
    if (invitations?.length > 0 && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        const latestInvitation = invitations[0];
        new Notification('New Event Role Invitation', {
          body: `You've been invited to be a ${latestInvitation.role} at ${latestInvitation.eventTitle}`,
          icon: '/favicon.ico',
          tag: `invitation-${latestInvitation.id}`,
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  }, [invitations]);

  const handleInvitationResponse = (participantId: number, status: 'accepted' | 'declined') => {
    updateInvitationMutation.mutate({ participantId, status });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Role Invitations
              {invitations?.length > 0 && (
                <Badge variant="destructive">{invitations.length}</Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : invitations?.length > 0 ? (
              <div className="divide-y">
                {invitations.map((invitation: RoleInvitation) => (
                  <div key={invitation.id} className="p-6 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant="outline" 
                            className="flex items-center gap-1 bg-orange-50 text-orange-700 border-orange-200"
                          >
                            {ROLE_ICONS[invitation.role as keyof typeof ROLE_ICONS]}
                            {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            from {invitation.inviterName}
                          </span>
                        </div>
                        
                        <h4 className="font-semibold text-foreground mb-1 truncate">
                          {invitation.eventTitle}
                        </h4>
                        
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{formatDate(invitation.eventStartDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{invitation.eventLocation}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Invited {formatDate(invitation.invitedAt)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleInvitationResponse(invitation.id, 'accepted')}
                          disabled={updateInvitationMutation.isPending}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleInvitationResponse(invitation.id, 'declined')}
                          disabled={updateInvitationMutation.isPending}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No pending invitations</h3>
                <p>You'll see event role invitations here when organizers invite you to participate.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}