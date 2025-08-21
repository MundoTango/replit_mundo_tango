import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Clock, Calendar, MapPin, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function EventInvitationManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's event invitations
  const { data: invitationsData, isLoading } = useQuery({
    queryKey: ['/api/users/me/event-invitations'],
    queryFn: () => apiRequest('/api/users/me/event-invitations'),
  });

  // Update invitation status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ participantId, status }: { participantId: number; status: 'accepted' | 'declined' }) =>
      apiRequest(`/api/event-participants/${participantId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: (data, variables) => {
      toast({
        title: `Invitation ${variables.status}`,
        description: `You have ${variables.status} the event role invitation`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users/me/event-invitations'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update invitation',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  const handleAccept = (participantId: number) => {
    updateStatusMutation.mutate({ participantId, status: 'accepted' });
  };

  const handleDecline = (participantId: number) => {
    updateStatusMutation.mutate({ participantId, status: 'declined' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'declined':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const filterInvitations = (status?: string) => {
    if (!invitationsData?.data) return [];
    if (!status) return invitationsData.data;
    return invitationsData.data.filter((inv: any) => inv.status === status);
  };

  const InvitationCard = ({ invitation }: { invitation: any }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-lg">{invitation.eventTitle}</h3>
              {getStatusIcon(invitation.status)}
              <Badge className={getStatusColor(invitation.status)}>
                {invitation.status}
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Role: <strong className="text-[#8E142E]">{invitation.role}</strong></span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(invitation.eventStartDate), 'PPP')}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>{invitation.eventLocation}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Invited by: {invitation.inviterName}</span>
              </div>
            </div>
          </div>
          
          {invitation.status === 'pending' && (
            <div className="flex space-x-2 ml-4">
              <Button
                size="sm"
                onClick={() => handleAccept(invitation.id)}
                disabled={updateStatusMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDecline(invitation.id)}
                disabled={updateStatusMutation.isPending}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Decline
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8E142E]"></div>
      </div>
    );
  }

  const pendingInvitations = filterInvitations('pending');
  const acceptedInvitations = filterInvitations('accepted');
  const declinedInvitations = filterInvitations('declined');
  const allInvitations = filterInvitations();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Role Invitations</h1>
        <p className="text-gray-600">Manage your event role invitations and build your tango resume</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingInvitations.length > 0 && (
              <Badge className="ml-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                {pendingInvitations.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Accepted ({acceptedInvitations.length})
          </TabsTrigger>
          <TabsTrigger value="declined">
            Declined ({declinedInvitations.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({allInvitations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingInvitations.length > 0 ? (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                You have {pendingInvitations.length} pending invitation{pendingInvitations.length !== 1 ? 's' : ''}
              </p>
              {pendingInvitations.map((invitation: any) => (
                <InvitationCard key={invitation.id} invitation={invitation} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pending invitations</h3>
                <p className="text-gray-500">You're all caught up! Check back later for new opportunities.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="accepted" className="mt-6">
          {acceptedInvitations.length > 0 ? (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                You have accepted {acceptedInvitations.length} role invitation{acceptedInvitations.length !== 1 ? 's' : ''}
              </p>
              {acceptedInvitations.map((invitation: any) => (
                <InvitationCard key={invitation.id} invitation={invitation} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No accepted invitations</h3>
                <p className="text-gray-500">Accept invitations to build your tango resume.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="declined" className="mt-6">
          {declinedInvitations.length > 0 ? (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                You have declined {declinedInvitations.length} role invitation{declinedInvitations.length !== 1 ? 's' : ''}
              </p>
              {declinedInvitations.map((invitation: any) => (
                <InvitationCard key={invitation.id} invitation={invitation} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <XCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No declined invitations</h3>
                <p className="text-gray-500">All your invitations are still active.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          {allInvitations.length > 0 ? (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                You have {allInvitations.length} total invitation{allInvitations.length !== 1 ? 's' : ''}
              </p>
              {allInvitations.map((invitation: any) => (
                <InvitationCard key={invitation.id} invitation={invitation} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No invitations yet</h3>
                <p className="text-gray-500">Event organizers will invite you to participate in their events.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}