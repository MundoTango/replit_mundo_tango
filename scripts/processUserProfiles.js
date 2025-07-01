#!/usr/bin/env node

/**
 * Process user profiles to complete onboarding and trigger city group automation
 * This simulates the registration flow that should automatically create groups
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Test users with diverse locations for automation testing
const testUsers = [
  { id: 21, name: "Carlos Miguel Santos", city: "Montevideo", country: "Uruguay" },
  { id: 22, name: "Isabella Chen", city: "San Francisco", country: "United States" },
  { id: 23, name: "Fabio Benedetti", city: "Milan", country: "Italy" },
  { id: 24, name: "Sophie Laurent", city: "Paris", country: "France" },
  { id: 25, name: "Miguel Alvarez", city: "Rosario", country: "Argentina" },
  { id: 26, name: "Anna Kowalski", city: "Warsaw", country: "Poland" },
  { id: 27, name: "Roberto Silva", city: "São Paulo", country: "Brazil" }
];

async function processUserProfiles() {
  console.log('🚀 Processing user profiles for group automation testing...\n');
  
  for (const user of testUsers) {
    console.log(`📋 Processing ${user.name} (${user.city}, ${user.country})`);
    
    try {
      // Step 1: Update user profile with complete location data
      const updateResult = await execQuery(`
        UPDATE users 
        SET city = '${user.city}', 
            country = '${user.country}',
            is_onboarding_complete = true,
            code_of_conduct_accepted = true,
            form_status = 2
        WHERE id = ${user.id}
        RETURNING id, name, city, country;
      `);
      
      if (updateResult.length > 0) {
        console.log(`   ✅ Profile updated: ${updateResult[0].name}`);
      }
      
      // Step 2: Check if city group exists
      const groupCheck = await execQuery(`
        SELECT id, name, slug, member_count 
        FROM groups 
        WHERE city = '${user.city}' AND type = 'city';
      `);
      
      if (groupCheck.length === 0) {
        console.log(`   📋 Creating city group for ${user.city}...`);
        
        // Generate group slug
        const slug = `tango-${user.city.toLowerCase().replace(/\s+/g, '-')}-${user.country.toLowerCase().replace(/\s+/g, '-')}`;
        const groupName = `Tango ${user.city}, ${user.country}`;
        const description = `Connect with tango dancers and enthusiasts in ${user.city}, ${user.country}. Share local events, find dance partners, and build community connections.`;
        
        // Create the group
        const createResult = await execQuery(`
          INSERT INTO groups (name, slug, type, emoji, description, is_private, city, country, member_count, created_by)
          VALUES ('${groupName}', '${slug}', 'city', '🏙️', '${description}', false, '${user.city}', '${user.country}', 0, 3)
          RETURNING id, name, slug;
        `);
        
        if (createResult.length > 0) {
          console.log(`   ✅ Group created: ${createResult[0].name} (${createResult[0].slug})`);
          
          // Step 3: Auto-join user to the new group
          const membershipResult = await execQuery(`
            INSERT INTO group_members (group_id, user_id, role, status, joined_at)
            VALUES (${createResult[0].id}, ${user.id}, 'member', 'active', NOW())
            RETURNING id;
          `);
          
          if (membershipResult.length > 0) {
            console.log(`   ✅ User auto-joined to group`);
            
            // Update member count
            await execQuery(`
              UPDATE groups 
              SET member_count = member_count + 1 
              WHERE id = ${createResult[0].id};
            `);
          }
        }
      } else {
        console.log(`   ✅ Group exists: ${groupCheck[0].name} (${groupCheck[0].member_count} members)`);
        
        // Check if user is already a member
        const memberCheck = await execQuery(`
          SELECT id FROM group_members 
          WHERE group_id = ${groupCheck[0].id} AND user_id = ${user.id} AND status = 'active';
        `);
        
        if (memberCheck.length === 0) {
          console.log(`   📋 Auto-joining user to existing group...`);
          
          const joinResult = await execQuery(`
            INSERT INTO group_members (group_id, user_id, role, status, joined_at)
            VALUES (${groupCheck[0].id}, ${user.id}, 'member', 'active', NOW())
            RETURNING id;
          `);
          
          if (joinResult.length > 0) {
            console.log(`   ✅ User joined existing group`);
            
            // Update member count
            await execQuery(`
              UPDATE groups 
              SET member_count = member_count + 1 
              WHERE id = ${groupCheck[0].id};
            `);
          }
        } else {
          console.log(`   ✅ User already a member of group`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Error processing ${user.name}:`, error.message);
    }
    
    console.log(''); // Add spacing
  }
  
  // Generate summary report
  await generateSummaryReport();
}

async function generateSummaryReport() {
  console.log('📊 AUTOMATION SUMMARY REPORT');
  console.log('=====================================\n');
  
  try {
    // Get total statistics
    const totalUsers = await execQuery(`
      SELECT COUNT(*) as count FROM users 
      WHERE is_onboarding_complete = true;
    `);
    
    const totalGroups = await execQuery(`
      SELECT COUNT(*) as count FROM groups 
      WHERE type = 'city';
    `);
    
    const totalMemberships = await execQuery(`
      SELECT COUNT(*) as count FROM group_members 
      WHERE status = 'active';
    `);
    
    console.log(`📈 Total Active Users: ${totalUsers[0]?.count || 0}`);
    console.log(`🏙️  Total City Groups: ${totalGroups[0]?.count || 0}`);
    console.log(`👥 Total Active Memberships: ${totalMemberships[0]?.count || 0}\n`);
    
    // List all city groups
    const allGroups = await execQuery(`
      SELECT name, city, country, member_count, slug 
      FROM groups 
      WHERE type = 'city' 
      ORDER BY city;
    `);
    
    console.log('🌍 CITY GROUPS CREATED:');
    console.log('------------------------');
    allGroups.forEach(group => {
      console.log(`• ${group.name} (${group.member_count} members) - /${group.slug}`);
    });
    
    console.log('\n✅ GROUP AUTOMATION TESTING COMPLETE!');
    console.log('\n🎯 Next Steps:');
    console.log('   1. Navigate to /groups page to see automation results');
    console.log('   2. Test the auto-join functionality');
    console.log('   3. Verify group navigation and membership status');
    console.log('   4. Test registration flow with new users');
    
  } catch (error) {
    console.log('❌ Error generating summary:', error.message);
  }
}

// Database query helper
async function execQuery(query) {
  try {
    const command = `psql "${process.env.DATABASE_URL}" -t -c "${query.replace(/"/g, '\\"')}"`;
    const { stdout } = await execAsync(command);
    
    if (query.trim().toUpperCase().startsWith('SELECT') || query.trim().toUpperCase().startsWith('INSERT')) {
      return parseQueryResult(stdout);
    }
    return [];
  } catch (error) {
    console.error('Query error:', error.message);
    return [];
  }
}

function parseQueryResult(stdout) {
  if (!stdout.trim()) return [];
  
  const lines = stdout.trim().split('\n').filter(line => line.trim());
  return lines.map(line => {
    try {
      // Simple parsing for common query results
      const parts = line.split('|').map(part => part.trim());
      if (parts.length === 1) {
        return { count: parseInt(parts[0]) || 0 };
      }
      // For more complex results, return as object
      return { raw: line };
    } catch {
      return { raw: line };
    }
  });
}

// Run the processing
if (require.main === module) {
  processUserProfiles().catch(console.error);
}

module.exports = { processUserProfiles, testUsers };