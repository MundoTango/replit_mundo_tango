"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import WhatsOnYourMind from "@/components/feed/WhatsOnYourMind";
import PostLikeComment from "@/components/feed/PostLikeComment";
import NewFeedEvents from "@/components/feed/NewFeedEvents";
import { 
  ImageIcon, 
  MapPin, 
  Star,
  Upload,
  X,
  Loader2
} from "lucide-react";

interface Post {
  id: number;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  user: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
  likes: number;
  isLiked: boolean;
  comments: number;
  shares: number;
  createdAt: string;
  visibility: string;
  isSaved?: boolean;
}

const EnhancedTimeline = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [visibility, setVisibility] = useState("Public");
  const [createPostModal, setCreatePostModal] = useState(false);
  const [createPostType, setCreatePostType] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postImages, setPostImages] = useState<File[]>([]);
  const [postLocation, setPostLocation] = useState("");
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Fetch posts with visibility filter
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/posts/feed", visibility],
    queryFn: async () => {
      const visibilityParam = visibility === "All" ? "" : visibility.toLowerCase();
      const response = await fetch(`/api/posts/feed?visibility=${visibilityParam}`);
      return response.json();
    },
  });

  const posts: Post[] = postsData?.data || [];

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: FormData) => {
      const response = await fetch("/api/post/store", {
        method: "POST",
        body: postData
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.code === 200) {
        setCreatePostModal(false);
        setPostContent("");
        setPostImages([]);
        setPostLocation("");
        setCreatePostType("");
        toast({ title: "Post created successfully!" });
        queryClient.invalidateQueries({ queryKey: ["/api/posts/feed"] });
      } else {
        toast({ title: "Failed to create post", variant: "destructive" });
      }
    },
  });

  // Update post mutation
  const updatePostMutation = useMutation({
    mutationFn: async (postData: FormData) => {
      const response = await fetch(`/api/post/update/${editingPost?.id}`, {
        method: "POST",
        body: postData
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.code === 200) {
        setCreatePostModal(false);
        setEditingPost(null);
        setPostContent("");
        setPostImages([]);
        setPostLocation("");
        toast({ title: "Post updated successfully!" });
        queryClient.invalidateQueries({ queryKey: ["/api/posts/feed"] });
      } else {
        toast({ title: "Failed to update post", variant: "destructive" });
      }
    },
  });

  const handleCreatePost = (type?: string) => {
    setCreatePostType(type || "");
    setCreatePostModal(true);
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setPostContent(post.content);
    setCreatePostModal(true);
  };

  const handleSubmitPost = () => {
    if (!postContent.trim()) {
      toast({ title: "Please enter some content", variant: "destructive" });
      return;
    }

    const formData = new FormData();
    formData.append("content", postContent);
    formData.append("visibility", visibility.toLowerCase());
    
    if (postLocation) {
      formData.append("location", postLocation);
    }
    
    postImages.forEach((image, index) => {
      formData.append(`images`, image);
    });

    if (editingPost) {
      updatePostMutation.mutate(formData);
    } else {
      createPostMutation.mutate(formData);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setPostImages(prev => [...prev, ...files].slice(0, 4)); // Max 4 images
  };

  const removeImage = (index: number) => {
    setPostImages(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (editingPost) {
      setPostContent(editingPost.content);
    }
  }, [editingPost]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Timeline */}
          <div className="col-span-12 lg:col-span-9">
            <div className="space-y-6">
              {/* What's on your mind */}
              <WhatsOnYourMind
                visibility={visibility}
                setVisibility={setVisibility}
                onCreatePost={handleCreatePost}
              />

              {/* Posts Feed */}
              <div className="space-y-4">
                {postsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                  </div>
                ) : posts.length === 0 ? (
                  <Card className="bg-white">
                    <CardContent className="text-center py-12">
                      <p className="text-gray-500">No posts available</p>
                    </CardContent>
                  </Card>
                ) : (
                  posts.map((post, index) => (
                    <PostLikeComment
                      key={post.id}
                      post={post}
                      index={index}
                      onEdit={handleEditPost}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Events */}
          <div className="col-span-12 lg:col-span-3">
            <div className="sticky top-6">
              <NewFeedEvents />
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Post Modal */}
      <Dialog open={createPostModal} onOpenChange={setCreatePostModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? "Edit Post" : "Create Post"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* User info */}
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage 
                  src={user?.profileImage || "/images/user-placeholder.jpeg"} 
                  className="object-cover"
                />
                <AvatarFallback className="bg-red-600 text-white">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-gray-900">{user?.name}</div>
                <div className="text-sm text-gray-500">@{user?.username}</div>
              </div>
            </div>

            {/* Post content */}
            <Textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What's on your mind?"
              className="min-h-[120px] resize-none border-gray-200 focus:border-red-500 focus:ring-red-500"
            />

            {/* Location input (if location type) */}
            {(createPostType === "LOCATION" || postLocation) && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={postLocation}
                    onChange={(e) => setPostLocation(e.target.value)}
                    placeholder="Add location..."
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            {/* Image upload */}
            {(createPostType === "MEDIA" || postImages.length > 0) && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Images</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Click to upload images or videos
                    </span>
                  </label>
                </div>
                
                {/* Preview uploaded images */}
                {postImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {postImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCreatePostType("MEDIA")}
                  className="flex items-center gap-2 text-gray-600"
                >
                  <ImageIcon className="h-4 w-4" />
                  Photo/Video
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCreatePostType("LOCATION")}
                  className="flex items-center gap-2 text-gray-600"
                >
                  <MapPin className="h-4 w-4" />
                  Location
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCreatePostType("ACTIVITY")}
                  className="flex items-center gap-2 text-gray-600"
                >
                  <Star className="h-4 w-4" />
                  Activity
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCreatePostModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitPost}
                  disabled={createPostMutation.isPending || updatePostMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {(createPostMutation.isPending || updatePostMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingPost ? "Update" : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedTimeline;