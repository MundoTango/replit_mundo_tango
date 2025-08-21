import { db } from '../db';
import { roles, userProfiles, userRoles } from '../../shared/schema';
import { eq, sql, inArray } from 'drizzle-orm';

export type CommunityRole = 
  | 'dancer' | 'performer' | 'teacher' | 'learning_source' | 'dj' | 'musician'
  | 'organizer' | 'host' | 'photographer' | 'content_creator' | 'choreographer'
  | 'tango_traveler' | 'tour_operator' | 'vendor' | 'wellness_provider'
  | 'tango_school' | 'tango_hotel';

export type PlatformRole = 
  | 'guest' | 'super_admin' | 'admin' | 'moderator' | 'curator' | 'bot';

export type AllRoles = CommunityRole | PlatformRole;

export interface RoleDefinition {
  name: string;
  description: string;
  isPlatformRole: boolean;
  permissions: string[];
  color: string;
  icon: string;
  routePath: string;
}

export const ROLE_DEFINITIONS: Record<AllRoles, RoleDefinition> = {
  // Community Roles
  dancer: {
    name: 'dancer',
    description: 'Social tango dancer',
    isPlatformRole: false,
    permissions: ['create_posts', 'comment_on_posts', 'rsvp_events', 'join_communities', 'send_messages', 'upload_media', 'create_memories', 'tag_friends'],
    color: 'purple',
    icon: 'music',
    routePath: '/moments'
  },
  performer: {
    name: 'performer',
    description: 'Stage/showcase tango performer',
    isPlatformRole: false,
    permissions: ['create_posts', 'comment_on_posts', 'rsvp_events', 'join_communities', 'send_messages', 'upload_media', 'create_memories', 'tag_friends', 'showcase_performances', 'create_performance_content'],
    color: 'pink',
    icon: 'star',
    routePath: '/moments'
  },
  teacher: {
    name: 'teacher',
    description: 'Teaches classes or privates',
    isPlatformRole: false,
    permissions: ['create_posts', 'comment_on_posts', 'rsvp_events', 'join_communities', 'send_messages', 'upload_media', 'create_memories', 'tag_friends', 'create_events', 'manage_own_events', 'create_educational_content', 'moderate_comments', 'view_student_progress'],
    color: 'green',
    icon: 'graduation-cap',
    routePath: '/teacher'
  },
  learning_source: {
    name: 'learning_source',
    description: 'Resource for learning tango',
    isPlatformRole: false,
    permissions: ['create_posts', 'comment_on_posts', 'upload_media', 'create_memories', 'create_educational_content', 'share_resources'],
    color: 'cyan',
    icon: 'book',
    routePath: '/moments'
  },
  dj: {
    name: 'dj',
    description: 'Plays music at tango events',
    isPlatformRole: false,
    permissions: ['create_posts', 'comment_on_posts', 'rsvp_events', 'join_communities', 'send_messages', 'upload_media', 'create_memories', 'tag_friends', 'manage_playlists', 'upload_music'],
    color: 'indigo',
    icon: 'disc',
    routePath: '/moments'
  },
  musician: {
    name: 'musician',
    description: 'Performs live tango music',
    isPlatformRole: false,
    permissions: ['create_posts', 'comment_on_posts', 'rsvp_events', 'join_communities', 'send_messages', 'upload_media', 'create_memories', 'tag_friends', 'upload_music', 'create_musical_content'],
    color: 'violet',
    icon: 'music',
    routePath: '/moments'
  },
  organizer: {
    name: 'organizer',
    description: 'Organizes milongas, festivals, etc.',
    isPlatformRole: false,
    permissions: ['create_posts', 'comment_on_posts', 'rsvp_events', 'join_communities', 'send_messages', 'upload_media', 'create_memories', 'tag_friends', 'create_events', 'manage_own_events', 'moderate_event_content', 'view_event_analytics', 'invite_participants', 'manage_event_rsvps'],
    color: 'blue',
    icon: 'calendar',
    routePath: '/organizer'
  },
  host: {
    name: 'host',
    description: 'Provides hospitality or space',
    isPlatformRole: false,
    permissions: ['create_posts', 'comment_on_posts', 'rsvp_events', 'join_communities', 'send_messages', 'upload_media', 'create_memories', 'tag_friends', 'create_events', 'manage_venue_info'],
    color: 'rose',
    icon: 'home',
    routePath: '/moments'
  },
  photographer: {
    name: 'photographer',
    description: 'Captures tango moments visually',
    isPlatformRole: false,
    permissions: ['create_posts', 'comment_on_posts', 'rsvp_events', 'join_communities', 'send_messages', 'upload_media', 'create_memories', 'tag_friends', 'upload_professional_photos', 'create_photo_galleries'],
    color: 'amber',
    icon: 'camera',
    routePath: '/moments'
  },
  content_creator: {
    name: 'content_creator',
    description: 'Creates tango media content',
    isPlatformRole: false,
    permissions: ['create_posts', 'comment_on_posts', 'rsvp_events', 'join_communities', 'send_messages', 'upload_media', 'create_memories', 'tag_friends', 'create_video_content', 'create_educational_content', 'monetize_content'],
    color: 'emerald',
    icon: 'video',
    routePath: '/moments'
  },
  choreographer: {
    name: 'choreographer',
    description: 'Designs choreographed pieces',
    isPlatformRole: false,
    permissions: ['create_posts', 'comment_on_posts', 'rsvp_events', 'join_communities', 'send_messages', 'upload_media', 'create_memories', 'tag_friends', 'create_choreography', 'share_dance_sequences'],
    color: 'fuchsia',
    icon: 'scissors',
    routePath: '/moments'
  },
  tango_traveler: {
    name: 'tango_traveler',
    description: 'Travels to tango communities',
    isPlatformRole: false,
    permissions: ['create_posts', 'comment_on_posts', 'rsvp_events', 'join_communities', 'send_messages', 'upload_media', 'create_memories', 'tag_friends', 'share_travel_experiences', 'recommend_venues'],
    color: 'teal',
    icon: 'plane',
    routePath: '/moments'
  },
  tour_operator: {
    name: 'tour_operator',
    description: 'Organizes tango-themed tours',
    isPlatformRole: false,
    permissions: ['create_posts', 'comment_on_posts', 'rsvp_events', 'join_communities', 'send_messages', 'upload_media', 'create_memories', 'tag_friends', 'create_events', 'manage_own_events', 'organize_tours', 'manage_bookings'],
    color: 'sky',
    icon: 'map',
    routePath: '/organizer'
  },
  vendor: {
    name: 'vendor',
    description: 'Sells tango shoes or accessories',
    isPlatformRole: false,
    permissions: ['create_posts', 'comment_on_posts', 'rsvp_events', 'join_communities', 'send_messages', 'upload_media', 'create_memories', 'tag_friends', 'sell_products', 'manage_inventory'],
    color: 'orange',
    icon: 'shopping-bag',
    routePath: '/moments'
  },
  wellness_provider: {
    name: 'wellness_provider',
    description: 'Provides tango wellness services',
    isPlatformRole: false,
    permissions: ['create_posts', 'comment_on_posts', 'rsvp_events', 'join_communities', 'send_messages', 'upload_media', 'create_memories', 'tag_friends', 'offer_wellness_services', 'create_wellness_content'],
    color: 'lime',
    icon: 'heart',
    routePath: '/moments'
  },
  tango_school: {
    name: 'tango_school',
    description: 'Tango instruction center or academy',
    isPlatformRole: false,
    permissions: ['create_posts', 'comment_on_posts', 'rsvp_events', 'join_communities', 'send_messages', 'upload_media', 'create_memories', 'tag_friends', 'create_events', 'manage_own_events', 'create_educational_content', 'manage_student_progress', 'organize_classes'],
    color: 'slate',
    icon: 'building',
    routePath: '/organizer'
  },
  tango_hotel: {
    name: 'tango_hotel',
    description: 'Venue offering tango lodging/events',
    isPlatformRole: false,
    permissions: ['create_posts', 'comment_on_posts', 'rsvp_events', 'join_communities', 'send_messages', 'upload_media', 'create_memories', 'tag_friends', 'create_events', 'manage_accommodations', 'offer_hospitality_services'],
    color: 'stone',
    icon: 'bed',
    routePath: '/moments'
  },

  // Platform Roles
  guest: {
    name: 'guest',
    description: 'Default new user role',
    isPlatformRole: true,
    permissions: ['view_public_content', 'view_public_events'],
    color: 'gray',
    icon: 'user',
    routePath: '/moments'
  },
  super_admin: {
    name: 'super_admin',
    description: 'Full system access',
    isPlatformRole: true,
    permissions: ['manage_users', 'manage_events', 'manage_communities', 'moderate_content', 'view_analytics', 'manage_roles', 'delete_any_content', 'ban_users', 'system_administration', 'database_access', 'security_management'],
    color: 'red',
    icon: 'crown',
    routePath: '/platform'
  },
  admin: {
    name: 'admin',
    description: 'Moderates, manages platform tools',
    isPlatformRole: true,
    permissions: ['manage_users', 'manage_events', 'manage_communities', 'moderate_content', 'view_analytics', 'manage_roles', 'delete_any_content', 'ban_users'],
    color: 'red',
    icon: 'shield',
    routePath: '/admin'
  },
  moderator: {
    name: 'moderator',
    description: 'Handles community safety/reporting',
    isPlatformRole: true,
    permissions: ['moderate_content', 'moderate_comments', 'moderate_event_content', 'handle_reports', 'warn_users', 'temporary_ban_users'],
    color: 'yellow',
    icon: 'flag',
    routePath: '/admin'
  },
  curator: {
    name: 'curator',
    description: 'Curates memories, events, visibility',
    isPlatformRole: true,
    permissions: ['curate_memories', 'curate_events', 'manage_featured_content', 'organize_content', 'quality_control'],
    color: 'purple',
    icon: 'star',
    routePath: '/admin'
  },
  bot: {
    name: 'bot',
    description: 'Internal automation or AI account',
    isPlatformRole: true,
    permissions: ['automated_actions', 'system_integration', 'data_processing'],
    color: 'gray',
    icon: 'bot',
    routePath: '/api/status'
  }
};

