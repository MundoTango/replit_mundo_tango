/**
 * Rich Text Comment Editor with WYSIWYG functionality
 * 11L Layer 3: Component Implementation
 */

import React, { useState, useRef } from 'react';
import { Bold, Italic, Link, Smile, AtSign, Send, X } from 'lucide-react';

interface RichTextCommentEditorProps {
  postId: number;
  parentCommentId?: number;
  placeholder?: string;
  onSubmit: (content: string, mentions: string[]) => void;
  onCancel?: () => void;
  className?: string;
}

export const RichTextCommentEditor: React.FC<RichTextCommentEditorProps> = ({
  postId,
  parentCommentId,
  placeholder = "Write a comment...",
  onSubmit,
  onCancel,
  className = ''
}) => {
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [mentions, setMentions] = useState<string[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content, mentions);
      setContent('');
      setMentions([]);
      setIsExpanded(false);
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText;
      setContent(text);
      
      // Extract mentions
      const mentionRegex = /@(\w+)/g;
      const foundMentions = [];
      let match;
      while ((match = mentionRegex.exec(text)) !== null) {
        foundMentions.push(match[1]);
      }
      setMentions(foundMentions);
    }
  };

  const insertEmoji = (emoji: string) => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(emoji));
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        editorRef.current.innerHTML += emoji;
      }
      handleInput();
    }
  };

  const commonEmojis = ['❤️', '😊', '😢', '👏', '🔥', '💃', '🕺', '🎵', '🌹', '✨'];

  return (
    <div className={`bg-white rounded-xl border border-gray-200 ${className}`}>
      {/* Toolbar */}
      {isExpanded && (
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
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
          </div>
          
          {/* Emoji Picker */}
          <div className="flex items-center gap-1">
            {commonEmojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => insertEmoji(emoji)}
                className="p-1 hover:bg-gray-100 rounded transition-colors text-lg"
                title={`Insert ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="p-4">
        <div
          ref={editorRef}
          contentEditable
          className={`
            w-full min-h-[40px] outline-none resize-none text-gray-900 
            ${isExpanded ? 'min-h-[100px]' : ''}
          `}
          style={{ wordWrap: 'break-word' }}
          placeholder={placeholder}
          onFocus={() => setIsExpanded(true)}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          suppressContentEditableWarning={true}
        />

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
};