import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, Users, Settings, Crown, GraduationCap, Music, UserCheck, 
  Camera, Palette, MapPin, Heart, ShoppingBag, Hotel, Building,
  Plane, Star, Mic, MonitorSpeaker
} from 'lucide-react';

interface UserWithRoles {
  id: number;
  email: string;
  name: string;
  username: string;
  primaryRole: string;
  roles: string[];
  displayName: string | null;
  avatarUrl: string | null;
  permissions: Record<string, boolean>;
  isActive: boolean;
}

interface RoleDefinition {
  name: string;
  description: string;
  isPlatformRole: boolean;
  permissions: Record<string, boolean>;
}

export default function EnhancedRoleManager() {
  const [currentUser, setCurrentUser] = useState<UserWithRoles | null>(null);
  const [allRoles, setAllRoles] = useState<RoleDefinition[]>([]);
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [newPrimaryRole, setNewPrimaryRole] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const roleIcons: Record<string, any> = {
    // Community roles
    dancer: Music,
    performer: Star,
    teacher: GraduationCap,
    learning_source: Settings,
    dj: MonitorSpeaker,
    musician: Mic,
    organizer: Users,
    host: Heart,
    photographer: Camera,
    content_creator: Palette,
    choreographer: Star,
    tango_traveler: MapPin,
    tour_operator: Plane,
    vendor: ShoppingBag,
    wellness_provider: Heart,
    tango_school: Building,
    tango_hotel: Hotel,
    
    // Platform roles
    guest: UserCheck,
    super_admin: Crown,
    admin: Shield,
    moderator: Settings,
    curator: Star,
    bot: Settings
  };

  const roleColors: Record<string, string> = {
    // Community roles - various colors
    dancer: 'bg-purple-100 text-purple-800 border-purple-200',
    performer: 'bg-pink-100 text-pink-800 border-pink-200',
    teacher: 'bg-green-100 text-green-800 border-green-200',
    learning_source: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    dj: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    musician: 'bg-violet-100 text-violet-800 border-violet-200',
    organizer: 'bg-blue-100 text-blue-800 border-blue-200',
    host: 'bg-rose-100 text-rose-800 border-rose-200',
    photographer: 'bg-amber-100 text-amber-800 border-amber-200',
    content_creator: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    choreographer: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
    tango_traveler: 'bg-teal-100 text-teal-800 border-teal-200',
    tour_operator: 'bg-sky-100 text-sky-800 border-sky-200',
    vendor: 'bg-orange-100 text-orange-800 border-orange-200',
    wellness_provider: 'bg-lime-100 text-lime-800 border-lime-200',
    tango_school: 'bg-slate-100 text-slate-800 border-slate-200',
    tango_hotel: 'bg-stone-100 text-stone-800 border-stone-200',
    
    // Platform roles - administrative colors
    guest: 'bg-gray-100 text-gray-800 border-gray-200',
    super_admin: 'bg-red-100 text-red-800 border-red-200',
    admin: 'bg-red-100 text-red-800 border-red-200',
    moderator: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    curator: 'bg-purple-100 text-purple-800 border-purple-200',
    bot: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadCurrentUser(),
        loadAllRoles(),
        loadUsers()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const response = await fetch('/api/roles/enhanced/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        setCurrentUser(result.data);
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadAllRoles = async () => {
    try {
      const response = await fetch('/api/roles/enhanced/all', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        setAllRoles(result.data.roles || []);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/roles/users', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        setUsers(result.data.users || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const assignRole = async () => {
    if (!selectedUser || !selectedRole) {
      setMessage({ type: 'error', text: 'Please select both user and role' });
      return;
    }

    try {
      setUpdating(true);
      const response = await fetch('/api/roles/enhanced/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: parseInt(selectedUser),
          roleName: selectedRole
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: `Role ${selectedRole} assigned successfully` });
        setSelectedUser('');
        setSelectedRole('');
        loadData();
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to assign role' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setUpdating(false);
    }
  };

  const removeRole = async (userId: number, roleName: string) => {
    try {
      setUpdating(true);
      const response = await fetch('/api/roles/enhanced/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, roleName })
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: `Role ${roleName} removed successfully` });
        loadData();
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to remove role' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setUpdating(false);
    }
  };

  const setPrimaryRole = async () => {
    if (!selectedUser || !newPrimaryRole) {
      setMessage({ type: 'error', text: 'Please select user and primary role' });
      return;
    }

    try {
      setUpdating(true);
      const response = await fetch('/api/roles/enhanced/primary', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: parseInt(selectedUser),
          primaryRole: newPrimaryRole
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: `Primary role updated to ${newPrimaryRole}` });
        setSelectedUser('');
        setNewPrimaryRole('');
        loadData();
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update primary role' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setUpdating(false);
    }
  };

  const checkPermission = async (permission: string) => {
    try {
      const response = await fetch(`/api/roles/permissions/check?permission=${permission}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        setMessage({ 
          type: result.data.hasPermission ? 'success' : 'error', 
          text: `Permission '${permission}': ${result.data.hasPermission ? 'Granted' : 'Denied'}` 
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to check permission' });
    }
  };

  const getRoleIcon = (role: string) => {
    const IconComponent = roleIcons[role] || UserCheck;
    return <IconComponent className="h-4 w-4" />;
  };

  const getRoleColor = (role: string) => {
    return roleColors[role] || roleColors.guest;
  };

  const communityRoles = allRoles.filter(role => !role.isPlatformRole);
  const platformRoles = allRoles.filter(role => role.isPlatformRole);
  const isAdmin = currentUser?.roles.includes('admin') || currentUser?.roles.includes('super_admin');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">Loading comprehensive role system...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <Shield className="h-12 w-12 mx-auto mb-4 text-blue-600" />
        <h1 className="text-3xl font-bold">Enhanced Role Management System</h1>
        <p className="text-gray-600 mt-2">
          Complete 16+ community roles plus platform administration for Mundo Tango
        </p>
      </div>

      {message && (
        <Alert className={message.type === 'success' ? 'border-green-200' : 'border-red-200'}>
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="current" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="current">Current User</TabsTrigger>
          <TabsTrigger value="roles">All Roles</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Your Role Profile
              </CardTitle>
              <CardDescription>
                Your current roles and permissions in the Mundo Tango platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentUser ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {getRoleIcon(currentUser.primaryRole)}
                    <span className="font-medium">Primary Role:</span>
                    <Badge className={getRoleColor(currentUser.primaryRole)}>
                      {currentUser.primaryRole.toUpperCase().replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">All Roles ({currentUser.roles.length}):</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentUser.roles.map(role => (
                        <Badge key={role} className={getRoleColor(role)}>
                          <div className="flex items-center gap-1">
                            {getRoleIcon(role)}
                            <span>{role.replace(/_/g, ' ')}</span>
                          </div>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Active Permissions:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm max-h-48 overflow-y-auto">
                      {Object.entries(currentUser.permissions)
                        .filter(([_, has]) => has)
                        .map(([perm]) => (
                        <div key={perm} className="p-2 rounded border bg-green-50 border-green-200">
                          <span className="text-green-800">
                            {perm.replace(/_/g, ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Test Key Permissions:</h4>
                    <div className="flex gap-2 flex-wrap">
                      {['create_events', 'moderate_content', 'manage_users', 'upload_media', 'create_posts'].map(perm => (
                        <Button
                          key={perm}
                          variant="outline"
                          size="sm"
                          onClick={() => checkPermission(perm)}
                        >
                          Test {perm.replace(/_/g, ' ')}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Loading user profile...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Community Roles ({communityRoles.length})
                </CardTitle>
                <CardDescription>
                  Tango community member roles with specific permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {communityRoles.map(role => (
                    <div key={role.name} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        {getRoleIcon(role.name)}
                        <Badge className={getRoleColor(role.name)}>
                          {role.name.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{role.description}</p>
                      <p className="text-xs text-gray-500">
                        {Object.keys(role.permissions).length} permissions
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Platform Roles ({platformRoles.length})
                </CardTitle>
                <CardDescription>
                  Administrative and system roles for platform management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {platformRoles.map(role => (
                    <div key={role.name} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        {getRoleIcon(role.name)}
                        <Badge className={getRoleColor(role.name)}>
                          {role.name.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{role.description}</p>
                      <p className="text-xs text-gray-500">
                        {Object.keys(role.permissions).length} permissions
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {isAdmin ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    Role Assignment
                  </CardTitle>
                  <CardDescription>
                    Assign roles to users (Admin/Super Admin only)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Select User</label>
                      <Select value={selectedUser} onValueChange={setSelectedUser}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a user" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map(user => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              <div className="flex items-center gap-2">
                                <span>{user.name} (@{user.username})</span>
                                <Badge className={`${getRoleColor(user.primaryRole)} text-xs`}>
                                  {user.primaryRole}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Role to Assign</label>
                      <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {allRoles.map(role => (
                            <SelectItem key={role.name} value={role.name}>
                              <div className="flex items-center gap-2">
                                {getRoleIcon(role.name)}
                                <span>{role.name.replace(/_/g, ' ')}</span>
                                {role.isPlatformRole && <Crown className="h-3 w-3" />}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <Button 
                        onClick={assignRole} 
                        disabled={updating || !selectedUser || !selectedRole}
                        className="w-full"
                      >
                        {updating ? 'Assigning...' : 'Assign Role'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Directory with Multi-Role Management</CardTitle>
                  <CardDescription>
                    View and manage all users with their roles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {users.map(user => (
                      <div key={user.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{user.name}</span>
                              <span className="text-sm text-gray-600">@{user.username}</span>
                              {!user.isActive && (
                                <Badge variant="outline" className="text-red-600 border-red-200">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                            <div>
                              <span className="text-sm text-gray-600">Primary: </span>
                              <Badge className={getRoleColor(user.primaryRole)}>
                                {user.primaryRole.replace(/_/g, ' ')}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {user.roles.map(role => (
                                <div key={role} className="flex items-center gap-1">
                                  <Badge variant="outline" className={`text-xs ${getRoleColor(role)}`}>
                                    <div className="flex items-center gap-1">
                                      {getRoleIcon(role)}
                                      <span>{role.replace(/_/g, ' ')}</span>
                                      {role !== 'guest' && (
                                        <button
                                          onClick={() => removeRole(user.id, role)}
                                          className="ml-1 text-red-500 hover:text-red-700"
                                          title="Remove role"
                                        >
                                          ×
                                        </button>
                                      )}
                                    </div>
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Crown className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Admin Access Required</h3>
                <p className="text-gray-600">
                  User management features are only available to administrators and super administrators.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Permission Testing & Verification</CardTitle>
              <CardDescription>
                Test different permissions and understand role capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {[
                  'create_posts', 'create_events', 'moderate_content', 'manage_users',
                  'upload_media', 'create_memories', 'manage_playlists', 'sell_products',
                  'organize_tours', 'offer_wellness_services', 'create_educational_content',
                  'manage_accommodations', 'curate_memories', 'handle_reports'
                ].map(permission => (
                  <Button
                    key={permission}
                    variant="outline"
                    size="sm"
                    onClick={() => checkPermission(permission)}
                    className="justify-start text-left h-auto p-3"
                  >
                    <div>
                      <div className="font-medium text-xs">
                        {permission.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Click to test
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="text-center text-sm text-gray-500">
        <p>
          Enhanced role system with 17 community roles and 6 platform roles supporting 
          multi-role users, role-based routing, and comprehensive permission management.
        </p>
      </div>
    </div>
  );
}