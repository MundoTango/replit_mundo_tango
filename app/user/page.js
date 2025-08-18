"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/auth/useAuthContext";
import { PATH_AUTH, PATH_DASHBOARD } from "@/routes/paths";
import { getToken } from "@/data/services/localStorageService";
import localStorageAvailable from "@/utils/localStorageAvailable";
import TrustedConnectionsFilter from "../../components/Feed/TrustedConnectionsFilter";
import SmartPostPrioritization from "../../components/Feed/SmartPostPrioritization";

function UserClient() {
  const { user } = useAuthContext();
  const [visibility, setVisibility] = useState("Public");
  const [createPostModal, setCreatePostModal] = useState(false);
  const [createPostType, setCreatePostType] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postImages, setPostImages] = useState([]);
  const [postLocation, setPostLocation] = useState("");
  const [editingPost, setEditingPost] = useState(null);
  const [postList, setPostList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedFilter, setFeedFilter] = useState("all");
  const [prioritizedPosts, setPrioritizedPosts] = useState([]);

  // Enhanced post creation handler
  const handleCreatePost = (type) => {
    setCreatePostType(type || "");
    setCreatePostModal(true);
  };

  // Fetch posts with visibility filter
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const visibilityParam = visibility === "All" ? "" : visibility.toLowerCase();
      const response = await fetch(`/api/post/get-all-post?visibility=${visibilityParam}`);
      const data = await response.json();
      
      if (data.code === 200) {
        const posts = data.data || [];
        setPostList(posts);
        filterAndPrioritizePosts(posts);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Smart post filtering and prioritization
  const filterAndPrioritizePosts = (posts) => {
    let filteredPosts = [...posts];

    // Apply feed filter
    switch (feedFilter) {
      case "trusted":
        // Simulate trusted connections (in real app, this would use relationship data)
        filteredPosts = posts.filter(post => 
          post.user && (
            post.total_likes > 5 || // High engagement indicates trusted content
            post.user.id === user?.id || // Own posts
            (post.content && post.content.toLowerCase().includes('tango')) // Tango-related content
          )
        );
        break;
      case "local":
        // Filter for local content
        filteredPosts = posts.filter(post => 
          post.location && post.location.toLowerCase().includes(user?.city?.toLowerCase() || user?.country?.toLowerCase() || 'argentina')
        );
        break;
      case "events":
        // Filter for event-related content
        filteredPosts = posts.filter(post => 
          post.content && (
            post.content.toLowerCase().includes('event') ||
            post.content.toLowerCase().includes('milonga') ||
            post.content.toLowerCase().includes('workshop') ||
            post.content.toLowerCase().includes('festival')
          )
        );
        break;
      default:
        // "all" - no additional filtering
        break;
    }

    // Smart prioritization based on user role and engagement
    const prioritized = filteredPosts.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Engagement score
      scoreA += (a.total_likes || 0) + (a.total_comments || 0) * 2;
      scoreB += (b.total_likes || 0) + (b.total_comments || 0) * 2;

      // Recency bonus (posts from last 24 hours get priority)
      const hoursSinceA = (Date.now() - new Date(a.created_at).getTime()) / (1000 * 60 * 60);
      const hoursSinceB = (Date.now() - new Date(b.created_at).getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceA < 24) scoreA += 10;
      if (hoursSinceB < 24) scoreB += 10;

      // Role-specific content boost
      const userRoles = user?.tangoRoles || [];
      
      if (userRoles.includes('teacher') || userRoles.includes('instructor')) {
        if (a.content && a.content.toLowerCase().includes('teach')) scoreA += 5;
        if (b.content && b.content.toLowerCase().includes('teach')) scoreB += 5;
      }
      
      if (userRoles.includes('traveler')) {
        if (a.content && (a.content.toLowerCase().includes('travel') || a.location)) scoreA += 5;
        if (b.content && (b.content.toLowerCase().includes('travel') || b.location)) scoreB += 5;
      }

      return scoreB - scoreA;
    });

    setPrioritizedPosts(prioritized);
  };

  // Create post submission
  const handleSubmitPost = async () => {
    if (!postContent.trim()) return;

    const formData = new FormData();
    formData.append("content", postContent);
    formData.append("visibility", visibility.toLowerCase());
    
    if (postLocation) {
      formData.append("location", postLocation);
    }
    
    postImages.forEach((image) => {
      formData.append("images", image);
    });

    try {
      const response = await fetch("/api/post/store", {
        method: "POST",
        body: formData
      });
      const data = await response.json();
      
      if (data.code === 200) {
        setCreatePostModal(false);
        setPostContent("");
        setPostImages([]);
        setPostLocation("");
        setCreatePostType("");
        fetchPosts(); // Refresh posts
      }
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };

  // Handle image upload
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files || []);
    setPostImages(prev => [...prev, ...files].slice(0, 4));
  };

  const removeImage = (index) => {
    setPostImages(prev => prev.filter((_, i) => i !== index));
  };

  // Initialize posts on component mount and visibility/filter change
  useEffect(() => {
    fetchPosts();
  }, [visibility]);

  // Re-filter when feed filter changes
  useEffect(() => {
    if (postList.length > 0) {
      filterAndPrioritizePosts(postList);
    }
  }, [feedFilter, user]);

  return (
    <div className="grid grid-cols-12 gap-5 overflow-hidden">
      <div className="col-span-12 lg:col-span-9">
        <div className="px-2 py-2">
          {/* Enhanced What's on your mind component */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">New Feeds</h2>
              <div className="relative">
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold focus:outline-none"
                >
                  <option value="Public">Public</option>
                  <option value="Friend">Friends</option>
                  <option value="Private">Private</option>
                  <option value="All">All</option>
                </select>
              </div>
            </div>

            {/* Clean Feed Filter */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-sm">Feed Focus</h3>
                <span className="text-xs text-gray-500">Show posts from</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  onClick={() => setFeedFilter("all")}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    feedFilter === "all" 
                      ? 'bg-red-50 border-red-200 text-red-700' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-sm">All Posts</span>
                  </div>
                  <p className="text-xs text-gray-500">Everything in your feed</p>
                </button>

                <button
                  onClick={() => setFeedFilter("trusted")}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    feedFilter === "trusted" 
                      ? 'bg-red-50 border-red-200 text-red-700' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-medium text-sm">Close Circle</span>
                  </div>
                  <p className="text-xs text-gray-500">Your dance partners & close friends</p>
                </button>

                <button
                  onClick={() => setFeedFilter("local")}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    feedFilter === "local" 
                      ? 'bg-red-50 border-red-200 text-red-700' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-sm">Local Scene</span>
                  </div>
                  <p className="text-xs text-gray-500">Your city's tango community</p>
                </button>

                <button
                  onClick={() => setFeedFilter("events")}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    feedFilter === "events" 
                      ? 'bg-red-50 border-red-200 text-red-700' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-sm">Events Only</span>
                  </div>
                  <p className="text-xs text-gray-500">Milongas, workshops & festivals</p>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 cursor-pointer">
                  <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{user?.name}</div>
                    <div className="text-sm text-gray-500">@{user?.username}</div>
                  </div>
                </div>
                <button 
                  onClick={() => handleCreatePost()}
                  className="flex items-center gap-2 text-gray-700 hover:bg-gray-100 px-3 py-1 rounded"
                >
                  <span className="font-semibold">Public</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="What's on your mind?"
                  className="w-full py-3 pl-4 pr-12 border border-gray-200 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                  onClick={() => handleCreatePost()}
                  readOnly
                />
                <button
                  onClick={() => handleCreatePost()}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  😊
                </button>
              </div>

              <hr className="my-4 border-gray-200" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => handleCreatePost("LOCATION")}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    Location
                  </button>
                  <button
                    onClick={() => handleCreatePost("MEDIA")}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    Image/Video
                  </button>
                  <button
                    onClick={() => handleCreatePost("ACTIVITY")}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Activity
                  </button>
                </div>
                <button
                  onClick={() => handleCreatePost()}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-2 rounded-lg font-semibold"
                >
                  Post
                </button>
              </div>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            ) : prioritizedPosts.length === 0 ? (
              <div className="bg-white rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Welcome to Mundo Tango!</h3>
                <p className="text-gray-600 mb-6">Start following people to see their posts in your timeline.</p>
                <button className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700">
                  Discover People
                </button>
              </div>
            ) : (
              prioritizedPosts.map((post, index) => {
                // Calculate post priority indicators
                const hoursSincePost = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
                const isRecent = hoursSincePost < 24;
                const isHighEngagement = (post.total_likes || 0) + (post.total_comments || 0) > 5;
                const isRelevantToRole = user?.tangoRoles?.some(role => 
                  post.content?.toLowerCase().includes(role) || 
                  (role === 'traveler' && post.location)
                );

                return (
                <div key={post.id} className={`bg-white rounded-xl p-6 shadow-sm relative ${
                  isHighEngagement ? 'ring-1 ring-red-100' : ''
                }`}>
                  {/* Priority indicator */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    {isRecent && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        Recent
                      </span>
                    )}
                    {isHighEngagement && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Popular
                      </span>
                    )}
                    {isRelevantToRole && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                        For You
                      </span>
                    )}
                  </div>

                  {/* Post header */}
                  <div className="flex items-start justify-between mb-4 pr-20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {post.user?.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{post.user?.name || "Unknown User"}</div>
                        <div className="text-sm text-gray-500">
                          @{post.user?.username || "unknown"} • {new Date(post.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </div>

                  {/* Post content */}
                  <div className="mb-4">
                    <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
                    
                    {post.image_url && (
                      <div className="mt-3">
                        <img 
                          src={post.image_url} 
                          alt="Post image"
                          className="w-full rounded-lg max-h-96 object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Post stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span>{post.total_likes || 0} likes</span>
                    <span>{post.total_comments || 0} comments</span>
                    <span>{post.total_shares || 0} shares</span>
                  </div>

                  <hr className="my-3 border-gray-200" />

                  {/* Action buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                        <svg className={`w-4 h-4 ${post.is_liked ? 'text-red-600 fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Like
                      </button>
                      
                      <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Comment
                      </button>
                      
                      <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                        Share
                      </button>
                    </div>
                  </div>
                </div>
                );
              })
            )}
          </div>
          
          {/* Filter Status Indicator */}
          {feedFilter !== "all" && prioritizedPosts.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                </svg>
                <span>
                  Showing {prioritizedPosts.length} posts filtered by{" "}
                  <span className="font-semibold">
                    {feedFilter === "trusted" && "Close Circle"}
                    {feedFilter === "local" && "Local Scene"}
                    {feedFilter === "events" && "Events Only"}
                  </span>
                </span>
                <button
                  onClick={() => setFeedFilter("all")}
                  className="ml-2 text-blue-600 hover:text-blue-800 underline text-xs"
                >
                  Show all posts
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="col-span-12 lg:col-span-3 h-screen">
        {/* Enhanced Events Component */}
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-sm">Upcoming events you've RSVP'ed</h3>
              <button className="text-red-600 hover:text-red-700 text-xs font-semibold">
                See all
              </button>
            </div>
            <p className="text-gray-500 text-sm text-center py-4">No upcoming events</p>
          </div>
          
          <hr className="border-gray-200" />
          
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-sm">Events in Your City</h3>
              <button className="text-red-600 hover:text-red-700 text-xs font-semibold">
                See all
              </button>
            </div>
            <p className="text-gray-500 text-sm text-center py-4">No city events found</p>
          </div>
          
          <hr className="border-gray-200" />
          
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-sm">Events you follow</h3>
              <button className="text-red-600 hover:text-red-700 text-xs font-semibold">
                See all
              </button>
            </div>
            <p className="text-gray-500 text-sm text-center py-4">You don't follow any events</p>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {createPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Create Post</h3>
                <button
                  onClick={() => setCreatePostModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{user?.name}</div>
                  <div className="text-sm text-gray-500">@{user?.username}</div>
                </div>
              </div>

              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full min-h-[120px] p-3 border border-gray-200 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none resize-none"
              />

              {(createPostType === "LOCATION" || postLocation) && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Location</label>
                  <input
                    value={postLocation}
                    onChange={(e) => setPostLocation(e.target.value)}
                    placeholder="Add location..."
                    className="w-full p-3 border border-gray-200 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              )}

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
                      <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-sm text-gray-600">
                        Click to upload images or videos
                      </span>
                    </label>
                  </div>
                  
                  {postImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {postImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setCreatePostType("MEDIA")}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    Photo/Video
                  </button>
                  <button
                    onClick={() => setCreatePostType("LOCATION")}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    Location
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setCreatePostModal(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitPost}
                    disabled={!postContent.trim()}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UserPage() {
  const { push } = useRouter();
  const { isAuthenticated, isInitialized, user } = useAuthContext();

  useEffect(() => {
    const checkAuth = () => {
      const accessToken = getToken();
      if (!accessToken || (!isAuthenticated && isInitialized)) {
        push(PATH_AUTH.login);
      }
    };

    const storageAvailable = localStorageAvailable();
    if (storageAvailable) {
      checkAuth();
    }
  }, [isAuthenticated, isInitialized, user, push]);

  if (!isInitialized) {
    return (
      <div className="w-100 h-screen flex justify-center items-center">
        <div className="main-spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-100 h-screen flex justify-center items-center">
        <div className="main-spinner"></div>
      </div>
    );
  }

  return <UserClient />;
}