import { Request, Response, NextFunction } from 'express';
import { authService, UserRole } from '../services/authService';

// Extend Express Request to include user role information
declare global {
  namespace Express {
    interface Request {
      userRole?: UserRole;
      userPermissions?: Record<string, boolean>;
      userWithRole?: any;
    }
  }
}

export interface RoleAuthOptions {
  roles?: UserRole[];
  permissions?: string[];
  requireAll?: boolean; // If true, user must have ALL permissions; if false, ANY permission
}

/**
 * Middleware to check user roles and permissions
 */
export function requireRole(options: RoleAuthOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get user ID from existing auth middleware
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({
          code: 401,
          message: 'Authentication required',
          data: null
        });
      }

      // Get user with role information
      const userWithRole = await authService.getUserWithRole(userId);
      
      if (!userWithRole) {
        return res.status(401).json({
          code: 401,
          message: 'User not found or inactive',
          data: null
        });
      }

      if (!userWithRole.isActive) {
        return res.status(403).json({
          code: 403,
          message: 'Account is deactivated',
          data: null
        });
      }

      // Attach role information to request
      req.userRole = userWithRole.role;
      req.userPermissions = userWithRole.permissions;
      req.userWithRole = userWithRole;

      // Check role requirements
      if (options.roles && options.roles.length > 0) {
        if (!options.roles.includes(userWithRole.role)) {
          return res.status(403).json({
            code: 403,
            message: `Access denied. Required roles: ${options.roles.join(', ')}`,
            data: { userRole: userWithRole.role, requiredRoles: options.roles }
          });
        }
      }

      // Check permission requirements
      if (options.permissions && options.permissions.length > 0) {
        const hasPermissions = options.requireAll
          ? options.permissions.every(permission => userWithRole.permissions[permission])
          : options.permissions.some(permission => userWithRole.permissions[permission]);

        if (!hasPermissions) {
          return res.status(403).json({
            code: 403,
            message: `Access denied. Required permissions: ${options.permissions.join(', ')}`,
            data: { 
              userPermissions: Object.keys(userWithRole.permissions).filter(p => userWithRole.permissions[p]),
              requiredPermissions: options.permissions,
              requireAll: options.requireAll
            }
          });
        }
      }

      next();
    } catch (error) {
      console.error('Role authentication error:', error);
      res.status(500).json({
        code: 500,
        message: 'Internal server error during role authentication',
        data: null
      });
    }
  };
}

/**
 * Convenience middleware for common role requirements
 */
export const requireAdmin = requireRole({ roles: ['admin'] });
export const requireOrganizer = requireRole({ roles: ['admin', 'organizer'] });
export const requireTeacher = requireRole({ roles: ['admin', 'organizer', 'teacher'] });
export const requireDancer = requireRole({ roles: ['admin', 'organizer', 'teacher', 'dancer'] });

/**
 * Convenience middleware for common permission requirements
 */
export const requireEventManagement = requireRole({ 
  permissions: ['manage_events', 'create_events', 'manage_own_events'], 
  requireAll: false 
});

export const requireContentModeration = requireRole({ 
  permissions: ['moderate_content', 'moderate_comments', 'moderate_event_content'], 
  requireAll: false 
});

export const requireUserManagement = requireRole({ 
  permissions: ['manage_users', 'ban_users'], 
  requireAll: false 
});

/**
 * Middleware to ensure user profile exists and is properly set up
 */
export async function ensureUserProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: 'Authentication required',
        data: null
      });
    }

    // Ensure user profile exists
    await authService.ensureUserProfile(userId);
    
    next();
  } catch (error) {
    console.error('Error ensuring user profile:', error);
    res.status(500).json({
      code: 500,
      message: 'Error setting up user profile',
      data: null
    });
  }
}

/**
 * Middleware to check if user can access a specific resource
 */
export function requireResourceAccess(resourceType: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      const resourceId = req.params.id;
      
      if (!userId) {
        return res.status(401).json({
          code: 401,
          message: 'Authentication required',
          data: null
        });
      }

      const userWithRole = await authService.getUserWithRole(userId);
      
      if (!userWithRole) {
        return res.status(401).json({
          code: 401,
          message: 'User not found',
          data: null
        });
      }

      // Admin can access everything
      if (userWithRole.role === 'admin') {
        req.userWithRole = userWithRole;
        return next();
      }

      // Check specific resource access based on type
      let hasAccess = false;
      
      switch (resourceType) {
        case 'event':
          hasAccess = userWithRole.permissions.manage_events || 
                     userWithRole.permissions.manage_own_events;
          break;
        case 'post':
          hasAccess = userWithRole.permissions.create_posts ||
                     userWithRole.permissions.moderate_content;
          break;
        case 'user':
          hasAccess = userWithRole.permissions.manage_users ||
                     userId.toString() === resourceId; // Users can access their own data
          break;
        default:
          hasAccess = false;
      }

      if (!hasAccess) {
        return res.status(403).json({
          code: 403,
          message: `Access denied to ${resourceType}`,
          data: { resourceType, resourceId }
        });
      }

      req.userWithRole = userWithRole;
      next();
    } catch (error) {
      console.error('Resource access check error:', error);
      res.status(500).json({
        code: 500,
        message: 'Error checking resource access',
        data: null
      });
    }
  };
}

/**
 * Middleware to log role-based actions for audit trail
 */
export function auditRoleAction(action: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Store audit info in request for later logging
    (req as any).auditAction = {
      action,
      userId: (req as any).user?.id,
      userRole: req.userRole,
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };
    
    next();
  };
}

/**
 * Middleware to enforce rate limiting based on user role
 */
export function roleBasedRateLimit() {
  const rateLimits = new Map<string, { count: number; resetTime: number }>();
  
  // Different limits for different roles
  const limits = {
    guest: { requests: 10, window: 60000 }, // 10 requests per minute
    dancer: { requests: 50, window: 60000 }, // 50 requests per minute
    teacher: { requests: 100, window: 60000 }, // 100 requests per minute
    organizer: { requests: 200, window: 60000 }, // 200 requests per minute
    admin: { requests: 1000, window: 60000 } // 1000 requests per minute
  };

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      const userRole = req.userRole || 'guest';
      const key = `${userId || req.ip}_${userRole}`;
      const now = Date.now();
      
      const limit = limits[userRole as keyof typeof limits] || limits.guest;
      
      let usage = rateLimits.get(key);
      
      if (!usage || now > usage.resetTime) {
        usage = { count: 0, resetTime: now + limit.window };
      }
      
      usage.count++;
      rateLimits.set(key, usage);
      
      if (usage.count > limit.requests) {
        return res.status(429).json({
          code: 429,
          message: 'Rate limit exceeded',
          data: {
            limit: limit.requests,
            window: limit.window,
            role: userRole,
            resetTime: usage.resetTime
          }
        });
      }
      
      // Clean up expired entries periodically
      if (Math.random() < 0.01) { // 1% chance to clean up
        for (const [k, v] of rateLimits.entries()) {
          if (now > v.resetTime) {
            rateLimits.delete(k);
          }
        }
      }
      
      next();
    } catch (error) {
      console.error('Rate limiting error:', error);
      next(); // Don't block requests on rate limiting errors
    }
  };
}