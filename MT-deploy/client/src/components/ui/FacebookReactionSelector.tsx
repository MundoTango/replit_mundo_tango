import React, { useState } from 'react';

export interface FacebookReaction {
  id: string;
  emoji: string;
  label: string;
  color: string;
}

export const FACEBOOK_REACTIONS: FacebookReaction[] = [
  { id: 'like', emoji: '👍', label: 'Like', color: 'text-blue-500' },
  { id: 'love', emoji: '❤', label: 'Love', color: 'text-red-500' },
  { id: 'haha', emoji: '😂', label: 'Haha', color: 'text-yellow-500' },
  { id: 'wow', emoji: '😮', label: 'Wow', color: 'text-yellow-600' },
  { id: 'sad', emoji: '😢', label: 'Sad', color: 'text-yellow-500' },
  { id: 'angry', emoji: '😡', label: 'Angry', color: 'text-orange-500' }
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
        <span style={{ marginRight: '8px', fontSize: '16px' }}>👍</span>
        <span style={{ fontSize: '14px', fontWeight: '500' }}>
          {currentReactionData ? currentReactionData.label : 'Like'}
        </span>
      </button>

      {/* Reaction Count Display */}
      {totalReactions > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {topReactions.map((reaction, index) => (
            <span 
              key={reaction!.id}
              style={{
                fontSize: '16px',
                padding: '2px',
                marginRight: index < topReactions.length - 1 ? '4px' : '0'
              }}
            >
              {reaction!.emoji}
            </span>
          ))}
          <span style={{ fontSize: '14px', color: '#666', marginLeft: '4px' }}>
            {totalReactions}
          </span>
        </div>
      )}

      {/* Reaction Picker */}
      {showReactions && (
        <div className="absolute bottom-full left-0 mb-3 bg-white rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 border border-gray-100">
          <div className="grid grid-cols-6 gap-1">
            {FACEBOOK_REACTIONS.map((reaction) => (
              <button
                key={reaction.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onReact(reaction.id);
                  setShowReactions(false);
                }}
                className={`
                  w-14 h-14 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors duration-150
                  ${currentReaction === reaction.id ? 'bg-gray-100 ring-2 ring-blue-500' : ''}
                `}
                title={reaction.label}
              >
                <span style={{ fontSize: '24px', padding: '4px' }}>
                  {reaction.emoji}
                </span>
              </button>
            ))}
          </div>
          {/* Tooltip arrow */}
          <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white border-r border-b border-gray-100 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
};