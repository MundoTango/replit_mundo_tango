import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MapPin, 
  MoreVertical,
  Expand
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import PostDetailModal from './PostDetailModal';
import { renderWithMentions } from '@/utils/renderWithMentions';

interface Post {
  id: number;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  userId: number;
  createdAt: string;
  user: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
    tangoRoles?: string[];
  };
  likes?: number;
  comments?: number;
  isLiked?: boolean;
  hashtags?: string[];
  location?: string;
}

interface PostItemProps {
  post: Post;
  onLike: (postId: number) => void;
  onShare: (post: Post) => void;
}

export default function PostItem({ post, onLike, onShare }: PostItemProps) {
  const [commentText, setCommentText] = useState('');
  const [isCommentFocused, setIsCommentFocused] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      'dancer': 'bg-pink-100 text-pink-700',
      'dj': 'bg-purple-100 text-purple-700',
      'teacher': 'bg-blue-100 text-blue-700',
      'organizer': 'bg-green-100 text-green-700',
      'performer': 'bg-yellow-100 text-yellow-700',
      'musician': 'bg-indigo-100 text-indigo-700'
    };
    return colors[role.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  const getAvatarFallback = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="bg-white bg-opacity-95 rounded-2xl shadow-md border border-gray-100 p-6 md:p-8 hover:scale-[1.02] hover:shadow-xl transition-all duration-200 ease-in-out focus-visible:outline-offset-2">
      <div className="space-y-6 leading-relaxed">
        {/* Post Header - Enhanced Author Display */}
        <div className="flex items-center space-x-4 rounded-t-xl border-b border-gray-200 pb-3 mb-4">
          <div className="flex items-center gap-3">
            {/* Avatar with Gradient Fallback */}
            <div className="relative">
              {post.user.profileImage ? (
                <img
                  src={post.user.profileImage}
                  alt={post.user.name}
                  className="w-12 h-12 object-cover rounded-full ring-2 ring-gray-100"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {getAvatarFallback(post.user.name)}
                </div>
              )}
            </div>

            {/* Author Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900 hover:text-[#8E142E] cursor-pointer transition-colors">
                  {post.user.name}
                </h4>
                <span className="text-gray-500 text-sm">@{post.user.username}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                
                {/* Location Tag */}
                {post.location && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1 text-blue-600">
                      <MapPin className="h-3 w-3" />
                      <span className="text-sm">{post.location}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Role Badges */}
              {post.user.tangoRoles && post.user.tangoRoles.length > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  {post.user.tangoRoles.slice(0, 3).map((role, index) => (
                    <span
                      key={index}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(role)}`}
                    >
                      {role}
                    </span>
                  ))}
                  {post.user.tangoRoles.length > 3 && (
                    <span className="text-xs text-gray-500">+{post.user.tangoRoles.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Post Options */}
          <div className="flex items-center gap-2">
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
              See Friendship
            </button>
            <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Post Content - Enhanced Visual Hierarchy */}
        <div className="mb-4">
          <p className="text-gray-900 text-base leading-relaxed font-medium">
            {renderWithMentions(post.content)}
          </p>

          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {post.hashtags.map((hashtag, index) => (
                <span key={index} className="text-blue-600 hover:text-blue-700 cursor-pointer text-sm">
                  #{hashtag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Media Preview - Enhanced with Hover Effects */}
        {(post.imageUrl || post.videoUrl) && (
          <div className="mb-4 relative group">
            {post.imageUrl && (
              <div 
                className="rounded-xl overflow-hidden hover:scale-[1.01] transition-transform duration-200 cursor-pointer relative"
                onClick={() => setShowModal(true)}
              >
                <img
                  src={post.imageUrl}
                  alt="Post media"
                  className="w-full h-64 md:h-80 object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                    <Expand className="h-5 w-5 text-gray-700" />
                  </div>
                </div>
              </div>
            )}
            {post.videoUrl && (
              <div className="rounded-xl overflow-hidden hover:scale-[1.01] transition-transform duration-200 relative">
                <video
                  src={post.videoUrl}
                  className="w-full h-64 md:h-80 object-cover cursor-pointer"
                  preload="metadata"
                  onClick={() => setShowModal(true)}
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                    <Expand className="h-5 w-5 text-gray-700" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Interaction Footer - Modernized */}
        <div className="border-t border-gray-100 pt-3">
          <div className="flex items-center justify-between mb-3">
            {/* Like Button */}
            <button
              onClick={() => onLike(post.id)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
            >
              <Heart 
                className={`h-5 w-5 transition-all duration-200 ${
                  post.isLiked 
                    ? 'fill-red-500 text-red-500' 
                    : 'text-gray-500 group-hover:text-red-500'
                }`}
              />
              <span className={`text-sm font-medium ${
                post.isLiked ? 'text-red-500' : 'text-gray-500'
              }`}>
                {post.likes || 0}
              </span>
            </button>

            {/* Comment Button */}
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
            >
              <MessageCircle className="h-5 w-5 text-gray-500 group-hover:text-blue-500 transition-colors duration-200" />
              <span className="text-gray-500 text-sm font-medium">
                {post.comments || 0}
              </span>
            </button>

            {/* Share Button */}
            <button
              onClick={() => onShare(post)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
            >
              <Share2 className="h-5 w-5 text-gray-500 group-hover:text-green-500 transition-colors duration-200" />
              <span className="text-gray-500 text-sm font-medium">
                Share
              </span>
            </button>
          </div>

          {/* Comment Input - Auto-Expanding */}
          <div className={`transition-all duration-300 ${
            isCommentFocused ? 'max-h-32 opacity-100' : 'max-h-16 opacity-90'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                {getAvatarFallback('User')}
              </div>
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onFocus={() => setIsCommentFocused(true)}
                  onBlur={() => {
                    if (!commentText.trim()) setIsCommentFocused(false);
                  }}
                  placeholder="Write your comment..."
                  className={`w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 ${
                    isCommentFocused ? 'min-h-[80px]' : 'min-h-[40px]'
                  }`}
                  rows={isCommentFocused ? 3 : 1}
                />
                {isCommentFocused && (
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => {
                        setIsCommentFocused(false);
                        setCommentText('');
                      }}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={!commentText.trim()}
                      className="px-4 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Comment
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Detail Modal */}
      <PostDetailModal
        post={post}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onLike={onLike}
        onShare={onShare}
      />
    </div>
  );
}