import React, { useState } from 'react';

export interface FacebookReaction {
  id: string;
  emoji: string;
  label: string;
  color: string;
}

export const FACEBOOK_REACTIONS: FacebookReaction[] = [
  { id: 'like', emoji: '👍', label: 'Like', color: 'text-blue-500' },
  { id: 'love', emoji: '❤️', label: 'Love', color: 'text-red-500' },
  { id: 'haha', emoji: '😆', label: 'Haha', color: 'text-yellow-500' },
  { id: 'wow', emoji: '😮', label: 'Wow', color: 'text-yellow-600' },
  { id: 'sad', emoji: '😢', label: 'Sad', color: 'text-yellow-500' },
  { id: 'angry', emoji: '😠', label: 'Angry', color: 'text-orange-500' }
];

interface FacebookReactionSelectorProps {
  postId: number | string;
  currentReaction?: string;
  reactions?: { [key: string]: number };
  onReact: (reactionId: string) => void;
  className?: string;
}

export const FacebookReactionSelector: React.FC<FacebookReactionSelectorProps> = ({
  postId,
  currentReaction,
  reactions = {},
  onReact,
  className = ''
}) => {
  const [showReactions, setShowReactions] = useState(false);

  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);
  const topReactions = Object.entries(reactions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([id]) => FACEBOOK_REACTIONS.find(r => r.id === id))
    .filter(Boolean);

  const currentReactionData = currentReaction 
    ? FACEBOOK_REACTIONS.find(r => r.id === currentReaction)
    : null;

  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      {/* Reaction Button */}
      <button
        onMouseEnter={() => setShowReactions(true)}
        onMouseLeave={() => setShowReactions(false)}
        onClick={() => {
          if (currentReaction) {
            onReact(currentReaction); // Toggle off
          } else {
            onReact('like'); // Default like
          }
        }}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition-all duration-200
          ${currentReaction 
            ? 'bg-blue-50 text-blue-600' 
            : 'text-gray-600 hover:bg-gray-50'
          }
        `}
      >
        {currentReactionData ? (
          <>
            <span className="text-lg">{currentReactionData.emoji}</span>
            <span className="text-sm">{currentReactionData.label}</span>
          </>
        ) : (
          <>
            <span className="text-lg">👍</span>
            <span className="text-sm">Like</span>
          </>
        )}
      </button>

      {/* Reaction Count Display */}
      {totalReactions > 0 && (
        <div className="flex items-center">
          <div className="flex -space-x-2">
            {topReactions.map((reaction) => (
              <span 
                key={reaction!.id} 
                className="inline-flex items-center justify-center w-6 h-6 bg-white rounded-full shadow-sm text-sm border border-gray-100"
              >
                {reaction!.emoji}
              </span>
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600">{totalReactions}</span>
        </div>
      )}

      {/* Reaction Picker */}
      {showReactions && (
        <div className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex gap-2">
            {FACEBOOK_REACTIONS.map((reaction) => (
              <button
                key={reaction.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onReact(reaction.id);
                  setShowReactions(false);
                }}
                className={`
                  w-12 h-12 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-all duration-200
                  ${currentReaction === reaction.id ? 'bg-gray-100' : ''}
                `}
                title={reaction.label}
              >
                <span className="text-2xl block">{reaction.emoji}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};