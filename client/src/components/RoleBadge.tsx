import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RoleBadgeProps {
  role: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Emoji-only role display with descriptive hover text
const roleEmojiMapping: Record<string, { emoji: string; description: string }> = {
  // Community roles - emoji only
  dancer: { emoji: '💃', description: 'Dancer: Passionate about tango dancing' },
  performer: { emoji: '🌟', description: 'Performer: Professional tango performer' },
  teacher: { emoji: '📚', description: 'Teacher: Tango instructor and educator' },
  learning_source: { emoji: '📖', description: 'Learning Source: Educational content creator' },
  dj: { emoji: '🎧', description: 'DJ: Music curator and event DJ' },
  musician: { emoji: '🎵', description: 'Musician: Tango musician and composer' },
  organizer: { emoji: '📅', description: 'Organizer: Event organizer and community builder' },
  host: { emoji: '🏠', description: 'Host: Offers accommodation to travelers' },
  guide: { emoji: '🗺️', description: 'Guide: Willing to show visitors around' },
  photographer: { emoji: '📸', description: 'Photographer: Captures tango moments' },
  content_creator: { emoji: '🎨', description: 'Content Creator: Creates tango-related content' },
  choreographer: { emoji: '✂️', description: 'Choreographer: Creates tango choreography' },
  tango_traveler: { emoji: '🌍', description: 'Tango Traveler: Travels for tango events' },
  tour_operator: { emoji: '✈️', description: 'Tour Operator: Organizes tango tours' },
  vendor: { emoji: '🛍️', description: 'Vendor: Sells tango-related products' },
  wellness_provider: { emoji: '💚', description: 'Wellness Provider: Health and wellness services' },
  tango_school: { emoji: '🏢', description: 'Tango School: Educational institution' },
  tango_hotel: { emoji: '🛏️', description: 'Tango Hotel: Tango-friendly accommodation' },
  
  // Platform roles - administrative
  guest: { emoji: '👤', description: 'Guest: Platform visitor' },
  super_admin: { emoji: '👑', description: 'Super Admin: Full platform access' },
  admin: { emoji: '🛡️', description: 'Admin: Administrative privileges' },
  moderator: { emoji: '🚩', description: 'Moderator: Content moderation' },
  curator: { emoji: '⭐', description: 'Curator: Content curation specialist' },
  bot: { emoji: '🤖', description: 'Bot: Automated system account' }
};

const sizeClasses = {
  sm: 'text-sm w-6 h-6',
  md: 'text-base w-8 h-8',
  lg: 'text-lg w-10 h-10'
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({ 
  role, 
  size = 'md', 
  className = '' 
}) => {
  const roleData = roleEmojiMapping[role];
  
  if (!roleData) {
    return (
      <span className={`inline-flex items-center justify-center rounded-full bg-gray-100 ${sizeClasses[size]} ${className}`}>
        ❓
      </span>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span 
            className={`inline-flex items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-sm border border-gray-200 hover:border-gray-300 cursor-help transition-all duration-200 ${sizeClasses[size]} ${className}`}
          >
            {roleData.emoji}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm font-medium">{roleData.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default RoleBadge;