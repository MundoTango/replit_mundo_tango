import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, X, Check, Clock, Mail, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EventParticipant {
  id: number;
  eventId: number;
  userId: number;
  role: string;
  status: 'pending' | 'accepted' | 'declined';
  invitedBy: number;
  invitedAt: string;
  respondedAt?: string;
  userName?: string;
  userEmail?: string;
}

interface EventRoleInvitationWorkflowProps {
  eventId: number;
  isEventCreator: boolean;
}

const EVENT_ROLES = [
  { value: 'dj', label: 'DJ', description: 'Music curator and playlist manager' },
  { value: 'teacher', label: 'Teacher', description: 'Tango instructor and lesson leader' },
  { value: 'musician', label: 'Musician', description: 'Live music performer' },
  { value: 'performer', label: 'Performer', description: 'Dance performance artist' },
  { value: 'host', label: 'Host', description: 'Event host and MC' },
  { value: 'volunteer', label: 'Volunteer', description: 'Event support and assistance' },
  { value: 'photographer', label: 'Photographer', description: 'Event photography' },
  { value: 'organizer', label: 'Co-Organizer', description: 'Event planning and coordination' },
];

export function EventRoleInvitationWorkflow({ eventId, isEventCreator }: EventRoleInvitationWorkflowProps) {
  const [userIdentifier, setUserIdentifier] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const queryClient = useQueryClient();

  // Fetch current event participants
  const { data: participants, isLoading } = useQuery({
    queryKey: ['/api/events', eventId, 'participants'],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/participants`);
      if (!response.ok) throw new Error('Failed to fetch participants');
      const result = await response.json();
      return result.data || [];
    },
  });

  // Invite participant mutation
  const inviteParticipantMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      const response = await fetch(`/api/events/${eventId}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to invite participant');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'participants'] });
      toast({ title: 'Role invitation sent successfully' });
      setUserIdentifier('');
      setSelectedRole('');
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Failed to send invitation', 
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  // Update participant status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ participantId, status }: { participantId: number; status: string }) => {
      const response = await fetch(`/api/event-participants/${participantId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'participants'] });
      toast({ title: 'Invitation status updated' });
    },
  });

  const handleInviteParticipant = () => {
    if (!userIdentifier.trim() || !selectedRole) {
      toast({ 
        title: 'Missing information', 
        description: 'Please enter user ID/email and select a role',
        variant: 'destructive'
      });
      return;
    }

    // For now, assume userIdentifier is a user ID
    // In production, you'd implement user lookup by email
    const userId = parseInt(userIdentifier);
    if (isNaN(userId)) {
      toast({ 
        title: 'Invalid user ID', 
        description: 'Please enter a valid numeric user ID',
        variant: 'destructive'
      });
      return;
    }

    inviteParticipantMutation.mutate({ userId, role: selectedRole });
  };

  const handleStatusUpdate = (participantId: number, status: string) => {
    updateStatusMutation.mutate({ participantId, status });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <Check className="w-4 h-4 text-green-600" />;
      case 'declined': return <X className="w-4 h-4 text-red-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-orange-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'declined': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Group participants by role
  const participantsByRole = participants?.reduce((acc: Record<string, EventParticipant[]>, participant: EventParticipant) => {
    if (!acc[participant.role]) acc[participant.role] = [];
    acc[participant.role].push(participant);
    return acc;
  }, {}) || {};

  return (
    <div className="space-y-6">
      {/* Role Invitation Form (Only for Event Creators) */}
      {isEventCreator && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Invite Team Members
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">User ID or Email</label>
                <Input
                  placeholder="Enter user ID or email..."
                  value={userIdentifier}
                  onChange={(e) => setUserIdentifier(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Role</label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div>
                          <div className="font-medium">{role.label}</div>
                          <div className="text-xs text-muted-foreground">{role.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleInviteParticipant}
                  disabled={!userIdentifier.trim() || !selectedRole || inviteParticipantMutation.isPending}
                  className="w-full"
                >
                  {inviteParticipantMutation.isPending ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              Invited users will receive a notification to accept or decline their role assignment.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Participants by Role */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Event Team</h3>
        
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : Object.keys(participantsByRole).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(participantsByRole).map(([role, roleParticipants]) => (
              <Card key={role}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base capitalize flex items-center justify-between">
                    {EVENT_ROLES.find(r => r.value === role)?.label || role}
                    <Badge variant="outline">{(roleParticipants as any[]).length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(roleParticipants as any[]).map((participant: any) => (
                    <div key={participant.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex-1">
                        <div className="font-medium">
                          User {participant.userId}
                          {participant.userName && ` (${participant.userName})`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Invited {new Date(participant.invitedAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`flex items-center gap-1 ${getStatusColor(participant.status)}`}
                        >
                          {getStatusIcon(participant.status)}
                          {participant.status}
                        </Badge>
                        
                        {/* Allow participants to accept/decline their own invitations */}
                        {participant.status === 'pending' && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(participant.id, 'accepted')}
                              disabled={updateStatusMutation.isPending}
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(participant.id, 'declined')}
                              disabled={updateStatusMutation.isPending}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No team members assigned yet.
              {isEventCreator && " Use the form above to invite participants with specific roles."}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Role Information */}
      <Card>
        <CardHeader>
          <CardTitle>Available Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EVENT_ROLES.map((role) => (
              <div key={role.value} className="p-3 rounded-lg border">
                <div className="font-medium">{role.label}</div>
                <div className="text-sm text-muted-foreground">{role.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}