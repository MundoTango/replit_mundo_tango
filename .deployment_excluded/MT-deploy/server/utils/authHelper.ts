import { db } from '../db';
import { users, userRoles } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Unified authentication helper to handle multiple auth patterns
 */
export const getUserId = (req: any): number | string | null => {
  // ESA Framework Layer 13: Systematic authentication with retro fixes
  
  // Primary authentication patterns
  if (req.user?.id) {
    console.log('🔐 ESA Auth: Found req.user.id:', req.user.id);
    return req.user.id;
  }
  
  if (req.user?.claims?.sub) {
    console.log('🔐 ESA Auth: Found req.user.claims.sub:', req.user.claims.sub);
    return req.user.claims.sub;
  }
  
  // Session-based authentication
  if (req.session?.passport?.user?.id) {
    console.log('🔐 ESA Auth: Found session user id:', req.session.passport.user.id);
    return req.session.passport.user.id;
  }
  
  if (req.session?.passport?.user?.claims?.sub) {
    console.log('🔐 ESA Auth: Found session claims sub:', req.session.passport.user.claims.sub);
    return req.session.passport.user.claims.sub;
  }
  
  // Development fallback with enhanced logging
  if (process.env.NODE_ENV === 'development' || process.env.AUTH_BYPASS === 'true') {
    console.log('🔧 ESA Layer 13: Auth bypass - using default admin user');
    return 7; // Scott Boddye's admin user ID
  }
  
  console.log('❌ ESA Layer 13: No valid authentication found');
  return null;
};

/**
 * Check if user has super admin role - ESA Layer 13 Enhanced
 */
export const checkSuperAdminRole = async (userId: number | string): Promise<boolean> => {
  try {
    // Convert string userId to number if needed
    const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    if (isNaN(numericUserId)) {
      console.error('❌ ESA Layer 13: Invalid userId for super admin check:', userId);
      return false;
    }

    const userRoleData = await db
      .select({
        roleName: userRoles.roleName
      })
      .from(userRoles)
      .where(and(
        eq(userRoles.userId, numericUserId),
        eq(userRoles.roleName, 'super_admin')
      ))
      .limit(1);
    
    return userRoleData.length > 0;
  } catch (error) {
    console.error('❌ ESA Layer 13: Error checking super admin role:', error);
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
 * Flexible authentication middleware - ESA Layer 13 Enhanced
 */
export const flexibleAuth = async (req: any, res: any, next: any) => {
  const userId = getUserId(req);
  if (userId) {
    // Convert to number for consistency
    const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    req.userId = isNaN(numericUserId) ? userId : numericUserId;
    
    // Check if super admin
    req.isSuperAdmin = await checkSuperAdminRole(userId);
  }
  next();
};