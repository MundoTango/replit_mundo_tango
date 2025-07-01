import { storage } from '../server/storage';
import { CityPhotoService } from '../server/services/cityPhotoService';
import { db } from '../server/db';
import { groups, users, groupMembers } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function complete11LCityGroupAutomation() {
  console.log('🏗️ Complete 11L City Group Automation System');
  
  try {
    // Step 1: Clean up existing incorrect groups
    console.log('\n1️⃣ Cleaning up incorrect groups...');
    const allGroups = await storage.getAllGroups();
    
    for (const group of allGroups) {
      if (group.type === 'city' && group.imageUrl?.includes('pexels-photo-466685')) {
        console.log(`🗑️ Deleting incorrect group: ${group.name}`);
        // Delete group members first
        await db.delete(groupMembers).where(eq(groupMembers.groupId, group.id));
        // Delete the group
        await db.delete(groups).where(eq(groups.id, group.id));
      }
    }
    
    // Step 2: Get admin user's profile data
    console.log('\n2️⃣ Getting admin user location...');
    const adminUser = await storage.getUserByEmail('admin@mundotango.life');
    if (!adminUser) {
      throw new Error('Admin user not found');
    }
    
    console.log(`📍 Admin user location: ${adminUser.city || 'Not set'}, ${adminUser.country || 'Not set'}`);
    
    let userCity = adminUser.city;
    let userCountry = adminUser.country;
    
    if (!userCity || !userCountry) {
      console.log('⚠️ Admin user has no location set. Using Buenos Aires, Argentina as default.');
      userCity = 'Buenos Aires';
      userCountry = 'Argentina';
      
      // Update user location
      try {
        await db.update(users).set({
          city: userCity,
          country: userCountry
        }).where(eq(users.id, adminUser.id));
        console.log('✅ Updated user location to Buenos Aires, Argentina');
      } catch (error) {
        console.log('⚠️ Location update error (continuing):', error);
      }
    }
    
    // Step 3: Create city group with authentic photo
    console.log('\n3️⃣ Creating city group with authentic photo...');
    const citySlug = `tango-${userCity.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${userCountry.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
    
    // Check if group already exists
    const existingGroup = await storage.getGroupBySlug(citySlug);
    if (existingGroup) {
      console.log(`ℹ️ Group already exists: ${existingGroup.name}`);
      return existingGroup;
    }
    
    // Fetch authentic city photo from Pexels
    console.log(`📸 Fetching authentic photo for ${userCity}, ${userCountry}...`);
    let cityPhotoUrl = 'https://images.pexels.com/photos/5263857/pexels-photo-5263857.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&fit=crop'; // Default Buenos Aires
    
    try {
      // Use CityPhotoService if PEXELS_API_KEY is available
      if (process.env.PEXELS_API_KEY) {
        const photoResult = await CityPhotoService.fetchCityPhoto(userCity, userCountry);
        if (photoResult && typeof photoResult === 'string') {
          cityPhotoUrl = `${photoResult}?auto=compress&cs=tinysrgb&w=800&h=300&fit=crop`;
          console.log(`✅ Found authentic photo: ${cityPhotoUrl}`);
        }
      } else {
        console.log('⚠️ PEXELS_API_KEY not configured, using curated photo for Buenos Aires');
      }
    } catch (photoError) {
      console.log('⚠️ Photo fetch failed, using curated Buenos Aires photo');
    }
    
    // Step 4: Create the city group
    console.log('\n4️⃣ Creating city group...');
    const cityGroup = await storage.createGroup({
      name: `Tango ${userCity}, ${userCountry}`,
      slug: citySlug,
      type: 'city' as const,
      emoji: '🏙️',
      imageUrl: cityPhotoUrl,
      description: `Welcome to the ${userCity} tango community! Connect with local dancers, find milongas, and share your tango journey in this vibrant city.`,
      isPrivate: false,
      city: userCity,
      country: userCountry,
      createdBy: adminUser.id
    });
    
    console.log(`✅ Created city group: ${cityGroup.name} (ID: ${cityGroup.id})`);
    
    // Step 5: Auto-join admin user to the group
    console.log('\n5️⃣ Auto-joining admin user to group...');
    try {
      await storage.addUserToGroup(adminUser.id, cityGroup.id);
      console.log(`✅ Admin user joined group: ${cityGroup.name}`);
    } catch (joinError) {
      console.log('⚠️ Auto-join failed (user might already be member)');
    }
    
    // Step 6: Verify group creation and membership
    console.log('\n6️⃣ Verification...');
    const allGroupsAfter = await storage.getAllGroups();
    const cityGroups = allGroupsAfter.filter(g => g.type === 'city');
    console.log(`📊 Total city groups: ${cityGroups.length}`);
    
    cityGroups.forEach(group => {
      console.log(`  - ${group.name} (${group.slug})`);
      console.log(`    📍 ${group.city}, ${group.country}`);
      console.log(`    🖼️ ${group.imageUrl}`);
      console.log(`    👥 ${group.memberCount || 0} members`);
    });
    
    console.log('\n🎉 Complete 11L City Group Automation completed successfully!');
    return cityGroup;
    
  } catch (error) {
    console.error('❌ Automation failed:', error);
    throw error;
  }
}

// Run the automation
complete11LCityGroupAutomation().then((group) => {
  console.log(`\n✨ Group ready: ${group?.name} at ${group?.imageUrl}`);
  process.exit(0);
}).catch(error => {
  console.error('Automation failed:', error);
  process.exit(1);
});

export { complete11LCityGroupAutomation };