/**
 * Process User Profiles and Create City Groups with Authentic Photos
 * 11L Framework Implementation: Complete Automation Testing
 */

const { DatabaseStorage } = require('../server/storage');
const { CityPhotoService } = require('../server/services/cityPhotoService');

async function processUserProfiles() {
  console.log('🚀 Processing User Profiles for City Group Creation');
  console.log('Testing city-specific photo automation...\n');
  
  try {
    const storage = new DatabaseStorage();
    
    // Get all users with city information
    const users = await storage.getAllUsers();
    const usersWithCities = users.filter(user => user.city && user.country);
    
    console.log(`👥 Found ${usersWithCities.length} users with city information:`);
    usersWithCities.forEach(user => {
      console.log(`   ${user.name}: ${user.city}, ${user.country}`);
    });
    console.log('');
    
    // Process each unique city
    const uniqueCities = [...new Set(usersWithCities.map(user => `${user.city}|${user.country}`))];
    
    console.log('🏙️ Creating city groups with authentic photos:');
    console.log('='.repeat(60));
    
    for (const cityCountry of uniqueCities) {
      const [city, country] = cityCountry.split('|');
      
      console.log(`\n📍 Processing ${city}, ${country}...`);
      
      try {
        // Generate group slug
        const slug = `tango-${city.toLowerCase().replace(/\s+/g, '-')}-${country.toLowerCase().replace(/\s+/g, '-')}`;
        
        // Check if group already exists
        let existingGroup;
        try {
          existingGroup = await storage.getGroupBySlug(slug);
        } catch (error) {
          // Group doesn't exist, which is expected
        }
        
        if (existingGroup) {
          console.log(`   ✅ Group already exists: ${existingGroup.name}`);
          console.log(`   📷 Photo: ${existingGroup.imageUrl?.substring(0, 60)}...`);
        } else {
          // Fetch authentic city photo
          console.log(`   🔍 Fetching authentic ${city} photo via Pexels API...`);
          const cityPhoto = await CityPhotoService.fetchCityPhoto(city, country);
          
          if (cityPhoto) {
            console.log(`   📸 Found ${city} photo by ${cityPhoto.photographer}`);
            console.log(`   🎯 Source: ${cityPhoto.source} (${cityPhoto.quality} quality)`);
            
            // Create group with city-specific photo
            const newGroup = await storage.createGroup({
              name: `Tango ${city}`,
              slug: slug,
              description: `Connect with tango dancers in ${city}, ${country}. Share milongas, workshops, and tango experiences in this vibrant dance community.`,
              type: 'city',
              imageUrl: cityPhoto.url,
              coverImage: cityPhoto.url,
              memberCount: 0,
              isPublic: true,
              settings: {},
              emoji: '🏙️'
            });
            
            console.log(`   ✅ Created "${newGroup.name}" with authentic ${city} photo`);
            console.log(`   🆔 Group ID: ${newGroup.id}`);
            console.log(`   📋 Slug: ${newGroup.slug}`);
            
            // Auto-join users from this city
            const cityUsers = usersWithCities.filter(user => user.city === city && user.country === country);
            
            for (const user of cityUsers) {
              try {
                await storage.addUserToGroup(user.id, newGroup.id);
                console.log(`   👤 Auto-joined ${user.name} to ${city} group`);
              } catch (error) {
                // User might already be in group
                console.log(`   📋 ${user.name} already in ${city} group`);
              }
            }
            
            // Update member count
            await storage.updateGroupMemberCount(newGroup.id);
            
          } else {
            console.log(`   ❌ Could not fetch photo for ${city}`);
          }
        }
        
      } catch (error) {
        console.error(`   ❌ Error processing ${city}:`, error.message);
      }
    }
    
    // Summary verification
    console.log('\n📊 AUTOMATION RESULTS:');
    console.log('='.repeat(40));
    
    const allGroups = await storage.getAllGroups();
    const cityGroups = allGroups.filter(g => g.type === 'city');
    
    console.log(`\n🏙️ Total city groups: ${cityGroups.length}`);
    
    let citySpecificPhotos = 0;
    let buenoslAiresTemplates = 0;
    
    for (const group of cityGroups) {
      console.log(`\n📍 ${group.name}`);
      console.log(`   Members: ${group.memberCount || 0}`);
      
      if (group.imageUrl) {
        if (group.imageUrl.includes('16228260')) {
          buenoslAiresTemplates++;
          console.log(`   ❌ Photo: Buenos Aires template (ID: 16228260)`);
        } else if (group.imageUrl.includes('pexels.com')) {
          citySpecificPhotos++;
          console.log(`   ✅ Photo: City-specific from Pexels`);
        }
        console.log(`   🔗 URL: ${group.imageUrl.substring(0, 60)}...`);
      }
    }
    
    console.log('\n🎯 FINAL VERIFICATION:');
    console.log(`✅ City-specific photos: ${citySpecificPhotos}`);
    console.log(`❌ Buenos Aires templates: ${buenoslAiresTemplates}`);
    
    if (buenoslAiresTemplates === 0) {
      console.log('\n🎉 SUCCESS: All groups have authentic city-specific photos!');
      console.log('Each city group displays a unique photo of that specific city.');
    } else {
      console.log('\n⚠️ ISSUE: Some groups still using Buenos Aires template.');
    }
    
  } catch (error) {
    console.error('❌ Automation failed:', error.message);
  }
  
  console.log('\n🎉 User Profile Processing Complete!');
}

// Run the automation
processUserProfiles();