export class RolesService {
  /**
   * Get all available roles
   */
  async getAllRoles(): Promise<RoleDefinition[]> {
    try {
      const dbRoles = await db.select().from(roles);
      return dbRoles.map(role => ROLE_DEFINITIONS[role.name as AllRoles] || {
        name: role.name,
        description: role.description,
        isPlatformRole: role.isPlatformRole || false,
        permissions: [],
        color: 'gray',
        icon: 'user',
        routePath: '/moments'
      });
    } catch (error) {
      console.error('Error fetching roles:', error);
      return Object.values(ROLE_DEFINITIONS);
    }
  }

  /**
   * Get user's roles
   */
  async getUserRoles(userId: number): Promise<AllRoles[]> {
    try {
      const userProfile = await db
        .select({ roles: userProfiles.roles })
        .from(userProfiles)
        .where(eq(userProfiles.userId, userId))
        .limit(1);

      if (userProfile[0]?.roles) {
        return userProfile[0].roles as AllRoles[];
      }

      // Fallback: check junction table
      const junctionRoles = await db
        .select({ roleName: userRoles.roleName })
        .from(userRoles)
        .where(eq(userRoles.userId, userId));

      if (junctionRoles.length > 0) {
        return junctionRoles.map(r => r.roleName as AllRoles);
      }

      // Default fallback
      await this.assignDefaultRole(userId);
      return ['guest'];
    } catch (error) {
      console.error('Error getting user roles:', error);
      await this.assignDefaultRole(userId);
      return ['guest'];
    }
  }

