import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, Video, MapPin, Globe, Users, Lock, X, ImageIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Temporary auth mock for layout testing
const useAuthContext = () => ({
  user: {
    name: 'Scott Boddye',
    profileImage: '/images/user-placeholder.jpeg'
  }
});

export default function TrangoTechPostComposer() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  
  const [showExpandedComposer, setShowExpandedComposer] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    imageUrl: null as string | null,
    videoUrl: null as string | null,
    location: '',
    visibility: 'public'
  });

  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create post');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      setNewPost({
        content: '',
        imageUrl: null,
        videoUrl: null,
        location: '',
        visibility: 'public'
      });
      setShowExpandedComposer(false);
      toast({
        title: "Success",
        description: "Your post has been shared!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!newPost.content.trim()) {
      toast({
        title: "Content Required",
        description: "Please add some content to your post.",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate({
      content: newPost.content,
      imageUrl: newPost.imageUrl,
      videoUrl: newPost.videoUrl,
      location: newPost.location,
      visibility: newPost.visibility,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setNewPost(prev => ({ ...prev, imageUrl: url }));
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setNewPost(prev => ({ ...prev, videoUrl: url }));
    }
  };

  const getVisibilityIcon = () => {
    switch (newPost.visibility) {
      case 'public': return <Globe className="h-4 w-4" />;
      case 'friends': return <Users className="h-4 w-4" />;
      case 'private': return <Lock className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full">
      {/* TrangoTech Post Composer */}
      <div className="bg-gradient-to-br from-turquoise-100 to-turquoise-200/50 rounded-xl p-6 mb-8 shadow-lg border border-turquoise-200/30">
        <div className="flex items-center gap-4">
          <div className="relative">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-12 h-12 object-cover rounded-full border-2 border-white shadow-md"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-turquoise-400 to-blue-600 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-lg">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          
          <button
            onClick={() => setShowExpandedComposer(true)}
            className="flex-1 text-left px-6 py-4 bg-white/80 backdrop-blur-sm rounded-xl 
                       border border-white/50 shadow-sm hover:shadow-md hover:bg-white/90
                       transition-all duration-300 text-gray-600 hover:text-gray-800
                       focus:outline-none focus:ring-2 focus:ring-coral-300"
          >
            Share your tango moment...
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-coral-200/40">
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-pink-50 
                             border border-pink-200 rounded-lg cursor-pointer transition-colors
                             hover:scale-105 hover:shadow-md transform duration-300">
              <Camera className="h-4 w-4 text-pink-600" />
              <span className="text-sm text-pink-700 font-medium">Photo</span>
            </button>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-blue-50 
                             border border-blue-200 rounded-lg cursor-pointer transition-colors
                             hover:scale-105 hover:shadow-md transform duration-300">
              <Video className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-700 font-medium">Video</span>
            </button>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-green-50 
                             border border-green-200 rounded-lg cursor-pointer transition-colors
                             hover:scale-105 hover:shadow-md transform duration-300">
              <MapPin className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">Location</span>
            </button>
          </div>
          
          <button
            onClick={() => setShowExpandedComposer(true)}
            className="px-6 py-2 bg-gradient-to-r from-coral-500 to-coral-600 text-white 
                       rounded-lg hover:from-coral-600 hover:to-coral-700 shadow-md hover:shadow-lg
                       transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            Post
          </button>
        </div>
      </div>

      {/* TrangoTech Modal - Expanded Composer */}
      {showExpandedComposer && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowExpandedComposer(false)}
          />
          <div 
            className="relative bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl z-10"
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
                  className="w-full min-h-[120px] p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                {/* Location Input */}
                <div className="flex items-center gap-2 p-3 border rounded-lg">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Add location..."
                    value={newPost.location}
                    onChange={(e) => setNewPost(prev => ({ ...prev, location: e.target.value }))}
                    className="flex-1 outline-none"
                  />
                </div>
                
                {/* Media Upload */}
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-pink-50 border border-pink-200 rounded-lg cursor-pointer transition-colors">
                      <ImageIcon className="h-4 w-4 text-pink-600" />
                      <span className="text-sm text-pink-700">Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    
                    <label className="flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-blue-50 border border-blue-200 rounded-lg cursor-pointer transition-colors">
                      <Video className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-700">Video</span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                    
                    {/* Preview uploaded media */}
                    {newPost.imageUrl && (
                      <div className="relative">
                        <img 
                          src={newPost.imageUrl} 
                          alt="Preview" 
                          className="w-full max-h-64 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => setNewPost(prev => ({ ...prev, imageUrl: null }))}
                          className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    
                    {newPost.videoUrl && (
                      <div className="relative">
                        <video 
                          src={newPost.videoUrl} 
                          controls 
                          className="w-full max-h-64 rounded-lg"
                        />
                        <button
                          onClick={() => setNewPost(prev => ({ ...prev, videoUrl: null }))}
                          className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Visibility and Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Visibility:</span>
                      <div className="flex gap-1">
                        {['Public', 'Friends', 'Private'].map((vis) => (
                          <button
                            key={vis}
                            onClick={() => setNewPost(prev => ({ ...prev, visibility: vis.toLowerCase() }))}
                            className={`px-3 py-1 text-xs rounded-full transition-colors flex items-center gap-1 ${
                              newPost.visibility === vis.toLowerCase()
                                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {vis === 'Public' && <Globe className="h-3 w-3" />}
                            {vis === 'Friends' && <Users className="h-3 w-3" />}
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