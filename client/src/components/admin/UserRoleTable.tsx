import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Search, 
  UserPlus, 
  Edit3, 
  Shield, 
  Crown, 
  Users,
  Plus,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  roles: string[];
  primaryRole: string;
  lastActive: string;
  isActive: boolean;
}

interface Role {
  id: string;
  name: string;
  type: 'community' | 'platform';
  description: string;
}

export default function UserRoleTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock data for demonstration - in production this would come from API
  const mockUsers: User[] = [
    {
      id: 3,
      name: 'Scott Boddye',
      username: 'admin',
      email: 'admin@mundotango.life',
      roles: ['super_admin', 'admin', 'dancer', 'teacher', 'organizer'],
      primaryRole: 'super_admin',
      lastActive: '2 minutes ago',
      isActive: true
    },
    {
      id: 4,
      name: 'Maria Rodriguez',
      username: 'maria_tango',
      email: 'maria@mundotango.life',
      roles: ['dancer', 'teacher'],
      primaryRole: 'teacher',
      lastActive: '1 hour ago',
      isActive: true
    },
    {
      id: 5,
      name: 'Carlos Martinez',
      username: 'carlos_dj',
      email: 'carlos@mundotango.life',
      roles: ['dj', 'organizer', 'dancer'],
      primaryRole: 'dj',
      lastActive: '3 hours ago',
      isActive: true
    },
    {
      id: 6,
      name: 'Elena Fernandez',
      username: 'elena_performer',
      email: 'elena@mundotango.life',
      roles: ['performer', 'dancer', 'teacher'],
      primaryRole: 'performer',
      lastActive: '1 day ago',
      isActive: false
    }
  ];

  const mockRoles: Role[] = [
    { id: 'super_admin', name: 'Super Admin', type: 'platform', description: 'Full system access' },
    { id: 'admin', name: 'Admin', type: 'platform', description: 'Administrative access' },
    { id: 'moderator', name: 'Moderator', type: 'platform', description: 'Content moderation' },
    { id: 'dancer', name: 'Dancer', type: 'community', description: 'Tango dancer' },
    { id: 'teacher', name: 'Teacher', type: 'community', description: 'Tango instructor' },
    { id: 'dj', name: 'DJ', type: 'community', description: 'Music curator' },
    { id: 'organizer', name: 'Organizer', type: 'community', description: 'Event organizer' },
    { id: 'performer', name: 'Performer', type: 'community', description: 'Stage performer' }
  ];

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      'super_admin': 'bg-red-100 text-red-700 border-red-200',
      'admin': 'bg-orange-100 text-orange-700 border-orange-200',
      'moderator': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'organizer': 'bg-green-100 text-green-700 border-green-200',
      'teacher': 'bg-blue-100 text-blue-700 border-blue-200',
      'dancer': 'bg-pink-100 text-pink-700 border-pink-200',
      'dj': 'bg-purple-100 text-purple-700 border-purple-200',
      'performer': 'bg-indigo-100 text-indigo-700 border-indigo-200'
    };
    return colors[role] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getRoleIcon = (role: string) => {
    if (role === 'super_admin') return <Crown className="h-3 w-3" />;
    if (role === 'admin') return <Shield className="h-3 w-3" />;
    return <Users className="h-3 w-3" />;
  };

  const filteredUsers = mockUsers.filter((user: User) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.roles.includes(roleFilter);
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users by name, username, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
          />
        </div>
        
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-48 rounded-xl border-gray-200">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
            <SelectItem value="organizer">Organizer</SelectItem>
            <SelectItem value="teacher">Teacher</SelectItem>
            <SelectItem value="dancer">Dancer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* User table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="font-semibold text-gray-900">User</TableHead>
              <TableHead className="font-semibold text-gray-900">Primary Role</TableHead>
              <TableHead className="font-semibold text-gray-900">All Roles</TableHead>
              <TableHead className="font-semibold text-gray-900">Last Active</TableHead>
              <TableHead className="font-semibold text-gray-900">Status</TableHead>
              <TableHead className="font-semibold text-gray-900">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user: User) => (
              <TableRow key={user.id} className="hover:bg-gray-50/30 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">@{user.username}</div>
                      <div className="text-xs text-gray-400">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${getRoleBadgeColor(user.primaryRole)} border`}>
                    <div className="flex items-center gap-1">
                      {getRoleIcon(user.primaryRole)}
                      <span className="capitalize">{user.primaryRole.replace('_', ' ')}</span>
                    </div>
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.roles.slice(0, 3).map((role, index) => (
                      <Badge key={index} className={`${getRoleBadgeColor(role)} border text-xs`}>
                        {role.replace('_', ' ')}
                      </Badge>
                    ))}
                    {user.roles.length > 3 && (
                      <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs">
                        +{user.roles.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-600">{user.lastActive}</div>
                </TableCell>
                <TableCell>
                  <Badge className={user.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setIsEditDialogOpen(true);
                    }}
                    className="rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                  >
                    <Edit3 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit user roles dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit User Roles</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              <div className="text-center p-4 bg-gray-50 rounded-2xl">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-2xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">
                  {selectedUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <h3 className="font-semibold text-gray-900">{selectedUser.name}</h3>
                <p className="text-sm text-gray-500">@{selectedUser.username}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Role</label>
                  <Select defaultValue={selectedUser.primaryRole}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mockRoles.map((role: Role) => (
                        <SelectItem key={role.id} value={role.id}>
                          <div className="flex items-center gap-2">
                            {getRoleIcon(role.id)}
                            <span className="capitalize">{role.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Roles</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {mockRoles.filter((role: Role) => role.id !== selectedUser.primaryRole).map((role: Role) => (
                      <label key={role.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={selectedUser.roles.includes(role.id)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="flex items-center gap-2">
                          {getRoleIcon(role.id)}
                          <span className="text-sm font-medium">{role.name}</span>
                        </div>
                        <span className="text-xs text-gray-500 ml-auto">{role.type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    toast({
                      title: "Success",
                      description: "User roles updated successfully"
                    });
                    setIsEditDialogOpen(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}