  /**
   * Check if user has specific role
   */
  async hasRole(userId: number, roleName: AllRoles): Promise<boolean> {
    try {
      const userRoles = await this.getUserRoles(userId);
      return userRoles.includes(roleName);
    } catch (error) {
      console.error('Error checking user role:', error);
      return false;
    }
  }

  /**
   * Check if user has any of the specified roles
   */
  async hasAnyRole(userId: number, roleNames: AllRoles[]): Promise<boolean> {
    try {
      const userRoles = await this.getUserRoles(userId);
      return userRoles.some(role => roleNames.includes(role));
    } catch (error) {
      console.error('Error checking user roles:', error);
      return false;
    }
  }

  /**
   * Get user's primary role
   */
  async getPrimaryRole(userId: number): Promise<AllRoles> {
    try {
      const userProfile = await db
        .select({ primaryRole: userProfiles.primaryRole })
        .from(userProfiles)
        .where(eq(userProfiles.userId, userId))
        .limit(1);

      if (userProfile[0]?.primaryRole) {
        return userProfile[0].primaryRole as AllRoles;
      }

      // Fallback to first role in array
      const roles = await this.getUserRoles(userId);
      return roles[0] || 'guest';
    } catch (error) {
      console.error('Error getting primary role:', error);
      return 'guest';
    }
  }

