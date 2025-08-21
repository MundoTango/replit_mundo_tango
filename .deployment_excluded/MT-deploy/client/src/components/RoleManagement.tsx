import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Users, Settings, Crown, GraduationCap, Music, UserCheck } from 'lucide-react';

interface UserWithRole {
  id: number;
  email: string;
  name: string;
  username: string;
  role: string;
  displayName: string | null;
  avatarUrl: string | null;
  permissions: Record<string, boolean>;
  isActive: boolean;
}

interface CurrentUserRole {
  id: number;
  role: string;
  permissions: Record<string, boolean>;
  displayName: string | null;
  avatarUrl: string | null;
  isActive: boolean;
}

export default function RoleManagement() {
  const [currentUserRole, setCurrentUserRole] = useState<CurrentUserRole | null>(null);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const roleIcons = {
    admin: Crown,
    organizer: Users,
    teacher: GraduationCap,
    dancer: Music,
    guest: UserCheck
  };

  const roleColors = {
    admin: 'bg-red-100 text-red-800 border-red-200',
    organizer: 'bg-blue-100 text-blue-800 border-blue-200',
    teacher: 'bg-green-100 text-green-800 border-green-200',
    dancer: 'bg-purple-100 text-purple-800 border-purple-200',
    guest: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  useEffect(() => {
    loadCurrentUserRole();
    loadUsers();
  }, []);

  const loadCurrentUserRole = async () => {
    try {
      const response = await fetch('/api/roles/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        setCurrentUserRole(result.data);
      }
    } catch (error) {
      console.error('Error loading current user role:', error);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/roles/users', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        setUsers(result.data.users || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setMessage({ type: 'error', text: 'Failed to load users. Admin access required.' });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async () => {
    if (!selectedUser || !selectedRole) {
      setMessage({ type: 'error', text: 'Please select both user and role' });
      return;
    }

    try {
      setUpdating(true);
      const response = await fetch('/api/roles/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: parseInt(selectedUser),
          role: selectedRole
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: `User role updated to ${selectedRole}` });
        setSelectedUser('');
        setSelectedRole('');
        loadUsers(); // Reload users to reflect changes
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update role' });
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
    const IconComponent = roleIcons[role as keyof typeof roleIcons] || UserCheck;
    return <IconComponent className="h-4 w-4" />;
  };

  const getRoleColor = (role: string) => {
    return roleColors[role as keyof typeof roleColors] || roleColors.guest;
  };

  const isAdmin = currentUserRole?.role === 'admin';

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <Shield className="h-12 w-12 mx-auto mb-4 text-blue-600" />
        <h1 className="text-3xl font-bold">Role-Based Authentication System</h1>
        <p className="text-gray-600 mt-2">
          Manage user roles and permissions across the Mundo Tango platform
        </p>
      </div>

      {message && (
        <Alert className={message.type === 'success' ? 'border-green-200' : 'border-red-200'}>
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Current User Role
            </CardTitle>
            <CardDescription>
              Your current role and permissions in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentUserRole ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {getRoleIcon(currentUserRole.role)}
                  <Badge className={getRoleColor(currentUserRole.role)}>
                    {currentUserRole.role.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {currentUserRole.displayName || 'No display name'}
                  </span>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Permissions:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(currentUserRole.permissions).map(([perm, has]) => (
                      <div key={perm} className={`p-2 rounded border ${has ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                        <span className={has ? 'text-green-800' : 'text-gray-600'}>
                          {perm.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Test Permissions:</h4>
                  <div className="flex gap-2 flex-wrap">
                    {['manage_users', 'create_events', 'moderate_content'].map(perm => (
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
              <p className="text-gray-500">Loading role information...</p>
            )}
          </CardContent>
        </Card>

        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Role Management
              </CardTitle>
              <CardDescription>
                Update user roles (Admin only)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                          {getRoleIcon(user.role)}
                          <span>{user.name} ({user.username})</span>
                          <Badge className={`${getRoleColor(user.role)} text-xs`}>
                            {user.role}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">New Role</label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {['admin', 'organizer', 'teacher', 'dancer', 'guest'].map(role => (
                      <SelectItem key={role} value={role}>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(role)}
                          <span>{role.charAt(0).toUpperCase() + role.slice(1)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={updateUserRole} 
                disabled={updating || !selectedUser || !selectedRole}
                className="w-full"
              >
                {updating ? 'Updating...' : 'Update Role'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Directory
            {isAdmin && <Badge variant="outline">Admin View</Badge>}
          </CardTitle>
          <CardDescription>
            {isAdmin ? 'All users with their roles and status' : 'Public user directory (limited view)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500">Loading users...</p>
          ) : users.length > 0 ? (
            <div className="space-y-3">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getRoleIcon(user.role)}
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-600">@{user.username}</p>
                      {isAdmin && <p className="text-xs text-gray-500">{user.email}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                    {!user.isActive && (
                      <Badge variant="outline" className="text-red-600 border-red-200">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              {isAdmin ? 'No users found' : 'Access restricted - Admin role required'}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="text-center text-sm text-gray-500">
        <p>
          Role-based authentication system with 5 roles: Admin, Organizer, Teacher, Dancer, Guest.
          Each role has specific permissions for platform features and content management.
        </p>
      </div>
    </div>
  );
}