import { db } from '../server/db';
import { events } from '../shared/schema';
import { sql } from 'drizzle-orm';

async function seedEventsSimple() {
  console.log('🌱 Starting simple event seeding...');
  
  try {
    // Get the admin user (Scott)
    const currentDate = new Date();
    
    // Create sample events for the next 30 days
    const sampleEvents = [
      {
        title: 'Friday Night Milonga at La Viruta',
        description: 'Join us for an unforgettable night of tango dancing at Buenos Aires\' most famous milonga venue. Live orchestra, traditional tandas, and great energy!',
        location: 'La Viruta Tango Club',
        address: 'Armenia 1366, Buenos Aires',
        city: 'Buenos Aires',
        state: 'Buenos Aires',
        country: 'Argentina',
        eventType: 'milonga',
        startDate: new Date(currentDate.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        endDate: new Date(currentDate.getTime() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours later
        maxAttendees: 200,
        isPublic: true,
        userId: 7, // Scott's ID
        coverImage: 'https://images.pexels.com/photos/1516036/pexels-photo-1516036.jpeg'
      },
      {
        title: 'Beginner Tango Practica',
        description: 'Perfect for those starting their tango journey. Practice basic steps, improve your embrace, and meet fellow beginners in a supportive environment.',
        location: 'Centro Cultural Recoleta',
        address: 'Junín 1930, Buenos Aires',
        city: 'Buenos Aires',
        state: 'Buenos Aires',
        country: 'Argentina',
        eventType: 'practica',
        startDate: new Date(currentDate.getTime() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        endDate: new Date(currentDate.getTime() + 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
        maxAttendees: 50,
        isPublic: true,
        userId: 7,
        coverImage: 'https://images.pexels.com/photos/2531546/pexels-photo-2531546.jpeg'
      },
      {
        title: 'Tango Marathon Weekend',
        description: 'Three days of non-stop tango! Dance from sunset to sunrise with the best dancers from around the world. Multiple venues, DJs, and special performances.',
        location: 'Various venues',
        address: 'San Telmo, Buenos Aires',
        city: 'Buenos Aires',
        state: 'Buenos Aires',
        country: 'Argentina',
        eventType: 'marathon',
        startDate: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        endDate: new Date(currentDate.getTime() + 10 * 24 * 60 * 60 * 1000), // 3 days later
        maxAttendees: 300,
        isPublic: true,
        userId: 7,
        coverImage: 'https://images.pexels.com/photos/46024/pexels-photo-46024.jpeg'
      },
      {
        title: 'Tango Festival Buenos Aires 2025',
        description: 'The biggest tango festival in the world! Workshops with maestros, performances, competitions, and milongas every night.',
        location: 'Teatro Colón',
        address: 'Cerrito 628, Buenos Aires',
        city: 'Buenos Aires',
        state: 'Buenos Aires',
        country: 'Argentina',
        eventType: 'festival',
        startDate: new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        endDate: new Date(currentDate.getTime() + 21 * 24 * 60 * 60 * 1000), // 1 week duration
        maxAttendees: 1000,
        isPublic: true,
        userId: 7,
        coverImage: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg'
      },
      {
        title: 'Outdoor Summer Milonga',
        description: 'Dance under the stars! Join us for a magical outdoor milonga in the heart of Buenos Aires. Free entry, all levels welcome.',
        location: 'Plaza Dorrego',
        address: 'Defensa 1098, San Telmo, Buenos Aires',
        city: 'Buenos Aires',
        state: 'Buenos Aires',
        country: 'Argentina',
        eventType: 'milonga',
        startDate: new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        endDate: new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours later
        maxAttendees: 150,
        isPublic: true,
        userId: 7,
        coverImage: 'https://images.pexels.com/photos/258804/pexels-photo-258804.jpeg'
      }
    ];
    
    // Insert events (without adding participants to avoid trigger issues)
    let successCount = 0;
    for (const eventData of sampleEvents) {
      try {
        const [insertedEvent] = await db
          .insert(events)
          .values(eventData)
          .returning();
          
        console.log(`✅ Created event: ${insertedEvent.title}`);
        successCount++;
      } catch (error) {
        console.log(`⚠️  Skipping event: ${eventData.title} (may already exist)`);
      }
    }
    
    console.log(`\n🎉 Event seeding completed! Created ${successCount} new events.`);
    console.log('Refresh your browser to see the events in the sidebar.');
    
  } catch (error) {
    console.error('❌ Error seeding events:', error);
  } finally {
    process.exit(0);
  }
}

// Run the seeding
seedEventsSimple();