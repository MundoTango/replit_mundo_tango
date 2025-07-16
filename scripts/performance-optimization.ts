import { sql } from 'drizzle-orm';
import { db } from '../server/db';

async function createPerformanceIndexes() {
  console.log('🚀 Creating performance optimization indexes...');
  
  try {
    // Critical indexes for frequent queries
    const indexes = [
      // Posts feed queries
      'CREATE INDEX IF NOT EXISTS idx_posts_user_created ON posts(user_id, created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_posts_created_desc ON posts(created_at DESC)',
      
      // Memory queries
      'CREATE INDEX IF NOT EXISTS idx_memories_user_created ON memories(user_id, created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_memories_created_desc ON memories(created_at DESC)',
      
      // Comments queries
      'CREATE INDEX IF NOT EXISTS idx_comments_post_created ON post_comments(post_id, created_at)',
      
      // Notifications
      'CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read)',
      
      // Friend requests
      'CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status, created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_friends_user_status ON friends(user_id, status)',
      
      // Events
      'CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date)',
      'CREATE INDEX IF NOT EXISTS idx_events_city_start ON events(city, start_date)',
      
      // Reports for moderation
      'CREATE INDEX IF NOT EXISTS idx_reports_status_created ON reports(status, created_at DESC)',
      
      // User roles for auth
      'CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id)',
      
      // Groups
      'CREATE INDEX IF NOT EXISTS idx_groups_type ON groups(type)',
      'CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id)'
    ];
    
    for (const index of indexes) {
      console.log(`Creating index: ${index.match(/idx_\w+/)?.[0]}`);
      await db.execute(sql.raw(index));
    }
    
    console.log('✅ All performance indexes created successfully');
    
    // Analyze tables to update statistics
    const tables = ['posts', 'memories', 'post_comments', 'notifications', 'friends', 'events', 'users'];
    for (const table of tables) {
      console.log(`Analyzing table: ${table}`);
      await db.execute(sql.raw(`ANALYZE ${table}`));
    }
    
    console.log('✅ Table statistics updated');
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  }
}

// Run the optimization
createPerformanceIndexes().then(() => {
  console.log('🎉 Performance optimization complete');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});