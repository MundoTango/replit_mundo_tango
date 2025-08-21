import React, { useState } from 'react';

interface SimpleLikeButtonProps {
  postId: number | string;
  currentReaction?: string;
  reactions?: { [key: string]: number };
  onReact: (reactionId: string) => void;
  className?: string;
}

const SIMPLE_REACTIONS = [
  { id: 'like', text: '👍', label: 'Like' },
  { id: 'love', text: '❤️', label: 'Love' },
  { id: 'haha', text: '😆', label: 'Haha' },
  { id: 'wow', text: '😮', label: 'Wow' },
  { id: 'sad', text: '😢', label: 'Sad' },
  { id: 'angry', text: '😠', label: 'Angry' },
  { id: 'fire', text: '🔥', label: 'Fire' },
  { id: 'heart_eyes', text: '😍', label: 'Heart Eyes' },
  { id: 'thinking', text: '🤔', label: 'Thinking' },
  { id: 'party', text: '🎉', label: 'Party' },
  { id: 'clap', text: '👏', label: 'Clap' },
  { id: 'mind_blown', text: '🤯', label: 'Mind Blown' }
];

export const SimpleLikeButton: React.FC<SimpleLikeButtonProps> = ({
  postId,
  currentReaction,
  reactions = {},
  onReact,
  className = ''
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);
  const currentReactionData = SIMPLE_REACTIONS.find(r => r.id === currentReaction);

  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowDropdown(false);
    }, 300);
    setHoverTimeout(timeout);
  };

  const handleDropdownMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  const handleDropdownMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowDropdown(false);
    }, 150);
    setHoverTimeout(timeout);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Like Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-200 hover:scale-105"
      >
        <span style={{ display: 'inline-block', width: '20px', textAlign: 'center' }}>
          {currentReactionData ? currentReactionData.text : '👍'}
        </span>
        <span className="text-sm font-medium">
          {currentReactionData ? currentReactionData.label : 'Like'}
        </span>
      </button>

      {/* Simple Dropdown */}
      {showDropdown && (
        <div 
          className="absolute bg-white border border-gray-200 rounded-lg shadow-2xl p-1 transition-all duration-300 ease-out"
          style={{ 
            zIndex: 99999,
            width: '180px',
            bottom: '100%',
            left: '0px',
            marginBottom: '4px',
            animation: 'slideInUp 0.3s ease-out, pulse 0.6s ease-out'
          }}
          onMouseEnter={handleDropdownMouseEnter}
          onMouseLeave={handleDropdownMouseLeave}
        >
          <div className="grid grid-cols-4 gap-0">
            {SIMPLE_REACTIONS.map((reaction, index) => (
              <button
                key={reaction.id}
                onClick={() => {
                  onReact(reaction.id);
                  setShowDropdown(false);
                }}
                className="flex items-center justify-center p-1 rounded hover:bg-blue-50 transition-all duration-200 hover:scale-125 hover:rotate-12 group"
                style={{ 
                  width: '40px', 
                  height: '40px',
                  fontSize: '24px',
                  animation: `fadeInBounce 0.4s ease-out ${index * 0.05}s both`
                }}
                title={reaction.label}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.4) rotate(15deg)';
                  e.currentTarget.style.backgroundColor = '#dbeafe';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                  e.currentTarget.style.backgroundColor = '';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                {reaction.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reaction Count */}
      {totalReactions > 0 && (
        <div className="mt-1">
          <span className="text-sm text-gray-600">{totalReactions} reactions</span>
        </div>
      )}
    </div>
  );
};