import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, MapPin, Smile, ThumbsUp, BookmarkIcon, Eye, Calendar, Music } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MemoryCardProps {
  post: any;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

export default function FacebookInspiredMemoryCard({ post, onLike, onComment, onShare }: MemoryCardProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState('');

  const reactions = ['👍', '❤️', '😊', '😢', '😡', '😮'];
  
  const handleReaction = (reaction: string) => {
    setUserReaction(reaction);
    setShowReactions(false);
  };

  const getAvatarFallback = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Parse location if it's JSON
  const getLocationName = (location: any) => {
    if (!location) return null;
    try {
      const loc = typeof location === 'string' ? JSON.parse(location) : location;
      return loc.name || loc.formatted_address || location;
    } catch {
      return location;
    }
  };

  return (
    <article className="bg-white rounded-lg shadow-sm mb-4">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            {/* Avatar */}
            {post.user?.profileImage ? (
              <img
                src={post.user.profileImage}
                alt={post.user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {getAvatarFallback(post.user?.name || 'U')}
              </div>
            )}
            
            {/* User info */}
            <div>
              <h3 className="font-medium text-[15px] text-gray-900 hover:underline cursor-pointer">
                {post.user?.name || 'Anonymous'}
              </h3>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>{formatDistanceToNow(new Date(post.createdAt))}</span>
                {post.location && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <MapPin className="h-3 w-3" />
                      {getLocationName(post.location)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Menu button */}
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreHorizontal className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-[15px] text-gray-900 whitespace-pre-wrap">{post.content}</p>
        
        {/* Emotion tags - subtle display */}
        {post.emotionTags?.length > 0 && (
          <div className="mt-2 text-sm text-gray-500">
            Feeling {post.emotionTags.join(', ')}
          </div>
        )}
      </div>

      {/* Media */}
      {(post.imageUrl || post.videoUrl) && (
        <div className="relative">
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt=""
              className="w-full object-cover"
            />
          )}
          {post.videoUrl && (
            <video
              src={post.videoUrl}
              controls
              className="w-full"
            />
          )}
        </div>
      )}

      {/* Engagement stats */}
      <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-2">
          {userReaction && <span>{userReaction}</span>}
          <span className="hover:underline cursor-pointer">{post.likes || 0} likes</span>
          {post.views && (
            <>
              <span>·</span>
              <span>{post.views} views</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="hover:underline cursor-pointer">{post.commentsCount || 0} comments</span>
          <span>{post.shares || 0} shares</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-4 py-1 border-t border-b border-gray-200">
        <div className="flex items-center justify-around">
          {/* Like/React button */}
          <button
            className="relative flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 rounded transition-colors"
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setTimeout(() => setShowReactions(false), 300)}
            onClick={() => !userReaction && handleReaction('👍')}
          >
            {userReaction ? (
              <>
                <span className="text-lg">{userReaction}</span>
                <span className={`text-sm font-medium ${userReaction === '👍' ? 'text-blue-600' : 'text-gray-700'}`}>
                  {userReaction === '👍' ? 'Like' : 'React'}
                </span>
              </>
            ) : (
              <>
                <ThumbsUp className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Like</span>
              </>
            )}
            
            {/* Reaction picker */}
            {showReactions && (
              <div 
                className="absolute bottom-full left-0 mb-2 bg-white rounded-full shadow-lg border border-gray-200 px-2 py-1 flex items-center gap-1"
                onMouseEnter={() => setShowReactions(true)}
              >
                {reactions.map(reaction => (
                  <button
                    key={reaction}
                    className="p-1.5 hover:scale-125 transition-transform"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReaction(reaction);
                    }}
                  >
                    <span className="text-xl">{reaction}</span>
                  </button>
                ))}
              </div>
            )}
          </button>

          {/* Comment button */}
          <button
            className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 rounded transition-colors"
            onClick={() => setShowCommentBox(!showCommentBox)}
          >
            <MessageCircle className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Comment</span>
          </button>

          {/* Share button */}
          <button
            className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 rounded transition-colors"
            onClick={onShare}
          >
            <Share2 className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Share</span>
          </button>
        </div>
      </div>

      {/* Comment box */}
      {showCommentBox && (
        <div className="p-4 flex gap-2">
          <div className="w-8 h-8 bg-gray-400 rounded-full flex-shrink-0"></div>
          <div className="flex-1">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full px-3 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && comment.trim()) {
                  onComment?.();
                  setComment('');
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Memory-specific features */}
      <div className="border-t border-gray-100">
        {/* Memory metadata bar */}
        <div className="px-4 py-3 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            {/* Memory energy/mood indicator */}
            {post.emotionTags?.includes('joy') && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>High energy</span>
              </div>
            )}
            
            {/* Music playing */}
            {post.content?.toLowerCase().includes('tanda') || post.content?.toLowerCase().includes('music') && (
              <div className="flex items-center gap-1">
                <Music className="h-3 w-3" />
                <span>Tango music</span>
              </div>
            )}
            
            {/* Save memory */}
            <button className="flex items-center gap-1 hover:text-gray-700">
              <BookmarkIcon className="h-3 w-3" />
              <span>Save</span>
            </button>
          </div>
          
          {/* Consent indicator */}
          {post.hasConsent && (
            <div className="flex items-center gap-1 text-green-600">
              <span className="text-xs">✓ Consented</span>
            </div>
          )}
        </div>
        
        {/* Similar memories suggestion */}
        {post.location && (
          <div className="px-4 pb-3 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-600">
                <span className="font-medium">12 similar memories</span> from {getLocationName(post.location)}
              </p>
              <button className="text-xs text-blue-600 hover:underline">View all</button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}