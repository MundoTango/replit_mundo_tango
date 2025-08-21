import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
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
  Award,
  Clock,
  TrendingUp,
  UserPlus,
  Send
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ESA Framework: Enhanced Role Invitations tied to Events
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
  message?: string;
  // Enhanced for event organizers
  permissions?: string[];
  isEventOrganizer?: boolean;
  canInviteOthers?: boolean;
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
  dj: 'bg-purple-100 text-purple-800',
  teacher: 'bg-blue-100 text-blue-800',
  musician: 'bg-green-100 text-green-800',
  performer: 'bg-pink-100 text-pink-800',
  host: 'bg-orange-100 text-orange-800',
  photographer: 'bg-indigo-100 text-indigo-800',
  organizer: 'bg-red-100 text-red-800',
  volunteer: 'bg-yellow-100 text-yellow-800',
};

export default function RoleInvitations() {
  const [activeTab, setActiveTab] = useState('pending');
  const [showSendForm, setShowSendForm] = useState(false);
  const [sendForm, setSendForm] = useState({
    username: '',
    eventId: '',
    role: '',
    message: ''
  });

  // Fetch invitations
  const { data: invitations, isLoading } = useQuery({
    queryKey: ['/api/users/me/event-invitations', activeTab],
    queryFn: async () => {
      const response = await fetch(`/api/users/me/event-invitations?status=${activeTab}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch invitations');
      const result = await response.json();
      return result.data || [];
    }
  });

  // Fetch my events (for sending invitations)
  const { data: myEvents } = useQuery({
    queryKey: ['/api/users/me/events'],
    queryFn: async () => {
      const response = await fetch('/api/users/me/events', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch events');
      const result = await response.json();
      return result.data || [];
    }
  });

  // Update invitation mutation
  const updateInvitationMutation = useMutation({
    mutationFn: async ({ participantId, status }: { participantId: number; status: 'accepted' | 'declined' }) => {
      const response = await fetch(`/api/event-participants/${participantId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('Failed to update invitation');
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.status === 'accepted' ? 'Invitation Accepted!' : 'Invitation Declined',
        description: variables.status === 'accepted' 
          ? 'You have successfully accepted the role invitation.'
          : 'You have declined the role invitation.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users/me/event-invitations'] });
    }
  });

  // Send invitation mutation
  const sendInvitationMutation = useMutation({
    mutationFn: async (data: typeof sendForm) => {
      const response = await fetch('/api/events/invite-participant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to send invitation');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Invitation Sent!',
        description: 'The role invitation has been sent successfully.',
      });
      setShowSendForm(false);
      setSendForm({ username: '', eventId: '', role: '', message: '' });
    }
  });

  const handleAccept = (invitation: RoleInvitation) => {
    updateInvitationMutation.mutate({ participantId: invitation.id, status: 'accepted' });
  };

  const handleDecline = (invitation: RoleInvitation) => {
    updateInvitationMutation.mutate({ participantId: invitation.id, status: 'declined' });
  };

  const handleSendInvitation = () => {
    if (!sendForm.username || !sendForm.eventId || !sendForm.role) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }
    sendInvitationMutation.mutate(sendForm);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate stats
  const stats = {
    pending: invitations?.filter((inv: RoleInvitation) => inv.status === 'pending').length || 0,
    accepted: invitations?.filter((inv: RoleInvitation) => inv.status === 'accepted').length || 0,
    total: invitations?.length || 0
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            Role Invitations
          </h1>
          <p className="text-gray-600">Manage your event role invitations and send new ones</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="glassmorphic-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glassmorphic-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Accepted</p>
                  <p className="text-2xl font-bold">{stats.accepted}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glassmorphic-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Invitations</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Bell className="w-8 h-8 text-turquoise-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glassmorphic-card">
            <CardContent className="p-4">
              <Button
                onClick={() => setShowSendForm(!showSendForm)}
                className="w-full bg-gradient-to-r from-turquoise-600 to-cyan-600 hover:from-turquoise-700 hover:to-cyan-700 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Invitation
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Send Invitation Form */}
        {showSendForm && (
          <Card className="glassmorphic-card mb-8">
            <CardHeader>
              <CardTitle>Send Role Invitation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Username</label>
                  <Input
                    placeholder="Enter username..."
                    value={sendForm.username}
                    onChange={(e) => setSendForm({ ...sendForm, username: e.target.value })}
                    className="glassmorphic-input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Event</label>
                  <Select
                    value={sendForm.eventId}
                    onValueChange={(value) => setSendForm({ ...sendForm, eventId: value })}
                  >
                    <SelectTrigger className="glassmorphic-input">
                      <SelectValue placeholder="Select event..." />
                    </SelectTrigger>
                    <SelectContent>
                      {myEvents?.map((event: any) => (
                        <SelectItem key={event.id} value={event.id.toString()}>
                          {event.title} - {formatDate(event.startDate)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <Select
                    value={sendForm.role}
                    onValueChange={(value) => setSendForm({ ...sendForm, role: value })}
                  >
                    <SelectTrigger className="glassmorphic-input">
                      <SelectValue placeholder="Select role..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(ROLE_ICONS).map((role) => (
                        <SelectItem key={role} value={role}>
                          <div className="flex items-center gap-2">
                            {ROLE_ICONS[role as keyof typeof ROLE_ICONS]}
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Message (Optional)</label>
                  <Input
                    placeholder="Add a personal message..."
                    value={sendForm.message}
                    onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
                    className="glassmorphic-input"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={handleSendInvitation}
                  disabled={sendInvitationMutation.isPending}
                  className="bg-gradient-to-r from-turquoise-600 to-cyan-600 hover:from-turquoise-700 hover:to-cyan-700 text-white"
                >
                  {sendInvitationMutation.isPending ? 'Sending...' : 'Send Invitation'}
                </Button>
                <Button
                  onClick={() => setShowSendForm(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invitations Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="declined">Declined</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-turquoise-600"></div>
              </div>
            ) : invitations?.length === 0 ? (
              <Card className="glassmorphic-card p-12 text-center">
                <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {activeTab === 'pending' ? 'No Pending Invitations' : 
                   activeTab === 'accepted' ? 'No Accepted Invitations' :
                   activeTab === 'declined' ? 'No Declined Invitations' :
                   'No Invitations'}
                </h3>
                <p className="text-gray-600">
                  {activeTab === 'pending' ? "You'll see new role invitations here when organizers invite you." :
                   activeTab === 'accepted' ? "Invitations you've accepted will appear here." :
                   activeTab === 'declined' ? "Invitations you've declined will appear here." :
                   "All your invitations will appear here."}
                </p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {invitations.map((invitation: RoleInvitation) => (
                  <Card key={invitation.id} className="glassmorphic-card overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Badge 
                              className={`flex items-center gap-1 ${ROLE_COLORS[invitation.role as keyof typeof ROLE_COLORS] || 'bg-gray-100 text-gray-800'}`}
                            >
                              {ROLE_ICONS[invitation.role as keyof typeof ROLE_ICONS]}
                              {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              Invited by {invitation.inviterName}
                            </span>
                          </div>
                          
                          <h3 className="text-lg font-semibold mb-2">{invitation.eventTitle}</h3>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(invitation.eventStartDate)}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {invitation.eventLocation}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Invited {formatDate(invitation.invitedAt)}
                            </div>
                          </div>
                          
                          {invitation.message && (
                            <div className="p-3 bg-gray-50 rounded-lg mb-4">
                              <p className="text-sm text-gray-700 italic">"{invitation.message}"</p>
                            </div>
                          )}
                          
                          {invitation.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleAccept(invitation)}
                                disabled={updateInvitationMutation.isPending}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Accept
                              </Button>
                              <Button
                                onClick={() => handleDecline(invitation)}
                                disabled={updateInvitationMutation.isPending}
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Decline
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        {invitation.status !== 'pending' && (
                          <Badge 
                            variant={invitation.status === 'accepted' ? 'default' : 'secondary'}
                            className={invitation.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          >
                            {invitation.status === 'accepted' ? 'Accepted' : 'Declined'}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}