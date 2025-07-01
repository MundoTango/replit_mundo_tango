import { storage } from '../server/storage';

async function testCityGroupCreation() {
  console.log('🧪 Testing City Group Creation During Registration');
  
  // Test data for various cities
  const testCities = [
    { city: 'Prague', country: 'Czech Republic' },
    { city: 'Amsterdam', country: 'Netherlands' },
    { city: 'Vienna', country: 'Austria' },
    { city: 'Barcelona', country: 'Spain' },
    { city: 'Stockholm', country: 'Sweden' }
  ];
  
  try {
    for (const location of testCities) {
      console.log(`\n🏙️ Testing city group creation for: ${location.city}, ${location.country}`);
      
      // Generate city group slug
      const citySlug = `tango-${location.city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${location.country.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
      
      // Check if city group already exists
      const existingGroup = await storage.getGroupBySlug(citySlug);
      
      if (!existingGroup) {
        console.log(`🎨 Creating new city group for ${location.city}, ${location.country}`);
        
        // Create city group with fallback photo initially
        const cityGroup = await storage.createGroup({
          name: `Tango ${location.city}, ${location.country}`,
          slug: citySlug,
          type: 'city' as const,
          emoji: '🏙️',
          imageUrl: 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&fit=crop',
          description: `Welcome to the ${location.city} tango community! Connect with local dancers, find milongas, and share your tango journey in this beautiful city.`,
          isPrivate: false,
          city: location.city,
          country: location.country,
          createdBy: 3 // Scott Boddye's user ID
        });
        
        console.log(`✅ Created city group: ${cityGroup.name} (ID: ${cityGroup.id}, Slug: ${cityGroup.slug})`);
      } else {
        console.log(`ℹ️ City group already exists: ${existingGroup.name} (ID: ${existingGroup.id})`);
      }
    }
    
    // List all groups to verify creation
    console.log('\n📋 All City Groups:');
    const allGroups = await storage.getAllGroups();
    allGroups.forEach(group => {
      console.log(`  - ${group.name} (${group.slug}) - ${group.city}, ${group.country}`);
    });
    
    console.log('\n🎉 City group creation test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing city group creation:', error);
  }
}

// Run the test
testCityGroupCreation().then(() => {
  console.log('Test completed');
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});

export { testCityGroupCreation };