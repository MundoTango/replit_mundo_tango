import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Camera, 
  MapPin, 
  Globe,
  Lock,
  Users,
  X,
  ChevronDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function TrangoTechPostComposer() {
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

  const handleSubmit = () => {
    if (!newPost.content.trim()) {
      toast({
        title: "Error",
        description: "Please write something to share.",
        variant: "destructive",
      });
      return;
    }

    const hashtags = newPost.tags ? newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    createPostMutation.mutate({
      content: newPost.content,
      hashtags,
      location: newPost.location || null,
      isPublic: newPost.visibility === 'Public',
    });
  };

  const getVisibilityIcon = () => {
    switch (newPost.visibility) {
      case 'Public': return <Globe className="h-4 w-4" />;
      case 'Friend': return <Users className="h-4 w-4" />;
      case 'Private': return <Lock className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  return (
    <div>
      {/* TrangoTech Header - New Feeds */}
      <div className="flex justify-between items-center my-5">
        <div className="text-2xl font-bold">New Feeds</div>
        <div>
          <button className="rounded-xl bg-btn-color text-sm font-bold text-white flex items-center justify-center gap-2 w-32 h-10">
            ALL <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* TrangoTech Card - What's on your mind */}
      <div className="card select-none">
        <div className="flex justify-between pr-5">
          <div className="text-black flex items-center gap-4 cursor-pointer">
            <div>
              <img
                src={user?.profileImage || '/images/user-placeholder.jpeg'}
                alt=""
                loading="lazy"
                className="w-10 h-10 object-cover rounded-full"
              />
            </div>
            <div>
              <div className="text-sm font-semibold">{user?.name}</div>
              <div className="text-sm text-gray-text-color">
                @{user?.username}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2" onClick={() => setShowExpandedComposer(true)}>
            <div>
              {getVisibilityIcon()}
            </div>
            <div className="font-semibold">{newPost.visibility}</div>
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>

        <div className="mr-5 my-5 pr-3 input-text flex items-center gap-3">
          <input
            type="text"
            placeholder="What's on your mind?"
            onClick={() => setShowExpandedComposer(true)}
            className="input-text border-none w-full bg-transparent outline-none"
            readOnly
          />
        </div>

        <br />
        <hr />
        <br />

        <div className="flex w-full justify-between flex-wrap">
          <div className="flex w-auto justify-between flex-wrap gap-8">
            <button
              type="button"
              className="text-light-gray-color text-md inline-flex items-center text-center text-sm font-medium cursor-default"
              onClick={() => setShowExpandedComposer(true)}
            >
              <span className="px-2">
                <MapPin className="h-4 w-4" />
              </span>
              Location
            </button>
            <button
              type="button"
              className="text-light-gray-color text-md inline-flex items-center text-center text-sm font-medium cursor-default"
              onClick={() => setShowExpandedComposer(true)}
            >
              <span className="px-2">
                <Camera className="h-4 w-4" />
              </span>
              Image/Video
            </button>
          </div>
          <div className="pr-5 mt-4 xl:mt-0">
            <button
              onClick={() => setShowExpandedComposer(true)}
              className="rounded-xl bg-btn-color px-10 py-2.5 text-sm font-bold text-white cursor-default"
            >
              Post
            </button>
          </div>
        </div>
      </div>

      {/* TrangoTech Modal - Expanded Composer */}
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
                  className="w-full p-3 border border-gray-200 rounded-lg resize-none h-32 focus:border-[#8E142E] focus:outline-none"
                />
                
                <input
                  type="text"
                  placeholder="Add hashtags (comma separated)"
                  value={newPost.tags}
                  onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:border-[#8E142E] focus:outline-none"
                />
                
                <input
                  type="text"
                  placeholder="Add location"
                  value={newPost.location}
                  onChange={(e) => setNewPost(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:border-[#8E142E] focus:outline-none"
                />
                
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Visibility:</span>
                    <div className="flex gap-1">
                      {(['Public', 'Friend', 'Private'] as const).map((vis) => (
                        <button
                          key={vis}
                          onClick={() => setNewPost(prev => ({ ...prev, visibility: vis }))}
                          className={`px-3 py-1 text-sm rounded-lg transition-colors capitalize flex items-center gap-1 ${
                            newPost.visibility === vis
                              ? 'bg-btn-color text-white'
                              : 'border border-gray-200 text-gray-600 hover:border-btn-color'
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
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowExpandedComposer(false)}
                      className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={createPostMutation.isPending}
                      className="px-6 py-2 bg-btn-color text-white rounded-lg hover:bg-[#7A1128] transition-colors disabled:opacity-50"
                    >
                      {createPostMutation.isPending ? 'Posting...' : 'Post'}
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