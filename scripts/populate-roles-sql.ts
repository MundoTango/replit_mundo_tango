import { db } from '../server/db';
import { sql } from 'drizzle-orm';

const communityRolesSQL = sql`
INSERT INTO roles (name, description, is_platform_role, permissions, memory_access_level, emotional_tag_access, is_custom, is_approved)
VALUES 
  ('dancer', 'Social dancer who attends milongas and practicas', false, '{}', 1, '{}', false, true),
  ('performer', 'Professional tango performer and show dancer', false, '{}', 1, '{}', false, true),
  ('teacher', 'Tango instructor teaching classes and workshops', false, '{}', 1, '{}', false, true),
  ('learning_source', 'Educational resource provider for tango', false, '{}', 1, '{}', false, true),
  ('dj', 'Tango DJ who plays music at milongas and events', false, '{}', 1, '{}', false, true),
  ('musician', 'Live tango music performer', false, '{}', 1, '{}', false, true),
  ('organizer', 'Event organizer for milongas, festivals, and workshops', false, '{}', 1, '{}', false, true),
  ('host', 'Venue host for tango events', false, '{}', 1, '{}', false, true),
  ('photographer', 'Professional photographer capturing tango moments', false, '{}', 1, '{}', false, true),
  ('content_creator', 'Creates tango-related content (videos, blogs, podcasts)', false, '{}', 1, '{}', false, true),
  ('choreographer', 'Creates and directs tango choreographies', false, '{}', 1, '{}', false, true),
  ('tango_traveler', 'Travels internationally for tango events', false, '{}', 1, '{}', false, true),
  ('tour_operator', 'Organizes tango travel experiences and tours', false, '{}', 1, '{}', false, true),
  ('vendor', 'Sells tango-related products (shoes, clothes, accessories)', false, '{}', 1, '{}', false, true),
  ('wellness_provider', 'Provides wellness services for dancers', false, '{}', 1, '{}', false, true),
  ('tango_school', 'Tango school or academy', false, '{}', 1, '{}', false, true),
  ('tango_hotel', 'Accommodation specifically for tango travelers', false, '{}', 1, '{}', false, true)
ON CONFLICT (name) DO NOTHING;
`;

async function populateRoles() {
  try {
    console.log('🎭 Populating community roles using SQL...');
    
    // Execute the SQL directly
    await db.execute(communityRolesSQL);
    
    // Verify roles were added
    const result = await db.execute(sql`SELECT name FROM roles WHERE is_platform_role = false ORDER BY name`);
    
    console.log(`\n📊 Community roles in database:`);
    result.rows.forEach(row => {
      console.log(`✅ ${row.name}`);
    });
    
    console.log(`\n✨ Total community roles: ${result.rows.length}`);
    console.log('Community roles population complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error populating roles:', error);
    process.exit(1);
  }
}

populateRoles();