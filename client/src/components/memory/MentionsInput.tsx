import React, { useState, useCallback, useMemo } from 'react';
import { MentionsInput as ReactMentionsInput, Mention } from 'react-mentions';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, UsersRound } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { 
  MentionData, 
  MENTION_MARKUP, 
  formatMentionSuggestions, 
  filterMentions 
} from '../../utils/mentionUtils';

interface MentionsInputProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  rows?: number;
}

interface SearchResponse {
  users: any[];
  events: any[];
  groups: any[];
}

const MentionsInput: React.FC<MentionsInputProps> = ({
  value,
  onChange,
  placeholder = "Share your memory and @mention people, events, or groups...",
  className = "",
  disabled = false,
  rows = 4
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch mention data from search API
  const { data: searchData, isLoading } = useQuery({
    queryKey: ['/api/search/mentions', searchQuery],
    queryFn: () => apiRequest(`/api/search/mentions?q=${encodeURIComponent(searchQuery)}`),
    enabled: searchQuery.length >= 2,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Format data for react-mentions
  const mentionSuggestions = useMemo(() => {
    if (!searchData) return [];
    
    const { users = [], events = [], groups = [] } = searchData as SearchResponse;
    return formatMentionSuggestions(users, events, groups);
  }, [searchData]);

  // Handle mention search with debouncing
  const handleMentionSearch = useCallback((query: string, callback: Function) => {
    setSearchQuery(query);
    
    // Return filtered suggestions immediately for better UX
    if (mentionSuggestions.length > 0) {
      const filtered = filterMentions(mentionSuggestions, query);
      callback(filtered);
    } else {
      callback([]);
    }
  }, [mentionSuggestions]);

  // Custom suggestion renderer
  const renderSuggestion = useCallback((
    suggestion: MentionData,
    search: string,
    highlightedDisplay: React.ReactNode,
    index: number,
    focused: boolean
  ) => {
    const getTypeIcon = (type: string) => {
      switch (type) {
        case 'user':
          return <Users className="h-4 w-4 text-blue-500" />;
        case 'event':
          return <Calendar className="h-4 w-4 text-green-500" />;
        case 'group':
          return <UserGroup className="h-4 w-4 text-purple-500" />;
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
      <div 
        className={`
          flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors
          ${focused ? 'bg-blue-100' : 'hover:bg-gray-50'}
        `}
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
            {highlightedDisplay}
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
    );
  }, []);

  // Handle content change
  const handleChange = useCallback((event: any) => {
    onChange(event.target.value);
  }, [onChange]);

  // Mention input styles
  const mentionInputStyle = {
    control: {
      backgroundColor: '#fff',
      fontSize: '14px',
      fontWeight: 'normal',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      minHeight: `${rows * 1.5}rem`,
      outline: 'none',
      transition: 'border-color 0.2s ease',
    },
    
    '&multiLine': {
      control: {
        fontFamily: 'inherit',
        minHeight: `${rows * 1.5}rem`,
        padding: '12px 16px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        fontSize: '14px',
        lineHeight: '1.5',
      },
      highlighter: {
        padding: '12px 16px',
        border: '1px solid transparent',
        fontSize: '14px',
        lineHeight: '1.5',
      },
      input: {
        padding: '12px 16px',
        border: '1px solid transparent',
        fontSize: '14px',
        lineHeight: '1.5',
        outline: 'none',
        resize: 'vertical',
        minHeight: `${rows * 1.5}rem`,
      },
    },

    suggestions: {
      list: {
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        maxHeight: '200px',
        overflowY: 'auto',
        fontSize: '14px',
        zIndex: 50,
      },
      item: {
        padding: '0px',
        borderBottom: '1px solid #f3f4f6',
        '&focused': {
          backgroundColor: '#eff6ff',
        },
      },
    },
  };

  return (
    <div className={`mentions-container ${className}`}>
      <MentionsInput
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        style={mentionInputStyle}
        allowSuggestionsAboveCursor={true}
        a11ySuggestionsListLabel="Suggested mentions"
      >
        <Mention
          trigger="@"
          data={handleMentionSearch}
          markup={MENTION_MARKUP}
          renderSuggestion={renderSuggestion}
          displayTransform={(id: string, display: string) => `@${display}`}
          appendSpaceOnAdd={true}
          allowSpaceInQuery={true}
        />
      </MentionsInput>
      
      {/* Helper text */}
      <div className="mt-2 text-xs text-gray-500">
        Type @ to mention users, events, or groups. Press Tab or Enter to select.
      </div>

      {/* Loading indicator */}
      {isLoading && searchQuery.length >= 2 && (
        <div className="mt-2 text-xs text-blue-600">
          Searching for mentions...
        </div>
      )}
    </div>
  );
};

export default MentionsInput;