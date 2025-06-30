import React, { useState, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Calendar, UsersRound } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface MentionData {
  id: string;
  display: string;
  type: 'user' | 'event' | 'group';
  avatar?: string;
  status?: string;
}

interface SimpleMentionsInputProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  rows?: number;
}

const SimpleMentionsInput: React.FC<SimpleMentionsInputProps> = ({
  value,
  onChange,
  placeholder = "Share your memory and @mention people or events...",
  className = "",
  disabled = false,
  rows = 4
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
  const [currentMention, setCurrentMention] = useState('');
  const [mentionStart, setMentionStart] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Search for mentions when @ is typed
  const { data: searchData, isLoading } = useQuery({
    queryKey: ['/api/search/mentions', currentMention],
    queryFn: async () => {
      const response = await apiRequest(`/api/search/mentions?q=${encodeURIComponent(currentMention)}`);
      return response;
    },
    enabled: currentMention.length >= 1 && showSuggestions,
    staleTime: 30000,
  });

  // Get suggestions from search data
  const suggestions: MentionData[] = React.useMemo(() => {
    if (!searchData) return [];
    
    const allSuggestions: MentionData[] = [];
    
    // Add users
    if (searchData.users && Array.isArray(searchData.users)) {
      searchData.users.forEach((user: any) => {
        allSuggestions.push({
          id: user.id.toString(),
          display: user.name || user.username,
          type: 'user',
          avatar: user.profileImage
        });
      });
    }
    
    // Add events
    if (searchData.events && Array.isArray(searchData.events)) {
      searchData.events.forEach((event: any) => {
        allSuggestions.push({
          id: event.id.toString(),
          display: event.title,
          type: 'event'
        });
      });
    }
    
    return allSuggestions;
  }, [searchData]);

  // Handle text change and detect @ mentions
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    onChange(newValue);
    
    // Check if we're in a mention context
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      const hasSpaceAfterAt = textAfterAt.includes(' ');
      
      if (!hasSpaceAfterAt && textAfterAt.length <= 50) {
        // We're in a mention
        setCurrentMention(textAfterAt);
        setMentionStart(lastAtIndex);
        setShowSuggestions(true);
        
        // Calculate suggestion position
        const textarea = textareaRef.current;
        if (textarea) {
          const coords = getCaretCoordinates(textarea, cursorPos);
          setSuggestionPosition({
            top: coords.top + 25,
            left: coords.left
          });
        }
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  }, [onChange]);

  // Insert mention into text
  const insertMention = useCallback((suggestion: MentionData) => {
    const beforeMention = value.substring(0, mentionStart);
    const afterMention = value.substring(mentionStart + currentMention.length + 1);
    const mentionText = `@[${suggestion.display}](type:${suggestion.type},id:${suggestion.id})`;
    
    const newValue = beforeMention + mentionText + ' ' + afterMention;
    onChange(newValue);
    setShowSuggestions(false);
    
    // Focus back to textarea
    if (textareaRef.current) {
      const newCursorPos = beforeMention.length + mentionText.length + 1;
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  }, [value, mentionStart, currentMention, onChange]);

  // Handle key navigation in suggestions
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        e.preventDefault();
      } else if (e.key === 'Enter' && suggestions.length > 0) {
        insertMention(suggestions[0]);
        e.preventDefault();
      }
    }
  }, [showSuggestions, suggestions, insertMention]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'event':
        return <Calendar className="h-4 w-4 text-green-500" />;
      case 'group':
        return <UsersRound className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'user':
        return 'bg-blue-50 text-blue-700';
      case 'event':
        return 'bg-green-50 text-green-700';
      case 'group':
        return 'bg-purple-50 text-purple-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      
      {/* Suggestions dropdown */}
      {showSuggestions && (
        <Card 
          className="absolute z-50 w-80 max-h-60 overflow-y-auto shadow-lg"
          style={{
            top: suggestionPosition.top,
            left: suggestionPosition.left
          }}
        >
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-3 text-sm text-gray-500">Searching...</div>
            ) : suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <div
                  key={`${suggestion.type}-${suggestion.id}`}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  onClick={() => insertMention(suggestion)}
                >
                  {/* Avatar or Icon */}
                  <div className="flex-shrink-0">
                    {suggestion.avatar ? (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={suggestion.avatar} alt={suggestion.display} />
                        <AvatarFallback>
                          {suggestion.display.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        {getTypeIcon(suggestion.type)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {suggestion.display}
                    </div>
                    {suggestion.status && (
                      <div className="text-sm text-gray-500 truncate">
                        {suggestion.status}
                      </div>
                    )}
                  </div>

                  {/* Type Badge */}
                  <Badge 
                    variant="secondary" 
                    className={`${getTypeColor(suggestion.type)} capitalize text-xs`}
                  >
                    {suggestion.type}
                  </Badge>
                </div>
              ))
            ) : currentMention.length > 0 ? (
              <div className="p-3 text-sm text-gray-500">No matches found</div>
            ) : null}
          </CardContent>
        </Card>
      )}
      
      {/* Helper text */}
      <div className="mt-2 text-xs text-gray-500">
        Type @ to mention users or events. Press Enter to select the first suggestion.
      </div>
    </div>
  );
};

// Utility function to get caret coordinates
function getCaretCoordinates(element: HTMLTextAreaElement, position: number) {
  const div = document.createElement('div');
  const style = getComputedStyle(element);
  
  // Copy styles from textarea
  [
    'position', 'left', 'top', 'width', 'height', 'border', 'padding',
    'margin', 'font-family', 'font-size', 'font-weight', 'line-height',
    'letter-spacing', 'white-space', 'word-wrap', 'overflow-wrap'
  ].forEach(prop => {
    div.style[prop as any] = style[prop as any];
  });
  
  div.style.position = 'absolute';
  div.style.visibility = 'hidden';
  div.style.whiteSpace = 'pre-wrap';
  div.style.wordWrap = 'break-word';
  
  const text = element.value.substring(0, position);
  div.textContent = text;
  
  const span = document.createElement('span');
  span.textContent = element.value.substring(position) || '.';
  div.appendChild(span);
  
  document.body.appendChild(div);
  
  const rect = element.getBoundingClientRect();
  const spanRect = span.getBoundingClientRect();
  const divRect = div.getBoundingClientRect();
  
  const coordinates = {
    top: spanRect.top - divRect.top + rect.top,
    left: spanRect.left - divRect.left + rect.left
  };
  
  document.body.removeChild(div);
  return coordinates;
}

export default SimpleMentionsInput;