import React from 'react';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, UsersRound } from 'lucide-react';

interface SimpleMentionRendererProps {
  content: string;
  className?: string;
  onClick?: (type: string, id: string) => void;
}

const SimpleMentionRenderer: React.FC<SimpleMentionRendererProps> = ({ 
  content, 
  className = "", 
  onClick 
}) => {
  // Regex pattern for parsing mentions in format: @[Display Name](type:user,id:123)
  const MENTION_REGEX = /@\[([^\]]+)\]\(type:(\w+),id:([^)]+)\)/g;
  
  const getMentionColor = (type: string) => {
    switch (type) {
      case 'user':
        return 'text-blue-600 bg-blue-50';
      case 'event':
        return 'text-green-600 bg-green-50';
      case 'group':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getMentionRoute = (type: string, id: string) => {
    switch (type) {
      case 'user':
        return `/u/${id}`;
      case 'event':
        return `/events/${id}`;
      case 'group':
        return `/groups/${id}`;
      default:
        return '#';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <Users className="h-3 w-3" />;
      case 'event':
        return <Calendar className="h-3 w-3" />;
      case 'group':
        return <UsersRound className="h-3 w-3" />;
      default:
        return null;
    }
  };

  // Parse content and replace mentions with styled components
  const renderWithMentions = (text: string) => {
    const parts = [];
    let lastIndex = 0;
    let match;
    
    // Reset regex
    MENTION_REGEX.lastIndex = 0;
    
    while ((match = MENTION_REGEX.exec(text)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      
      // Add styled mention
      const display = match[1];
      const type = match[2];
      const id = match[3];
      const colorClass = getMentionColor(type);
      const route = getMentionRoute(type, id);
      
      parts.push(
        <Link key={`${type}-${id}-${match.index}`} href={route}>
          <span
            className={`
              inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium
              hover:opacity-80 transition-opacity cursor-pointer
              ${colorClass}
            `}
            onClick={(e) => {
              if (onClick) {
                e.preventDefault();
                onClick(type, id);
              }
            }}
            title={`${type}: ${display}`}
          >
            {getTypeIcon(type)}
            @{display}
          </span>
        </Link>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    
    return parts;
  };

  return (
    <div className={`mention-content ${className}`}>
      <div className="whitespace-pre-wrap leading-relaxed">
        {renderWithMentions(content)}
      </div>
    </div>
  );
};

export default SimpleMentionRenderer;