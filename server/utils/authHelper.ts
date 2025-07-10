import { db } from '../db';
import { users, userRoles, roles } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Unified authentication helper to handle multiple auth patterns
 */
export const getUserId = (req: any): number | null => {
  // Check multiple authentication patterns
  if (req.user?.id) return req.user.id;
  if (req.user?.claims?.sub) return req.user.claims.sub;
  if (req.session?.passport?.user?.id) return req.session.passport.user.id;
  if (req.session?.passport?.user?.claims?.sub) return req.session.passport.user.claims.sub;
  
  // Fallback for development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Auth bypass - using default user for development');
    return 7; // Scott Boddye's user ID
  }
  
  return null;
};

/**
 * Check if user has super admin role
 */
export const checkSuperAdminRole = async (userId: number): Promise<boolean> => {
  try {
    const userRoleData = await db
      .select({
        roleName: userRoles.roleName
      })
      .from(userRoles)
      .where(and(
        eq(userRoles.userId, userId),
        eq(userRoles.roleName, 'super_admin')
      ))
      .limit(1);
    
    return userRoleData.length > 0;
  } catch (error) {
    console.error('Error checking super admin role:', error);
    return false;
  }
};

/**
 * Super admin middleware
 */
export const requireSuperAdmin = async (req: any, res: any, next: any) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const isSuperAdmin = await checkSuperAdminRole(userId);
  if (!isSuperAdmin) {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  
  // Add user info to request for downstream use
  req.userId = userId;
  req.isSuperAdmin = true;
  
  next();
};

/**
 * Flexible authentication middleware
 */
export const flexibleAuth = async (req: any, res: any, next: any) => {
  const userId = getUserId(req);
  if (userId) {
    req.userId = userId;
    // Check if super admin
    req.isSuperAdmin = await checkSuperAdminRole(userId);
  }
  next();
};