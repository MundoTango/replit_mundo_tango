import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function createRealTestMemories() {
  console.log('Creating test memories with real user IDs...');

  // Test memories data with actual user IDs
  const memories = [
    {
      userId: 1, // maria_tango
      title: "My first milonga at La Viruta",
      content: "Just experienced the magic of La Viruta! The energy was incredible, and I finally nailed that complex sacada sequence I've been practicing. The live orchestra made everything feel so alive! #BuenosAires #Milonga #TangoLife",
      emotionTags: ['joy', 'excitement', 'accomplishment'],
      emotionVisibility: 'public',
      trustCircleLevel: 1,
      location: {
        name: "La Viruta, Buenos Aires, Argentina",
        coordinates: { lat: -34.5875, lng: -58.4371 },
        place_id: "ChIJN1t_tDeuEmsRUsoyG83frY4",
        formatted_address: "Armenia 1366, C1414 CABA, Argentina"
      }
    },
    {
      userId: 21, // dj_carlos
      title: "DJ set at Salon Canning",
      content: "Last night's DJ set at Salon Canning was pure magic! The floor was packed from start to finish. Played a beautiful tanda of D'Arienzo that had everyone flying. Thank you dancers for your energy! 🎵 #DJLife #Milonga #Canning",
      emotionTags: ['excitement', 'satisfaction', 'energy'],
      emotionVisibility: 'public',
      trustCircleLevel: 1,
      location: {
        name: "Salon Canning, Buenos Aires",
        coordinates: { lat: -34.6288, lng: -58.4160 },
        place_id: "ChIJN1t_tDeuEmsRUsoyG83frY6",
        formatted_address: "Av. Raúl Scalabrini Ortiz 1331, Buenos Aires"
      }
    },
    {
      userId: 22, // bella_organizer
      title: "Successful milonga organization",
      content: "What a night! Our monthly milonga was a huge success with over 100 dancers. The energy was electric and seeing everyone enjoying themselves made all the hard work worth it. Special thanks to our amazing DJ @dj_carlos! #MilongaOrganizer #Community",
      emotionTags: ['pride', 'satisfaction', 'gratitude'],
      emotionVisibility: 'public',
      trustCircleLevel: 1,
      location: {
        name: "Club Gricel, Buenos Aires",
        coordinates: { lat: -34.6432, lng: -58.4587 },
        place_id: "ChIJN1t_tDeuEmsRUsoyG83frY5",
        formatted_address: "La Rioja 1180, Buenos Aires, Argentina"
      }
    },
    {
      userId: 23, // fabio_performer
      title: "Performing at Teatro Colón",
      content: "Dream come true! Just performed at the iconic Teatro Colón with our company. The acoustics, the grandeur, the history - everything was perfect. Grateful to share the stage with such talented artists. This is why we dance! #Performance #TeatroColon #TangoShow",
      emotionTags: ['awe', 'gratitude', 'pride'],
      emotionVisibility: 'public',
      trustCircleLevel: 1,
      location: {
        name: "Teatro Colón, Buenos Aires",
        coordinates: { lat: -34.6011, lng: -58.3831 },
        place_id: "ChIJN1t_tDeuEmsRUsoyG83frY9",
        formatted_address: "Cerrito 628, Buenos Aires, Argentina"
      }
    },
    {
      userId: 24, // sophie_dancer
      title: "Beautiful practica session",
      content: "Had an incredible practica today working on musicality with new friends. We explored Pugliese's dramatic pauses and it opened up a whole new dimension in our dance. Sometimes the magic happens in the silence between notes. #Practica #Musicality #Pugliese",
      emotionTags: ['wonder', 'discovery', 'connection'],
      emotionVisibility: 'public',
      trustCircleLevel: 1,
      location: {
        name: "El Beso, Buenos Aires",
        coordinates: { lat: -34.6090, lng: -58.3968 },
        place_id: "ChIJN1t_tDeuEmsRUsoyG83frY7",
        formatted_address: "Riobamba 416, Buenos Aires, Argentina"
      }
    },
    {
      userId: 25, // miguel_musician
      title: "Playing live at milonga",
      content: "What an honor to play with the quintet tonight! The connection between the musicians and dancers was magical. When we played 'La Cumparsita' for the last tanda, the entire room was in tears. This is tango at its finest. #LiveMusic #Bandoneon #MilongaLife",
      emotionTags: ['honor', 'connection', 'emotion'],
      emotionVisibility: 'public',
      trustCircleLevel: 1,
      location: {
        name: "Salon El Abrojo, Buenos Aires",
        coordinates: { lat: -34.6245, lng: -58.4089 },
        place_id: "ChIJN1t_tDeuEmsRUsoyG83frY8",
        formatted_address: "Humberto I 1462, Buenos Aires"
      }
    },
    {
      userId: 26, // anna_workshop
      title: "Teaching my first workshop",
      content: "What an amazing experience teaching my first vals workshop today! Seeing students' faces light up when they understood the rhythm was priceless. Special thanks to @bella_organizer for the opportunity! #Teaching #Vals #Workshop",
      emotionTags: ['pride', 'gratitude', 'joy'],
      emotionVisibility: 'public',
      trustCircleLevel: 1,
      location: {
        name: "DNI Tango, Buenos Aires",
        coordinates: { lat: -34.5920, lng: -58.3731 },
        place_id: "ChIJN1t_tDeuEmsRUsoyG83frY5",
        formatted_address: "Bulnes 1011, Buenos Aires, Argentina"
      }
    },
    {
      userId: 27, // roberto_festival
      title: "Marathon memories from Bariloche",
      content: "Just returned from organizing the Bariloche Tango Marathon - what an unforgettable weekend! Dancing with a view of the Andes, connecting with dancers from around the world, and those late-night tandas that went until sunrise. Thank you to all who attended! #Marathon #Bariloche #TangoArgentina",
      emotionTags: ['joy', 'exhaustion', 'fulfillment'],
      emotionVisibility: 'public',
      trustCircleLevel: 1,
      location: {
        name: "Bariloche, Argentina",
        coordinates: { lat: -41.1335, lng: -71.3103 },
        place_id: "ChIJN1t_tDeuEmsRUsoyG83frY8",
        formatted_address: "San Carlos de Bariloche, Río Negro, Argentina"
      }
    },
    {
      userId: 30, // london_dancer
      title: "Sunset milonga at Puerto Madero",
      content: "Dancing tango by the river as the sun sets over Buenos Aires - moments like these remind me why I fell in love with this dance. Met wonderful dancers from Japan and Germany today. Tango truly is a universal language! #PuertoMadero #Milonga #SunsetTango",
      emotionTags: ['romance', 'peace', 'connection'],
      emotionVisibility: 'public',
      trustCircleLevel: 1,
      location: {
        name: "Puerto Madero, Buenos Aires",
        coordinates: { lat: -34.6118, lng: -58.3625 },
        place_id: "ChIJN1t_tDeuEmsRUsoyG83frY0",
        formatted_address: "Puerto Madero, Buenos Aires, Argentina"
      }
    },
    {
      userId: 31, // carlos_tango
      title: "Late night at Viruta",
      content: "3am and the dance floor is still packed! Just had the most amazing tanda to Troilo with a complete stranger who became a friend through our shared connection to the music. This is what tango is all about - pure connection and joy. #LaViruta #Connection #NightMilonga",
      emotionTags: ['joy', 'connection', 'energy'],
      emotionVisibility: 'public',
      trustCircleLevel: 1,
      location: {
        name: "La Viruta, Buenos Aires",
        coordinates: { lat: -34.5875, lng: -58.4371 },
        place_id: "ChIJN1t_tDeuEmsRUsoyG83frY4",
        formatted_address: "Armenia 1366, C1414 CABA, Argentina"
      }
    }
  ];

  try {
    // Insert memories
    for (const memory of memories) {
      // Generate a unique ID for each memory
      const memoryId = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const result = await sql`
        INSERT INTO memories (
          id,
          user_id, 
          title, 
          content,
          emotion_tags,
          emotion_visibility,
          trust_circle_level,
          location,
          media_urls,
          co_tagged_users,
          consent_required,
          is_archived,
          created_at,
          updated_at
        ) VALUES (
          ${memoryId},
          ${memory.userId},
          ${memory.title},
          ${memory.content},
          ${memory.emotionTags},
          ${memory.emotionVisibility},
          ${memory.trustCircleLevel},
          ${JSON.stringify(memory.location)}::jsonb,
          ARRAY[]::text[],
          ARRAY[]::integer[],
          false,
          false,
          NOW(),
          NOW()
        )
        ON CONFLICT DO NOTHING
        RETURNING id, title
      `;

      if (result.length > 0) {
        console.log(`✅ Created memory: "${result[0].title}" (ID: ${result[0].id})`);
      }
      
      // Small delay to ensure unique timestamps
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log('\n✨ All test memories created successfully!');

  } catch (error) {
    console.error('Error creating test memories:', error);
  }
}

// Run the script
createRealTestMemories();