import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Users, Shield, Mail, UserCheck, UserX, Settings, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface EventAdmin {
  id: number;
  userId: number;
  eventId: number;
  role: 'owner' | 'admin' | 'moderator';
  permissions: {
    canEditEvent: boolean;
    canDeleteEvent: boolean;
    canManageAdmins: boolean;
    canModerateContent: boolean;
    canSendNotifications: boolean;
  };
  user: {
    id: number;
    name: string;
    username: string;
    profileImage: string | null;
  };
  addedAt: string;
}

interface EventDelegationPanelProps {
  eventId: number;
  isOwner: boolean;
  currentUserId: number;
}

export default function EventDelegationPanel({ eventId, isOwner, currentUserId }: EventDelegationPanelProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'moderator'>('admin');
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Fetch event admins
  const { data: admins, isLoading } = useQuery({
    queryKey: ['/api/events', eventId, 'admins'],
    enabled: isOwner || false,
  });

  // Search users for adding as admin
  const { data: searchResults } = useQuery<{ users: Array<{ id: number; name: string; username: string; profileImage: string | null }> }>({
    queryKey: ['/api/user/global-search', searchTerm],
    enabled: searchTerm.length > 2 && showAddDialog,
  });

  // Add admin mutation
  const addAdminMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      const response = await apiRequest('POST', `/api/events/${eventId}/admins`, { userId, role });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Admin added successfully",
        description: "The user now has administrative privileges for this event.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'admins'] });
      setShowAddDialog(false);
      setSearchTerm('');
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Remove admin mutation
  const removeAdminMutation = useMutation({
    mutationFn: async (adminId: number) => {
      const response = await apiRequest('DELETE', `/api/events/${eventId}/admins/${adminId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Admin removed",
        description: "Administrative privileges have been revoked.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'admins'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update permissions mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ adminId, permissions }: { adminId: number; permissions: any }) => {
      const response = await apiRequest('PUT', `/api/events/${eventId}/admins/${adminId}/permissions`, { permissions });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Permissions updated",
        description: "Admin permissions have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'admins'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-gradient-to-r from-amber-400 to-orange-500 text-white';
      case 'admin':
        return 'bg-gradient-to-r from-turquoise-400 to-cyan-500 text-white';
      case 'moderator':
        return 'bg-gradient-to-r from-purple-400 to-pink-500 text-white';
      default:
        return 'bg-gray-200';
    }
  };

  if (!isOwner) {
    return (
      <Card className="glassmorphic-card">
        <CardContent className="p-6">
          <p className="text-gray-600">Only event owners can manage administrators.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glassmorphic-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-turquoise-500" />
            Event Administrators
          </span>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-to-r from-turquoise-400 to-cyan-500 hover:from-turquoise-500 hover:to-cyan-600">
                <UserCheck className="w-4 h-4 mr-2" />
                Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="glassmorphic-card max-w-md">
              <DialogHeader>
                <DialogTitle>Add Event Administrator</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Search Users</Label>
                  <Input
                    placeholder="Search by name or username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="glassmorphic-input"
                  />
                </div>
                
                <div>
                  <Label>Role</Label>
                  <Select value={selectedRole} onValueChange={(value: 'admin' | 'moderator') => setSelectedRole(value)}>
                    <SelectTrigger className="glassmorphic-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {searchResults?.users && searchResults.users.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.users.map((user: any) => (
                      <div key={user.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={user.profileImage} />
                            <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-600">@{user.username}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addAdminMutation.mutate({ userId: user.id, role: selectedRole })}
                          disabled={addAdminMutation.isPending}
                        >
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading administrators...</p>
        ) : (
          <div className="space-y-4">
            {admins && Array.isArray(admins) && admins.map((admin: EventAdmin) => (
              <div key={admin.id} className="glassmorphic-card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 ring-2 ring-turquoise-200">
                      <AvatarImage src={admin.user.profileImage || undefined} />
                      <AvatarFallback>{admin.user.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{admin.user.name}</p>
                        {admin.role === 'owner' && <Crown className="w-4 h-4 text-amber-500" />}
                      </div>
                      <p className="text-sm text-gray-600">@{admin.user.username}</p>
                      <Badge className={`mt-1 ${getRoleBadgeColor(admin.role)}`}>
                        {admin.role.charAt(0).toUpperCase() + admin.role.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  
                  {admin.role !== 'owner' && admin.userId !== currentUserId && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeAdminMutation.mutate(admin.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <UserX className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {admin.role !== 'owner' && (
                  <div className="mt-4 space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Permissions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(admin.permissions).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <Label htmlFor={`${admin.id}-${key}`} className="text-sm font-normal">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </Label>
                          <Switch
                            id={`${admin.id}-${key}`}
                            checked={value}
                            onCheckedChange={(checked) => {
                              updatePermissionsMutation.mutate({
                                adminId: admin.id,
                                permissions: { ...admin.permissions, [key]: checked }
                              });
                            }}
                            disabled={admin.userId === currentUserId}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {(!admins || !Array.isArray(admins) || admins.length === 0) && (
              <p className="text-center text-gray-600 py-8">
                No administrators yet. Add someone to help manage this event.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}