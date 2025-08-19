import { db } from '../db';
import { users, userProfiles, roles, userRoles } from '../../shared/schema';
import { eq, and, inArray, sql } from 'drizzle-orm';

export type CommunityRole = 
  | 'dancer' | 'performer' | 'teacher' | 'learning_source' | 'dj' | 'musician'
  | 'organizer' | 'host' | 'photographer' | 'content_creator' | 'choreographer'
  | 'tango_traveler' | 'tour_operator' | 'vendor' | 'wellness_provider'
  | 'tango_school' | 'tango_hotel';

export type PlatformRole = 
  | 'guest' | 'super_admin' | 'admin' | 'moderator' | 'curator' | 'bot';

export type AllRoles = CommunityRole | PlatformRole;

export interface UserWithMultipleRoles {
  id: number;
  email: string;
  name: string;
  username: string;
  primaryRole: AllRoles;
  roles: AllRoles[];
  displayName: string | null;
  avatarUrl: string | null;
  permissions: Record<string, boolean>;
  isActive: boolean;
}

export interface RoleDefinition {
  name: string;
  description: string;
  isPlatformRole: boolean;
  permissions: Record<string, boolean>;
}

// Enhanced permissions for comprehensive role system
export const ENHANCED_ROLE_PERMISSIONS: Record<AllRoles, Record<string, boolean>> = {
  // Community Roles
  dancer: {
    'create_posts': true,
    'comment_on_posts': true,
    'rsvp_events': true,
    'join_communities': true,
    'send_messages': true,
    'upload_media': true,
    'create_memories': true,
    'tag_friends': true
  },
  performer: {
    'create_posts': true,
    'comment_on_posts': true,
    'rsvp_events': true,
    'join_communities': true,
    'send_messages': true,
    'upload_media': true,
    'create_memories': true,
    'tag_friends': true,
    'showcase_performances': true,
    'create_performance_content': true
  },
  teacher: {
    'create_posts': true,
    'comment_on_posts': true,
    'rsvp_events': true,
    'join_communities': true,
    'send_messages': true,
    'upload_media': true,
    'create_memories': true,
    'tag_friends': true,
    'create_events': true,
    'manage_own_events': true,
    'create_educational_content': true,
    'moderate_comments': true,
    'view_student_progress': true
  },
  learning_source: {
    'create_posts': true,
    'comment_on_posts': true,
    'upload_media': true,
    'create_memories': true,
    'create_educational_content': true,
    'share_resources': true
  },
  dj: {
    'create_posts': true,
    'comment_on_posts': true,
    'rsvp_events': true,
    'join_communities': true,
    'send_messages': true,
    'upload_media': true,
    'create_memories': true,
    'tag_friends': true,
    'manage_playlists': true,
    'upload_music': true
  },
  musician: {
    'create_posts': true,
    'comment_on_posts': true,
    'rsvp_events': true,
    'join_communities': true,
    'send_messages': true,
    'upload_media': true,
    'create_memories': true,
    'tag_friends': true,
    'upload_music': true,
    'create_musical_content': true
  },
  organizer: {
    'create_posts': true,
    'comment_on_posts': true,
    'rsvp_events': true,
    'join_communities': true,
    'send_messages': true,
    'upload_media': true,
    'create_memories': true,
    'tag_friends': true,
    'create_events': true,
    'manage_own_events': true,
    'moderate_event_content': true,
    'view_event_analytics': true,
    'invite_participants': true,
    'manage_event_rsvps': true
  },
  host: {
    'create_posts': true,
    'comment_on_posts': true,
    'rsvp_events': true,
    'join_communities': true,
    'send_messages': true,
    'upload_media': true,
    'create_memories': true,
    'tag_friends': true,
    'create_events': true,
    'manage_venue_info': true
  },
  photographer: {
    'create_posts': true,
    'comment_on_posts': true,
    'rsvp_events': true,
    'join_communities': true,
    'send_messages': true,
    'upload_media': true,
    'create_memories': true,
    'tag_friends': true,
    'upload_professional_photos': true,
    'create_photo_galleries': true
  },
  content_creator: {
    'create_posts': true,
    'comment_on_posts': true,
    'rsvp_events': true,
    'join_communities': true,
    'send_messages': true,
    'upload_media': true,
    'create_memories': true,
    'tag_friends': true,
    'create_video_content': true,
    'create_educational_content': true,
    'monetize_content': true
  },
  choreographer: {
    'create_posts': true,
    'comment_on_posts': true,
    'rsvp_events': true,
    'join_communities': true,
    'send_messages': true,
    'upload_media': true,
    'create_memories': true,
    'tag_friends': true,
    'create_choreography': true,
    'share_dance_sequences': true
  },
  tango_traveler: {
    'create_posts': true,
    'comment_on_posts': true,
    'rsvp_events': true,
    'join_communities': true,
    'send_messages': true,
    'upload_media': true,
    'create_memories': true,
    'tag_friends': true,
    'share_travel_experiences': true,
    'recommend_venues': true
  },
  tour_operator: {
    'create_posts': true,
    'comment_on_posts': true,
    'rsvp_events': true,
    'join_communities': true,
    'send_messages': true,
    'upload_media': true,
    'create_memories': true,
    'tag_friends': true,
    'create_events': true,
    'manage_own_events': true,
    'organize_tours': true,
    'manage_bookings': true
  },
  vendor: {
    'create_posts': true,
    'comment_on_posts': true,
    'rsvp_events': true,
    'join_communities': true,
    'send_messages': true,
    'upload_media': true,
    'create_memories': true,
    'tag_friends': true,
    'sell_products': true,
    'manage_inventory': true
  },
  wellness_provider: {
    'create_posts': true,
    'comment_on_posts': true,
    'rsvp_events': true,
    'join_communities': true,
    'send_messages': true,
    'upload_media': true,
    'create_memories': true,
    'tag_friends': true,
    'offer_wellness_services': true,
    'create_wellness_content': true
  },
  tango_school: {
    'create_posts': true,
    'comment_on_posts': true,
    'rsvp_events': true,
    'join_communities': true,
    'send_messages': true,
    'upload_media': true,
    'create_memories': true,
    'tag_friends': true,
    'create_events': true,
    'manage_own_events': true,
    'create_educational_content': true,
    'manage_student_progress': true,
    'organize_classes': true
  },
  tango_hotel: {
    'create_posts': true,
    'comment_on_posts': true,
    'rsvp_events': true,
    'join_communities': true,
    'send_messages': true,
    'upload_media': true,
    'create_memories': true,
    'tag_friends': true,
    'create_events': true,
    'manage_accommodations': true,
    'offer_hospitality_services': true
  },

  // Platform Roles
  guest: {
    'view_public_content': true,
    'view_public_events': true
  },
  super_admin: {
    'manage_users': true,
    'manage_events': true,
    'manage_communities': true,
    'moderate_content': true,
    'view_analytics': true,
    'manage_roles': true,
    'delete_any_content': true,
    'ban_users': true,
    'system_administration': true,
    'database_access': true,
    'security_management': true
  },
  admin: {
    'manage_users': true,
    'manage_events': true,
    'manage_communities': true,
    'moderate_content': true,
    'view_analytics': true,
    'manage_roles': true,
    'delete_any_content': true,
    'ban_users': true
  },
  moderator: {
    'moderate_content': true,
    'moderate_comments': true,
    'moderate_event_content': true,
    'handle_reports': true,
    'warn_users': true,
    'temporary_ban_users': true
  },
  curator: {
    'curate_memories': true,
    'curate_events': true,
    'manage_featured_content': true,
    'organize_content': true,
    'quality_control': true
  },
  bot: {
    'automated_actions': true,
    'system_integration': true,
    'data_processing': true
  }
};

