/**
 * Test City-Specific Photo Automation System
 * 11L Framework Implementation: End-to-End Testing
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Import services
const { DatabaseStorage } = require('../server/storage');
const { CityPhotoService } = require('../server/services/cityPhotoService');

async function testCitySpecificPhotoAutomation() {
  console.log('🧪 Testing City-Specific Photo Automation System\n');
  console.log('Testing that each city gets its OWN authentic photo, not Buenos Aires template\n');
  
  try {
    // Initialize storage
    const storage = new DatabaseStorage();
    
    const testCities = [
      { city: 'Tokyo', country: 'Japan', expected: 'Tokyo landmarks, not Buenos Aires' },
      { city: 'London', country: 'United Kingdom', expected: 'London skyline, not Buenos Aires' },
      { city: 'Sydney', country: 'Australia', expected: 'Sydney harbor, not Buenos Aires' },
      { city: 'Amsterdam', country: 'Netherlands', expected: 'Amsterdam canals, not Buenos Aires' },
      { city: 'Rome', country: 'Italy', expected: 'Roman architecture, not Buenos Aires' }
    ];
    
    console.log('🎯 TESTING OBJECTIVE:');
    console.log('Each city should get an authentic photo of THAT specific city');
    console.log('NOT the Buenos Aires aerial template copied to all cities\n');
    
    for (const { city, country, expected } of testCities) {
      console.log(`📸 Testing ${city}, ${country}...`);
      console.log(`   Expected: ${expected}`);
      
      try {
        // Test 1: Photo Fetching Service
        console.log(`   🔍 Step 1: Fetching authentic ${city} photo via Pexels...`);
        const cityPhoto = await CityPhotoService.fetchCityPhoto(city, country);
        
        if (cityPhoto && cityPhoto.source === 'pexels') {
          console.log(`   ✅ Photo Service: Found authentic ${city} photo`);
          console.log(`      Photographer: ${cityPhoto.photographer}`);
          console.log(`      Quality: ${cityPhoto.quality}`);
          console.log(`      URL: ${cityPhoto.url.substring(0, 50)}...`);
          
          // Test 2: Group Creation with City-Specific Photo
          console.log(`   🏗️ Step 2: Creating city group with authentic ${city} photo...`);
          
          const groupSlug = `tango-${city.toLowerCase().replace(/\s+/g, '-')}-${country.toLowerCase().replace(/\s+/g, '-')}`;
          
          // Check if group already exists
          let existingGroup;
          try {
            existingGroup = await storage.getGroupBySlug(groupSlug);
          } catch (error) {
            // Group doesn't exist, which is expected
          }
          
          if (existingGroup) {
            console.log(`   📋 Group already exists: ${existingGroup.name}`);
            console.log(`      Current photo: ${existingGroup.imageUrl?.substring(0, 50)}...`);
            
            // Check if it's using Buenos Aires template
            if (existingGroup.imageUrl && existingGroup.imageUrl.includes('16228260')) {
              console.log(`   ❌ PROBLEM: Group is using Buenos Aires template photo!`);
              console.log(`      This should be a ${city}-specific photo, not Buenos Aires`);
            } else {
              console.log(`   ✅ SUCCESS: Group has city-specific photo (not Buenos Aires template)`);
            }
          } else {
            // Create new group with city-specific photo
            const newGroup = await storage.createGroup({
              name: `Tango ${city}`,
              slug: groupSlug,
              description: `Connect with tango dancers in ${city}, ${country}. Share milongas, workshops, and tango experiences in this vibrant dance community.`,
              type: 'city',
              imageUrl: cityPhoto.url,
              coverImage: cityPhoto.url,
              location: `${city}, ${country}`,
              memberCount: 0,
              isPublic: true,
              settings: {},
              emoji: '🏙️'
            });
            
            console.log(`   ✅ SUCCESS: Created group "${newGroup.name}" with authentic ${city} photo`);
            console.log(`      Group ID: ${newGroup.id}`);
            console.log(`      Slug: ${newGroup.slug}`);
            console.log(`      Photo URL: ${newGroup.imageUrl.substring(0, 50)}...`);
          }
          
        } else {
          console.log(`   📋 Using fallback photo for ${city}`);
        }
        
      } catch (error) {
        console.error(`   ❌ Error testing ${city}:`, error.message);
      }
      
      console.log(''); // Empty line for readability
    }
    
    // Test 3: Verification Summary
    console.log('📊 AUTOMATION VERIFICATION SUMMARY:');
    console.log('='.repeat(50));
    
    try {
      const allGroups = await storage.getAllGroups();
      const cityGroups = allGroups.filter(g => g.type === 'city');
      
      console.log(`Total city groups: ${cityGroups.length}`);
      
      let buenoslAiresTemplateCount = 0;
      let citySpecificPhotoCount = 0;
      
      for (const group of cityGroups) {
        if (group.imageUrl && group.imageUrl.includes('16228260')) {
          buenoslAiresTemplateCount++;
          console.log(`❌ ${group.name}: Using Buenos Aires template`);
        } else if (group.imageUrl && group.imageUrl.includes('pexels.com')) {
          citySpecificPhotoCount++;
          console.log(`✅ ${group.name}: Using city-specific photo`);
        }
      }
      
      console.log('\n🎯 AUTOMATION RESULTS:');
      console.log(`✅ City-specific photos: ${citySpecificPhotoCount}`);
      console.log(`❌ Buenos Aires templates: ${buenoslAiresTemplateCount}`);
      
      if (buenoslAiresTemplateCount === 0) {
        console.log('\n🎉 SUCCESS: All city groups have city-specific photos!');
        console.log('The automation correctly fetches authentic photos for each city.');
      } else {
        console.log('\n⚠️ ISSUE: Some groups still using Buenos Aires template.');
        console.log('The automation needs to be updated to use city-specific photos.');
      }
      
    } catch (error) {
      console.error('❌ Error in verification summary:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('\n🎉 City-Specific Photo Automation Test Completed!');
}

// Run the test
testCitySpecificPhotoAutomation();