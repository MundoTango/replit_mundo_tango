import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Clock } from 'lucide-react';
import { format } from 'date-fns';

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

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.(post.id);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark?.(post.id);
  };

  const formatDate = (date: string | Date) => {
    return format(new Date(date), 'MMM d, yyyy');
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 
                    transform hover:-translate-y-1 border border-blue-50 overflow-hidden group">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={post.user.profileImage || '/api/placeholder/40/40'}
                alt={post.user.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-gradient-to-br from-orange-200 to-pink-200"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-teal-400 to-teal-500 
                            rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 hover:text-teal-600 cursor-pointer transition-colors">
                {post.user.name}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-blue-500">
                <span>@{post.user.username}</span>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(post.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <button className="p-2 rounded-xl text-blue-400 hover:text-blue-600 hover:bg-blue-50 
                           transition-all duration-200 opacity-0 group-hover:opacity-100">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-4">
        <p className="text-blue-900 leading-relaxed">{post.content}</p>
      </div>

      {/* Media */}
      {post.imageUrl && (
        <div className="px-6 pb-4">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-teal-50">
            <img
              src={post.imageUrl}
              alt="Memory"
              className={`w-full h-auto transition-all duration-500 ${
                imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-teal-300 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 py-4 border-t border-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-200 ${
                isLiked
                  ? 'text-pink-500 bg-pink-50'
                  : 'text-blue-500 hover:text-pink-500 hover:bg-pink-50'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="font-medium">{post.likesCount}</span>
            </button>
            
            <button
              onClick={() => onComment?.(post.id)}
              className="flex items-center space-x-2 px-3 py-2 rounded-xl text-blue-500 
                       hover:text-teal-500 hover:bg-teal-50 transition-all duration-200"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">{post.commentsCount}</span>
            </button>
            
            <button
              onClick={() => onShare?.(post.id)}
              className="flex items-center space-x-2 px-3 py-2 rounded-xl text-blue-500 
                       hover:text-orange-500 hover:bg-orange-50 transition-all duration-200"
            >
              <Share2 className="w-5 h-5" />
              <span className="font-medium">{post.sharesCount}</span>
            </button>
          </div>
          
          <button
            onClick={handleBookmark}
            className={`p-2 rounded-xl transition-all duration-200 ${
              isBookmarked
                ? 'text-orange-500 bg-orange-50'
                : 'text-blue-400 hover:text-orange-500 hover:bg-orange-50'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}