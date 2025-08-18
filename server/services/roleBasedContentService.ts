import { db } from '../db';
import { posts, memories, events, userProfiles, users } from '../../shared/schema';
import { eq, and, or, inArray, desc, sql } from 'drizzle-orm';

interface ContentScore {
  contentId: string;
  score: number;
  reason: string;
}

/**
 * Service for ranking and filtering content based on user roles
 * Implements intelligent content algorithms for different user types
 */
export class RoleBasedContentService {
  
  /**
   * Role-specific content weights for ranking
   */
  private roleContentWeights = {
    // Teachers see more educational content
    teacher: {
      educational: 3.0,
      performance: 1.5,
      social: 1.0,
      workshop: 2.5,
    },
    // Performers see more performance-related content
    performer: {
      educational: 1.0,
      performance: 3.0,
      social: 1.5,
      showcase: 2.5,
    },
    // DJs see more music and event content
    dj: {
      educational: 0.5,
      performance: 1.0,
      social: 2.0,
      milonga: 3.0,
      music: 2.5,
    },
    // Organizers see more event and community content
    organizer: {
      educational: 1.0,
      performance: 1.5,
      social: 2.0,
      event: 3.0,
      community: 2.5,
    },
    // Travelers see more location and tour content
    tango_traveler: {
      educational: 1.0,
      performance: 1.5,
      social: 1.5,
      travel: 3.0,
      location: 2.5,
    },
    // Default weights for dancers
    default: {
      educational: 1.0,
      performance: 1.0,
      social: 1.5,
      milonga: 2.0,
    }
  };

  /**
   * Get personalized content feed based on user roles
   */
  async getPersonalizedFeed(userId: number, limit: number = 20, offset: number = 0) {
    try {
      // Get user's roles
      const [userProfile] = await db
        .select({
          roles: users.tangoRoles,
          primaryRole: userProfiles.primaryRole,
        })
        .from(users)
        .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
        .where(eq(users.id, userId));

      const userRoles = userProfile?.roles || ['dancer'];
      const primaryRole = userProfile?.primaryRole || 'dancer';

      // Get base content
      const baseMemories = await db
        .select({
          id: memories.id,
          content: memories.content,
          userId: memories.userId,
          createdAt: memories.createdAt,
          emotionTags: memories.emotionTags,
          location: memories.location,
        })
        .from(memories)
        .orderBy(desc(memories.createdAt))
        .limit(limit * 2) // Get extra to allow for filtering
        .offset(offset);

      // Score each piece of content
      const scoredContent: ContentScore[] = [];

      for (const memory of baseMemories) {
        let score = 100; // Base score
        const reasons: string[] = [];

        // Apply role-based scoring
        const weights = this.roleContentWeights[primaryRole as keyof typeof this.roleContentWeights] || this.roleContentWeights.default;

        // Check content type from emotion tags and content
        if (memory.emotionTags?.includes('teaching') || memory.content?.toLowerCase().includes('workshop')) {
          score *= weights.educational || 1.0;
          reasons.push('Educational content');
        }

        if (memory.emotionTags?.includes('performing') || memory.content?.toLowerCase().includes('performance')) {
          score *= weights.performance || 1.0;
          reasons.push('Performance content');
        }

        if (memory.location && primaryRole === 'tango_traveler') {
          score *= weights.travel || 1.0;
          reasons.push('Travel content');
        }

        // Boost recent content
        const ageInDays = (Date.now() - new Date(memory.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        const recencyBoost = Math.max(0, 1 - (ageInDays / 30)); // Decay over 30 days
        score *= (1 + recencyBoost * 0.5);

        scoredContent.push({
          contentId: memory.id,
          score,
          reason: reasons.join(' • '),
        });
      }

      // Sort by score and return top items
      const sortedIds = scoredContent
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.contentId);

      // Return memories in score order
      return baseMemories
        .filter(m => sortedIds.includes(m.id))
        .sort((a, b) => sortedIds.indexOf(a.id) - sortedIds.indexOf(b.id));

    } catch (error) {
      console.error('Error getting personalized feed:', error);
      return [];
    }
  }

  /**
   * Get role-specific event recommendations
   */
  async getEventRecommendations(userId: number, userRoles: string[], limit: number = 10) {
    try {
      // Define event type preferences by role
      const roleEventPreferences: Record<string, string[]> = {
        teacher: ['workshop', 'class', 'seminar', 'intensive'],
        performer: ['showcase', 'competition', 'festival', 'show'],
        dj: ['milonga', 'practica', 'marathon', 'festival'],
        organizer: ['milonga', 'festival', 'workshop', 'social'],
        tango_traveler: ['festival', 'marathon', 'tour', 'retreat'],
        musician: ['concert', 'live music', 'orchestra', 'performance'],
        photographer: ['photoshoot', 'festival', 'showcase', 'event'],
      };

      // Build query conditions based on user roles
      const preferences: string[] = [];
      for (const role of userRoles) {
        if (roleEventPreferences[role]) {
          preferences.push(...roleEventPreferences[role]);
        }
      }

      // Get upcoming events with role-based filtering
      const recommendedEvents = await db
        .select()
        .from(events)
        .where(
          and(
            sql`${events.startDate} > NOW()`,
            preferences.length > 0
              ? or(...preferences.map(pref => 
                  sql`LOWER(${events.eventType}) LIKE ${'%' + pref + '%'}`
                ))
              : undefined
          )
        )
        .orderBy(events.startDate)
        .limit(limit);

      return recommendedEvents;
    } catch (error) {
      console.error('Error getting event recommendations:', error);
      return [];
    }
  }
}

export const roleBasedContentService = new RoleBasedContentService();