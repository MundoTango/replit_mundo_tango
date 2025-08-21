import React from 'react';

interface SimpleEmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  className?: string;
}

export function SimpleEmojiPicker({ onEmojiSelect, className = '' }: SimpleEmojiPickerProps) {
  // Popular emojis for comments
  const emojis = ['❤️', '😊', '😍', '👏', '🔥', '💃', '🕺', '🎵', '😂', '🥰'];
  
  return (
    <div className={`flex items-center gap-1 p-2 bg-gray-50 rounded-lg ${className}`}>
      <span className="text-sm text-gray-500 mr-2">Quick emojis:</span>
      {emojis.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onEmojiSelect(emoji)}
          className="text-xl p-1 hover:bg-white hover:scale-110 rounded transition-all duration-150"
          title={`Add ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}