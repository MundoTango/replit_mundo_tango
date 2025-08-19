import { db } from '../db';
import { notifications, userProfiles, users } from '../../shared/schema';
import { eq, and, inArray } from 'drizzle-orm';

interface NotificationPreference {
  type: string;
  enabled: boolean;
  channels: ('in_app' | 'email' | 'push')[];
}

interface RoleNotificationPreferences {
  [role: string]: NotificationPreference[];
}

/**
 * Service for managing role-based notification preferences
 * Different roles have different default notification settings
 */
export class NotificationPreferencesService {
  
  /**
   * Default notification preferences by role
   */
  private defaultPreferencesByRole: RoleNotificationPreferences = {
    teacher: [
      { type: 'class_booking', enabled: true, channels: ['in_app', 'email'] },
      { type: 'student_question', enabled: true, channels: ['in_app', 'push'] },
      { type: 'workshop_reminder', enabled: true, channels: ['email'] },
      { type: 'review_received', enabled: true, channels: ['in_app'] },
      { type: 'payment_received', enabled: true, channels: ['email'] },
    ],
    performer: [
      { type: 'show_invitation', enabled: true, channels: ['in_app', 'email', 'push'] },
      { type: 'performance_review', enabled: true, channels: ['in_app'] },
      { type: 'festival_announcement', enabled: true, channels: ['email'] },
      { type: 'booking_request', enabled: true, channels: ['in_app', 'push'] },
    ],
    dj: [
      { type: 'gig_request', enabled: true, channels: ['in_app', 'email', 'push'] },
      { type: 'playlist_feedback', enabled: true, channels: ['in_app'] },
      { type: 'milonga_invitation', enabled: true, channels: ['email'] },
      { type: 'music_request', enabled: true, channels: ['in_app'] },
    ],
    organizer: [
      { type: 'event_registration', enabled: true, channels: ['in_app', 'email'] },
      { type: 'venue_update', enabled: true, channels: ['push'] },
      { type: 'attendee_feedback', enabled: true, channels: ['in_app'] },
      { type: 'payment_update', enabled: true, channels: ['email'] },
      { type: 'staff_message', enabled: true, channels: ['in_app', 'push'] },
    ],
    host: [
      { type: 'booking_request', enabled: true, channels: ['in_app', 'email', 'push'] },
      { type: 'guest_message', enabled: true, channels: ['in_app', 'push'] },
      { type: 'review_received', enabled: true, channels: ['in_app', 'email'] },
      { type: 'payment_received', enabled: true, channels: ['email'] },
    ],
    tango_traveler: [
      { type: 'tour_update', enabled: true, channels: ['in_app', 'email', 'push'] },
      { type: 'local_event', enabled: true, channels: ['in_app'] },
      { type: 'travel_tip', enabled: true, channels: ['email'] },
      { type: 'group_activity', enabled: true, channels: ['in_app', 'push'] },
    ],
    default: [
      { type: 'friend_request', enabled: true, channels: ['in_app'] },
      { type: 'event_reminder', enabled: true, channels: ['in_app', 'push'] },
      { type: 'message_received', enabled: true, channels: ['in_app'] },
      { type: 'post_liked', enabled: false, channels: ['in_app'] },
      { type: 'comment_received', enabled: true, channels: ['in_app'] },
    ]
  };

  /**
   * Get notification preferences for a user based on their roles
   */
  async getUserNotificationPreferences(userId: number): Promise<NotificationPreference[]> {
    try {
      // Get user's roles
      const [user] = await db
        .select({
          roles: users.tangoRoles,
          primaryRole: userProfiles.primaryRole,
        })
        .from(users)
        .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
        .where(eq(users.id, userId));

      if (!user) {
        return this.defaultPreferencesByRole.default;
      }

      // Merge preferences from all user roles
      const allPreferences: Map<string, NotificationPreference> = new Map();
      
      // Start with default preferences
      this.defaultPreferencesByRole.default.forEach(pref => {
        allPreferences.set(pref.type, { ...pref });
      });

      // Add role-specific preferences
      const userRoles = user.roles || [];
      for (const role of userRoles) {
        const rolePreferences = this.defaultPreferencesByRole[role];
        if (rolePreferences) {
          rolePreferences.forEach(pref => {
            if (allPreferences.has(pref.type)) {
              // Merge channels if preference already exists
              const existing = allPreferences.get(pref.type)!;
              const mergedChannels = Array.from(new Set([...existing.channels, ...pref.channels]));
              allPreferences.set(pref.type, {
                ...pref,
                channels: mergedChannels as ('in_app' | 'email' | 'push')[],
              });
            } else {
              allPreferences.set(pref.type, { ...pref });
            }
          });
        }
      }

      return Array.from(allPreferences.values());
    } catch (error) {
      console.error('Error getting user notification preferences:', error);
      return this.defaultPreferencesByRole.default;
    }
  }

  /**
   * Check if a user should receive a specific notification type
   */
  async shouldNotify(
    userId: number, 
    notificationType: string, 
    channel: 'in_app' | 'email' | 'push' = 'in_app'
  ): Promise<boolean> {
    try {
      const preferences = await this.getUserNotificationPreferences(userId);
      const preference = preferences.find(p => p.type === notificationType);
      
      if (!preference) {
        // If no specific preference, check if it's a default type
        return channel === 'in_app'; // Default to in-app only
      }

      return preference.enabled && preference.channels.includes(channel);
    } catch (error) {
      console.error('Error checking notification preference:', error);
      return channel === 'in_app'; // Safe default
    }
  }

  /**
   * Send notification if user preferences allow
   */
  async sendNotificationIfEnabled(
    userId: number,
    type: string,
    title: string,
    message: string,
    relatedId?: string,
    relatedType?: string
  ): Promise<boolean> {
    try {
      // Check if in-app notifications are enabled for this type
      if (!await this.shouldNotify(userId, type, 'in_app')) {
        return false;
      }

      // Create the notification
      await db.insert(notifications).values({
        userId,
        type,
        title,
        message,
        relatedId,
        relatedType,
        isRead: false,
      });

      // TODO: Check email/push preferences and send accordingly
      // if (await this.shouldNotify(userId, type, 'email')) {
      //   await emailService.send(...);
      // }

      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }
}

export const notificationPreferencesService = new NotificationPreferencesService();