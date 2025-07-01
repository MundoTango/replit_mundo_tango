#!/usr/bin/env node

/**
 * 11L Pexels API Photo Update Script
 * Updates Buenos Aires group with authentic cityscape photo from Pexels
 */

import { storage } from '../server/storage.js';
import { CityPhotoService } from '../server/services/cityPhotoService.js';

async function updateBuenosAiresGroupPhoto() {
  console.log('🏗️ [11L Photo Update] Starting Buenos Aires photo update...');
  
  try {
    // Layer 5: Data Layer - Find Buenos Aires group
    console.log('📊 Finding Buenos Aires group...');
    const group = await storage.getGroupBySlug('tango-buenos-aires-argentina');
    
    if (!group) {
      console.error('❌ Buenos Aires group not found');
      return;
    }
    
    console.log(`✅ Found group: ${group.name} (ID: ${group.id})`);
    console.log(`📸 Current imageUrl: ${group.imageUrl}`);
    
    // Layer 2: Open Source Scan - Check PEXELS_API_KEY
    if (!process.env.PEXELS_API_KEY) {
      console.error('❌ PEXELS_API_KEY not configured');
      return;
    }
    
    console.log('🔑 PEXELS_API_KEY configured successfully');
    
    // Layer 6: Backend Layer - Fetch authentic Buenos Aires photo
    console.log('📸 Fetching authentic Buenos Aires cityscape from Pexels...');
    const photoResult = await CityPhotoService.downloadAndStoreCityPhoto(
      'Buenos Aires',
      'Argentina', 
      group.id
    );
    
    console.log('✅ Photo download result:', photoResult);
    
    // Layer 5: Data Layer - Update group with new photo
    console.log('💾 Updating group with authentic photo...');
    await storage.updateGroup(group.id, { 
      imageUrl: photoResult.localPath,
      coverImage: photoResult.localPath  // Also set as cover image
    });
    
    console.log(`🎉 Buenos Aires group updated successfully!`);
    console.log(`📸 New photo URL: ${photoResult.localPath}`);
    console.log(`👨‍🎨 Photo by: ${photoResult.photographer}`);
    console.log(`🆔 Pexels ID: ${photoResult.pexelsId}`);
    
    // Layer 11: Testing & Observability - Verify update
    const updatedGroup = await storage.getGroupBySlug('tango-buenos-aires-argentina');
    console.log('\n✅ Verification - Updated group photo:', updatedGroup?.imageUrl);
    
    console.log('\n🏆 11L Photo Update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating Buenos Aires photo:', error);
    
    // Fallback to high-quality curated Buenos Aires photo
    console.log('🔄 Applying curated Buenos Aires fallback...');
    try {
      const group = await storage.getGroupBySlug('tango-buenos-aires-argentina');
      if (group) {
        const fallbackUrl = 'https://images.pexels.com/photos/7061662/pexels-photo-7061662.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
        await storage.updateGroup(group.id, { 
          imageUrl: fallbackUrl,
          coverImage: fallbackUrl
        });
        console.log('✅ Applied curated Buenos Aires photo as fallback');
      }
    } catch (fallbackError) {
      console.error('❌ Fallback update failed:', fallbackError);
    }
  }
}

// Run the update
updateBuenosAiresGroupPhoto()
  .then(() => {
    console.log('✨ Photo update script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });