// Professional Group Automation
// Automatically assigns users to professional groups based on their selected tango roles

import { db } from '../server/db';
import { groups, groupMembers, users } from '../shared/schema';
import { eq, and, inArray } from 'drizzle-orm';

// Mapping of tango roles to professional group names
const ROLE_TO_GROUP_MAPPING = {
  // Dancer is default, no professional group needed
  'Teacher': 'Teachers Network',
  'Instructor': 'Teachers Network',
  'DJ': 'DJs United',
  'Organizer': 'Event Organizers',
  'Performer': 'Performers Guild',
  'Musician': 'Tango Musicians',
  'Singer': 'Tango Musicians',
  'Content Creator': 'Content Creators Hub',
  'Videographer': 'Content Creators Hub',
  'Photographer': 'Content Creators Hub',
  'Blogger': 'Content Creators Hub',
  'Historian': 'Tango History Society',
  'Vendor': 'Tango Marketplace',
  'Designer': 'Tango Marketplace',
  'Venue Owner': 'Venue Owners Network',
  'Tango House': 'Venue Owners Network',
  'Tango School': 'Schools & Academies'
};

// Create professional groups if they don't exist
export async function ensureProfessionalGroups() {
  const groupNames = [...new Set(Object.values(ROLE_TO_GROUP_MAPPING))];
  
  for (const groupName of groupNames) {
    // Check if group exists
    const existingGroup = await db.select()
      .from(groups)
      .where(and(
        eq(groups.name, groupName),
        eq(groups.type, 'professional')
      ))
      .limit(1);
    
    if (existingGroup.length === 0) {
      // Create the professional group
      const slug = groupName.toLowerCase().replace(/\s+/g, '-');
      await db.insert(groups).values({
        name: groupName,
        slug: slug,
        description: `Professional network for ${groupName}`,
        type: 'professional',
        visibility: 'public',
        memberCount: 0,
        createdBy: 1, // System created
        isActive: true
      });
      
      console.log(`✅ Created professional group: ${groupName}`);
    }
  }
}

// Assign user to professional groups based on their roles
export async function assignUserToProfessionalGroups(userId, tangoRoles) {
  if (!tangoRoles || tangoRoles.length === 0) return;
  
  console.log(`🔄 Processing professional group assignments for user ${userId} with roles:`, tangoRoles);
  
  // Ensure professional groups exist
  await ensureProfessionalGroups();
  
  // Map tango roles to professional groups
  const professionalGroupNames = [];
  for (const role of tangoRoles) {
    const groupName = ROLE_TO_GROUP_MAPPING[role];
    if (groupName && !professionalGroupNames.includes(groupName)) {
      professionalGroupNames.push(groupName);
    }
  }
  
  if (professionalGroupNames.length === 0) {
    console.log(`ℹ️ No professional groups to assign for user ${userId}`);
    return;
  }
  
  // Get professional groups
  const professionalGroups = await db.select()
    .from(groups)
    .where(and(
      inArray(groups.name, professionalGroupNames),
      eq(groups.type, 'professional')
    ));
  
  // Assign user to each professional group
  for (const group of professionalGroups) {
    // Check if user is already a member
    const existingMembership = await db.select()
      .from(groupMembers)
      .where(and(
        eq(groupMembers.userId, userId),
        eq(groupMembers.groupId, group.id)
      ))
      .limit(1);
    
    if (existingMembership.length === 0) {
      // Add user to group
      await db.insert(groupMembers).values({
        groupId: group.id,
        userId: userId,
        role: 'member',
        joinedAt: new Date()
      });
      
      // Update member count
      await db.update(groups)
        .set({ memberCount: group.memberCount + 1 })
        .where(eq(groups.id, group.id));
      
      console.log(`✅ Added user ${userId} to professional group: ${group.name}`);
    } else {
      console.log(`ℹ️ User ${userId} already member of professional group: ${group.name}`);
    }
  }
}

// Remove user from professional groups (when roles change)
export async function updateUserProfessionalGroups(userId, newTangoRoles) {
  // Get current professional group memberships
  const currentMemberships = await db.select({
    groupId: groupMembers.groupId,
    groupName: groups.name
  })
    .from(groupMembers)
    .innerJoin(groups, eq(groups.id, groupMembers.groupId))
    .where(and(
      eq(groupMembers.userId, userId),
      eq(groups.type, 'professional')
    ));
  
  // Calculate which groups user should be in
  const shouldBeInGroups = new Set();
  for (const role of newTangoRoles || []) {
    const groupName = ROLE_TO_GROUP_MAPPING[role];
    if (groupName) {
      shouldBeInGroups.add(groupName);
    }
  }
  
  // Remove from groups they shouldn't be in
  for (const membership of currentMemberships) {
    if (!shouldBeInGroups.has(membership.groupName)) {
      await db.delete(groupMembers)
        .where(and(
          eq(groupMembers.userId, userId),
          eq(groupMembers.groupId, membership.groupId)
        ));
      
      // Update member count
      await db.update(groups)
        .set({ memberCount: db.sql`member_count - 1` })
        .where(eq(groups.id, membership.groupId));
      
      console.log(`🗑️ Removed user ${userId} from professional group: ${membership.groupName}`);
    }
  }
  
  // Add to new groups
  await assignUserToProfessionalGroups(userId, newTangoRoles);
}