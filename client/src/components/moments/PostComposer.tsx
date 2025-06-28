import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Camera, 
  Video, 
  MapPin, 
  Hash, 
  Globe,
  Lock,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function PostComposer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showExpandedComposer, setShowExpandedComposer] = useState(false);
  const [newPost, setNewPost] = useState({ 
    content: '', 
    tags: '', 
    location: '',
    visibility: 'public' as 'public' | 'friends' | 'private'
  });
  const [uploadedMedia, setUploadedMedia] = useState<any[]>([]);

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      return apiRequest('POST', '/api/posts', postData);
    },
    onSuccess: () => {
      toast({
        title: "Moment shared",
        description: "Your tango moment has been posted successfully.",
      });
      setShowExpandedComposer(false);
      setNewPost({ content: '', tags: '', location: '', visibility: 'public' });
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
      isPublic: newPost.visibility === 'public',
    };

    createPostMutation.mutate(postData);
  };

  const getVisibilityIcon = () => {
    switch (newPost.visibility) {
      case 'public': return <Globe className="h-4 w-4" />;
      case 'friends': return <Users className="h-4 w-4" />;
      case 'private': return <Lock className="h-4 w-4" />;
    }
  };

  return (
    <Card className="mb-6 shadow-sm border-gray-200">
      <CardContent className="p-6">
        {/* Simple Composer */}
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={user?.profileImage || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white">
              {user?.name?.[0] || user?.username?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <button
              onClick={() => setShowExpandedComposer(true)}
              className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-all duration-200 hover:border-pink-300"
            >
              <span className="text-gray-500">Share your tango moment...</span>
            </button>
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowExpandedComposer(true)}
                  className="text-gray-600 hover:text-pink-600 hover:bg-pink-50"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Photo
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowExpandedComposer(true)}
                  className="text-gray-600 hover:text-pink-600 hover:bg-pink-50"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Video
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowExpandedComposer(true)}
                  className="text-gray-600 hover:text-pink-600 hover:bg-pink-50"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Location
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Composer Dialog */}
        <Dialog open={showExpandedComposer} onOpenChange={setShowExpandedComposer}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user?.profileImage || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                    {user?.name?.[0] || user?.username?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{user?.name}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    {getVisibilityIcon()}
                    <span className="capitalize">{newPost.visibility}</span>
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <Textarea
                placeholder="What's happening in your tango world?"
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                className="min-h-[120px] text-lg border-none resize-none focus:ring-0 p-0"
              />
              
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Add tags (comma separated)"
                    value={newPost.tags}
                    onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Add location"
                    value={newPost.location}
                    onChange={(e) => setNewPost(prev => ({ ...prev, location: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Visibility:</span>
                  <div className="flex gap-1">
                    {(['public', 'friends', 'private'] as const).map((vis) => (
                      <Button
                        key={vis}
                        variant={newPost.visibility === vis ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setNewPost(prev => ({ ...prev, visibility: vis }))}
                        className="capitalize"
                      >
                        {vis === 'public' && <Globe className="h-3 w-3 mr-1" />}
                        {vis === 'friends' && <Users className="h-3 w-3 mr-1" />}
                        {vis === 'private' && <Lock className="h-3 w-3 mr-1" />}
                        {vis}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowExpandedComposer(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreatePost}
                    disabled={createPostMutation.isPending || !newPost.content.trim()}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                  >
                    {createPostMutation.isPending ? 'Sharing...' : 'Share Moment'}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}