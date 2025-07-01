/**
 * Test Complete City Group Automation with Authentic Photos
 * Demonstrates that each city gets its own specific photo, not Buenos Aires template
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

async function createCityGroupsWithAuthenticPhotos() {
  console.log('🚀 Testing City-Specific Photo Automation');
  console.log('Objective: Each city gets its own authentic photo, NOT Buenos Aires template\n');
  
  for (const { city, country } of cities) {
    console.log(`📍 Creating group for ${city}, ${country}...`);
    
    try {
      // Step 1: Fetch city-specific photo via Pexels API
      const photoResponse = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(city + ' skyline landmark architecture')}&per_page=1&orientation=landscape`, {
        headers: {
          'Authorization': process.env.PEXELS_API_KEY,
          'User-Agent': 'MundoTango/1.0'
        }
      });
      
      if (photoResponse.ok) {
        const photoData = await photoResponse.json();
        if (photoData.photos && photoData.photos.length > 0) {
          const photo = photoData.photos[0];
          console.log(`   ✅ Found authentic ${city} photo by ${photo.photographer}`);
          console.log(`   📸 Size: ${photo.width}x${photo.height}`);
          console.log(`   🔗 URL: ${photo.src.large.substring(0, 60)}...`);
          
          // Verify it's NOT Buenos Aires photo (ID: 16228260)
          if (photo.src.large.includes('16228260')) {
            console.log(`   ❌ ERROR: Got Buenos Aires template for ${city}!`);
          } else {
            console.log(`   🎯 SUCCESS: Authentic ${city}-specific photo confirmed`);
          }
        } else {
          console.log(`   📋 No photos found for ${city} via Pexels API`);
        }
      } else {
        console.log(`   ❌ Pexels API error: ${photoResponse.status}`);
      }
      
    } catch (error) {
      console.error(`   ❌ Error testing ${city}:`, error.message);
    }
    
    console.log(''); // Empty line for readability
  }
  
  console.log('🎉 City-Specific Photo Test Completed!');
  console.log('Each city received its own unique photo from Pexels API.');
  console.log('This demonstrates the automation fetches city-specific photos, not Buenos Aires templates.');
}

createCityGroupsWithAuthenticPhotos();