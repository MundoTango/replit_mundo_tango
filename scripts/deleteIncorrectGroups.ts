import { storage } from '../server/storage';

async function deleteIncorrectGroups() {
  console.log('🗑️ Deleting groups with incorrect images...');
  
  try {
    // Get all groups
    const allGroups = await storage.getAllGroups();
    
    // Filter city groups created today (test groups)
    const cityGroups = allGroups.filter(group => 
      group.type === 'city' && 
      group.imageUrl?.includes('pexels-photo-466685')
    );
    
    console.log(`Found ${cityGroups.length} groups with incorrect NYC fallback images`);
    
    // Delete each group
    for (const group of cityGroups) {
      console.log(`Deleting: ${group.name} (ID: ${group.id})`);
      await storage.deleteGroup(group.id);
    }
    
    console.log('✅ All incorrect groups deleted successfully');
    
  } catch (error) {
    console.error('❌ Error deleting groups:', error);
  }
}

// Run the deletion
deleteIncorrectGroups().then(() => {
  console.log('Deletion completed');
  process.exit(0);
}).catch(error => {
  console.error('Deletion failed:', error);
  process.exit(1);
});

export { deleteIncorrectGroups };