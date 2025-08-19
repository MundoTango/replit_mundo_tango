import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Clock, Sparkles, Users } from 'lucide-react';
import { format } from 'date-fns';
import PostActionsMenu from './PostActionsMenu';
import ShareModal from './ShareModal';

interface ModernPostCardProps {
  post: {
    id: number;
    content: string;
    imageUrl?: string | null;
    videoUrl?: string | null;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    createdAt: string | Date;
    user: {
      id: number;
      name: string;
      username: string;
      profileImage?: string | null;
    };
  };
  onLike?: (postId: number) => void;
  onComment?: (postId: number) => void;
  onShare?: (postId: number) => void;
  onBookmark?: (postId: number) => void;
}

export default function ModernPostCard({ 
  post, 
  onLike, 
  onComment, 
  onShare, 
  onBookmark 
}: ModernPostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.(post.id);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark?.(post.id);
  };

  const formatDate = (date: string | Date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return '1 day ago';
    return format(postDate, 'MMM d, yyyy');
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl hover:shadow-coral-500/10 
                    transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02]
                    border-2 border-blue-100/50 overflow-hidden group relative">
      
      {/* Floating engagement indicator */}
      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <div className="bg-gradient-to-r from-coral-400 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Hot
        </div>
      </div>

      {/* Header */}
      <div className="p-8 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative group/avatar">
              <img
                src={post.user.profileImage || '/api/placeholder/48/48'}
                alt={post.user.name}
                className="w-14 h-14 rounded-2xl object-cover border-3 border-gradient-to-br from-coral-200 to-pink-200 shadow-lg
                         group-hover/avatar:scale-110 transition-transform duration-300"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-500 
                            rounded-full border-3 border-white shadow-lg animate-pulse"></div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-bold text-blue-900 hover:text-teal-600 cursor-pointer transition-colors text-lg">
                  {post.user.name}
                </h3>
                <span className="text-blue-500 font-semibold">@{post.user.username}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-blue-600/70">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{formatDate(post.createdAt)}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>Public</span>
                </div>
              </div>
            </div>
          </div>
          
          <PostActionsMenu postId={post.id} />
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal 
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          post={post}
        />
      )}

      {/* Content */}
      <div className="px-8 pb-6">
        <p className="text-blue-900 leading-relaxed text-lg font-medium">{post.content}</p>
      </div>

      {/* Media */}
      {post.imageUrl && (
        <div className="px-8 pb-6">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-50 to-teal-50 shadow-xl">
            <img
              src={post.imageUrl}
              alt="Memory"
              className={`w-full h-auto transition-all duration-700 hover:scale-105 ${
                imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
              }`}
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-teal-300 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-8 py-6 border-t-2 border-blue-50/50 bg-gradient-to-r from-blue-50/20 to-teal-50/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-3 px-5 py-3 rounded-2xl font-bold text-lg transition-all duration-300 
                        transform hover:scale-105 shadow-lg hover:shadow-xl ${
                isLiked
                  ? 'text-pink-600 bg-gradient-to-r from-pink-50 to-rose-50 border-2 border-pink-200'
                  : 'text-blue-600 hover:text-pink-600 bg-white hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 border-2 border-blue-200 hover:border-pink-200'
              }`}
            >
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-current animate-pulse' : ''}`} />
              <span>{post.likesCount}</span>
            </button>
            
            <button
              onClick={() => onComment?.(post.id)}
              className="flex items-center space-x-3 px-5 py-3 rounded-2xl text-blue-600 
                       hover:text-teal-600 bg-white hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 
                       font-bold text-lg transition-all duration-300 transform hover:scale-105 
                       shadow-lg hover:shadow-xl border-2 border-blue-200 hover:border-teal-200"
            >
              <MessageCircle className="w-6 h-6" />
              <span>{post.commentsCount}</span>
            </button>
            
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center space-x-3 px-5 py-3 rounded-2xl text-blue-600 
                       hover:text-coral-600 bg-white hover:bg-gradient-to-r hover:from-coral-50 hover:to-orange-50 
                       font-bold text-lg transition-all duration-300 transform hover:scale-105 
                       shadow-lg hover:shadow-xl border-2 border-blue-200 hover:border-coral-200"
            >
              <Share2 className="w-6 h-6" />
              <span>{post.sharesCount}</span>
            </button>
          </div>
          
          <button
            onClick={handleBookmark}
            className={`p-4 rounded-2xl transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl ${
              isBookmarked
                ? 'text-coral-600 bg-gradient-to-r from-coral-50 to-orange-50 border-2 border-coral-200'
                : 'text-blue-500 hover:text-coral-600 bg-white hover:bg-gradient-to-r hover:from-coral-50 hover:to-orange-50 border-2 border-blue-200 hover:border-coral-200'
            }`}
          >
            <Bookmark className={`w-6 h-6 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Engagement stats */}
        <div className="mt-4 pt-4 border-t border-blue-100/50">
          <div className="flex items-center justify-between text-sm text-blue-600/70">
            <span className="font-medium">
              {post.likesCount + post.commentsCount + post.sharesCount} total engagements
            </span>
            <button className="text-teal-600 hover:text-teal-700 font-semibold hover:underline transition-colors">
              See Friendship
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}