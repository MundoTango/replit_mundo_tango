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
    visibility: 'Public' as 'Public' | 'Friend' | 'Private'
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
      setNewPost({ content: '', tags: '', location: '', visibility: 'Public' });
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
      isPublic: newPost.visibility === 'Public',
    };

    createPostMutation.mutate(postData);
  };

  const getVisibilityIcon = () => {
    switch (newPost.visibility) {
      case 'Public': return <Globe className="h-4 w-4" />;
      case 'Friend': return <Users className="h-4 w-4" />;
      case 'Private': return <Lock className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      {/* Modern Momento Composer */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 flex items-center justify-center text-white font-semibold">
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt=""
              className="w-12 h-12 object-cover rounded-full"
            />
          ) : (
            user?.name?.[0] || user?.username?.[0] || 'U'
          )}
        </div>
        
        <div className="flex-1">
          <button
            onClick={() => setShowExpandedComposer(true)}
            className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-all duration-200 hover:border-pink-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
          >
            <span className="text-gray-500 font-medium">Share your tango moment...</span>
          </button>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowExpandedComposer(true)}
                className="flex items-center gap-2 text-gray-600 hover:text-pink-600 px-3 py-2 rounded-lg hover:bg-pink-50 transition-all duration-200"
              >
                <Camera className="h-4 w-4" />
                <span className="text-sm font-medium">Photo</span>
              </button>
              <button
                onClick={() => setShowExpandedComposer(true)}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
              >
                <Video className="h-4 w-4" />
                <span className="text-sm font-medium">Video</span>
              </button>
              <button
                onClick={() => setShowExpandedComposer(true)}
                className="flex items-center gap-2 text-gray-600 hover:text-green-600 px-3 py-2 rounded-lg hover:bg-green-50 transition-all duration-200"
              >
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">Location</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Expanded Composer Modal */}
      {showExpandedComposer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt=""
                        className="w-10 h-10 object-cover rounded-full"
                      />
                    ) : (
                      user?.name?.[0] || user?.username?.[0] || 'U'
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{user?.name}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      {getVisibilityIcon()}
                      <span className="capitalize">{newPost.visibility}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowExpandedComposer(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              {/* Content */}
              <div className="space-y-5">
                <textarea
                  placeholder="Share your tango moment with the community..."
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full min-h-[140px] text-lg border-none resize-none focus:outline-none p-0 placeholder-gray-400"
                />
                
                {/* Tags and Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Add tags (comma separated)"
                      value={newPost.tags}
                      onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
                      className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Add location"
                      value={newPost.location}
                      onChange={(e) => setNewPost(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all"
                    />
                  </div>
                </div>
                
                {/* Footer */}
                <div className="flex items-center justify-between pt-5 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600">Visibility:</span>
                    <div className="flex gap-2">
                      {(['Public', 'Friend', 'Private'] as const).map((vis) => (
                        <button
                          key={vis}
                          onClick={() => setNewPost(prev => ({ ...prev, visibility: vis }))}
                          className={`px-3 py-1.5 text-sm rounded-lg transition-all flex items-center gap-1.5 font-medium ${
                            newPost.visibility === vis
                              ? 'bg-gradient-to-r from-pink-500 to-blue-500 text-white'
                              : 'border border-gray-200 text-gray-600 hover:border-pink-300 hover:bg-pink-50'
                          }`}
                        >
                          {vis === 'Public' && <Globe className="h-3 w-3" />}
                          {vis === 'Friend' && <Users className="h-3 w-3" />}
                          {vis === 'Private' && <Lock className="h-3 w-3" />}
                          {vis}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowExpandedComposer(false)}
                      className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleCreatePost}
                      disabled={createPostMutation.isPending || !newPost.content.trim()}
                      className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-xl hover:from-pink-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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