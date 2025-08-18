/**
 * 11-Layer City Groups Creation Script
 * Creates authentic city groups for all test users with Pexels photos
 */

import { createApp } from '../server/index.js';
import { Storage } from '../server/storage.js';
import { fetchCityPhoto } from '../server/services/cityPhotoService.js';

// 11L Layer 5: Data Layer - City group definitions
const TEST_USER_CITIES = [
  { userId: 2, city: 'San Francisco', country: 'United States' },
  { userId: 3, city: 'Buenos Aires', country: 'Argentina' },
  { userId: 4, city: 'Buenos Aires', country: 'Argentina' },
  { userId: 21, city: 'Montevideo', country: 'Uruguay' },
  { userId: 22, city: 'San Francisco', country: 'USA' },
  { userId: 23, city: 'Milan', country: 'Italy' },
  { userId: 24, city: 'Paris', country: 'France' },
  { userId: 25, city: 'Rosario', country: 'Argentina' },
  { userId: 26, city: 'Warsaw', country: 'Poland' },
  { userId: 27, city: 'São Paulo', country: 'Brazil' }
];

// 11L Layer 10: AI & Reasoning - Intelligent city grouping
function createUniqueCity(city: string, country: string) {
  // Normalize country names
  const normalizedCountry = country === 'USA' ? 'United States' : country;
  return { city, country: normalizedCountry };
}

function generateSlug(city: string, country: string): string {
  return `tango-${city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${country.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
}

// 11L Layer 6: Backend Layer - Comprehensive group creation logic
async function createCityGroupWithPhoto(storage: Storage, cityData: { city: string; country: string }, createdBy: number) {
  const { city, country } = cityData;
  const slug = generateSlug(city, country);
  
  console.log(`\n🏙️ Creating city group: ${city}, ${country}`);
  
  try {
    // Check if group already exists
    const existingGroup = await storage.getGroupBySlug(slug);
    if (existingGroup) {
      console.log(`✅ Group already exists: ${existingGroup.name}`);
      return existingGroup;
    }

    // 11L Layer 2: Open Source Scan - Fetch authentic city photo
    console.log(`📸 Fetching authentic photo for ${city}...`);
    const photoUrl = await fetchCityPhoto(city);
    console.log(`📸 Photo URL: ${photoUrl}`);

    // 11L Layer 5: Data Layer - Create group with comprehensive metadata
    const groupData = {
      name: `Tango ${city}, ${country}`,
      slug,
      type: 'city' as const,
      emoji: '🏙️',
      imageUrl: photoUrl,
      coverImage: photoUrl, // Same photo for both card and detail page
      description: `Welcome to the ${city} tango community! Connect with local dancers, find milongas, and share your tango journey in this beautiful city.`,
      isPrivate: false,
      city,
      country,
      memberCount: 0,
      createdBy
    };

    const newGroup = await storage.createGroup(groupData);
    console.log(`✅ Created group: ${newGroup.name} (ID: ${newGroup.id})`);
    
    return newGroup;
  } catch (error) {
    console.error(`❌ Error creating group for ${city}:`, error);
    // 11L Layer 4: Consent & UX Safeguards - Fallback handling
    return null;
  }
}

// 11L Layer 8: Sync & Automation - Batch processing
async function processAllCityGroups() {
  console.log('🚀 Starting 11-Layer City Groups Creation Process\n');
  
  const storage = new Storage();
  
  // 11L Layer 10: AI & Reasoning - Extract unique cities
  const uniqueCities = new Map();
  TEST_USER_CITIES.forEach(({ city, country }) => {
    const normalized = createUniqueCity(city, country);
    const key = `${normalized.city}-${normalized.country}`;
    if (!uniqueCities.has(key)) {
      uniqueCities.set(key, normalized);
    }
  });

  console.log(`📍 Found ${uniqueCities.size} unique cities to process:`);
  uniqueCities.forEach((cityData, key) => {
    console.log(`  - ${cityData.city}, ${cityData.country}`);
  });

  // 11L Layer 6: Backend Layer - Create groups sequentially to avoid rate limits
  const createdGroups = [];
  for (const [key, cityData] of uniqueCities) {
    const group = await createCityGroupWithPhoto(storage, cityData, 3); // Scott as creator
    if (group) {
      createdGroups.push(group);
    }
    // 11L Layer 3: Legal & Compliance - Respect API rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 11L Layer 8: Sync & Automation - Auto-assign users to their city groups
  console.log('\n👥 Auto-assigning users to city groups...');
  for (const { userId, city, country } of TEST_USER_CITIES) {
    const normalized = createUniqueCity(city, country);
    const slug = generateSlug(normalized.city, normalized.country);
    
    try {
      const group = await storage.getGroupBySlug(slug);
      if (group) {
        // Check if user is already a member
        const isMember = await storage.checkUserInGroup(userId, group.id);
        if (!isMember) {
          await storage.addUserToGroup(userId, group.id, 'member');
          await storage.updateGroupMemberCount(group.id, 1);
          console.log(`✅ Added user ${userId} to ${group.name}`);
        } else {
          console.log(`👤 User ${userId} already in ${group.name}`);
        }
      }
    } catch (error) {
      console.error(`❌ Error adding user ${userId} to group:`, error);
    }
  }

  // 11L Layer 11: Testing & Observability - Validation summary
  console.log('\n📊 11-Layer City Groups Creation Summary:');
  console.log(`✅ Groups created: ${createdGroups.length}`);
  console.log(`👥 Users processed: ${TEST_USER_CITIES.length}`);
  console.log(`🌍 Cities covered: ${uniqueCities.size}`);
  
  // List all created groups
  if (createdGroups.length > 0) {
    console.log('\n🏙️ Created City Groups:');
    createdGroups.forEach(group => {
      console.log(`  - ${group.name} (${group.slug})`);
    });
  }

  return {
    groupsCreated: createdGroups.length,
    usersProcessed: TEST_USER_CITIES.length,
    citiesCovered: uniqueCities.size,
    groups: createdGroups
  };
}

// 11L Layer 11: Testing & Observability - Script execution
async function main() {
  try {
    console.log('🌟 Mundo Tango 11-Layer City Groups Creation System');
    console.log('=====================================================\n');
    
    const results = await processAllCityGroups();
    
    console.log('\n🎉 11-Layer implementation completed successfully!');
    console.log(`📈 Results: ${results.groupsCreated} groups, ${results.usersProcessed} users, ${results.citiesCovered} cities`);
    
    process.exit(0);
  } catch (error) {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { processAllCityGroups, createCityGroupWithPhoto };