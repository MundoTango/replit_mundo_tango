
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Search, Users, Plus, MapPin, Calendar, Globe, Lock } from "lucide-react";

interface Group {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  location?: string;
  isPublic: boolean;
  imageUrl?: string;
  createdAt: string;
  isJoined?: boolean;
}

export default function GroupsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    location: "",
    isPublic: true,
  });

  const { data: myGroups } = useQuery({
    queryKey: ["groups", "my"],
    queryFn: async () => {
      const response = await fetch("/api/groups/my", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch my groups");
      const data = await response.json();
      return data.data || [];
    },
  });

  const { data: allGroups } = useQuery({
    queryKey: ["groups", "all", searchQuery],
    queryFn: async () => {
      const response = await fetch(`/api/groups?search=${searchQuery}&limit=20`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch groups");
      const data = await response.json();
      return data.data || [];
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: async (groupData: typeof newGroup) => {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(groupData),
      });
      if (!response.ok) throw new Error("Failed to create group");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setIsCreateDialogOpen(false);
      setNewGroup({ name: "", description: "", location: "", isPublic: true });
      toast({
        title: "Success",
        description: "Group created successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive",
      });
    },
  });

  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: number) => {
      const response = await fetch(`/api/groups/${groupId}/join`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to join group");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast({
        title: "Success",
        description: "Joined group successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to join group",
        variant: "destructive",
      });
    },
  });

  const handleCreateGroup = () => {
    if (!newGroup.name.trim() || !newGroup.description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createGroupMutation.mutate(newGroup);
  };

  const handleJoinGroup = (groupId: number) => {
    joinGroupMutation.mutate(groupId);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Groups</h1>
          <p className="text-gray-600">Join tango communities and connect with dancers</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Group Name</Label>
                <Input
                  id="name"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="Enter group name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="Describe your group"
                />
              </div>
              <div>
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  value={newGroup.location}
                  onChange={(e) => setNewGroup({ ...newGroup, location: e.target.value })}
                  placeholder="City, Country"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={newGroup.isPublic}
                  onChange={(e) => setNewGroup({ ...newGroup, isPublic: e.target.checked })}
                />
                <Label htmlFor="isPublic">Public Group</Label>
              </div>
              <Button 
                onClick={handleCreateGroup}
                disabled={createGroupMutation.isPending}
                className="w-full"
              >
                {createGroupMutation.isPending ? "Creating..." : "Create Group"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="my" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my">My Groups</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
        </TabsList>

        <TabsContent value="my" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center">
              <Users className="w-5 h-5 mr-2" />
              My Groups ({myGroups?.length || 0})
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myGroups?.map((group: Group) => (
              <Card key={group.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  {group.imageUrl && (
                    <img 
                      src={group.imageUrl} 
                      alt={group.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        {group.isPublic ? (
                          <Globe className="w-4 h-4 mr-1" />
                        ) : (
                          <Lock className="w-4 h-4 mr-1" />
                        )}
                        {group.isPublic ? "Public" : "Private"}
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {group.memberCount} members
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {group.description}
                  </p>
                  {group.location && (
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      {group.location}
                    </div>
                  )}
                  <Button variant="outline" size="sm" className="w-full">
                    View Group
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="discover" className="space-y-4">
          <h2 className="text-xl font-semibold">Discover Groups</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allGroups?.filter((group: Group) => !group.isJoined).map((group: Group) => (
              <Card key={group.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  {group.imageUrl && (
                    <img 
                      src={group.imageUrl} 
                      alt={group.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        {group.isPublic ? (
                          <Globe className="w-4 h-4 mr-1" />
                        ) : (
                          <Lock className="w-4 h-4 mr-1" />
                        )}
                        {group.isPublic ? "Public" : "Private"}
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {group.memberCount} members
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {group.description}
                  </p>
                  {group.location && (
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      {group.location}
                    </div>
                  )}
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => handleJoinGroup(group.id)}
                    disabled={joinGroupMutation.isPending}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Join Group
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search for tango groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allGroups?.map((group: Group) => (
              <Card key={group.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  {group.imageUrl && (
                    <img 
                      src={group.imageUrl} 
                      alt={group.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        {group.isPublic ? (
                          <Globe className="w-4 h-4 mr-1" />
                        ) : (
                          <Lock className="w-4 h-4 mr-1" />
                        )}
                        {group.isPublic ? "Public" : "Private"}
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {group.memberCount} members
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {group.description}
                  </p>
                  {group.location && (
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      {group.location}
                    </div>
                  )}
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => handleJoinGroup(group.id)}
                    disabled={joinGroupMutation.isPending}
                    variant={group.isJoined ? "outline" : "default"}
                  >
                    {group.isJoined ? "View Group" : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Join Group
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
