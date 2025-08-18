/**
 * Create All City Groups in Database with Authentic Photos
 * Direct database automation to populate groups for all test user cities
 */

import fetch from 'node-fetch';

const cities = [
  { city: 'Milan', country: 'Italy' },
  { city: 'Montevideo', country: 'Uruguay' },
  { city: 'Paris', country: 'France' },
  { city: 'Rosario', country: 'Argentina' },
  { city: 'San Francisco', country: 'United States' },
  { city: 'São Paulo', country: 'Brazil' },
  { city: 'Warsaw', country: 'Poland' }
];

async function createCityGroupsInDatabase() {
  console.log('🚀 Creating City Groups in Database with Authentic Photos');
  console.log('Target: 8 total groups (Buenos Aires already exists + 7 new)\n');
  
  for (const { city, country } of cities) {
    console.log(`📍 Creating group for ${city}, ${country}...`);
    
    try {
      // Create group via admin API endpoint (no auth needed for this internal automation)
      const response = await fetch('http://localhost:5000/api/admin/create-city-group', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': 'connect.sid=admin-automation-session'
        },
        body: JSON.stringify({
          city: city,
          country: country
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`   ✅ Group created successfully: ${result.name || `Tango ${city}, ${country}`}`);
        if (result.image_url) {
          console.log(`   📸 Authentic photo assigned: ${result.image_url.substring(0, 60)}...`);
        }
      } else {
        const errorText = await response.text();
        console.log(`   ❌ Error ${response.status}: ${errorText.substring(0, 100)}...`);
      }
      
    } catch (error) {
      console.error(`   ❌ Exception creating ${city} group:`, error.message);
    }
    
    console.log(''); // Empty line
  }
  
  console.log('🎉 City Group Creation Completed!');
  console.log('Visit /groups page to see all city groups with authentic photos.');
}

createCityGroupsInDatabase();