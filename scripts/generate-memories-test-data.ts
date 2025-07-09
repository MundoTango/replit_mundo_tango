import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function generateMemoriesTestData() {
  console.log('🎭 Starting Mundo Tango test data generation for memories and events...');

  try {
    // First, check if we have any memories
    const memoryCount = await db.execute(sql`SELECT COUNT(*) as count FROM memories`);
    console.log(`📊 Current memories count: ${memoryCount.rows[0].count}`);

    // Generate test memories for user 7 (Scott)
    const testMemories = [
      {
        user_id: 7,
        title: "Amazing milonga at La Viruta!",
        content: "Just attended the most incredible milonga at La Viruta! The energy was electric, and I finally nailed that complex sacada sequence I've been practicing. The live orchestra made everything feel so alive! 💃 #BuenosAires #Milonga #TangoLife",
        emotion_tags: ['joy', 'excitement', 'accomplishment', 'connected'],
        emotion_visibility: 'public',
        trust_circle_level: 1,
        location: JSON.stringify({
          name: "La Viruta Tango Club",
          formatted_address: "Armenia 1366, Buenos Aires, Argentina",
          lat: -34.5934,
          lng: -58.4146
        }),
        media_urls: [],
        co_tagged_users: [],
        consent_required: false,
        consent_status: 'not_required'
      },
      {
        user_id: 7,
        title: "Teaching my first workshop",
        content: "Today I taught my first tango workshop on musicality and connection. Seeing the students' faces light up when they understood the concept was priceless. So grateful for this journey! 🎵",
        emotion_tags: ['gratitude', 'pride', 'fulfillment'],
        emotion_visibility: 'public',
        trust_circle_level: 1,
        location: JSON.stringify({
          name: "DNI Tango",
          formatted_address: "Bulnes 1011, Buenos Aires, Argentina",
          lat: -34.5957,
          lng: -58.4119
        }),
        media_urls: [],
        co_tagged_users: [],
        consent_required: false,
        consent_status: 'not_required'
      },
      {
        user_id: 7,
        title: "Sunset tango at Puerto Madero",
        content: "Dancing tango outdoors at Puerto Madero as the sun sets over the water... moments like these remind me why I fell in love with Buenos Aires and tango. Pure magic! 🌅",
        emotion_tags: ['peace', 'beauty', 'romance', 'contentment'],
        emotion_visibility: 'public',
        trust_circle_level: 1,
        location: JSON.stringify({
          name: "Puerto Madero",
          formatted_address: "Puerto Madero, Buenos Aires, Argentina",
          lat: -34.6118,
          lng: -58.3642
        }),
        media_urls: [],
        co_tagged_users: [],
        consent_required: false,
        consent_status: 'not_required'
      },
      {
        user_id: 7,
        title: "Festival Internacional de Tango",
        content: "The energy at the Festival Internacional is unbelievable! Workshops all day, milongas all night. My feet are tired but my soul is full. Met dancers from 20+ countries! 🌍",
        emotion_tags: ['excitement', 'community', 'international', 'inspiration'],
        emotion_visibility: 'public',
        trust_circle_level: 1,
        location: JSON.stringify({
          name: "Centro Cultural Borges",
          formatted_address: "Viamonte 525, Buenos Aires, Argentina",
          lat: -34.5998,
          lng: -58.3731
        }),
        media_urls: [],
        co_tagged_users: [],
        consent_required: false,
        consent_status: 'not_required'
      },
      {
        user_id: 7,
        title: "Morning practice at Confitería Ideal",
        content: "There's something special about practicing in the morning at Confitería Ideal. The history in these walls, the old wooden floor... you can feel the ghosts of tango past. 👻",
        emotion_tags: ['nostalgia', 'history', 'practice', 'dedication'],
        emotion_visibility: 'public',
        trust_circle_level: 1,
        location: JSON.stringify({
          name: "Confitería Ideal",
          formatted_address: "Suipacha 384, Buenos Aires, Argentina",
          lat: -34.6028,
          lng: -58.3817
        }),
        media_urls: [],
        co_tagged_users: [],
        consent_required: false,
        consent_status: 'not_required'
      }
    ];

    // Insert memories
    console.log('📝 Creating test memories...');
    for (const memory of testMemories) {
      await db.execute(sql`
        INSERT INTO memories (
          user_id, title, content, emotion_tags,
          emotion_visibility, trust_circle_level, location, media_urls, 
          co_tagged_users, consent_required, consent_status
        ) VALUES (
          ${memory.user_id}, ${memory.title}, ${memory.content}, 
          ${memory.emotion_tags}::text[], 
          ${memory.emotion_visibility}, ${memory.trust_circle_level}, ${memory.location}::jsonb, 
          ${memory.media_urls}::text[], ${memory.co_tagged_users}::integer[], 
          ${memory.consent_required}, ${memory.consent_status}
        )
      `);
    }

    // Check if we have events for the sidebar
    const eventCount = await db.execute(sql`SELECT COUNT(*) as count FROM events`);
    console.log(`📊 Current events count: ${eventCount.rows[0].count}`);

    // Generate some upcoming events
    const today = new Date();
    const testEvents = [
      {
        title: "Milonga del Domingo",
        description: "Traditional Sunday milonga with live orchestra. Dress code: elegant.",
        organizer: "La Viruta",
        start_date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        end_date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // 4 hours later
        location: "La Viruta, Armenia 1366, Buenos Aires",
        event_type: "milonga",
        attendee_count: 45
      },
      {
        title: "Tango Workshop: Advanced Sacadas",
        description: "Master the art of sacadas with renowned maestros.",
        organizer: "DNI Tango",
        start_date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
        end_date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
        location: "DNI Tango, Bulnes 1011, Buenos Aires",
        event_type: "workshop",
        attendee_count: 25
      },
      {
        title: "Practica at Salon Canning",
        description: "Weekly practica with DJ Carlos. Perfect your moves in a relaxed environment.",
        organizer: "Salon Canning",
        start_date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        end_date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(), // 3 hours later
        location: "Salon Canning, Av. Raúl Scalabrini Ortiz 1331, Buenos Aires",
        event_type: "practica",
        attendee_count: 35
      },
      {
        title: "Buenos Aires Tango Festival",
        description: "Annual tango festival featuring international artists and orchestras.",
        organizer: "City of Buenos Aires",
        start_date: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        end_date: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 7 days duration
        location: "Various locations, Buenos Aires",
        event_type: "festival",
        attendee_count: 500
      }
    ];

    // Insert events if we don't have enough
    if (parseInt(eventCount.rows[0].count) < 10) {
      console.log('📅 Creating test events...');
      for (const event of testEvents) {
        await db.execute(sql`
          INSERT INTO events (
            title, description, organizer, start_date, end_date, 
            location, event_type, attendee_count
          ) VALUES (
            ${event.title}, ${event.description}, ${event.organizer}, 
            ${event.start_date}::timestamp, ${event.end_date}::timestamp,
            ${event.location}, ${event.event_type}, ${event.attendee_count}
          )
        `);
      }
    }

    // Verify the data was created
    const newMemoryCount = await db.execute(sql`SELECT COUNT(*) as count FROM memories`);
    const newEventCount = await db.execute(sql`SELECT COUNT(*) as count FROM events`);
    
    console.log(`✅ Test data generation complete!`);
    console.log(`📊 Total memories: ${newMemoryCount.rows[0].count}`);
    console.log(`📊 Total events: ${newEventCount.rows[0].count}`);
    
    // Show sample of created memories
    const sampleMemories = await db.execute(sql`
      SELECT id, title, user_id, created_at 
      FROM memories 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log('\n📝 Sample memories created:');
    sampleMemories.rows.forEach(m => {
      console.log(`  - ${m.title} (User: ${m.user_id})`);
    });

  } catch (error) {
    console.error('❌ Error generating test data:', error);
    throw error;
  }
}

// Run the script
generateMemoriesTestData()
  .then(() => {
    console.log('✨ Test data generation completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test data generation failed:', error);
    process.exit(1);
  });