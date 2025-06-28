import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Camera, 
  Video, 
  MapPin, 
  Hash, 
  Globe,
  Lock,
  Users,
  X
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
    <div className="card mb-6">
      {/* Simple Composer - TT Style */}
      <div className="flex items-start gap-4">
        <img
          src={user?.profileImage || '/images/user-placeholder.jpeg'}
          alt=""
          className="w-12 h-12 object-cover rounded-full"
        />
        
        <div className="flex-1">
          <button
            onClick={() => setShowExpandedComposer(true)}
            className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-all duration-200 hover:border-[#8E142E]"
          >
            <span className="text-gray-500">What's on your mind?</span>
          </button>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowExpandedComposer(true)}
                className="flex items-center gap-2 text-gray-600 hover:text-[#8E142E] px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Camera className="h-4 w-4" />
                Photo
              </button>
              <button
                onClick={() => setShowExpandedComposer(true)}
                className="flex items-center gap-2 text-gray-600 hover:text-[#8E142E] px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Video className="h-4 w-4" />
                Video
              </button>
              <button
                onClick={() => setShowExpandedComposer(true)}
                className="flex items-center gap-2 text-gray-600 hover:text-[#8E142E] px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MapPin className="h-4 w-4" />
                Location
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Composer Modal - TT Style */}
      {showExpandedComposer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <img
                    src={user?.profileImage || '/images/user-placeholder.jpeg'}
                    alt=""
                    className="w-10 h-10 object-cover rounded-full"
                  />
                  <div>
                    <div className="font-semibold">{user?.name}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      {getVisibilityIcon()}
                      <span className="capitalize">{newPost.visibility}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowExpandedComposer(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <textarea
                  placeholder="What's happening in your tango world?"
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full min-h-[120px] text-lg border-none resize-none focus:outline-none p-0"
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Add tags (comma separated)"
                      value={newPost.tags}
                      onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8E142E]"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Add location"
                      value={newPost.location}
                      onChange={(e) => setNewPost(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8E142E]"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Visibility:</span>
                    <div className="flex gap-1">
                      {(['public', 'friends', 'private'] as const).map((vis) => (
                        <button
                          key={vis}
                          onClick={() => setNewPost(prev => ({ ...prev, visibility: vis }))}
                          className={`px-3 py-1 text-sm rounded-lg transition-colors capitalize flex items-center gap-1 ${
                            newPost.visibility === vis
                              ? 'bg-[#8E142E] text-white'
                              : 'border border-gray-200 text-gray-600 hover:border-[#8E142E]'
                          }`}
                        >
                          {vis === 'public' && <Globe className="h-3 w-3" />}
                          {vis === 'friends' && <Users className="h-3 w-3" />}
                          {vis === 'private' && <Lock className="h-3 w-3" />}
                          {vis}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowExpandedComposer(false)}
                      className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleCreatePost}
                      disabled={createPostMutation.isPending || !newPost.content.trim()}
                      className="px-4 py-2 bg-[#8E142E] text-white rounded-lg hover:bg-[#7A1226] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {createPostMutation.isPending ? 'Sharing...' : 'Share Moment'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}