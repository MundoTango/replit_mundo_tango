import { db } from '../server/db';
import { users, roles, userRoles } from '../shared/schema';
import { eq, and } from 'drizzle-orm';

async function assignSuperAdmin() {
  try {
    console.log('🚀 Assigning super admin role to Scott Boddye...');
    
    // Find Scott Boddye's user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, 7))
      .limit(1);
    
    if (!user || user.length === 0) {
      console.error('❌ User with ID 7 not found');
      return;
    }
    
    console.log('✅ Found user:', user[0].name, user[0].username);
    
    // We know super_admin role exists, no need to query it
    console.log('✅ Using super_admin role');
    
    // Check if user already has super_admin role
    const existingRole = await db
      .select()
      .from(userRoles)
      .where(and(
        eq(userRoles.userId, 7),
        eq(userRoles.roleName, 'super_admin')
      ))
      .limit(1);
    
    if (existingRole && existingRole.length > 0) {
      console.log('⚠️  User already has super_admin role');
      return;
    }
    
    // Assign super_admin role
    await db.insert(userRoles).values({
      userId: 7,
      roleName: 'super_admin',
      isPrimary: false, // Keep existing primary role
      assignedAt: new Date(),
      assignedBy: 7 // Self-assigned
    });
    
    console.log('✅ Successfully assigned super_admin role to Scott Boddye');
    
    // Verify the assignment
    const userRolesAfter = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, 7));
    
    console.log('📊 User roles after assignment:', userRolesAfter.map(r => r.roleName));
    
  } catch (error) {
    console.error('❌ Error assigning super admin role:', error);
  } finally {
    process.exit(0);
  }
}

assignSuperAdmin();