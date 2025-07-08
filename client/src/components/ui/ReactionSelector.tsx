/**
 * Enhanced Reaction System with Tango-Specific Emotions
 * 11L Layer 2: Component Implementation
 */

import React, { useState } from 'react';
import { Heart, Smile, Frown, ThumbsUp, ThumbsDown, Star } from 'lucide-react';

export interface Reaction {
  id: string;
  emoji: string;
  label: string;
  color: string;
  category: 'love' | 'joy' | 'tango' | 'support' | 'sad';
}

export const REACTION_TYPES: Reaction[] = [
  // Love & Passion
  { id: 'love', emoji: '❤️', label: 'Love', color: 'text-red-500', category: 'love' },
  { id: 'passion', emoji: '🔥', label: 'Passion', color: 'text-orange-500', category: 'love' },
  { id: 'romance', emoji: '🌹', label: 'Romance', color: 'text-pink-500', category: 'love' },
  
  // Joy & Celebration
  { id: 'joy', emoji: '😊', label: 'Joy', color: 'text-yellow-500', category: 'joy' },
  { id: 'wow', emoji: '😮', label: 'Wow', color: 'text-blue-500', category: 'joy' },
  { id: 'celebration', emoji: '🎉', label: 'Celebration', color: 'text-purple-500', category: 'joy' },
  
  // Tango-Specific
  { id: 'tango_dancer', emoji: '💃', label: 'Beautiful Dancing', color: 'text-pink-600', category: 'tango' },
  { id: 'tango_leader', emoji: '🕺', label: 'Strong Lead', color: 'text-blue-600', category: 'tango' },
  { id: 'music', emoji: '🎵', label: 'Great Music', color: 'text-indigo-500', category: 'tango' },
  { id: 'elegance', emoji: '✨', label: 'Elegance', color: 'text-amber-500', category: 'tango' },
  
  // Support & Encouragement
  { id: 'support', emoji: '👏', label: 'Applause', color: 'text-green-500', category: 'support' },
  { id: 'inspiration', emoji: '💫', label: 'Inspiring', color: 'text-cyan-500', category: 'support' },
  
  // Sadness
  { id: 'sad', emoji: '😢', label: 'Sad', color: 'text-gray-500', category: 'sad' }
];

interface ReactionSelectorProps {
  postId: number;
  currentReaction?: string;
  reactions?: { [key: string]: number };
  onReact: (reactionId: string) => void;
  className?: string;
}

export const ReactionSelector: React.FC<ReactionSelectorProps> = ({
  postId,
  currentReaction,
  reactions = {},
  onReact,
  className = ''
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleReactionClick = (reactionId: string) => {
    onReact(reactionId);
    setShowReactions(false);
  };

  const getTotalReactions = () => {
    return Object.values(reactions).reduce((sum, count) => sum + count, 0);
  };

  const getCurrentReactionEmoji = () => {
    if (currentReaction) {
      const reaction = REACTION_TYPES.find(r => r.id === currentReaction);
      return reaction?.emoji || '❤️';
    }
    return '❤️';
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Like Button */}
      <div className="flex items-center gap-2">
        <button
          className={`
            group flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200
            ${currentReaction 
              ? 'bg-pink-100 text-pink-600 hover:bg-pink-200' 
              : 'text-gray-500 hover:bg-pink-50 hover:text-pink-500'
            }
          `}
          onClick={() => currentReaction ? onReact('') : onReact('love')}
          onMouseEnter={() => {
            setIsHovering(true);
            setTimeout(() => setShowReactions(true), 500);
          }}
          onMouseLeave={() => {
            setIsHovering(false);
            setTimeout(() => {
              if (!isHovering) setShowReactions(false);
            }, 300);
          }}
        >
          <span className="text-lg transition-transform group-hover:scale-110">
            {getCurrentReactionEmoji()}
          </span>
          {getTotalReactions() > 0 && (
            <span className="text-sm font-medium">{getTotalReactions()}</span>
          )}
        </button>
      </div>

      {/* Reaction Picker Popup */}
      {showReactions && (
        <div 
          className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-3 z-50"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => {
            setIsHovering(false);
            setTimeout(() => setShowReactions(false), 200);
          }}
        >
          <div className="flex gap-1">
            {REACTION_TYPES.map((reaction) => (
              <button
                key={reaction.id}
                className={`
                  relative flex items-center justify-center w-12 h-12 rounded-full
                  transition-all duration-200 hover:scale-110
                  ${currentReaction === reaction.id 
                    ? 'bg-gradient-to-br from-pink-100 to-indigo-100 ring-2 ring-pink-300 shadow-md' 
                    : 'hover:bg-gray-100'
                  }
                `}
                onClick={() => handleReactionClick(reaction.id)}
                title={reaction.label}
              >
                <span className="text-xl transition-transform">
                  {reaction.emoji}
                </span>
                {reactions[reaction.id] > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gray-800 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-sm">
                    {reactions[reaction.id]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};