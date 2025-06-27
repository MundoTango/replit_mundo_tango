import { useState } from "react";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import CreatePost from "@/components/feed/create-post";
import PostCard from "@/components/feed/post-card";
import StoryViewer from "@/components/feed/story-viewer";
import ChatOverlay from "@/components/messaging/chat-overlay";
import { useQuery } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/authUtils";

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Fetch feed posts
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['/api/posts/feed'],
    queryFn: async () => {
      const response = await fetch('/api/posts/feed', {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      return data.data;
    },
  });

  // Fetch stories
  const { data: stories = [] } = useQuery({
    queryKey: ['/api/stories/following'],
    queryFn: async () => {
      const response = await fetch('/api/stories/following', {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch stories');
      const data = await response.json();
      return data.data;
    },
  });

  // Fetch upcoming events
  const { data: events = [] } = useQuery({
    queryKey: ['/api/events'],
    queryFn: async () => {
      const response = await fetch('/api/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      return data.data;
    },
  });

  return (
    <div className="min-h-screen bg-tango-gray">
      <Navbar onOpenChat={() => setIsChatOpen(true)} />
      
      <div className="pt-16 pb-20 lg:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 py-6">
            
            {/* Left Sidebar */}
            <div className="hidden lg:block lg:col-span-1">
              <Sidebar />
            </div>

            {/* Main Feed */}
            <div className="lg:col-span-2">
              {/* Stories Section */}
              <StoryViewer stories={stories} />

              {/* Create Post */}
              <CreatePost />

              {/* Posts Feed */}
              <div className="space-y-6">
                {isLoading ? (
                  <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-white rounded-xl card-shadow p-6 animate-pulse">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                          </div>
                        </div>
                        <div className="space-y-2 mb-4">
                          <div className="h-4 bg-gray-200 rounded w-full"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                        <div className="h-64 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  posts.map((post: any) => (
                    <PostCard key={post.id} post={post} />
                  ))
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="space-y-6">
                {/* Upcoming Events */}
                <div className="bg-white rounded-xl card-shadow p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-tango-black">Upcoming Events</h4>
                    <a href="/events" className="text-tango-red text-sm hover:underline">View All</a>
                  </div>
                  
                  <div className="space-y-3">
                    {events.slice(0, 3).map((event: any) => (
                      <div key={event.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-tango-gray cursor-pointer">
                        <div className="bg-tango-red text-white text-center p-2 rounded-lg min-w-[50px]">
                          <div className="text-xs font-semibold">
                            {new Date(event.startDate).toLocaleDateString('en', { month: 'short' }).toUpperCase()}
                          </div>
                          <div className="text-lg font-bold">
                            {new Date(event.startDate).getDate()}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-sm text-tango-black">{event.title}</h5>
                          <p className="text-xs text-gray-500">
                            {new Date(event.startDate).toLocaleTimeString('en', { 
                              hour: 'numeric', 
                              minute: '2-digit',
                              hour12: true 
                            })}
                          </p>
                          <p className="text-xs text-gray-500">{event.location}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trending Topics */}
                <div className="bg-white rounded-xl card-shadow p-4">
                  <h4 className="font-semibold text-tango-black mb-4">Trending in Tango</h4>
                  <div className="space-y-3">
                    <div className="cursor-pointer hover:bg-tango-gray p-2 rounded-lg">
                      <h5 className="font-semibold text-sm text-tango-red">#TangoArgentino</h5>
                      <p className="text-xs text-gray-500">2,847 posts</p>
                    </div>
                    <div className="cursor-pointer hover:bg-tango-gray p-2 rounded-lg">
                      <h5 className="font-semibold text-sm text-tango-red">#MilongaLife</h5>
                      <p className="text-xs text-gray-500">1,932 posts</p>
                    </div>
                    <div className="cursor-pointer hover:bg-tango-gray p-2 rounded-lg">
                      <h5 className="font-semibold text-sm text-tango-red">#TangoTeachers</h5>
                      <p className="text-xs text-gray-500">1,205 posts</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav onOpenChat={() => setIsChatOpen(true)} />

      {/* Chat Overlay */}
      <ChatOverlay isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
