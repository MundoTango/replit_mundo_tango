import { db } from '../server/db.js';
import { users } from '../shared/schema.js';
import { sql } from 'drizzle-orm';
import bcrypt from 'bcrypt';

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: sql`replit_id = '44164221'`
    });
    
    if (existingUser) {
      console.log('User already exists:', existingUser.email);
      return;
    }
    
    // Create the user
    const hashedPassword = await bcrypt.hash('test123', 10);
    const [newUser] = await db.insert(users).values({
      replitId: '44164221',
      name: 'Scott Boddye',
      username: 'admin3304',
      email: 'admin@mundotango.life',
      password: hashedPassword,
      firstName: 'Scott',
      lastName: 'Boddye',
      profileImage: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    console.log('✅ User created successfully:', newUser.email);
    console.log('User ID:', newUser.id);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating user:', error);
    process.exit(1);
  }
}

createTestUser();