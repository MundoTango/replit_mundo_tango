import { storage } from './storage';
import { sql } from 'drizzle-orm';
import { db } from './db';

async function createTestFriendship() {
  try {
    console.log('Creating test friendship...');
    
    // Scott is user ID 7
    const scottId = 7;
    
    // First create a test user named Maria
    const testUser = {
      name: 'Maria Fernandez',
      username: 'maria_tango',
      email: 'maria@example.com',
      password: 'test123', // In real app this would be hashed
      tangoRoles: ['dancer', 'teacher'],
      country: 'Argentina',
      city: 'Buenos Aires',
      state: 'Buenos Aires',
      yearsOfDancing: 10,
      leaderLevel: 7,
      followerLevel: 9,
      isOnboardingComplete: true,
      codeOfConductAccepted: true
    };
    
    try {
      console.log('Creating test user Maria...');
      const newUser = await storage.createUser(testUser);
      console.log('Test user created:', newUser);
      
      // Create a friendship between Scott and Maria
      const friendship = await storage.createFriendship({
        userId: scottId,
        friendId: newUser.id,
        status: 'accepted' // Make it accepted so they're already friends
      });
      
      console.log('Friendship created:', friendship);
      console.log(`Scott (ID: ${scottId}) is now friends with ${newUser.name} (ID: ${newUser.id})`);
      
      // Also create the reverse friendship for bidirectional connection
      const reverseFriendship = await storage.createFriendship({
        userId: newUser.id,
        friendId: scottId,
        status: 'accepted'
      });
      
      console.log('Reverse friendship created:', reverseFriendship);
    } catch (error) {
      if (error.message?.includes('duplicate key')) {
        console.log('Test user already exists, looking for existing users...');
        
        // If user already exists, just get existing users
        const users = await db.execute(
          sql`SELECT id, name, username FROM users WHERE id != ${scottId} LIMIT 5`
        );
        
        if (users.rows && users.rows.length > 0) {
          const otherUser = users.rows[0];
          
          // Check if friendship already exists
          const existingFriendship = await db.execute(
            sql`SELECT * FROM friends WHERE (user_id = ${scottId} AND friend_id = ${otherUser.id}) OR (user_id = ${otherUser.id} AND friend_id = ${scottId})`
          );
          
          if (existingFriendship.rows?.length > 0) {
            console.log('Friendship already exists between Scott and', otherUser.name);
          } else {
            // Create friendship
            const friendship = await storage.createFriendship({
              userId: scottId,
              friendId: otherUser.id,
              status: 'accepted'
            });
            
            console.log('Friendship created:', friendship);
            console.log(`Scott (ID: ${scottId}) is now friends with ${otherUser.name} (ID: ${otherUser.id})`);
            
            // Also create the reverse friendship
            const reverseFriendship = await storage.createFriendship({
              userId: otherUser.id,
              friendId: scottId,
              status: 'accepted'
            });
            
            console.log('Reverse friendship created:', reverseFriendship);
          }
        }
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error creating test friendship:', error);
  }
}

// Run the test
createTestFriendship();