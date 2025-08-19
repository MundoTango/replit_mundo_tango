import React, { useState, useRef } from 'react';
import {
  Bold,
  Italic,
  Link,
  AtSign,
  Smile,
  Send
} from 'lucide-react';

interface RichTextCommentEditorProps {
  postId: number;
  onSubmit: (content: string, mentions?: string[]) => void;
  onCancel?: () => void;
  placeholder?: string;
  className?: string;
}

export function RichTextCommentEditor({
  postId,
  onSubmit,
  onCancel,
  placeholder = 'Write a comment...',
  className = ''
}: RichTextCommentEditorProps) {
  const [content, setContent] = useState('');
  const [mentions, setMentions] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // ESA Solution: Simple, clean emoji list
  const emojis = [
    '❤️', '😊', '😍', '🥰', '😂',
    '👏', '🔥', '💃', '🕺', '🎵',
    '🌹', '✨', '🎉', '🥳', '🤗',
    '😎', '🤩', '😇', '🙏', '💪',
    '👍', '💯', '🎊', '🌟', '💖'
  ];

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content, mentions.length > 0 ? mentions : undefined);
      setContent('');
      setMentions([]);
      setIsExpanded(false);
      setShowEmojiPicker(false);
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleInput = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerHTML;
      setContent(text);
      
      // Extract mentions
      const mentionRegex = /@(\w+)/g;
      const foundMentions: string[] = [];
      let match;
      while ((match = mentionRegex.exec(text)) !== null) {
        foundMentions.push(match[1]);
      }
      setMentions(foundMentions);
    }
  };

  const insertEmoji = (emoji: string) => {
    if (editorRef.current) {
      // Simple approach: just append the emoji
      editorRef.current.innerHTML += emoji;
      handleInput();
      editorRef.current.focus();
      
      // Move cursor to end
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
    setShowEmojiPicker(false);
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 ${className}`}>
      {/* Toolbar */}
      {isExpanded && (
        <div className="border-b border-gray-100">
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => formatText('bold')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                onClick={() => formatText('italic')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </button>
              <div className="w-px h-6 bg-gray-200 mx-2"></div>
              <button
                onClick={() => formatText('createLink', prompt('Enter URL:') || '')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Add Link"
              >
                <Link className="h-4 w-4" />
              </button>
              <button
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Mention User"
              >
                <AtSign className="h-4 w-4" />
              </button>
              <div className="w-px h-6 bg-gray-200 mx-2"></div>
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-2 rounded-lg transition-colors ${
                  showEmojiPicker ? 'bg-pink-100 text-pink-600' : 'hover:bg-gray-100'
                }`}
                title="Add Emoji"
              >
                <Smile className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* ESA Simple Emoji Picker - Fixed Layout */}
          {showEmojiPicker && (
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {emojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => insertEmoji(emoji)}
                    className="w-14 h-14 flex items-center justify-center text-2xl hover:bg-white hover:shadow-md rounded-lg transition-all duration-200 border border-gray-200"
                    title={`Add ${emoji}`}
                    type="button"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Editor */}
      <div className="p-4 relative">
        <div
          ref={editorRef}
          contentEditable
          className={`
            w-full min-h-[40px] outline-none resize-none text-gray-900 
            ${isExpanded ? 'min-h-[100px]' : ''}
          `}
          style={{ wordWrap: 'break-word' }}
          onFocus={() => setIsExpanded(true)}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          suppressContentEditableWarning={true}
        />

        {/* Placeholder text display */}
        {!content && !isExpanded && (
          <div className="absolute text-gray-400 pointer-events-none">
            {placeholder}
          </div>
        )}

        {/* Actions */}
        {isExpanded && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              {mentions.length > 0 && (
                <span>
                  Mentioning: {mentions.map(m => `@${m}`).join(', ')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={!content.trim()}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${content.trim() 
                    ? 'bg-pink-500 text-white hover:bg-pink-600' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <Send className="h-4 w-4" />
                Comment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}