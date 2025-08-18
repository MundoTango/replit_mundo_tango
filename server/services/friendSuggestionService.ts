import { db } from '../db';
import { users, follows, groupMembers, userProfiles, posts, eventParticipants } from '../../shared/schema';
import { eq, and, notInArray, ne, sql, inArray, desc } from 'drizzle-orm';

interface FriendSuggestion {
  userId: number;
  username: string;
  name: string;
  profileImage: string | null;
  city: string | null;
  tangoRoles: string[] | null;
  mutualFriendsCount: number;
  commonGroupsCount: number;
  commonEventsCount: number;
  score: number;
  reason: string;
}

export class FriendSuggestionService {
  /**
   * Generate friend suggestions for a user based on multiple factors:
   * 1. Same city (highest weight)
   * 2. Common groups (professional and city)
   * 3. Mutual friends
   * 4. Same roles/interests
   * 5. Common event attendance
   */
  async getSuggestions(userId: number, limit: number = 20): Promise<FriendSuggestion[]> {
    try {
      // Get current user's data
      const [currentUser] = await db
        .select({
          city: users.city,
          tangoRoles: users.tangoRoles,
        })
        .from(users)
        .where(eq(users.id, userId));

      if (!currentUser) {
        return [];
      }

      // Get users the current user already follows
      const following = await db
        .select({ followingId: follows.followingId })
        .from(follows)
        .where(eq(follows.followerId, userId));

      const followingIds = following.map(f => f.followingId);
      followingIds.push(userId); // Exclude self

      // Get all potential friend candidates
      const candidates = await db
        .select({
          id: users.id,
          username: users.username,
          name: users.name,
          profileImage: users.profileImage,
          city: users.city,
          tangoRoles: users.tangoRoles,
        })
        .from(users)
        .where(
          and(
            notInArray(users.id, followingIds),
            eq(users.isActive, true)
          )
        );

      // Calculate scores for each candidate
      const suggestions: FriendSuggestion[] = [];

      for (const candidate of candidates) {
        let score = 0;
        const reasons: string[] = [];

        // 1. Same city (40 points)
        if (currentUser.city && candidate.city === currentUser.city) {
          score += 40;
          reasons.push(`Lives in ${candidate.city}`);
        }

        // 2. Mutual friends (up to 30 points)
        const mutualFriendsQuery = await db
          .select({ count: sql<number>`count(*)` })
          .from(follows)
          .where(
            and(
              eq(follows.followingId, candidate.id),
              inArray(follows.followerId, followingIds.filter(id => id !== userId))
            )
          );
        
        const mutualFriendsCount = Number(mutualFriendsQuery[0]?.count || 0);
        if (mutualFriendsCount > 0) {
          score += Math.min(mutualFriendsCount * 5, 30);
          reasons.push(`${mutualFriendsCount} mutual friend${mutualFriendsCount > 1 ? 's' : ''}`);
        }

        // 3. Common groups (up to 20 points)
        const userGroups = await db
          .select({ groupId: groupMembers.groupId })
          .from(groupMembers)
          .where(eq(groupMembers.userId, userId));

        const userGroupIds = userGroups.map(g => g.groupId);

        if (userGroupIds.length > 0) {
          const commonGroupsQuery = await db
            .select({ count: sql<number>`count(*)` })
            .from(groupMembers)
            .where(
              and(
                eq(groupMembers.userId, candidate.id),
                inArray(groupMembers.groupId, userGroupIds)
              )
            );

          const commonGroupsCount = Number(commonGroupsQuery[0]?.count || 0);
          if (commonGroupsCount > 0) {
            score += Math.min(commonGroupsCount * 10, 20);
            reasons.push(`${commonGroupsCount} common group${commonGroupsCount > 1 ? 's' : ''}`);
          }
        }

        // 4. Similar roles (up to 10 points)
        if (currentUser.tangoRoles && candidate.tangoRoles) {
          const commonRoles = currentUser.tangoRoles.filter(role => 
            candidate.tangoRoles?.includes(role)
          );
          if (commonRoles.length > 0) {
            score += Math.min(commonRoles.length * 5, 10);
            reasons.push(`Also ${commonRoles.join(', ')}`);
          }
        }

        // 5. Common events attended (bonus points)
        const userEvents = await db
          .select({ eventId: eventParticipants.eventId })
          .from(eventParticipants)
          .where(eq(eventParticipants.userId, userId));

        const userEventIds = userEvents.map(e => e.eventId);

        if (userEventIds.length > 0) {
          const commonEventsQuery = await db
            .select({ count: sql<number>`count(*)` })
            .from(eventParticipants)
            .where(
              and(
                eq(eventParticipants.userId, candidate.id),
                inArray(eventParticipants.eventId, userEventIds)
              )
            );

          const commonEventsCount = Number(commonEventsQuery[0]?.count || 0);
          if (commonEventsCount > 0) {
            score += commonEventsCount * 2;
            reasons.push(`${commonEventsCount} events together`);
          }
        }

        if (score > 0) {
          suggestions.push({
            userId: candidate.id,
            username: candidate.username,
            name: candidate.name,
            profileImage: candidate.profileImage,
            city: candidate.city,
            tangoRoles: candidate.tangoRoles,
            mutualFriendsCount,
            commonGroupsCount: 0, // Set from query above
            commonEventsCount: 0, // Set from query above
            score,
            reason: reasons.join(' • '),
          });
        }
      }

      // Sort by score and return top suggestions
      return suggestions
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    } catch (error) {
      console.error('Error generating friend suggestions:', error);
      return [];
    }
  }

  /**
   * Get quick suggestions for new users (city-based only)
   */
  async getQuickSuggestionsForNewUser(userId: number, city: string | null, limit: number = 10): Promise<FriendSuggestion[]> {
    if (!city) return [];

    try {
      const suggestions = await db
        .select({
          id: users.id,
          username: users.username,
          name: users.name,
          profileImage: users.profileImage,
          city: users.city,
          tangoRoles: users.tangoRoles,
        })
        .from(users)
        .where(
          and(
            ne(users.id, userId),
            eq(users.city, city),
            eq(users.isActive, true)
          )
        )
        .limit(limit);

      return suggestions.map(user => ({
        userId: user.id,
        username: user.username,
        name: user.name,
        profileImage: user.profileImage,
        city: user.city,
        tangoRoles: user.tangoRoles,
        mutualFriendsCount: 0,
        commonGroupsCount: 0,
        commonEventsCount: 0,
        score: 40, // City match score
        reason: `Lives in ${city}`,
      }));
    } catch (error) {
      console.error('Error getting quick suggestions:', error);
      return [];
    }
  }
}

export const friendSuggestionService = new FriendSuggestionService();