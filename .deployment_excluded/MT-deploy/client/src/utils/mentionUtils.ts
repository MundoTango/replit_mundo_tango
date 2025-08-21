// Mention Utilities for Layer 9 Memory System
// Handles parsing, validation, and rendering of @mentions across users, events, and groups

export interface MentionData {
  id: string;
  display: string;
  type: 'user' | 'event' | 'group';
  avatar?: string;
  status?: string;
}

export interface ParsedMention {
  display: string;
  type: 'user' | 'event' | 'group';
  id: string;
  position?: {
    start: number;
    end: number;
  };
}

// Regex pattern for parsing mentions in format: @[Display Name](type:user,id:123)
export const MENTION_REGEX = /@\[([^\]]+)\]\(type:(\w+),id:([^)]+)\)/g;

// Markup template for react-mentions
export const MENTION_MARKUP = '@[__display__](type:__type__,id:__id__)';

/**
 * Extract all mentions from text content
 */
export function extractMentions(text: string): ParsedMention[] {
  const mentions: ParsedMention[] = [];
  let match;
  
  // Reset regex to start from beginning
  MENTION_REGEX.lastIndex = 0;
  
  while ((match = MENTION_REGEX.exec(text)) !== null) {
    mentions.push({
      display: match[1],
      type: match[2] as 'user' | 'event' | 'group',
      id: match[3],
      position: {
        start: match.index,
        end: match.index + match[0].length
      }
    });
  }
  
  return mentions;
}

/**
 * Convert mentions back to readable text for display
 */
export function renderMentionsAsText(text: string): string {
  return text.replace(MENTION_REGEX, '@$1');
}

/**
 * Validate mention format and structure
 */
export function validateMention(mention: ParsedMention): boolean {
  return !!(
    mention.display &&
    mention.type &&
    mention.id &&
    ['user', 'event', 'group'].includes(mention.type)
  );
}

/**
 * Convert mentions to storage format for database
 */
export function mentionsToStorageFormat(mentions: ParsedMention[]): any[] {
  return mentions
    .filter(validateMention)
    .map(mention => ({
      type: mention.type,
      id: mention.id,
      display: mention.display
    }));
}

/**
 * Generate mention markup for react-mentions component
 */
export function createMentionMarkup(display: string, type: string, id: string): string {
  return `@[${display}](type:${type},id:${id})`;
}

/**
 * Parse mention URL format for routing
 */
export function parseMentionUrl(href: string): { type: string; id: string } | null {
  const match = /type:(\w+),id:([^)]+)/.exec(href || '');
  if (!match) return null;
  
  return {
    type: match[1],
    id: match[2]
  };
}

/**
 * Generate route path for mention type
 */
export function getMentionRoute(type: string, id: string): string {
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
}

/**
 * Get mention display color based on type
 */
export function getMentionColor(type: string): string {
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
}

/**
 * Format mention data for react-mentions suggestions
 */
export function formatMentionSuggestions(
  users: any[],
  events: any[],
  groups: any[]
): MentionData[] {
  const suggestions: MentionData[] = [];
  
  // Add users
  users.forEach(user => {
    suggestions.push({
      id: user.id.toString(),
      display: user.name || user.username,
      type: 'user',
      avatar: user.profileImage,
      status: user.isOnline ? 'online' : 'offline'
    });
  });
  
  // Add events
  events.forEach(event => {
    suggestions.push({
      id: event.id.toString(),
      display: event.title,
      type: 'event',
      status: event.status
    });
  });
  
  // Add groups
  groups.forEach(group => {
    suggestions.push({
      id: group.id.toString(),
      display: group.name,
      type: 'group',
      avatar: group.image,
      status: group.memberCount ? `${group.memberCount} members` : undefined
    });
  });
  
  return suggestions;
}

/**
 * Search and filter mentions based on query
 */
export function filterMentions(mentions: MentionData[], query: string): MentionData[] {
  if (!query.trim()) return mentions;
  
  const lowerQuery = query.toLowerCase();
  return mentions.filter(mention =>
    mention.display.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get unique mentioned user IDs for notification purposes
 */
export function getUniqueUserMentions(mentions: ParsedMention[]): string[] {
  return Array.from(
    new Set(
      mentions
        .filter(mention => mention.type === 'user')
        .map(mention => mention.id)
    )
  );
}

/**
 * Generate notification payload for mentioned users
 */
export function createMentionNotificationPayload(
  mentionedUserIds: string[],
  memoryId: string,
  creatorName: string,
  memoryTitle: string
) {
  return {
    userIds: mentionedUserIds,
    type: 'memory_mention',
    data: {
      memoryId,
      creatorName,
      memoryTitle,
      timestamp: new Date().toISOString()
    }
  };
}