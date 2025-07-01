#!/usr/bin/env tsx

import { storage } from '../server/storage';
import { slugify, generateCityGroupDescription, logGroupAutomation } from '../utils/cityGroupAutomation';
import { nanoid } from 'nanoid';

async function complete11LCityGroupFlow() {
  console.log('🏗️ Starting complete 11L City Group automation flow...');
  
  try {
    // Get Scott Boddye user data
    const user = await storage.getUser(3);
    
    if (!user) {
      console.error('❌ User not found');
      return;
    }
    
    console.log('👤 Found user:', { 
      id: user.id, 
      name: user.name, 
      city: user.city, 
      country: user.country 
    });
    
    // Create Buenos Aires city group directly
    if (user.city && user.country) {
      console.log(`🏙️ Creating city group for ${user.city}, ${user.country}...`);
      
      const groupName = `Tango ${user.city}, ${user.country}`;
      const groupSlug = slugify(groupName);
      const description = generateCityGroupDescription(user.city, user.country);
      
      // Create the group
      const cityGroup = await storage.createGroup({
        name: groupName,
        slug: groupSlug,
        type: 'city',
        emoji: '🏙️',
        imageUrl: '/uploads/group-photos/fallback-city.jpg',
        description: description,
        isPrivate: false,
        city: user.city,
        country: user.country,
        memberCount: 0,
        createdBy: user.id
      });
      
      console.log('✅ City group created:', {
        id: cityGroup.id,
        name: cityGroup.name,
        slug: cityGroup.slug,
        memberCount: cityGroup.memberCount
      });
      
      // Add user to the group as admin
      console.log('👑 Adding user as admin to group...');
      const membership = await storage.addUserToGroup(cityGroup.id, user.id, 'admin');
      
      // Update member count
      await storage.updateGroupMemberCount(cityGroup.id);
      
      console.log('✅ User added as admin:', {
        userId: membership.userId,
        role: membership.role,
        status: membership.status
      });
      
      // Verify the setup
      const groupWithMembers = await storage.getGroupWithMembers(cityGroup.slug);
      console.log('🔍 Verification - Group with members:', {
        groupId: groupWithMembers.id,
        memberCount: groupWithMembers.members.length,
        members: groupWithMembers.members
      });
      
      // Check membership status
      const isMember = await storage.checkUserInGroup(cityGroup.id, user.id);
      console.log('🔍 Verification - User membership:', isMember);
      
      logGroupAutomation('complete_11l_flow_success', {
        groupId: cityGroup.id,
        userId: user.id,
        city: user.city,
        country: user.country,
        memberCount: groupWithMembers.members.length
      });
      
      console.log('🎉 Complete 11L City Group automation flow completed successfully!');
      
    } else {
      console.error('❌ User missing city/country data');
    }
    
  } catch (error) {
    console.error('❌ Error in complete 11L flow:', error);
    logGroupAutomation('complete_11l_flow_error', {
      userId: 3,
      error: error?.message || 'Unknown error'
    });
  }
}

// Run the automation
complete11LCityGroupFlow()
  .then(() => {
    console.log('✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });