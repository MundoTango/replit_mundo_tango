import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Plus, 
  Heart, 
  MessageCircle, 
  Share2, 
  Camera, 
  Video,
  MapPin,
  Calendar,
  Users,
  Filter,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import UploadMedia from '@/components/UploadMedia';
import RoleBadge from '@/components/RoleBadge';

interface Post {
  id: number;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  userId: number;
  createdAt: string;
  user: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
    tangoRoles?: string[];
  };
  likes?: number;
  comments?: number;
  isLiked?: boolean;
  hashtags?: string[];
  location?: string;
}

export default function MomentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPost, setNewPost] = useState({ content: '', tags: '', location: '' });
  const [uploadedMedia, setUploadedMedia] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'following' | 'nearby'>('all');

  // Fetch posts
  const { data: posts, isLoading } = useQuery({
    queryKey: ['/api/posts/feed', filterBy, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterBy !== 'all') params.append('filter', filterBy);
      if (searchQuery) params.append('q', searchQuery);
      
      const response = await fetch(`/api/posts/feed?${params}`, {
        credentials: 'include'
      });
      const result = await response.json();
      return result.data || [];
    }
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      return apiRequest('POST', '/api/posts', postData);
    },
    onSuccess: () => {
      toast({
        title: "Memory shared",
        description: "Your tango moment has been posted successfully.",
      });
      setShowCreateForm(false);
      setNewPost({ content: '', tags: '', location: '' });
      setUploadedMedia([]);
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to share your moment. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest('POST', `/api/posts/${postId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
    }
  });

  const handleCreatePost = () => {
    if (!newPost.content.trim()) {
      toast({
        title: "Content required",
        description: "Please add some content to your moment.",
        variant: "destructive",
      });
      return;
    }

    const postData = {
      content: newPost.content,
      hashtags: newPost.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      location: newPost.location || undefined,
      imageUrl: uploadedMedia.find(m => m.type?.startsWith('image/'))?.url,
      videoUrl: uploadedMedia.find(m => m.type?.startsWith('video/'))?.url,
    };

    createPostMutation.mutate(postData);
  };

  const handleLikePost = (postId: number) => {
    likePostMutation.mutate(postId);
  };

  const handleMediaUpload = (files: any[]) => {
    setUploadedMedia(files);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tango Moments</h1>
            <p className="text-gray-600 mt-1">Share your tango journey with the community</p>
          </div>
          
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                <Plus className="mr-2 h-4 w-4" />
                Share Moment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Share a Tango Moment</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <Textarea
                  placeholder="What's happening in your tango world?"
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  className="min-h-[120px]"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Add tags (comma separated)"
                    value={newPost.tags}
                    onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
                  />
                  <Input
                    placeholder="Location (optional)"
                    value={newPost.location}
                    onChange={(e) => setNewPost(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                
                <UploadMedia
                  onUpload={handleMediaUpload}
                  maxFiles={3}
                  folder="moments"
                  tags={['memory', 'moment']}
                  visibility="public"
                  context="memory_creation"
                />
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreatePost}
                    disabled={createPostMutation.isPending}
                    className="bg-gradient-to-r from-pink-500 to-purple-600"
                  >
                    {createPostMutation.isPending ? 'Sharing...' : 'Share Moment'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search moments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={filterBy === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterBy('all')}
                >
                  All
                </Button>
                <Button
                  variant={filterBy === 'following' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterBy('following')}
                >
                  Following
                </Button>
                <Button
                  variant={filterBy === 'nearby' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterBy('nearby')}
                >
                  Nearby
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="grid gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts?.length > 0 ? (
            posts.map((post: Post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Post Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={post.user.profileImage} />
                        <AvatarFallback>
                          {post.user.name?.[0] || post.user.username?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{post.user.name}</h3>
                          {post.user.tangoRoles?.slice(0, 2).map(role => (
                            <RoleBadge key={role} role={role} size="xs" />
                          ))}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>@{post.user.username}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="space-y-4">
                    <p className="text-gray-800 leading-relaxed">{post.content}</p>
                    
                    {/* Media */}
                    {post.imageUrl && (
                      <div className="rounded-lg overflow-hidden">
                        <img 
                          src={post.imageUrl} 
                          alt="Post content"
                          className="w-full max-h-96 object-cover"
                        />
                      </div>
                    )}
                    
                    {post.videoUrl && (
                      <div className="rounded-lg overflow-hidden">
                        <video 
                          src={post.videoUrl} 
                          controls
                          className="w-full max-h-96"
                        />
                      </div>
                    )}
                    
                    {/* Location & Tags */}
                    <div className="flex flex-wrap items-center gap-2">
                      {post.location && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" />
                          <span>{post.location}</span>
                        </div>
                      )}
                      
                      {post.hashtags?.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="flex items-center gap-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLikePost(post.id)}
                        className={post.isLiked ? 'text-red-500' : ''}
                      >
                        <Heart className={`mr-2 h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                        {post.likes || 0}
                      </Button>
                      
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        {post.comments || 0}
                      </Button>
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <Heart className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">No moments yet</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Be the first to share a tango moment! Share your dance journey, milestones, and experiences with the community.
                  </p>
                  <Button 
                    onClick={() => setShowCreateForm(true)}
                    className="bg-gradient-to-r from-pink-500 to-purple-600"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Share Your First Moment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}