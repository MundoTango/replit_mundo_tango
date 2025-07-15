import { useState } from "react";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import CreatePost from "@/components/feed/create-post";
import PostCard from "@/components/feed/post-card";
import StoryViewer from "@/components/feed/story-viewer";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

interface Post {
  id: number;
  userId: number;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  hashtags: string[];
  isPublic: boolean;
  createdAt: string;
  user?: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
}

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: postsResponse, isLoading } = useQuery({
    queryKey: ['/api/posts/feed'],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: storiesResponse } = useQuery({
    queryKey: ['/api/stories/following'],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const posts = (postsResponse as any)?.data || [];
  const stories = (storiesResponse as any)?.data || [];

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-blue-50 to-white">
      <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex">
        <Sidebar 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen}
          onClose={handleCloseSidebar}
        />
        
        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
            onClick={handleCloseSidebar}
          />
        )}
        
        <main className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? 'lg:ml-64' : ''
        }`}>
          <div className="max-w-2xl mx-auto p-4 space-y-6">
            {/* Stories Section */}
            {stories && stories.length > 0 && (
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-turquoise-100/50 hover:shadow-xl transition-shadow">
                <StoryViewer stories={stories} />
              </div>
            )}

            {/* Create Post */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-turquoise-100/50 hover:shadow-xl transition-shadow">
              <CreatePost />
            </div>

            {/* Posts Feed */}
            <div className="space-y-4">
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-turquoise-100/50">
                    <div className="flex items-center space-x-3 mb-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-4" />
                    <Skeleton className="h-48 w-full rounded-lg" />
                  </div>
                ))
              ) : posts && posts.length > 0 ? (
                posts.map((post: Post) => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 text-center shadow-lg border border-turquoise-100/50">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-gradient-to-br from-turquoise-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <span className="text-2xl">🎭</span>
                    </div>
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-turquoise-600 to-blue-600 bg-clip-text text-transparent mb-2">
                      Welcome to Mundo Tango
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Connect with tango dancers around the world. Share your passion, 
                      find events, and build your tango community.
                    </p>
                    <p className="text-sm text-gray-500">
                      Follow some users or join groups to see posts in your feed.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}