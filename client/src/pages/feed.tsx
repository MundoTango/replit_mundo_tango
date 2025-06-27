
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageCircle, Share2, Camera, Video } from "lucide-react";

interface Post {
  id: number;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: string;
  user: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
}

export default function FeedPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newPost, setNewPost] = useState("");

  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts", "feed"],
    queryFn: async () => {
      const response = await fetch("/api/post/get-all-post", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch posts");
      const data = await response.json();
      return data.data || [];
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch("/api/post/store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ content, visibility: "public", status: "active" }),
      });
      if (!response.ok) throw new Error("Failed to create post");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
      setNewPost("");
      toast({
        title: "Success",
        description: "Post created successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    },
  });

  const likePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await fetch("/api/post-like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ post_id: postId }),
      });
      if (!response.ok) throw new Error("Failed to like post");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
    },
  });

  const handleCreatePost = () => {
    if (!newPost.trim()) return;
    createPostMutation.mutate(newPost);
  };

  const handleLikePost = (postId: number) => {
    likePostMutation.mutate(postId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Create Post */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={user?.profileImage} />
              <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{user?.name}</h3>
              <p className="text-sm text-gray-500">@{user?.username}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="What's happening in your tango world?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="min-h-20"
          />
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm">
                <Camera className="w-4 h-4 mr-2" />
                Photo
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="w-4 h-4 mr-2" />
                Video
              </Button>
            </div>
            <Button 
              onClick={handleCreatePost}
              disabled={!newPost.trim() || createPostMutation.isPending}
            >
              {createPostMutation.isPending ? "Posting..." : "Post"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      {posts?.map((post: Post) => (
        <Card key={post.id}>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={post.user.profileImage} />
                <AvatarFallback>{post.user.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{post.user.name}</h3>
                <p className="text-sm text-gray-500">@{post.user.username}</p>
                <p className="text-xs text-gray-400">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-800">{post.content}</p>
            
            {post.imageUrl && (
              <img 
                src={post.imageUrl} 
                alt="Post content" 
                className="w-full rounded-lg max-h-96 object-cover"
              />
            )}
            
            {post.videoUrl && (
              <video 
                src={post.videoUrl} 
                controls 
                className="w-full rounded-lg max-h-96"
              />
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLikePost(post.id)}
                className={post.isLiked ? "text-red-500" : ""}
              >
                <Heart className={`w-4 h-4 mr-2 ${post.isLiked ? "fill-current" : ""}`} />
                {post.likesCount}
              </Button>
              
              <Button variant="ghost" size="sm">
                <MessageCircle className="w-4 h-4 mr-2" />
                {post.commentsCount}
              </Button>
              
              <Button variant="ghost" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