  /**
   * Get route path for user based on primary role
   */
  async getRouteForUser(userId: number): Promise<string> {
    try {
      const primaryRole = await this.getPrimaryRole(userId);
      return ROLE_DEFINITIONS[primaryRole]?.routePath || '/moments';
    } catch (error) {
      console.error('Error getting route for user:', error);
      return '/moments';
    }
  }

  /**
   * Get route paths for all user roles (for role switching)
   */
  async getAvailableRoutesForUser(userId: number): Promise<{ role: AllRoles; route: string; definition: RoleDefinition }[]> {
    try {
      const userRoles = await this.getUserRoles(userId);
      return userRoles
        .map(role => ({
          role,
          route: ROLE_DEFINITIONS[role]?.routePath || '/moments',
          definition: ROLE_DEFINITIONS[role]
        }))
        .filter((item, index, self) => 
          // Remove duplicates by route
          index === self.findIndex(t => t.route === item.route)
        );
    } catch (error) {
      console.error('Error getting available routes:', error);
      return [{ role: 'guest', route: '/moments', definition: ROLE_DEFINITIONS.guest }];
    }
  }

  /**
   * Assign default role to user
   */
  async assignDefaultRole(userId: number): Promise<void> {
    try {
      // Ensure user profile exists
      const existingProfile = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, userId))
        .limit(1);

      if (existingProfile.length === 0) {
        await db.insert(userProfiles).values({
          userId,
          primaryRole: 'guest',
          roles: ['guest'],
          isActive: true
        });
      } else {
        // Update existing profile to have guest role
        await db
          .update(userProfiles)
          .set({
            roles: ['guest'],
            primaryRole: 'guest'
          })
          .where(eq(userProfiles.userId, userId));
      }

      // Also add to junction table
      await db.insert(userRoles).values({
        userId,
        roleName: 'guest'
      }).onConflictDoNothing();
    } catch (error) {
      console.error('Error assigning default role:', error);
    }
  }

  /**
   * Get role definition
   */
  getRoleDefinition(roleName: AllRoles): RoleDefinition {
    return ROLE_DEFINITIONS[roleName] || ROLE_DEFINITIONS.guest;
  }

  /**
   * Get community roles only
   */
  getCommunityRoles(): RoleDefinition[] {
    return Object.values(ROLE_DEFINITIONS).filter(role => !role.isPlatformRole);
  }

  /**
   * Get platform roles only
   */
  getPlatformRoles(): RoleDefinition[] {
    return Object.values(ROLE_DEFINITIONS).filter(role => role.isPlatformRole);
  }
}

export const rolesService = new RolesService();