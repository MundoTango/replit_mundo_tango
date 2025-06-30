import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Calendar, UserGroup, ExternalLink } from 'lucide-react';
import { 
  parseMentionUrl, 
  getMentionRoute, 
  getMentionColor,
  MENTION_REGEX 
} from '../../../utils/mentionUtils';

interface MentionRendererProps {
  content: string;
  className?: string;
  onClick?: (type: string, id: string) => void;
  showTooltips?: boolean;
}

interface MentionLinkProps {
  href?: string;
  children: React.ReactNode;
  onClick?: (type: string, id: string) => void;
  showTooltips?: boolean;
}

// Custom mention link component
const MentionLink: React.FC<MentionLinkProps> = ({ 
  href, 
  children, 
  onClick,
  showTooltips = true 
}) => {
  const mentionData = parseMentionUrl(href || '');
  
  if (!mentionData) {
    return <span className="text-gray-600">{children}</span>;
  }

  const { type, id } = mentionData;
  const route = getMentionRoute(type, id);
  const colorClass = getMentionColor(type);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <Users className="h-3 w-3" />;
      case 'event':
        return <Calendar className="h-3 w-3" />;
      case 'group':
        return <UserGroup className="h-3 w-3" />;
      default:
        return <ExternalLink className="h-3 w-3" />;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick(type, id);
    }
  };

  return (
    <Link href={route}>
      <span 
        onClick={handleClick}
        className={`
          inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium
          hover:opacity-80 transition-opacity cursor-pointer
          ${colorClass}
        `}
        title={showTooltips ? `${type}: ${children}` : undefined}
      >
        {getTypeIcon(type)}
        {children}
      </span>
    </Link>
  );
};

// Enhanced mention renderer with rich formatting
const MentionRenderer: React.FC<MentionRendererProps> = ({
  content,
  className = "",
  onClick,
  showTooltips = true
}) => {
  // Custom components for ReactMarkdown
  const components = {
    // Handle mention links
    a: ({ href, children }: { href?: string; children: React.ReactNode }) => (
      <MentionLink 
        href={href} 
        onClick={onClick} 
        showTooltips={showTooltips}
      >
        {children}
      </MentionLink>
    ),
    
    // Enhanced paragraph styling
    p: ({ children }: { children: React.ReactNode }) => (
      <p className="mb-3 last:mb-0 leading-relaxed">
        {children}
      </p>
    ),
    
    // Enhanced strong text
    strong: ({ children }: { children: React.ReactNode }) => (
      <strong className="font-semibold text-gray-900">
        {children}
      </strong>
    ),
    
    // Enhanced emphasis
    em: ({ children }: { children: React.ReactNode }) => (
      <em className="italic text-gray-700">
        {children}
      </em>
    ),
    
    // Enhanced lists
    ul: ({ children }: { children: React.ReactNode }) => (
      <ul className="list-disc list-inside mb-3 space-y-1">
        {children}
      </ul>
    ),
    
    ol: ({ children }: { children: React.ReactNode }) => (
      <ol className="list-decimal list-inside mb-3 space-y-1">
        {children}
      </ol>
    ),
    
    li: ({ children }: { children: React.ReactNode }) => (
      <li className="text-gray-800">
        {children}
      </li>
    ),
    
    // Enhanced blockquotes
    blockquote: ({ children }: { children: React.ReactNode }) => (
      <blockquote className="border-l-4 border-blue-200 pl-4 py-2 mb-3 bg-blue-50 rounded-r-md">
        <div className="text-gray-700 italic">
          {children}
        </div>
      </blockquote>
    ),
    
    // Enhanced code blocks
    code: ({ children, className }: { children: React.ReactNode; className?: string }) => {
      const isInline = !className;
      
      if (isInline) {
        return (
          <code className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded-md text-sm font-mono">
            {children}
          </code>
        );
      }
      
      return (
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-md mb-3 overflow-x-auto">
          <code className="font-mono text-sm">
            {children}
          </code>
        </pre>
      );
    }
  };

  return (
    <div className={`mention-content ${className}`}>
      <ReactMarkdown 
        components={components}
        className="prose prose-sm max-w-none"
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

// Alternative simple renderer for when you just want text with styled mentions
export const SimpleMentionRenderer: React.FC<{
  content: string;
  className?: string;
  onClick?: (type: string, id: string) => void;
}> = ({ content, className = "", onClick }) => {
  // Parse content and replace mentions with styled spans
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
      
      parts.push(
        <span
          key={`${type}-${id}-${match.index}`}
          className={`
            inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium
            hover:opacity-80 transition-opacity cursor-pointer
            ${colorClass}
          `}
          onClick={() => onClick && onClick(type, id)}
        >
          @{display}
        </span>
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
    <div className={`simple-mention-content ${className}`}>
      {renderWithMentions(content)}
    </div>
  );
};

export default MentionRenderer;