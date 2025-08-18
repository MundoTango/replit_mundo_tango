import { storage } from '../storage';

export class ProfessionalGroupAssignmentService {
  private static roleToGroupMap: Record<string, string> = {
    'teacher': 'teachers-network',
    'dj': 'djs-united',
    'musician': 'musicians-guild',
    'organizer': 'organizers-hub',
    'host': 'hosts-alliance',
    'guide': 'guides-network',
    'photographer': 'photographers-circle',
    'content_creator': 'content-creators',
    'tango_traveler': 'tango-travelers',
    'tour_operator': 'tour-operators',
    'volunteer': 'volunteers-united',
    'historian': 'historians-society',
    'singer': 'singers-association',
    'taxi_dancer': 'taxi-dancers-network',
    'dancer_leader': 'dance-leaders-forum',
    'dancer_follower': 'dance-followers-forum',
    'dancer_switch': 'switch-dancers-group',
    'tango_school': 'tango-schools-network',
    'tango_house': 'tango-houses-association',
    'performer': 'performers-guild',
    'dancer': 'dancers-community'
  };

  /**
   * Assign user to professional groups based on their tango roles
   */
  static async assignByRoles(userId: number, roles: string[]): Promise<{
    success: boolean;
    assignedGroups: string[];
    errors: string[];
  }> {
    console.log(`🎯 Assigning user ${userId} to professional groups based on roles:`, roles);
    
    const assignedGroups: string[] = [];
    const errors: string[] = [];

    if (!roles || roles.length === 0) {
      return { success: true, assignedGroups: [], errors: [] };
    }

    for (const role of roles) {
      const groupSlug = this.roleToGroupMap[role];
      
      if (!groupSlug) {
        console.log(`⚠️ No professional group mapping for role: ${role}`);
        continue;
      }

      try {
        // Get the group by slug
        const group = await storage.getGroupBySlug(groupSlug);
        
        if (!group) {
          errors.push(`Professional group not found: ${groupSlug}`);
          continue;
        }

        // Check if user is already in the group
        const isUserInGroup = await storage.checkUserInGroup(group.id, userId);
        
        if (isUserInGroup) {
          console.log(`⏭️ User ${userId} already in group: ${group.name}`);
          assignedGroups.push(group.name);
          continue;
        }

        // Add user to group
        await storage.addUserToGroup(group.id, userId, 'member');
        assignedGroups.push(group.name);
        console.log(`✅ Added user ${userId} to professional group: ${group.name}`);
      } catch (error) {
        console.error(`❌ Failed to assign user to group ${groupSlug}:`, error);
        errors.push(`Failed to assign to ${groupSlug}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return {
      success: errors.length === 0,
      assignedGroups,
      errors
    };
  }

  /**
   * Handle professional group assignment during registration
   */
  static async handleRegistration(userId: number, tangoRoles?: string[]): Promise<void> {
    if (!tangoRoles || tangoRoles.length === 0) {
      console.log(`No tango roles provided for user ${userId}, skipping professional group assignment`);
      return;
    }

    try {
      const result = await this.assignByRoles(userId, tangoRoles);
      
      if (result.success) {
        console.log(`🎉 Successfully assigned user ${userId} to ${result.assignedGroups.length} professional groups`);
      } else {
        console.warn(`⚠️ Professional group assignment completed with errors:`, result.errors);
      }
    } catch (error) {
      console.error('Failed to handle professional group assignment:', error);
      // Don't throw - we don't want to fail registration if group assignment fails
    }
  }

  /**
   * Update professional group assignments when user updates their roles
   */
  static async updateRoleAssignments(userId: number, newRoles: string[], oldRoles?: string[]): Promise<void> {
    console.log(`🔄 Updating professional group assignments for user ${userId}`);
    console.log('Old roles:', oldRoles || 'none');
    console.log('New roles:', newRoles);

    // For now, just add to new groups based on new roles
    // In the future, we might want to remove from groups if roles are removed
    await this.handleRegistration(userId, newRoles);
  }
}