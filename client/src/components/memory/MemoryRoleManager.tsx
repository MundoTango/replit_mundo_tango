import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '../../../auth/useAuthContext';
import { Heart, Shield, Users, Eye, EyeOff, Settings, Plus } from 'lucide-react';
import CreateMemoryModal from './CreateMemoryModal';

// Layer 1: Frontend Component Implementation
export function MemoryRoleManager() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedRole, setSelectedRole] = useState('');
  const [customRoleRequest, setCustomRoleRequest] = useState({
    roleName: '',
    description: '',
    memoryPermissions: [],
    emotionalAccess: []
  });
  const [showCustomRoleModal, setShowCustomRoleModal] = useState(false);
  const [showCreateMemoryModal, setShowCreateMemoryModal] = useState(false);

  // Fetch user's current roles and permissions
  const { data: userRoles, isLoading: rolesLoading } = useQuery({
    queryKey: ['/api/memory/user-roles', user?.id],
    enabled: !!user?.id
  });

  // Fetch available memory permissions
  const { data: memoryPermissions } = useQuery({
    queryKey: ['/api/memory/permissions']
  });

  // Fetch trust circles
  const { data: trustCircles } = useQuery({
    queryKey: ['/api/memory/trust-circles', user?.id],
    enabled: !!user?.id
  });

  // Submit custom role request mutation
  const submitCustomRole = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/memory/custom-role-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Custom Role Requested",
        description: "Your custom role request has been submitted for admin review."
      });
      setShowCustomRoleModal(false);
      setCustomRoleRequest({ roleName: '', description: '', memoryPermissions: [], emotionalAccess: [] });
      queryClient.invalidateQueries({ queryKey: ['/api/memory/user-roles'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit custom role request.",
        variant: "destructive"
      });
    }
  });

  // Switch active role mutation
  const switchRole = useMutation({
    mutationFn: async (roleId: string) => {
      const response = await fetch('/api/memory/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId })
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Role Switched",
        description: "Your active role has been updated."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/memory/user-roles'] });
    }
  });

  const emotionalAccessLevels = [
    { value: 'basic', label: 'Basic', description: 'General emotional content' },
    { value: 'intimate', label: 'Intimate', description: 'Personal emotional sharing' },
    { value: 'vulnerable', label: 'Vulnerable', description: 'Deeply personal content' },
    { value: 'sacred', label: 'Sacred', description: 'Most sensitive emotional content' }
  ];

  const memoryPermissionTypes = [
    { value: 'can_create_memories', label: 'Create Memories' },
    { value: 'can_view_public_memories', label: 'View Public Memories' },
    { value: 'can_request_consent', label: 'Request Consent' },
    { value: 'can_manage_trust_circles', label: 'Manage Trust Circles' },
    { value: 'can_view_intimate_content', label: 'View Intimate Content' },
    { value: 'can_moderate_content', label: 'Moderate Content' }
  ];

  return (
    <div className="space-y-6">
      {/* Current Role Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Current Memory Role & Permissions
          </CardTitle>
          <CardDescription>
            Your active role determines what memories you can access and create
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {rolesLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="font-medium">Active Role:</span>
                <Badge variant="default" className="bg-gradient-to-r from-pink-500 to-purple-600">
                  {userRoles?.activeRole?.name || 'No Role Selected'}
                </Badge>
                <Badge variant="outline">
                  Level {userRoles?.activeRole?.memory_access_level || 1}
                </Badge>
              </div>
              
              {userRoles?.activeRole?.permissions && (
                <div className="space-y-2">
                  <span className="font-medium">Memory Permissions:</span>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(userRoles.activeRole.permissions).map(([key, value]) => 
                      value && (
                        <Badge key={key} variant="secondary" className="text-xs">
                          {key.replace('can_', '').replace('_', ' ')}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              )}

              {userRoles?.activeRole?.emotional_tag_access && (
                <div className="space-y-2">
                  <span className="font-medium">Emotional Access:</span>
                  <div className="flex flex-wrap gap-2">
                    {userRoles.activeRole.emotional_tag_access.map((level: string) => (
                      <Badge key={level} variant="outline" className="text-xs">
                        {level}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Role Switching */}
      {userRoles?.availableRoles?.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Switch Active Role</CardTitle>
            <CardDescription>
              Change your active role to access different memory permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Select
                value={selectedRole}
                onValueChange={setSelectedRole}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role to switch to" />
                </SelectTrigger>
                <SelectContent>
                  {userRoles.availableRoles.map((role: any) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name} (Level {role.memory_access_level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={() => switchRole.mutate(selectedRole)}
                disabled={!selectedRole || switchRole.isPending}
              >
                Switch Role
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trust Circles Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Trust Circles
          </CardTitle>
          <CardDescription>
            Manage who can access your emotional memories
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trustCircles?.length > 0 ? (
            <div className="space-y-3">
              {trustCircles.map((circle: any) => (
                <div key={circle.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{circle.trusted_user_name}</div>
                    <div className="text-sm text-gray-600">
                      Trust Level: {circle.trust_level} • Access: {circle.emotional_access_level}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Level {circle.trust_level}</Badge>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No trust circles established yet</p>
              <Button variant="outline" className="mt-3">
                <Plus className="h-4 w-4 mr-2" />
                Add Trust Circle
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create New Memory */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-600" />
            Create New Memory
          </CardTitle>
          <CardDescription>
            Share a tango moment with your community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => setShowCreateMemoryModal(true)}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Memory
          </Button>
        </CardContent>
      </Card>

      {/* Custom Role Request */}
      <Card>
        <CardHeader>
          <CardTitle>Request Custom Role</CardTitle>
          <CardDescription>
            Need special memory access? Request a custom role with specific permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={showCustomRoleModal} onOpenChange={setShowCustomRoleModal}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Request Custom Memory Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Custom Memory Role Request</DialogTitle>
                <DialogDescription>
                  Describe the role you need and the memory permissions required
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="roleName">Role Name</Label>
                  <input
                    id="roleName"
                    type="text"
                    className="w-full p-2 border rounded-md"
                    placeholder="e.g., Memory Curator, Emotional Guide"
                    value={customRoleRequest.roleName}
                    onChange={(e) => setCustomRoleRequest(prev => ({ ...prev, roleName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description & Justification</Label>
                  <Textarea
                    id="description"
                    placeholder="Explain why you need this role and how you'll use these permissions..."
                    value={customRoleRequest.description}
                    onChange={(e) => setCustomRoleRequest(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Memory Permissions Requested</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {memoryPermissionTypes.map((permission) => (
                      <div key={permission.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={permission.value}
                          checked={customRoleRequest.memoryPermissions.includes(permission.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setCustomRoleRequest(prev => ({
                                ...prev,
                                memoryPermissions: [...prev.memoryPermissions, permission.value]
                              }));
                            } else {
                              setCustomRoleRequest(prev => ({
                                ...prev,
                                memoryPermissions: prev.memoryPermissions.filter(p => p !== permission.value)
                              }));
                            }
                          }}
                        />
                        <label htmlFor={permission.value} className="text-sm">
                          {permission.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Emotional Access Levels Requested</Label>
                  <div className="space-y-2">
                    {emotionalAccessLevels.map((level) => (
                      <div key={level.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={level.value}
                          checked={customRoleRequest.emotionalAccess.includes(level.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setCustomRoleRequest(prev => ({
                                ...prev,
                                emotionalAccess: [...prev.emotionalAccess, level.value]
                              }));
                            } else {
                              setCustomRoleRequest(prev => ({
                                ...prev,
                                emotionalAccess: prev.emotionalAccess.filter(a => a !== level.value)
                              }));
                            }
                          }}
                        />
                        <div>
                          <label htmlFor={level.value} className="text-sm font-medium">
                            {level.label}
                          </label>
                          <p className="text-xs text-gray-600">{level.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowCustomRoleModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => submitCustomRole.mutate(customRoleRequest)}
                    disabled={!customRoleRequest.roleName || !customRoleRequest.description || submitCustomRole.isPending}
                  >
                    {submitCustomRole.isPending ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Memory Visibility Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Memory Visibility Status
          </CardTitle>
          <CardDescription>
            Overview of what memories you can currently access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {memoryPermissions?.publicCount || 0}
              </div>
              <div className="text-sm text-gray-600">Public Memories</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {memoryPermissions?.friendsCount || 0}
              </div>
              <div className="text-sm text-gray-600">Friends Only</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {memoryPermissions?.trustedCount || 0}
              </div>
              <div className="text-sm text-gray-600">Trusted Circle</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {memoryPermissions?.privateCount || 0}
              </div>
              <div className="text-sm text-gray-600">Private</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Memory Modal */}
      <CreateMemoryModal
        open={showCreateMemoryModal}
        onClose={() => setShowCreateMemoryModal(false)}
        onMemoryCreated={(memory) => {
          toast({
            title: "Success",
            description: "Memory created successfully!",
          });
          setShowCreateMemoryModal(false);
          queryClient.invalidateQueries({ queryKey: ['/api/memory/permissions'] });
        }}
      />
    </div>
  );
}

export default MemoryRoleManager;