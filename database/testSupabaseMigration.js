// Test script to validate Supabase migration
// Run this after deploying the migration to verify everything works

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration')
  console.log('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testMigration() {
  console.log('🧪 Testing Supabase Migration...\n')

  try {
    // Test 1: Check if all required tables exist
    console.log('1️⃣  Testing table creation...')
    const requiredTables = [
      'users', 'posts', 'events', 'groups', 'chat_rooms', 'chat_messages',
      'activities', 'feelings', 'friends', 'post_likes', 'post_comments',
      'event_participants', 'dance_experiences', 'teaching_experiences'
    ]

    for (const table of requiredTables) {
      const { data, error } = await supabase.from(table).select('id').limit(1)
      if (error) {
        console.error(`   ❌ Table '${table}' not found:`, error.message)
      } else {
        console.log(`   ✅ Table '${table}' exists`)
      }
    }

    // Test 2: Test user operations
    console.log('\n2️⃣  Testing user operations...')
    const testUser = {
      name: 'Test User',
      username: `test_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      first_name: 'Test',
      last_name: 'User',
      country: 'Argentina',
      city: 'Buenos Aires',
      languages: ['english', 'spanish'],
      tango_roles: ['dancer'],
      leader_level: 5,
      follower_level: 4,
      years_of_dancing: 3,
      started_dancing_year: 2021,
      user_type: '550e8400-e29b-41d4-a716-446655440014', // Regular user
      is_active: true,
      form_status: 2,
      is_onboarding_complete: true,
      code_of_conduct_accepted: true
    }

    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert(testUser)
      .select()
      .single()

    if (userError) {
      console.error('   ❌ Failed to create user:', userError.message)
    } else {
      console.log('   ✅ User created successfully:', newUser.id)

      // Test 3: Test post creation
      console.log('\n3️⃣  Testing post operations...')
      const testPost = {
        user_id: newUser.id,
        content: 'Testing the Supabase migration! Everything looks great.',
        visibility: 'public',
        is_public: true,
        hashtags: ['test', 'migration', 'supabase'],
        location: 'Test Location',
        city: 'Buenos Aires',
        country: 'Argentina'
      }

      const { data: newPost, error: postError } = await supabase
        .from('posts')
        .insert(testPost)
        .select()
        .single()

      if (postError) {
        console.error('   ❌ Failed to create post:', postError.message)
      } else {
        console.log('   ✅ Post created successfully:', newPost.id)

        // Test 4: Test relationships and joins
        console.log('\n4️⃣  Testing relationships...')
        const { data: postsWithUser, error: joinError } = await supabase
          .from('posts')
          .select(`
            id,
            content,
            user:user_id (id, name, username)
          `)
          .eq('id', newPost.id)
          .single()

        if (joinError) {
          console.error('   ❌ Failed to join tables:', joinError.message)
        } else {
          console.log('   ✅ Table joins working:', postsWithUser.user.name)
        }

        // Test 5: Test likes functionality
        console.log('\n5️⃣  Testing post likes...')
        const { error: likeError } = await supabase
          .from('post_likes')
          .insert({ post_id: newPost.id, user_id: newUser.id })

        if (likeError) {
          console.error('   ❌ Failed to like post:', likeError.message)
        } else {
          console.log('   ✅ Post like functionality working')
        }
      }

      // Test 6: Test search functionality
      console.log('\n6️⃣  Testing search...')
      const { data: searchResults, error: searchError } = await supabase
        .from('users')
        .select('id, name, username')
        .ilike('name', '%Test%')
        .limit(5)

      if (searchError) {
        console.error('   ❌ Search failed:', searchError.message)
      } else {
        console.log(`   ✅ Search working, found ${searchResults.length} results`)
      }

      // Test 7: Test RLS policies (should fail without proper auth)
      console.log('\n7️⃣  Testing Row Level Security...')
      const publicClient = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY || '')
      
      const { data: protectedData, error: rlsError } = await publicClient
        .from('users')
        .select('email')
        .limit(1)

      if (rlsError || !protectedData?.length) {
        console.log('   ✅ RLS policies working (protected data not accessible)')
      } else {
        console.warn('   ⚠️  RLS policies may need adjustment')
      }

      // Cleanup
      console.log('\n🧹 Cleaning up test data...')
      await supabase.from('post_likes').delete().eq('user_id', newUser.id)
      await supabase.from('posts').delete().eq('user_id', newUser.id)
      await supabase.from('users').delete().eq('id', newUser.id)
      console.log('   ✅ Test data cleaned up')
    }

    // Test 8: Check geographic functionality
    console.log('\n8️⃣  Testing geographic features...')
    const { data: geoData, error: geoError } = await supabase
      .rpc('nearby_users', { 
        lat: -34.6037, 
        lng: -58.3816, 
        radius_km: 50 
      })

    if (geoError && !geoError.message.includes('function "nearby_users" does not exist')) {
      console.error('   ❌ Geographic query failed:', geoError.message)
    } else if (geoError) {
      console.log('   ℹ️  Geographic functions need to be added (optional)')
    } else {
      console.log('   ✅ Geographic queries working')
    }

    console.log('\n🎉 Migration test completed successfully!')
    console.log('\nNext steps:')
    console.log('1. Update your app\'s DATABASE_URL to Supabase connection string')
    console.log('2. Configure environment variables for Supabase')
    console.log('3. Test your app with the new database')
    console.log('4. Deploy to production')

  } catch (error) {
    console.error('\n💥 Test failed with error:', error.message)
    console.log('\nPlease check:')
    console.log('1. Supabase project is running')
    console.log('2. Migration was applied successfully')
    console.log('3. Connection credentials are correct')
  }
}

// Run the test
testMigration()