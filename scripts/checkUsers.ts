import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function checkUsers() {
  const users = await sql`
    SELECT id, username, name 
    FROM users 
    ORDER BY id
  `;
  
  console.log('Existing users:', users);
}

checkUsers();
