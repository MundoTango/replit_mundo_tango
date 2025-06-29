import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, UserPlus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EventRoleInviterProps {
  eventId: number;
  eventTitle: string;
  isEventCreator: boolean;
}

const TANGO_ROLES = [
  'DJ',
  'Teacher',
  'Musician',
  'Performer',
  'Photographer',
  'Videographer',
  'Sound Technician',
  'Lighting Technician',
  'Event Coordinator',
  'Master of Ceremonies',
  'Security',
  'Host/Hostess'
];

export default function EventRoleInviter({ eventId, eventTitle, isEventCreator }: EventRoleInviterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Search users
  const { data: searchResults } = useQuery({
    queryKey: ['/api/user/global-search', searchQuery],
    enabled: searchQuery.length >= 2,
    queryFn: () => apiRequest(`/api/user/global-search?query=${encodeURIComponent(searchQuery)}`),
  });

  // Get event participants
  const { data: participantsData, isLoading: loadingParticipants } = useQuery({
    queryKey: ['/api/events', eventId, 'participants'],
    queryFn: () => apiRequest(`/api/events/${eventId}/participants`),
  });

  // Invite user mutation
  const inviteUserMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) =>
      apiRequest(`/api/events/${eventId}/participants`, {
        method: 'POST',
        body: JSON.stringify({ userId, role }),
      }),
    onSuccess: () => {
      toast({
        title: 'Invitation sent',
        description: 'User has been invited to participate in the event',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'participants'] });
      setSelectedUserId('');
      setSelectedRole('');
      setSearchQuery('');
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to send invitation',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  const handleInviteUser = () => {
    if (!selectedUserId || !selectedRole) {
      toast({
        title: 'Missing information',
        description: 'Please select a user and role',
        variant: 'destructive',
      });
      return;
    }

    inviteUserMutation.mutate({
      userId: parseInt(selectedUserId),
      role: selectedRole,
    });
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

  if (!isEventCreator) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Invite New Participant */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <UserPlus className="h-5 w-5 mr-2 text-[#8E142E]" />
            Invite Participants to {eventTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users by name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Search Results */}
          {searchResults?.data?.users && searchResults.data.users.length > 0 && (
            <div className="border rounded-lg max-h-40 overflow-y-auto">
              {searchResults.data.users.map((user: any) => (
                <div
                  key={user.id}
                  className={`p-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
                    selectedUserId === user.id.toString() ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => setSelectedUserId(user.id.toString())}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.profileImage || '/api/placeholder/40/40'}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">@{user.username}</p>
                    </div>
                  </div>
                  {selectedUserId === user.id.toString() && (
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Role Selection */}
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select a role for this event" />
            </SelectTrigger>
            <SelectContent>
              {TANGO_ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Invite Button */}
          <Button
            onClick={handleInviteUser}
            disabled={!selectedUserId || !selectedRole || inviteUserMutation.isPending}
            className="w-full bg-[#8E142E] hover:bg-[#6B0F22]"
          >
            <Plus className="h-4 w-4 mr-2" />
            {inviteUserMutation.isPending ? 'Sending Invitation...' : 'Send Invitation'}
          </Button>
        </CardContent>
      </Card>

      {/* Current Participants */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Event Participants</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingParticipants ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8E142E]"></div>
            </div>
          ) : participantsData?.data && participantsData.data.length > 0 ? (
            <div className="space-y-3">
              {participantsData.data.map((participant: any) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={participant.userProfileImage || '/api/placeholder/40/40'}
                      alt={participant.userName}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-sm">{participant.userName}</p>
                      <p className="text-xs text-gray-500">{participant.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(participant.status)}
                    <Badge variant="secondary" className={getStatusColor(participant.status)}>
                      {participant.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No participants invited yet</p>
              <p className="text-sm">Start by inviting users to specific roles</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}