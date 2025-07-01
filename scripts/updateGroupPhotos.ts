/**
 * 11L Photo Fix Script - Update Group Photos
 * Layer 8 (Automation): Bulk photo fetching for existing groups
 * 
 * This script fetches authentic city photos for all groups without images
 * and updates the database with the photo URLs.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { groups } from '../shared/schema.js';
import { eq, isNull } from 'drizzle-orm';
import { fetchCityPhoto } from '../server/services/cityPhotoService.js';

// Database connection
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

interface Group {
  id: number;
  name: string;
  city: string | null;
  country: string | null;
  imageUrl: string | null;
}

/**
 * Extract city name from group name for photo search
 * Input: "Tango Buenos Aires, Argentina" -> Output: "Buenos Aires"
 */
function extractCityFromGroupName(groupName: string): string {
  // Remove "Tango" prefix
  let cleaned = groupName.replace(/^Tango\s+/, '');
  
  // Split by comma and take first part (city)
  const parts = cleaned.split(',');
  return parts[0].trim();
}

/**
 * Update a single group with fetched photo
 */
async function updateGroupPhoto(group: Group): Promise<boolean> {
  try {
    console.log(`🌆 Fetching photo for ${group.name}...`);
    
    // Extract city name for search
    const cityName = group.city || extractCityFromGroupName(group.name);
    const countryName = group.country || '';
    
    // Fetch authentic city photo
    const photoUrl = await fetchCityPhoto(cityName, countryName);
    
    if (photoUrl) {
      // Update database with photo URL
      await db
        .update(groups)
        .set({ imageUrl: photoUrl })
        .where(eq(groups.id, group.id));
      
      console.log(`✅ Updated ${group.name} with photo: ${photoUrl}`);
      return true;
    } else {
      console.log(`❌ No photo found for ${group.name}`);
      return false;
    }
  } catch (error) {
    console.error(`💥 Error updating ${group.name}:`, error);
    return false;
  }
}

/**
 * Main function to update all groups without photos
 */
async function updateAllGroupPhotos() {
  try {
    console.log('🚀 Starting 11L Photo Update Script...');
    
    // Fetch all groups without photos
    const groupsWithoutPhotos = await db
      .select()
      .from(groups)
      .where(isNull(groups.imageUrl));
    
    console.log(`📊 Found ${groupsWithoutPhotos.length} groups without photos`);
    
    if (groupsWithoutPhotos.length === 0) {
      console.log('✅ All groups already have photos!');
      return;
    }
    
    let successCount = 0;
    let failureCount = 0;
    
    // Process each group with rate limiting
    for (const group of groupsWithoutPhotos) {
      const success = await updateGroupPhoto(group);
      
      if (success) {
        successCount++;
      } else {
        failureCount++;
      }
      
      // Rate limiting: wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n📈 Update Complete:');
    console.log(`✅ Successfully updated: ${successCount} groups`);
    console.log(`❌ Failed to update: ${failureCount} groups`);
    console.log(`📊 Total processed: ${groupsWithoutPhotos.length} groups`);
    
  } catch (error) {
    console.error('💥 Script failed:', error);
    throw error;
  } finally {
    // Close database connection
    await client.end();
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  updateAllGroupPhotos()
    .then(() => {
      console.log('🎉 Photo update script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Photo update script failed:', error);
      process.exit(1);
    });
}

export { updateAllGroupPhotos, updateGroupPhoto };