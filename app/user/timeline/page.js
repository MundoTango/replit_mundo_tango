"use client";

import { useEffect, useState } from "react";
import { useAuthContext } from "@/auth/useAuthContext";
import { useRouter } from "next/navigation";
import { PATH_AUTH } from "@/routes/paths";
import { getToken } from "@/data/services/localStorageService";

export default function TimelinePage() {
  const { isAuthenticated, isInitialized, user } = useAuthContext();
  const { push } = useRouter();
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      push(PATH_AUTH.login);
      return;
    }

    if (isAuthenticated && user) {
      fetchTimelineData();
    }
  }, [isAuthenticated, isInitialized, user, push]);

  const fetchTimelineData = async () => {
    try {
      const token = getToken();
      
      // Fetch posts
      const postsResponse = await fetch('/api/posts/feed', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        setPosts(postsData.data || []);
      }

      // Fetch stories
      const storiesResponse = await fetch('/api/stories/following', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (storiesResponse.ok) {
        const storiesData = await storiesResponse.json();
        setStories(storiesData.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch timeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isInitialized || loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div className="main-spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen background-color">
      {/* Header */}
      <header className="bg-white border-b border-border-color shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-btn-color">Mundo Tango</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <span className="text-sm font-medium text-background-color">
                  {user?.name || user?.username}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-border-color p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                <div>
                  <h3 className="font-semibold text-background-color">{user?.name}</h3>
                  <p className="text-sm text-gray-text-color">@{user?.username}</p>
                </div>
              </div>
              
              <nav className="space-y-2">
                <a href="/user/timeline" className="flex items-center px-3 py-2 text-btn-color bg-red-50 rounded-md">
                  <span className="ml-3">Timeline</span>
                </a>
                <a href="/user/profile" className="flex items-center px-3 py-2 text-gray-text-color hover:bg-gray-50 rounded-md">
                  <span className="ml-3">My Profile</span>
                </a>
                <a href="/user/events" className="flex items-center px-3 py-2 text-gray-text-color hover:bg-gray-50 rounded-md">
                  <span className="ml-3">Events</span>
                </a>
                <a href="/user/messages" className="flex items-center px-3 py-2 text-gray-text-color hover:bg-gray-50 rounded-md">
                  <span className="ml-3">Messages</span>
                </a>
                <a href="/user/friends" className="flex items-center px-3 py-2 text-gray-text-color hover:bg-gray-50 rounded-md">
                  <span className="ml-3">Friends</span>
                </a>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Stories Section */}
            {stories.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-border-color p-6 mb-6">
                <h2 className="text-lg font-semibold text-background-color mb-4">Stories</h2>
                <div className="flex space-x-4 overflow-x-auto">
                  {stories.map((story, index) => (
                    <div key={index} className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full p-1">
                        <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                          <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                        </div>
                      </div>
                      <p className="text-xs text-center mt-1 text-gray-text-color">Story</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Create Post */}
            <div className="bg-white rounded-lg shadow-sm border border-border-color p-6 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="What's on your mind?"
                    className="w-full p-3 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <div className="flex space-x-4">
                  <button className="text-gray-text-color hover:text-btn-color">Photo</button>
                  <button className="text-gray-text-color hover:text-btn-color">Video</button>
                  <button className="text-gray-text-color hover:text-btn-color">Event</button>
                </div>
                <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700">
                  Post
                </button>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {posts.length > 0 ? (
                posts.map((post, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm border border-border-color">
                    <div className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                        <div>
                          <h4 className="font-semibold text-background-color">{post.user?.name || 'User'}</h4>
                          <p className="text-sm text-gray-text-color">{new Date(post.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <p className="text-background-color mb-4">{post.content}</p>
                      
                      {post.mediaUrl && (
                        <div className="mb-4">
                          {post.mediaType === 'image' ? (
                            <img src={post.mediaUrl} alt="Post media" className="w-full rounded-lg" />
                          ) : post.mediaType === 'video' ? (
                            <video controls className="w-full rounded-lg">
                              <source src={post.mediaUrl} type="video/mp4" />
                            </video>
                          ) : null}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-4 border-t border-border-color">
                        <div className="flex space-x-6">
                          <button className="flex items-center space-x-2 text-gray-text-color hover:text-btn-color">
                            <span>Like</span>
                            <span className="text-sm">({post.likesCount || 0})</span>
                          </button>
                          <button className="flex items-center space-x-2 text-gray-text-color hover:text-btn-color">
                            <span>Comment</span>
                            <span className="text-sm">({post.commentsCount || 0})</span>
                          </button>
                          <button className="text-gray-text-color hover:text-btn-color">Share</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-border-color p-12 text-center">
                  <h3 className="text-lg font-semibold text-background-color mb-2">Welcome to Mundo Tango!</h3>
                  <p className="text-gray-text-color mb-6">Start following people to see their posts in your timeline.</p>
                  <button className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700">
                    Discover People
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}