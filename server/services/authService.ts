import { db } from '../db';
import { users, userProfiles } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

export type UserRole = 'admin' | 'organizer' | 'teacher' | 'dancer' | 'guest';

export interface UserWithRole {
  id: number;
  email: string;
  name: string;
  username: string;
  role: UserRole;
  displayName: string | null;
  avatarUrl: string | null;
  permissions: Record<string, boolean>;
  isActive: boolean;
}

export interface RolePermissions {
  [key: string]: boolean;
}

// Define role-based permissions
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
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
  organizer: {
    'create_events': true,
    'manage_own_events': true,
    'moderate_event_content': true,
    'view_event_analytics': true,
    'invite_participants': true,
    'manage_event_rsvps': true
  },
  teacher: {
    'create_events': true,
    'manage_own_events': true,
    'create_educational_content': true,
    'moderate_comments': true,
    'view_student_progress': true
  },
  dancer: {
    'create_posts': true,
    'comment_on_posts': true,
    'rsvp_events': true,
    'join_communities': true,
    'send_messages': true,
    'upload_media': true
  },
  guest: {
    'view_public_content': true,
    'view_public_events': true
  }
};

export class AuthService {
  /**
   * Get user with role information
   */
  async getUserWithRole(userId: number): Promise<UserWithRole | null> {
    try {
      const result = await db
        .select({
          userId: users.id,
          email: users.email,
          name: users.name,
          username: users.username,
          role: userProfiles.role,
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
      const role = (user.role as UserRole) || 'guest';
      
      return {
        id: user.userId,
        email: user.email,
        name: user.name,
        username: user.username,
        role,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        permissions: {
          ...ROLE_PERMISSIONS[role],
          ...(user.permissions as RolePermissions || {})
        },
        isActive: user.isActive ?? true
      };
    } catch (error) {
      console.error('Error getting user with role:', error);
      return null;
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: number, newRole: UserRole, updatedBy: number): Promise<boolean> {
    try {
      // Check if updater has permission to manage roles
      const updater = await this.getUserWithRole(updatedBy);
      if (!updater?.permissions.manage_roles) {
        throw new Error('Insufficient permissions to manage roles');
      }

      // Ensure user profile exists
      await this.ensureUserProfile(userId);

      await db
        .update(userProfiles)
        .set({ 
          role: newRole,
          updatedAt: new Date()
        })
        .where(eq(userProfiles.userId, userId));

      // Log the role change
      await this.logRoleChange(userId, newRole, updatedBy);
      
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      return false;
    }
  }

  /**
   * Check if user has specific permission
   */
  async hasPermission(userId: number, permission: string): Promise<boolean> {
    try {
      const user = await this.getUserWithRole(userId);
      return user?.permissions[permission] || false;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Check if user has any of the specified roles
   */
  async hasRole(userId: number, roles: UserRole[]): Promise<boolean> {
    try {
      const user = await this.getUserWithRole(userId);
      return user ? roles.includes(user.role) : false;
    } catch (error) {
      console.error('Error checking role:', error);
      return false;
    }
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
        // Get user info for display name
        const user = await db
          .select({ name: users.name, username: users.username })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        await db.insert(userProfiles).values({
          userId,
          role: 'guest',
          displayName: user[0]?.name || user[0]?.username || null,
          isActive: true
        });
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error);
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: UserRole, limit = 50): Promise<UserWithRole[]> {
    try {
      const result = await db
        .select({
          userId: users.id,
          email: users.email,
          name: users.name,
          username: users.username,
          role: userProfiles.role,
          displayName: userProfiles.displayName,
          avatarUrl: userProfiles.avatarUrl,
          permissions: userProfiles.permissions,
          isActive: userProfiles.isActive
        })
        .from(users)
        .innerJoin(userProfiles, eq(users.id, userProfiles.userId))
        .where(and(
          eq(userProfiles.role, role),
          eq(userProfiles.isActive, true)
        ))
        .limit(limit);

      return result.map(user => ({
        id: user.userId,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role as UserRole,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        permissions: {
          ...ROLE_PERMISSIONS[role],
          ...(user.permissions as RolePermissions || {})
        },
        isActive: user.isActive ?? true
      }));
    } catch (error) {
      console.error('Error getting users by role:', error);
      return [];
    }
  }

  /**
   * Log role changes for audit trail
   */
  private async logRoleChange(userId: number, newRole: UserRole, updatedBy: number): Promise<void> {
    try {
      // Log to activities table if it exists
      const logData = {
        userId: updatedBy,
        activityType: 'role_change',
        activityData: {
          targetUserId: userId,
          newRole: newRole,
          timestamp: new Date().toISOString()
        }
      };

      // This would log to activities table - implementation depends on your activities schema
      console.log('Role change logged:', logData);
    } catch (error) {
      console.error('Error logging role change:', error);
    }
  }

  /**
   * Set custom permissions for a user
   */
  async setCustomPermissions(userId: number, permissions: RolePermissions, updatedBy: number): Promise<boolean> {
    try {
      const updater = await this.getUserWithRole(updatedBy);
      if (!updater?.permissions.manage_roles) {
        throw new Error('Insufficient permissions to manage permissions');
      }

      await this.ensureUserProfile(userId);

      await db
        .update(userProfiles)
        .set({ 
          permissions,
          updatedAt: new Date()
        })
        .where(eq(userProfiles.userId, userId));

      return true;
    } catch (error) {
      console.error('Error setting custom permissions:', error);
      return false;
    }
  }

  /**
   * Deactivate user account
   */
  async deactivateUser(userId: number, deactivatedBy: number): Promise<boolean> {
    try {
      const updater = await this.getUserWithRole(deactivatedBy);
      if (!updater?.permissions.ban_users) {
        throw new Error('Insufficient permissions to deactivate users');
      }

      await this.ensureUserProfile(userId);

      await db
        .update(userProfiles)
        .set({ 
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(userProfiles.userId, userId));

      return true;
    } catch (error) {
      console.error('Error deactivating user:', error);
      return false;
    }
  }
}

export const authService = new AuthService();