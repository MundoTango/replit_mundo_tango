import { db } from '../server/db';
import { roles } from '../shared/schema';

const communityRoles = [
  { 
    name: 'dancer', 
    description: 'Social dancer who attends milongas and practicas', 
    isPlatformRole: false,
    permissions: {},
    memoryAccessLevel: 1, // Using integer instead of string
    emotionalTagAccess: {},
    isCustom: false,
    isApproved: true
  },
  { 
    name: 'performer', 
    description: 'Professional tango performer and show dancer', 
    isPlatformRole: false,
    permissions: {},
    memoryAccessLevel: 'basic',
    emotionalTagAccess: false,
    isCustom: false,
    isApproved: true
  },
  { 
    name: 'teacher', 
    description: 'Tango instructor teaching classes and workshops', 
    isPlatformRole: false,
    permissions: {},
    memoryAccessLevel: 'basic',
    emotionalTagAccess: false,
    isCustom: false,
    isApproved: true
  },
  { 
    name: 'learning_source', 
    description: 'Educational resource provider for tango', 
    isPlatformRole: false,
    permissions: {},
    memoryAccessLevel: 'basic',
    emotionalTagAccess: false,
    isCustom: false,
    isApproved: true
  },
  { 
    name: 'dj', 
    description: 'Tango DJ who plays music at milongas and events', 
    isPlatformRole: false,
    permissions: {},
    memoryAccessLevel: 'basic',
    emotionalTagAccess: false,
    isCustom: false,
    isApproved: true
  },
  { 
    name: 'musician', 
    description: 'Live tango music performer', 
    isPlatformRole: false,
    permissions: {},
    memoryAccessLevel: 'basic',
    emotionalTagAccess: false,
    isCustom: false,
    isApproved: true
  },
  { 
    name: 'organizer', 
    description: 'Event organizer for milongas, festivals, and workshops', 
    isPlatformRole: false,
    permissions: {},
    memoryAccessLevel: 'basic',
    emotionalTagAccess: false,
    isCustom: false,
    isApproved: true
  },
  { 
    name: 'host', 
    description: 'Venue host for tango events', 
    isPlatformRole: false,
    permissions: {},
    memoryAccessLevel: 'basic',
    emotionalTagAccess: false,
    isCustom: false,
    isApproved: true
  },
  { 
    name: 'photographer', 
    description: 'Professional photographer capturing tango moments', 
    isPlatformRole: false,
    permissions: {},
    memoryAccessLevel: 'basic',
    emotionalTagAccess: false,
    isCustom: false,
    isApproved: true
  },
  { 
    name: 'content_creator', 
    description: 'Creates tango-related content (videos, blogs, podcasts)', 
    isPlatformRole: false,
    permissions: {},
    memoryAccessLevel: 'basic',
    emotionalTagAccess: false,
    isCustom: false,
    isApproved: true
  },
  { 
    name: 'choreographer', 
    description: 'Creates and directs tango choreographies', 
    isPlatformRole: false,
    permissions: {},
    memoryAccessLevel: 'basic',
    emotionalTagAccess: false,
    isCustom: false,
    isApproved: true
  },
  { 
    name: 'tango_traveler', 
    description: 'Travels internationally for tango events', 
    isPlatformRole: false,
    permissions: {},
    memoryAccessLevel: 'basic',
    emotionalTagAccess: false,
    isCustom: false,
    isApproved: true
  },
  { 
    name: 'tour_operator', 
    description: 'Organizes tango travel experiences and tours', 
    isPlatformRole: false,
    permissions: {},
    memoryAccessLevel: 'basic',
    emotionalTagAccess: false,
    isCustom: false,
    isApproved: true
  },
  { 
    name: 'vendor', 
    description: 'Sells tango-related products (shoes, clothes, accessories)', 
    isPlatformRole: false,
    permissions: {},
    memoryAccessLevel: 'basic',
    emotionalTagAccess: false,
    isCustom: false,
    isApproved: true
  },
  { 
    name: 'wellness_provider', 
    description: 'Provides wellness services for dancers', 
    isPlatformRole: false,
    permissions: {},
    memoryAccessLevel: 'basic',
    emotionalTagAccess: false,
    isCustom: false,
    isApproved: true
  },
  { 
    name: 'tango_school', 
    description: 'Tango school or academy', 
    isPlatformRole: false,
    permissions: {},
    memoryAccessLevel: 'basic',
    emotionalTagAccess: false,
    isCustom: false,
    isApproved: true
  },
  { 
    name: 'tango_hotel', 
    description: 'Accommodation specifically for tango travelers', 
    isPlatformRole: false,
    permissions: {},
    memoryAccessLevel: 'basic',
    emotionalTagAccess: false,
    isCustom: false,
    isApproved: true
  }
];

async function populateRoles() {
  try {
    console.log('🎭 Populating community roles...');
    
    // Insert all community roles
    for (const role of communityRoles) {
      try {
        await db.insert(roles).values(role).onConflictDoNothing();
        console.log(`✅ Added role: ${role.name}`);
      } catch (error) {
        console.error(`❌ Error adding role ${role.name}:`, error);
      }
    }
    
    // Verify roles were added
    const allRoles = await db.select().from(roles);
    console.log(`\n📊 Total roles in database: ${allRoles.length}`);
    console.log('Community roles:', allRoles.filter(r => !r.isPlatformRole).map(r => r.name).join(', '));
    
    console.log('\n✨ Community roles population complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error populating roles:', error);
    process.exit(1);
  }
}

populateRoles();