// Role-based routing configuration
export const ROLE_BASED_ROUTES: Record<AllRoles, string> = {
  // Community roles default to /moments (main social feed)
  dancer: '/moments',
  performer: '/moments',
  teacher: '/teacher/dashboard',
  learning_source: '/moments',
  dj: '/moments',
  musician: '/moments',
  organizer: '/organizer/dashboard',
  host: '/moments',
  photographer: '/moments',
  content_creator: '/moments',
  choreographer: '/moments',
  tango_traveler: '/moments',
  tour_operator: '/organizer/dashboard',
  vendor: '/moments',
  wellness_provider: '/moments',
  tango_school: '/organizer/dashboard',
  tango_hotel: '/moments',

  // Platform roles
  guest: '/welcome',
  super_admin: '/admin/system',
  admin: '/admin',
  moderator: '/admin/moderation',
  curator: '/admin/curation',
  bot: '/api/status'
};

export class EnhancedRoleService {
  /**
   * Get user with all their roles and permissions
   */
  async getUserWithRoles(userId: number): Promise<UserWithMultipleRoles | null> {
    try {
      const result = await db
        .select({
          userId: users.id,
          email: users.email,
          name: users.name,
          username: users.username,
          primaryRole: userProfiles.primaryRole,
          roles: userProfiles.roles,
          displayName: userProfiles.displayName,
          avatarUrl: userProfiles.avatarUrl,
          permissions: userProfiles.permissions,
          isActive: userProfiles.isActive
        })
        .from(users)
        .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
        .where(eq(users.id, userId))
        .limit(1);

      if (!result[0]) return null;

      const user = result[0];
      const primaryRole = (user.primaryRole as AllRoles) || 'guest';
      const userRolesList = (user.roles as AllRoles[]) || ['guest'];
      
      // Combine permissions from all roles
      const combinedPermissions: Record<string, boolean> = {};
      userRolesList.forEach(role => {
        Object.assign(combinedPermissions, ENHANCED_ROLE_PERMISSIONS[role] || {});
      });
      
      // Merge with custom permissions
      Object.assign(combinedPermissions, user.permissions as Record<string, boolean> || {});

      return {
        id: user.userId,
        email: user.email,
        name: user.name,
        username: user.username,
        primaryRole,
        roles: userRolesList,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        permissions: combinedPermissions,
        isActive: user.isActive ?? true
      };
    } catch (error) {
      console.error('Error getting user with roles:', error);
      return null;
    }
  }

