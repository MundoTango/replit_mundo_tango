import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function createTestMemories() {
  console.log('Creating test memories for users...');

  // First, check the actual columns in the memories table
  const columns = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'memories' 
    ORDER BY ordinal_position
  `;
  
  console.log('Memories table columns:', columns);

  // Test memories data - updated to match actual table structure
  const memories = [
    {
      userId: 1,
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
      userId: 2,
      title: "Teaching my first workshop",
      content: "What an amazing experience teaching my first vals workshop today! Seeing students' faces light up when they understood the rhythm was priceless. Special thanks to @carlos for the opportunity! #Teaching #Vals #Workshop",
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
      userId: 4,
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
      userId: 5,
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
      userId: 6,
      title: "Marathon memories from Bariloche",
      content: "Just returned from the Bariloche Tango Marathon - what an unforgettable weekend! Dancing with a view of the Andes, connecting with dancers from around the world, and those late-night tandas that went until sunrise. My feet are tired but my heart is full! #Marathon #Bariloche #TangoArgentina",
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
      userId: 8,
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
      userId: 9,
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
      userId: 11,
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
    // First, let's check if we have a memories table (it might be called posts)
    const tableCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('memories', 'posts')
    `;

    const tableName = tableCheck[0]?.table_name || 'posts';
    console.log(`Using table: ${tableName}`);

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
    }

    // Let's also add some likes and comments to make it more realistic
    const posts = await sql`
      SELECT id, user_id FROM memories 
      ORDER BY created_at DESC 
      LIMIT 8
    `;

    // Add some likes
    const likePromises = [];
    for (const post of posts) {
      // Each post gets 2-4 likes from different users
      const likers = [1, 2, 4, 5, 6, 8, 9, 11].filter(id => id !== post.user_id);
      const numLikes = Math.floor(Math.random() * 3) + 2;
      
      for (let i = 0; i < numLikes && i < likers.length; i++) {
        likePromises.push(sql`
          INSERT INTO post_likes (post_id, user_id, created_at)
          VALUES (${post.id}, ${likers[i]}, NOW())
          ON CONFLICT DO NOTHING
        `);
      }
    }

    await Promise.all(likePromises);
    console.log(`✅ Added likes to posts`);

    // Add a few comments
    const comments = [
      { postIndex: 0, userId: 2, content: "La Viruta is magical! Hope to dance with you there soon 💃" },
      { postIndex: 1, userId: 5, content: "Your workshop was amazing! Can't wait for the next one!" },
      { postIndex: 2, userId: 9, content: "Your tandas always get everyone moving! See you at the next milonga 🎵" },
      { postIndex: 3, userId: 1, content: "Pugliese's pauses are so powerful. Let's practice together sometime!" },
      { postIndex: 4, userId: 11, content: "Bariloche marathon is on my bucket list! The photos look incredible 🏔️" }
    ];

    for (const comment of comments) {
      if (posts[comment.postIndex]) {
        await sql`
          INSERT INTO post_comments (
            post_id, 
            user_id, 
            content, 
            created_at
          ) VALUES (
            ${posts[comment.postIndex].id},
            ${comment.userId},
            ${comment.content},
            NOW()
          )
          ON CONFLICT DO NOTHING
        `;
      }
    }

    console.log(`✅ Added comments to posts`);
    console.log('\n✨ Test memories created successfully!');

  } catch (error) {
    console.error('Error creating test memories:', error);
  }
}

// Run the script
createTestMemories();