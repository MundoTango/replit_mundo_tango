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
    visibility: 'Public' as 'Public' | 'Friend' | 'Private',
    imageUrl: '',
    videoUrl: ''
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
      imageUrl: newPost.imageUrl || null,
      videoUrl: newPost.videoUrl || null,
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
      {/* Modern Header - New Feeds */}
      <div className="flex justify-between items-center my-8">
        <div className="text-3xl font-black bg-gradient-to-r from-blue-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
          New Feeds
        </div>
        <div>
          <button className="rounded-2xl bg-gradient-to-r from-coral-400 to-pink-500 hover:from-coral-500 hover:to-pink-600 
                           text-sm font-bold text-white flex items-center justify-center gap-2 w-32 h-12 
                           shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300">
            ALL <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Post Composer with coral-pink gradient */}
      <div className="bg-gradient-to-r from-coral-400 to-pink-500 rounded-3xl p-8 md:p-10 lg:p-12 text-white shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out">
        <div className="flex justify-between items-start mb-6">
          <div className="text-white flex items-center gap-4 cursor-pointer">
            <div className="relative">
              <img
                src={user?.profileImage || '/api/placeholder/56/56'}
                alt=""
                loading="lazy"
                className="w-14 h-14 object-cover rounded-2xl border-3 border-gradient-to-br from-coral-200 to-pink-200 shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-green-400 to-green-500 
                            rounded-full border-2 border-white shadow-lg"></div>
            </div>
            <div>
              <div className="text-lg font-bold text-white">{user?.name}</div>
              <div className="text-sm text-white/80 font-medium">
                @{user?.username}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-2xl 
                        border border-blue-200/50 shadow-lg cursor-pointer hover:bg-blue-50 transition-all duration-200" 
               onClick={() => setShowExpandedComposer(true)}>
            <div className="text-blue-600">
              {getVisibilityIcon()}
            </div>
            <div className="font-bold text-blue-900">{newPost.visibility}</div>
            <ChevronDown className="h-4 w-4 text-blue-500" />
          </div>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="What's on your mind?"
            onClick={() => setShowExpandedComposer(true)}
            className="w-full px-6 py-4 bg-white bg-opacity-90 border border-coral-300 
                     rounded-xl focus:outline-none text-coral-800 placeholder-coral-600 font-medium text-lg
                     cursor-pointer hover:bg-opacity-95 transition-all duration-200 ease-in-out shadow-md"
            readOnly
          />
        </div>

        <div className="border-t border-white border-opacity-50 pt-6">
          <div className="flex w-full justify-between items-center flex-wrap gap-4">
            <div className="flex gap-3">
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-3 rounded-full bg-white bg-opacity-90 text-teal-600 
                         hover:bg-opacity-100 hover:text-teal-700 font-medium transition-all duration-200 
                         transform hover:scale-105 shadow-md hover:shadow-lg cursor-pointer"
                onClick={() => setShowExpandedComposer(true)}
              >
                <MapPin className="h-4 w-4" />
                Location
              </button>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-3 rounded-full bg-white bg-opacity-90 text-pink-600 
                         hover:bg-opacity-100 hover:text-pink-700 font-medium transition-all duration-200 
                         transform hover:scale-105 shadow-md hover:shadow-lg cursor-pointer"
                onClick={() => setShowExpandedComposer(true)}
              >
                <Camera className="h-4 w-4" />
                Image/Video
              </button>
            </div>
            <div>
              <button
                onClick={() => setShowExpandedComposer(true)}
                className="bg-gradient-to-r from-coral-400 to-pink-500 hover:from-coral-500 hover:to-pink-600 
                         px-8 py-4 rounded-2xl text-lg font-bold text-white shadow-2xl hover:shadow-coral-500/30 
                         transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TrangoTech Modal - Expanded Composer */}
      {showExpandedComposer && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowExpandedComposer(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
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
                
                {/* Media Upload Section */}
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 hover:border-[#8E142E] transition-colors">
                  <div className="flex items-center justify-center gap-4">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const url = event.target?.result as string;
                            if (file.type.startsWith('image/')) {
                              setNewPost(prev => ({ ...prev, imageUrl: url }));
                            } else if (file.type.startsWith('video/')) {
                              setNewPost(prev => ({ ...prev, videoUrl: url }));
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                      id="media-upload"
                    />
                    <label
                      htmlFor="media-upload"
                      className="flex items-center gap-2 px-4 py-2 bg-[#8E142E] text-white rounded-lg cursor-pointer hover:bg-[#7A1128] transition-colors"
                    >
                      <Camera className="h-4 w-4" />
                      Upload Media
                    </label>
                    {(newPost.imageUrl || newPost.videoUrl) && (
                      <button
                        onClick={() => setNewPost(prev => ({ ...prev, imageUrl: '', videoUrl: '' }))}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                        Remove Media
                      </button>
                    )}
                  </div>
                  
                  {/* Media Preview */}
                  {newPost.imageUrl && (
                    <div className="mt-4">
                      <img src={newPost.imageUrl} alt="Upload preview" className="max-w-full h-40 object-cover rounded-lg" />
                    </div>
                  )}
                  {newPost.videoUrl && (
                    <div className="mt-4">
                      <video src={newPost.videoUrl} controls className="max-w-full h-40 rounded-lg" />
                    </div>
                  )}
                </div>
                
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