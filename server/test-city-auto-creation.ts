import { CityAutoCreationService } from './services/cityAutoCreationService';
import { db } from './db';
import { groups, groupMembers } from '../shared/schema';
import { eq, and } from 'drizzle-orm';

async function testCityAutoCreation() {
  console.log('🧪 Testing City Auto-Creation Service...\n');
  
  const testUserId = 7; // Scott Boddye
  
  // Test 1: Test city name normalization
  console.log('📝 Test 1: City Name Normalization');
  const testCities = [
    { input: 'NYC', expected: 'New York City' },
    { input: 'LA', expected: 'Los Angeles' },
    { input: 'buenos aires', expected: 'Buenos Aires' },
    { input: 'london, uk', expected: 'London, Uk' }
  ];
  
  for (const test of testCities) {
    const normalized = (CityAutoCreationService as any).normalizeCityName(test.input);
    console.log(`  ${test.input} → ${normalized} ${normalized === test.expected ? '✅' : '❌'}`);
  }
  
  // Test 2: Test registration trigger
  console.log('\n🏃 Test 2: Registration Trigger');
  try {
    const registrationResult = await CityAutoCreationService.createOrGetCityGroup(
      'NYC',
      'registration',
      testUserId
    );
    
    if (registrationResult) {
      console.log(`  ✅ City group ${registrationResult.created ? 'created' : 'found'} (ID: ${registrationResult.groupId})`);
      
      // Verify the group exists
      const [group] = await db
        .select()
        .from(groups)
        .where(eq(groups.id, registrationResult.groupId))
        .limit(1);
      
      console.log(`  Group name: ${group.name}`);
      console.log(`  Group slug: ${group.slug}`);
      console.log(`  Coordinates: ${group.latitude}, ${group.longitude}`);
    } else {
      console.log('  ❌ Failed to create/get city group');
    }
  } catch (error) {
    console.error('  ❌ Error:', error);
  }
  
  // Test 3: Test recommendation trigger
  console.log('\n🍴 Test 3: Recommendation Trigger');
  try {
    const recommendationResult = await CityAutoCreationService.handleRecommendation(
      1, // dummy recommendation ID
      'Kolašin',
      'Montenegro',
      testUserId
    );
    
    if (recommendationResult) {
      console.log(`  ✅ City group ${recommendationResult.isNew ? 'created' : 'found'}: ${recommendationResult.group.name}`);
    } else {
      console.log('  ❌ Failed to handle recommendation');
    }
  } catch (error) {
    console.error('  ❌ Error:', error);
  }
  
  // Test 4: Test event trigger
  console.log('\n🎉 Test 4: Event Trigger');
  try {
    const eventResult = await CityAutoCreationService.handleEvent(
      1, // dummy event ID
      'Paris',
      'France',
      testUserId
    );
    
    if (eventResult) {
      console.log(`  ✅ City group ${eventResult.isNew ? 'created' : 'found'}: ${eventResult.group.name}`);
    } else {
      console.log('  ❌ Failed to handle event');
    }
  } catch (error) {
    console.error('  ❌ Error:', error);
  }
  
  // Test 5: Test user membership
  console.log('\n👥 Test 5: User Membership');
  try {
    // Get all city groups the test user is a member of
    const userCityGroups = await db
      .select({
        groupName: groups.name,
        groupSlug: groups.slug,
        memberRole: groupMembers.role
      })
      .from(groupMembers)
      .innerJoin(groups, eq(groupMembers.groupId, groups.id))
      .where(
        and(
          eq(groupMembers.userId, testUserId),
          eq(groups.type, 'city')
        )
      );
    
    console.log(`  User is member of ${userCityGroups.length} city groups:`);
    userCityGroups.forEach(g => {
      console.log(`    - ${g.groupName} (${g.memberRole})`);
    });
  } catch (error) {
    console.error('  ❌ Error:', error);
  }
  
  console.log('\n✨ City Auto-Creation Service testing complete!');
}

// Run the test
testCityAutoCreation().catch(console.error);