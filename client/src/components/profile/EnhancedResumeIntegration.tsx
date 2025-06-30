import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Download, 
  Share, 
  Star, 
  Award,
  Music,
  Users,
  Camera,
  Mic,
  Globe,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AcceptedRole {
  id: number;
  eventId: number;
  role: string;
  status: 'accepted';
  respondedAt: string;
  eventTitle: string;
  eventStartDate: string;
  eventLocation: string;
  eventCity: string;
  eventCountry: string;
  inviterName: string;
  inviterId: number;
}

interface PendingInvitation {
  id: number;
  eventId: number;
  role: string;
  status: 'pending';
  invitedAt: string;
  eventTitle: string;
  eventStartDate: string;
  eventLocation: string;
  inviterName: string;
}

interface EnhancedResumeIntegrationProps {
  userId: number;
  isOwnProfile?: boolean;
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

const ROLE_COLORS = {
  dj: 'bg-purple-100 text-purple-800 border-purple-200',
  teacher: 'bg-blue-100 text-blue-800 border-blue-200',
  musician: 'bg-green-100 text-green-800 border-green-200',
  performer: 'bg-pink-100 text-pink-800 border-pink-200',
  host: 'bg-orange-100 text-orange-800 border-orange-200',
  photographer: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  organizer: 'bg-red-100 text-red-800 border-red-200',
  volunteer: 'bg-teal-100 text-teal-800 border-teal-200',
};

export function EnhancedResumeIntegration({ userId, isOwnProfile = false }: EnhancedResumeIntegrationProps) {
  const [activeTab, setActiveTab] = useState<'resume' | 'invitations'>('resume');
  const queryClient = useQueryClient();

  // Fetch accepted roles for resume
  const { data: acceptedRoles, isLoading: resumeLoading } = useQuery({
    queryKey: ['/api/users', userId, 'accepted-roles'],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/accepted-roles`);
      if (!response.ok) throw new Error('Failed to fetch accepted roles');
      const result = await response.json();
      return result.data || [];
    },
  });

  // Fetch pending invitations (only for own profile)
  const { data: pendingInvitations, isLoading: invitationsLoading } = useQuery({
    queryKey: ['/api/users/me/event-invitations'],
    queryFn: async () => {
      if (!isOwnProfile) return [];
      const response = await fetch('/api/users/me/event-invitations?status=pending');
      if (!response.ok) throw new Error('Failed to fetch invitations');
      const result = await response.json();
      return result.data || [];
    },
    enabled: isOwnProfile,
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
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'accepted-roles'] });
      toast({ 
        title: `Invitation ${status}`,
        description: status === 'accepted' ? 'Role added to your resume!' : 'Invitation declined'
      });
    },
  });

  // Group accepted roles by year
  const rolesByYear = acceptedRoles?.reduce((acc: Record<string, AcceptedRole[]>, role: AcceptedRole) => {
    const year = new Date(role.eventStartDate).getFullYear().toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(role);
    return acc;
  }, {}) || {};

  // Calculate statistics
  const stats = {
    totalEvents: acceptedRoles?.length || 0,
    uniqueRoles: new Set(acceptedRoles?.map((r: AcceptedRole) => r.role)).size,
    totalYears: Object.keys(rolesByYear).length,
    mostCommonRole: acceptedRoles?.reduce((acc: Record<string, number>, role: AcceptedRole) => {
      acc[role.role] = (acc[role.role] || 0) + 1;
      return acc;
    }, {})
  };

  const topRole = stats.mostCommonRole ? 
    Object.entries(stats.mostCommonRole).sort(([,a], [,b]) => (b as number) - (a as number))[0] : null;

  const handleInvitationResponse = (participantId: number, status: 'accepted' | 'declined') => {
    updateInvitationMutation.mutate({ participantId, status });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('resume')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'resume'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Award className="w-4 h-4 inline mr-2" />
          Tango Resume
        </button>
        {isOwnProfile && (
          <button
            onClick={() => setActiveTab('invitations')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'invitations'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <AlertCircle className="w-4 h-4 inline mr-2" />
            Role Invitations
            {pendingInvitations?.length > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {pendingInvitations.length}
              </Badge>
            )}
          </button>
        )}
      </div>

      {/* Resume Tab */}
      {activeTab === 'resume' && (
        <div className="space-y-6">
          {/* Statistics Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.totalEvents}</div>
                <div className="text-sm text-muted-foreground">Total Events</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.uniqueRoles}</div>
                <div className="text-sm text-muted-foreground">Unique Roles</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.totalYears}</div>
                <div className="text-sm text-muted-foreground">Active Years</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-sm font-medium text-primary capitalize">
                  {topRole?.[0] || 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Top Role</div>
              </CardContent>
            </Card>
          </div>

          {/* Resume by Year */}
          {resumeLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded mb-4" />
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : Object.keys(rolesByYear).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(rolesByYear)
                .sort(([a], [b]) => parseInt(b) - parseInt(a))
                .map(([year, roles]) => (
                  <Card key={year}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        {year}
                        <Badge variant="outline">{(roles as any[]).length} events</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {(roles as any[])
                        .sort((a: any, b: any) => new Date(b.eventStartDate).getTime() - new Date(a.eventStartDate).getTime())
                        .map((role: any, index: any) => (
                          <div key={role.id}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge 
                                    variant="outline" 
                                    className={`flex items-center gap-1 ${ROLE_COLORS[role.role as keyof typeof ROLE_COLORS] || 'bg-gray-100 text-gray-800'}`}
                                  >
                                    {ROLE_ICONS[role.role as keyof typeof ROLE_ICONS]}
                                    {role.role.charAt(0).toUpperCase() + role.role.slice(1)}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    Invited by {role.inviterName}
                                  </span>
                                </div>
                                
                                <h4 className="font-semibold">{role.eventTitle}</h4>
                                
                                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(role.eventStartDate)}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {role.eventLocation || `${role.eventCity}, ${role.eventCountry}`}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Accepted {formatDate(role.respondedAt)}
                                  </div>
                                </div>
                              </div>
                            </div>
                            {index < roles.length - 1 && <Separator className="mt-4" />}
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No accepted roles yet</h3>
                <p>
                  {isOwnProfile 
                    ? "Accept role invitations to build your tango resume!" 
                    : "This user hasn't accepted any event roles yet."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Invitations Tab */}
      {activeTab === 'invitations' && isOwnProfile && (
        <div className="space-y-4">
          {invitationsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : pendingInvitations?.length > 0 ? (
            pendingInvitations.map((invitation: PendingInvitation) => (
              <Card key={invitation.id} className="border-orange-200 bg-orange-50/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge 
                          variant="outline" 
                          className={`flex items-center gap-1 ${ROLE_COLORS[invitation.role as keyof typeof ROLE_COLORS] || 'bg-gray-100 text-gray-800'}`}
                        >
                          {ROLE_ICONS[invitation.role as keyof typeof ROLE_ICONS]}
                          {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                        </Badge>
                        <Badge variant="outline" className="text-orange-600 border-orange-200">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      </div>
                      
                      <h4 className="font-semibold mb-2">{invitation.eventTitle}</h4>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(invitation.eventStartDate)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {invitation.eventLocation}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Invited by {invitation.inviterName}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleInvitationResponse(invitation.id, 'accepted')}
                        disabled={updateInvitationMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
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
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No pending invitations</h3>
                <p>You'll see event role invitations here when organizers invite you to participate.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}