  /**
   * Assign role to user
   */
  async assignRoleToUser(userId: number, roleName: AllRoles, assignedBy: number): Promise<boolean> {
    try {
      // First ensure user profile exists
      await this.ensureUserProfile(userId);

      // Add to user_roles junction table
      await db.insert(userRoles).values({
        userId,
        roleName,
        assignedBy
      }).onConflictDoNothing();

      // Update user_profiles roles array
      const currentProfile = await db
        .select({ roles: userProfiles.roles, primaryRole: userProfiles.primaryRole })
        .from(userProfiles)
        .where(eq(userProfiles.userId, userId))
        .limit(1);

      if (currentProfile[0]) {
        const currentRoles = (currentProfile[0].roles as AllRoles[]) || ['guest'];
        const updatedRoles = [...new Set([...currentRoles, roleName])];
        
        // If this is their first non-guest role, make it primary
        const newPrimaryRole = currentProfile[0].primaryRole === 'guest' && roleName !== 'guest' 
          ? roleName 
          : currentProfile[0].primaryRole;

        await db
          .update(userProfiles)
          .set({ 
            roles: updatedRoles,
            primaryRole: newPrimaryRole,
            updatedAt: new Date()
          })
          .where(eq(userProfiles.userId, userId));
      }

      return true;
    } catch (error) {
      console.error('Error assigning role to user:', error);
      return false;
    }
  }

  /**
   * Remove role from user
   */
  async removeRoleFromUser(userId: number, roleName: AllRoles, removedBy: number): Promise<boolean> {
    try {
      // Remove from user_roles junction table
      await db
        .delete(userRoles)
        .where(and(
          eq(userRoles.userId, userId),
          eq(userRoles.roleName, roleName)
        ));

      // Update user_profiles roles array
      const currentProfile = await db
        .select({ roles: userProfiles.roles, primaryRole: userProfiles.primaryRole })
        .from(userProfiles)
        .where(eq(userProfiles.userId, userId))
        .limit(1);

      if (currentProfile[0]) {
        const currentRoles = (currentProfile[0].roles as AllRoles[]) || ['guest'];
        const updatedRoles = currentRoles.filter(role => role !== roleName);
        
        // Ensure at least guest role remains
        if (updatedRoles.length === 0) {
          updatedRoles.push('guest');
        }

        // Update primary role if it was removed
        const newPrimaryRole = currentProfile[0].primaryRole === roleName 
          ? updatedRoles[0] 
          : currentProfile[0].primaryRole;

        await db
          .update(userProfiles)
          .set({ 
            roles: updatedRoles,
            primaryRole: newPrimaryRole,
            updatedAt: new Date()
          })
          .where(eq(userProfiles.userId, userId));
      }

      return true;
    } catch (error) {
      console.error('Error removing role from user:', error);
      return false;
    }
  }

