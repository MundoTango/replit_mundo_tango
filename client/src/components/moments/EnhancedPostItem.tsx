import React, { useState, useMemo } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MapPin, 
  MoreVertical,
  Expand,
  Users,
  Calendar,
  Sparkles,
  Clock,
  CheckCircle
} from 'lucide-react';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
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
  hasConsent?: boolean;
  mentions?: Array<{
    type: 'user' | 'event' | 'group';
    id: string;
    display: string;
  }>;
  emotionTags?: string[];
}

interface PostItemProps {
  post: Post;
  onLike: (postId: number) => void;
  onShare: (post: Post) => void;
}

export default function EnhancedPostItem({ post, onLike, onShare }: PostItemProps) {
  const [commentText, setCommentText] = useState('');
  const [isCommentFocused, setIsCommentFocused] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Calculate age-based opacity for gradual fade effect
  const postAge = useMemo(() => {
    const daysSinceCreated = differenceInDays(new Date(), new Date(post.createdAt));
    if (daysSinceCreated <= 1) return 1; // Full opacity for recent posts
    if (daysSinceCreated <= 7) return 0.95; // Slight fade for week-old posts
    if (daysSinceCreated <= 30) return 0.85; // More fade for month-old posts
    return 0.75; // Most fade for older posts
  }, [post.createdAt]);

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      'dancer': 'bg-pink-100 text-pink-700 border-pink-200',
      'dj': 'bg-purple-100 text-purple-700 border-purple-200',
      'teacher': 'bg-blue-100 text-blue-700 border-blue-200',
      'organizer': 'bg-green-100 text-green-700 border-green-200',
      'performer': 'bg-amber-100 text-amber-700 border-amber-200',
      'musician': 'bg-indigo-100 text-indigo-700 border-indigo-200'
    };
    return colors[role.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      'joy': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'love': 'bg-pink-100 text-pink-800 border-pink-200',
      'excitement': 'bg-orange-100 text-orange-800 border-orange-200',
      'nostalgia': 'bg-purple-100 text-purple-800 border-purple-200',
      'gratitude': 'bg-green-100 text-green-800 border-green-200',
      'inspiration': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[emotion.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getMentionIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="h-3 w-3" />;
      case 'event': return <Calendar className="h-3 w-3" />;
      case 'group': return <Users className="h-3 w-3" />;
      default: return null;
    }
  };

  const getAvatarFallback = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const consentGlowClass = post.hasConsent 
    ? 'ring-2 ring-emerald-200 shadow-emerald-100/50 shadow-lg' 
    : '';

  return (
    <article 
      className={`
        relative bg-white/95 backdrop-blur-sm rounded-3xl border border-gray-100/50 
        hover:scale-[1.01] hover:shadow-2xl hover:shadow-indigo-100/30
        transition-all duration-300 ease-out
        ${consentGlowClass}
      `}
      style={{ opacity: postAge }}
    >
      {/* Consent indicator glow effect */}
      {post.hasConsent && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-3xl opacity-30 blur-sm animate-pulse"></div>
      )}
      
      <div className="relative p-6 lg:p-8 space-y-6">
        {/* Enhanced Header Section */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar with enhanced styling */}
            <div className="relative">
              {post.user?.profileImage ? (
                <img
                  src={post.user.profileImage}
                  alt={post.user.name || 'User'}
                  className="w-14 h-14 object-cover rounded-2xl ring-2 ring-indigo-100 shadow-lg"
                />
              ) : (
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {getAvatarFallback(post.user?.name || 'Anonymous')}
                </div>
              )}
              
              {/* Consent status indicator */}
              {post.hasConsent && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-white">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              )}
            </div>

            {/* User Info with enhanced typography */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-bold text-xl text-gray-900 hover:text-indigo-600 cursor-pointer transition-colors">
                  {post.user?.name || 'Anonymous'}
                </h3>
                <span className="text-gray-500 text-base">@{post.user?.username || 'anonymous'}</span>
              </div>
              
              {/* Roles with enhanced styling */}
              {post.user?.tangoRoles && post.user.tangoRoles.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {post.user.tangoRoles.slice(0, 3).map((role, index) => (
                    <span
                      key={index}
                      className={`
                        px-3 py-1 rounded-full text-xs font-medium border
                        ${getRoleBadgeColor(role)}
                        hover:scale-105 transition-transform duration-200
                      `}
                    >
                      {role}
                    </span>
                  ))}
                  {post.user.tangoRoles.length > 3 && (
                    <span className="text-xs text-gray-500">+{post.user.tangoRoles.length - 3} more</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Enhanced timestamp and actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-gray-500">
              <Clock className="h-4 w-4" />
              <time className="text-sm font-medium">
                {formatDistanceToNow(new Date(post.createdAt))} ago
              </time>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <MoreVertical className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </header>

        {/* Emotions and Location Section */}
        {(post.emotionTags?.length || post.location) && (
          <section className="flex items-center justify-between py-4 px-5 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-2xl border border-blue-100/50">
            {/* Emotion tags */}
            {post.emotionTags && post.emotionTags.length > 0 && (
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                <div className="flex gap-2 flex-wrap">
                  {post.emotionTags.map((emotion, index) => (
                    <span
                      key={index}
                      className={`
                        px-3 py-1 rounded-full text-xs font-medium border
                        ${getEmotionColor(emotion)}
                        hover:scale-105 transition-transform duration-200
                      `}
                    >
                      {emotion}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            {post.location && (
              <div className="flex items-center gap-2 text-indigo-600">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">{post.location}</span>
              </div>
            )}
          </section>
        )}

        {/* Mentions Section */}
        {post.mentions && post.mentions.length > 0 && (
          <section className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-2xl p-4 border border-purple-100/50">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-purple-700">Mentioned</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {post.mentions.map((mention, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-white/80 border border-purple-200 rounded-full text-sm font-medium text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer"
                >
                  {getMentionIcon(mention.type)}
                  @{mention.display}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Enhanced Content Section */}
        <section className="prose prose-lg max-w-none">
          <div className="text-gray-800 leading-relaxed text-lg">
            {renderWithMentions ? renderWithMentions(post.content) : post.content}
          </div>

          {/* Media content */}
          {post.imageUrl && (
            <div className="mt-6 rounded-2xl overflow-hidden shadow-lg ring-1 ring-gray-200">
              <img
                src={post.imageUrl}
                alt="Post content"
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          {post.videoUrl && (
            <div className="mt-6 rounded-2xl overflow-hidden shadow-lg ring-1 ring-gray-200">
              <video
                src={post.videoUrl}
                controls
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="mt-4 flex gap-2 flex-wrap">
              {post.hashtags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  #
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Enhanced Action Bar */}
        <footer className="flex items-center justify-between pt-6 border-t border-gray-100">
          <div className="flex items-center gap-6">
            {/* Like button */}
            <button
              onClick={() => onLike(post.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200
                ${post.isLiked 
                  ? 'bg-pink-100 text-pink-700 hover:bg-pink-200' 
                  : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                }
                hover:scale-105
              `}
            >
              <Heart className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`} />
              <span>{post.likes || 0}</span>
            </button>

            {/* Comment button */}
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 hover:scale-105"
            >
              <MessageCircle className="h-5 w-5" />
              <span>{post.comments || 0}</span>
            </button>

            {/* Share button */}
            <button
              onClick={() => onShare(post)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-gray-600 hover:bg-green-50 hover:text-green-600 transition-all duration-200 hover:scale-105"
            >
              <Share2 className="h-5 w-5" />
              <span>Share</span>
            </button>
          </div>

          {/* Expand button */}
          <button
            onClick={() => setShowModal(true)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105"
          >
            <Expand className="h-5 w-5" />
          </button>
        </footer>

        {/* Modal */}
        {showModal && (
          <PostDetailModal
            post={post}
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onLike={onLike}
            onShare={onShare}
          />
        )}
      </div>
    </article>
  );
}