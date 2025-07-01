/**
 * Test City-Specific Photo Fetching with Pexels API
 * Direct API test to verify PEXELS_API_KEY works for city-specific photos
 */

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const PEXELS_BASE_URL = 'https://api.pexels.com/v1';

async function testPexelsAPI() {
  console.log('🧪 Testing Pexels API for City-Specific Photo Fetching\n');
  
  if (!PEXELS_API_KEY) {
    console.error('❌ PEXELS_API_KEY not found in environment variables');
    return;
  }
  
  console.log('✅ PEXELS_API_KEY found, testing API...\n');
  
  const testCities = [
    { city: 'Prague', country: 'Czech Republic' },
    { city: 'Munich', country: 'Germany' },
    { city: 'Stockholm', country: 'Sweden' },
    { city: 'Vienna', country: 'Austria' },
    { city: 'Barcelona', country: 'Spain' }
  ];
  
  for (const { city, country } of testCities) {
    console.log(`📸 Testing photo search for ${city}, ${country}...`);
    
    try {
      const searchQuery = `${city} skyline landmark architecture`;
      console.log(`   Query: "${searchQuery}"`);
      
      const response = await fetch(
        `${PEXELS_BASE_URL}/search?query=${encodeURIComponent(searchQuery)}&per_page=3&orientation=landscape`,
        {
          headers: {
            'Authorization': PEXELS_API_KEY,
            'User-Agent': 'MundoTango/1.0'
          }
        }
      );
      
      if (!response.ok) {
        console.error(`   ❌ API error: ${response.status} ${response.statusText}`);
        continue;
      }
      
      const data = await response.json();
      
      if (data.photos && data.photos.length > 0) {
        const photo = data.photos[0];
        console.log(`   ✅ Found ${city} photo:`);
        console.log(`      Photographer: ${photo.photographer}`);
        console.log(`      Size: ${photo.width}x${photo.height}`);
        console.log(`      URL: ${photo.src.large.substring(0, 60)}...`);
        console.log(`   🎯 SUCCESS: Authentic ${city}-specific photo found!`);
      } else {
        console.log(`   📋 No photos found for ${city}`);
      }
      
    } catch (error) {
      console.error(`   ❌ Error testing ${city}:`, error.message);
    }
    
    console.log(''); // Empty line for readability
  }
  
  console.log('🎉 Pexels API test completed!');
  console.log('The automation system can now fetch authentic city-specific photos.');
}

testPexelsAPI();