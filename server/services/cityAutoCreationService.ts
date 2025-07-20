import { db } from '../db';
import { groups, groupMembers, users } from '@shared/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { CityNormalizationService, CityInfo } from './cityNormalizationService';
import { CityPhotoService } from './cityPhotoService';
// import { NotificationService } from './notificationService';

export interface CityGroupCreationResult {
  group: any;
  isNew: boolean;
  adminAssigned?: boolean;
  userJoined?: boolean;
}

export class CityAutoCreationService {
  /**
   * Handle city group creation triggered by user registration
   */
  static async handleUserRegistration(
    userId: number, 
    cityInput: string, 
    country: string,
    state?: string
  ): Promise<CityGroupCreationResult> {
    console.log(`🏙️ Handling city auto-creation for user ${userId}: ${cityInput}, ${country}`);
    
    try {
      // Normalize the city name
      const normResult = await CityNormalizationService.normalizeCity(cityInput, country, state);
      const cityInfo = normResult.cityInfo;
      
      // Find or create the city group
      const result = await this.findOrCreateCityGroup(cityInfo, 'registration', userId, userId);
      
      // Auto-join user to their city group
      if (result.isNew || !(await this.isUserInGroup(userId, result.group.id))) {
        await this.joinUserToGroup(userId, result.group.id);
        result.userJoined = true;
      }
      
      // Check if user should be admin (first 5 users)
      if (await this.shouldBeAdmin(userId, result.group.id)) {
        await this.assignAdmin(userId, result.group.id);
        result.adminAssigned = true;
        
        // Notify user they're a city admin
        await NotificationService.notify(userId, {
          type: 'role_assignment',
          title: 'You are now a City Admin!',
          message: `Congratulations! You're one of the first members of ${cityInfo.city} and have been made a city admin.`,
          link: `/groups/${result.group.slug}`
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error in handleUserRegistration:', error);
      throw error;
    }
  }

  /**
   * Handle city group creation triggered by recommendation
   */
  static async handleRecommendation(
    recommendationId: number,
    cityInput: string,
    country: string,
    createdBy: number
  ): Promise<CityGroupCreationResult> {
    console.log(`🏙️ Handling city auto-creation from recommendation ${recommendationId}: ${cityInput}, ${country}`);
    
    try {
      const normResult = await CityNormalizationService.normalizeCity(cityInput, country);
      const cityInfo = normResult.cityInfo;
      
      const result = await this.findOrCreateCityGroup(cityInfo, 'recommendation', recommendationId, createdBy);
      
      // Auto-join the recommendation creator if not already a member
      if (!(await this.isUserInGroup(createdBy, result.group.id))) {
        await this.joinUserToGroup(createdBy, result.group.id);
        result.userJoined = true;
      }
      
      return result;
    } catch (error) {
      console.error('Error in handleRecommendation:', error);
      throw error;
    }
  }

  /**
   * Handle city group creation triggered by event
   */
  static async handleEvent(
    eventId: number,
    cityInput: string,
    country: string,
    createdBy: number
  ): Promise<CityGroupCreationResult> {
    console.log(`🏙️ Handling city auto-creation from event ${eventId}: ${cityInput}, ${country}`);
    
    try {
      const normResult = await CityNormalizationService.normalizeCity(cityInput, country);
      const cityInfo = normResult.cityInfo;
      
      const result = await this.findOrCreateCityGroup(cityInfo, 'event', eventId, createdBy);
      
      // Auto-join the event creator if not already a member
      if (!(await this.isUserInGroup(createdBy, result.group.id))) {
        await this.joinUserToGroup(createdBy, result.group.id);
        result.userJoined = true;
      }
      
      return result;
    } catch (error) {
      console.error('Error in handleEvent:', error);
      throw error;
    }
  }

  /**
   * Find existing city group or create new one
   */
  private static async findOrCreateCityGroup(
    cityInfo: CityInfo,
    triggerType: string,
    triggerId: number,
    createdBy: number
  ): Promise<CityGroupCreationResult> {
    // Check if group already exists
    const existing = await db
      .select()
      .from(groups)
      .where(
        and(
          eq(groups.type, 'city'),
          eq(groups.city, cityInfo.city),
          eq(groups.country, cityInfo.country)
        )
      )
      .limit(1);
    
    if (existing.length > 0) {
      console.log(`✅ City group already exists: ${cityInfo.city}, ${cityInfo.country}`);
      return {
        group: existing[0],
        isNew: false
      };
    }
    
    // Create new city group
    console.log(`🆕 Creating new city group: ${cityInfo.city}, ${cityInfo.country}`);
    const newGroup = await this.createCityGroup(cityInfo);
    
    // Log the creation
    await this.logCreation(newGroup.id, triggerType, triggerId, createdBy, cityInfo);
    
    return {
      group: newGroup,
      isNew: true
    };
  }

  /**
   * Create a new city group
   */
  private static async createCityGroup(cityInfo: CityInfo): Promise<any> {
    const slug = this.generateSlug(cityInfo);
    
    // Create the group
    const [newGroup] = await db
      .insert(groups)
      .values({
        name: `${cityInfo.city}, ${cityInfo.country}`,
        slug: slug,
        type: 'city',
        city: cityInfo.city,
        state: cityInfo.state,
        country: cityInfo.country,
        description: `Welcome to the ${cityInfo.city} tango community! Share events, find dance partners, and discover the best milongas in town.`,
        emoji: '🏙️',
        isPrivate: false,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    // Fetch and set city photo asynchronously
    this.updateCityPhoto(newGroup.id, cityInfo).catch(console.error);
    
    return newGroup;
  }

  /**
   * Generate URL-safe slug for city group
   */
  private static generateSlug(cityInfo: CityInfo): string {
    const base = `${cityInfo.city}-${cityInfo.country}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    return base;
  }

  /**
   * Update city photo from Pexels API
   */
  private static async updateCityPhoto(groupId: number, cityInfo: CityInfo): Promise<void> {
    try {
      const photoUrl = await CityPhotoService.fetchCityPhoto(cityInfo.city, cityInfo.country);
      if (photoUrl) {
        await db
          .update(groups)
          .set({
            imageUrl: photoUrl,
            coverImage: photoUrl,
            updatedAt: new Date()
          })
          .where(eq(groups.id, groupId));
      }
    } catch (error) {
      console.error('Error updating city photo:', error);
    }
  }

  /**
   * Check if user is already in group
   */
  private static async isUserInGroup(userId: number, groupId: number): Promise<boolean> {
    const membership = await db
      .select()
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.userId, userId),
          eq(groupMembers.groupId, groupId)
        )
      )
      .limit(1);
    
    return membership.length > 0;
  }

  /**
   * Join user to group
   */
  private static async joinUserToGroup(userId: number, groupId: number): Promise<void> {
    await db
      .insert(groupMembers)
      .values({
        userId,
        groupId,
        role: 'member',
        joinedAt: new Date()
      })
      .onConflictDoNothing(); // Prevent duplicate joins
  }

  /**
   * Check if user should be admin (first 5 members)
   */
  private static async shouldBeAdmin(userId: number, groupId: number): Promise<boolean> {
    // Count existing admins
    const adminCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.role, 'admin')
        )
      );
    
    return Number(adminCount[0]?.count || 0) < 5;
  }

  /**
   * Assign admin role to user
   */
  private static async assignAdmin(userId: number, groupId: number): Promise<void> {
    await db
      .update(groupMembers)
      .set({
        role: 'admin',
        updatedAt: new Date()
      })
      .where(
        and(
          eq(groupMembers.userId, userId),
          eq(groupMembers.groupId, groupId)
        )
      );
  }

  /**
   * Log city group creation
   */
  private static async logCreation(
    groupId: number,
    triggerType: string,
    triggerId: number,
    createdBy: number,
    cityInfo: CityInfo
  ): Promise<void> {
    // TODO: Implement proper logging with Drizzle
    console.log('City group creation logged:', {
      groupId,
      triggerType,
      triggerId,
      createdBy,
      cityInfo
    });
  }

  /**
   * Get city group creation statistics
   */
  static async getCreationStats(): Promise<any> {
    // TODO: Implement proper stats with Drizzle
    const cityGroups = await db
      .select({
        count: sql<number>`count(*)`.as('count')
      })
      .from(groups)
      .where(eq(groups.type, 'city'));
    
    return {
      total_created: cityGroups[0]?.count || 0,
      created_today: 0,
      created_this_week: 0,
      created_this_month: 0,
      last_created_at: new Date()
    };
  }
}