  /**
   * Set primary role for user
   */
  async setPrimaryRole(userId: number, primaryRole: AllRoles): Promise<boolean> {
    try {
      // Ensure user has this role
      const userWithRoles = await this.getUserWithRoles(userId);
      if (!userWithRoles?.roles.includes(primaryRole)) {
        await this.assignRoleToUser(userId, primaryRole, userId);
      }

      await db
        .update(userProfiles)
        .set({ 
          primaryRole,
          updatedAt: new Date()
        })
        .where(eq(userProfiles.userId, userId));

      return true;
    } catch (error) {
      console.error('Error setting primary role:', error);
      return false;
    }
  }

  /**
   * Get all available roles
   */
  async getAllRoles(): Promise<RoleDefinition[]> {
    try {
      const rolesFromDb = await db.select().from(roles);
      
      return rolesFromDb.map(role => ({
        name: role.name,
        description: role.description,
        isPlatformRole: role.isPlatformRole || false,
        permissions: ENHANCED_ROLE_PERMISSIONS[role.name as AllRoles] || {}
      }));
    } catch (error) {
      console.error('Error getting all roles:', error);
      return [];
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(roleName: AllRoles, limit = 50): Promise<UserWithMultipleRoles[]> {
    try {
      const result = await db
        .select({
          userId: users.id,
          email: users.email,
          name: users.name,
          username: users.username,
          primaryRole: userProfiles.primaryRole,
          roles: userProfiles.roles,
          displayName: userProfiles.displayName,
          avatarUrl: userProfiles.avatarUrl,
          permissions: userProfiles.permissions,
          isActive: userProfiles.isActive
        })
        .from(users)
        .innerJoin(userProfiles, eq(users.id, userProfiles.userId))
        .where(sql`${userProfiles.roles} @> ARRAY[${roleName}]::text[]`)
        .limit(limit);

      return result.map(user => ({
        id: user.userId,
        email: user.email,
        name: user.name,
        username: user.username,
        primaryRole: (user.primaryRole as AllRoles) || 'guest',
        roles: (user.roles as AllRoles[]) || ['guest'],
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        permissions: {
          ...ENHANCED_ROLE_PERMISSIONS[(user.primaryRole as AllRoles) || 'guest'],
          ...(user.permissions as Record<string, boolean> || {})
        },
        isActive: user.isActive ?? true
      }));
    } catch (error) {
      console.error('Error getting users by role:', error);
      return [];
    }
  }

  /**
   * Check if user has permission
   */
  async hasPermission(userId: number, permission: string): Promise<boolean> {
    try {
      const user = await this.getUserWithRoles(userId);
      return user?.permissions[permission] || false;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Check if user has any of the specified roles
   */
  async hasAnyRole(userId: number, roleNames: AllRoles[]): Promise<boolean> {
    try {
      const user = await this.getUserWithRoles(userId);
      return user ? user.roles.some(role => roleNames.includes(role)) : false;
    } catch (error) {
      console.error('Error checking roles:', error);
      return false;
    }
  }

  /**
   * Get role-based route for user
   */
  getRouteForUser(user: UserWithMultipleRoles): string {
    return ROLE_BASED_ROUTES[user.primaryRole] || '/moments';
  }

  /**
   * Ensure user profile exists
   */
  async ensureUserProfile(userId: number): Promise<void> {
    try {
      const existing = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, userId))
        .limit(1);

      if (existing.length === 0) {
        const user = await db
          .select({ name: users.name, username: users.username })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        await db.insert(userProfiles).values({
          userId,
          primaryRole: 'guest',
          roles: ['guest'],
          displayName: user[0]?.name || user[0]?.username || null,
          isActive: true
        });

        // Also add to user_roles junction table
        await db.insert(userRoles).values({
          userId,
          roleName: 'guest'
        }).onConflictDoNothing();
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error);
    }
  }
}

export const enhancedRoleService = new EnhancedRoleService();