/**
 * 🏗️ 11L Tango Role Management System
 * Layer 6: Backend Layer - Comprehensive tango role definitions with emoticons and descriptions
 */

export interface TangoRole {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: 'dance' | 'music' | 'event' | 'community' | 'business';
  priority: number; // For sorting
}

export const TANGO_ROLES: TangoRole[] = [
  // Dance Roles
  { id: 'dancer', name: 'Dancer', emoji: '💃', description: 'Passionate tango dancer', category: 'dance', priority: 1 },
  { id: 'leader', name: 'Leader', emoji: '🕺', description: 'Leads in tango dancing', category: 'dance', priority: 2 },
  { id: 'follower', name: 'Follower', emoji: '💃', description: 'Follows in tango dancing', category: 'dance', priority: 3 },
  { id: 'teacher', name: 'Teacher', emoji: '🎓', description: 'Teaches tango techniques and steps', category: 'dance', priority: 4 },
  { id: 'performer', name: 'Performer', emoji: '🎭', description: 'Performs tango shows and exhibitions', category: 'dance', priority: 5 },
  
  // Music Roles
  { id: 'dj', name: 'DJ', emoji: '🎧', description: 'Plays tango music at milongas', category: 'music', priority: 6 },
  { id: 'musician', name: 'Musician', emoji: '🎵', description: 'Plays tango instruments', category: 'music', priority: 7 },
  { id: 'singer', name: 'Singer', emoji: '🎤', description: 'Sings tango songs', category: 'music', priority: 8 },
  
  // Event Roles
  { id: 'organizer', name: 'Organizer', emoji: '📅', description: 'Organizes tango events and milongas', category: 'event', priority: 9 },
  { id: 'host', name: 'Host', emoji: '🏠', description: 'Hosts tango events and visitors', category: 'event', priority: 10 },
  { id: 'volunteer', name: 'Volunteer', emoji: '🤝', description: 'Volunteers at tango events', category: 'event', priority: 11 },
  
  // Community Roles
  { id: 'photographer', name: 'Photographer', emoji: '📸', description: 'Captures tango moments and events', category: 'community', priority: 12 },
  { id: 'content_creator', name: 'Content Creator', emoji: '📱', description: 'Creates tango content for social media', category: 'community', priority: 13 },
  { id: 'historian', name: 'Historian', emoji: '📚', description: 'Preserves tango history and culture', category: 'community', priority: 14 },
  { id: 'guide', name: 'Guide', emoji: '🗺️', description: 'Shows visitors around tango venues', category: 'community', priority: 15 },
  
  // Business Roles
  { id: 'tango_house', name: 'Tango House', emoji: '🏢', description: 'Operates tango venue or business', category: 'business', priority: 16 },
  { id: 'tango_school', name: 'Tango School', emoji: '🏫', description: 'Runs tango educational institution', category: 'business', priority: 17 },
  { id: 'tour_operator', name: 'Tour Operator', emoji: '✈️', description: 'Organizes tango tours and trips', category: 'business', priority: 18 }
];

export const ROLE_CATEGORIES = {
  dance: { name: 'Dance', emoji: '💃', color: 'bg-pink-100 text-pink-800' },
  music: { name: 'Music', emoji: '🎵', color: 'bg-blue-100 text-blue-800' },
  event: { name: 'Events', emoji: '📅', color: 'bg-green-100 text-green-800' },
  community: { name: 'Community', emoji: '🤝', color: 'bg-purple-100 text-purple-800' },
  business: { name: 'Business', emoji: '💼', color: 'bg-orange-100 text-orange-800' }
};

export function getTangoRoleById(roleId: string): TangoRole | undefined {
  return TANGO_ROLES.find(role => role.id === roleId);
}

export function getRolesByCategory(category: string): TangoRole[] {
  return TANGO_ROLES.filter(role => role.category === category);
}

export function mapUserRoleToTangoRole(userRole: string): TangoRole {
  // Map database user roles to tango roles
  const roleMapping: Record<string, string> = {
    'admin': 'organizer',
    'member': 'dancer',
    'moderator': 'organizer',
    'teacher': 'teacher',
    'dj': 'dj',
    'performer': 'performer',
    'photographer': 'photographer',
    'organizer': 'organizer',
    'host': 'host',
    'volunteer': 'volunteer'
  };
  
  const tangoRoleId = roleMapping[userRole.toLowerCase()] || 'dancer';
  return getTangoRoleById(tangoRoleId) || TANGO_ROLES[0];
}