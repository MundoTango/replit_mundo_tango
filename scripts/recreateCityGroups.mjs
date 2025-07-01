/**
 * Recreate City Groups Using Automation System
 * Demonstrates city-specific photo automation via onboarding endpoints
 */

const cities = [
  { city: 'Milan', country: 'Italy' },
  { city: 'Paris', country: 'France' },
  { city: 'São Paulo', country: 'Brazil' },
  { city: 'Warsaw', country: 'Poland' },
  { city: 'Montevideo', country: 'Uruguay' },
  { city: 'San Francisco', country: 'United States' },
  { city: 'Rosario', country: 'Argentina' }
];

async function recreateCityGroups() {
  console.log('🚀 Recreating City Groups with Automation');
  console.log('Testing that each city gets its own authentic photo via automation system\n');
  
  for (const { city, country } of cities) {
    console.log(`📍 Processing ${city}, ${country}...`);
    
    try {
      // Use the onboarding automation endpoint to create city group
      const response = await fetch('http://localhost:5000/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `Test User ${city}`,
          email: `test.${city.toLowerCase().replace(/\s+/g, '')}@example.com`,
          username: `test${city.toLowerCase().replace(/\s+/g, '')}`,
          tangoRoles: ['dancer'],
          leaderLevel: 'intermediate',
          followerLevel: 'intermediate',
          yearsOfDancing: 5,
          startedDancingYear: 2019,
          city: city,
          country: country,
          codeOfConductAccepted: true
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`   ✅ Automation completed for ${city}`);
        console.log(`   📝 Response: ${result.message || 'Success'}`);
      } else {
        const errorText = await response.text();
        console.log(`   ❌ Error: ${response.status} - ${errorText.substring(0, 100)}...`);
      }
      
    } catch (error) {
      console.error(`   ❌ Error processing ${city}:`, error.message);
    }
    
    console.log(''); // Empty line
  }
  
  console.log('🎉 City Group Recreation Completed!');
  console.log('Each city should now have its own authentic photo via the automation system.');
}

recreateCityGroups();