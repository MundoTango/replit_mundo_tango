import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

async function testDatabaseConnection() {
  try {
    const result = await pool.query('SELECT COUNT(*) as user_count FROM users');
    console.log('✅ PostgreSQL connected! User count:', result.rows[0].user_count);
    
    // Test a few more tables
    const tables = ['posts', 'events', 'chat_rooms'];
    for (const table of tables) {
      const tableResult = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`✅ ${table} table: ${tableResult.rows[0].count} records`);
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

testDatabaseConnection()