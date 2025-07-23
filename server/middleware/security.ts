import { Request, Response, NextFunction } from 'express';
import { pool } from '../db';

// Security middleware to set current user context for RLS policies
export const setUserContext = async (req: any, res: Response, next: NextFunction) => {
  try {
    let userId = null;

    // Extract user ID from different authentication methods
    if (req.user?.id) {
      // Direct user object (Replit Auth)
      userId = req.user.id;
    } else if (req.user?.claims?.sub) {
      // JWT claims format
      const { storage } = await import('../storage');
      const user = await storage.getUserByReplitId(req.user.claims.sub);
      userId = user?.id;
    }

    if (userId) {
      // Set the current user context for RLS policies
      await pool.query('SELECT set_config($1, $2, true)', ['app.current_user_id', userId.toString()]);
      console.log('🔒 Security context set for user:', userId);
    } else {
      // Clear any existing context
      await pool.query('SELECT set_config($1, $2, true)', ['app.current_user_id', '0']);
    }

    next();
  } catch (error) {
    console.error('Security context error:', error);
    // Don't fail the request, just proceed without context
    next();
  }
};

// Security audit middleware
export const auditSecurityEvent = (eventType: string) => {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id || (req.user?.claims?.sub ? 
        (await import('../storage')).storage.getUserByReplitId(req.user.claims.sub).then(u => u?.id) : null);
      
      if (userId) {
        const eventData = {
          method: req.method,
          path: req.path,
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          timestamp: new Date().toISOString()
        };

        // Log security event asynchronously
        setTimeout(async () => {
          try {
            await pool.query(
              'SELECT log_security_event($1, $2, $3, $4)',
              [eventType, req.path.split('/')[2] || 'unknown', userId, JSON.stringify(eventData)]
            );
          } catch (err) {
            console.error('Security audit error:', err);
          }
        }, 0);
      }

      next();
    } catch (error) {
      console.error('Security audit middleware error:', error);
      next();
    }
  };
};

// Middleware to check user permissions for specific resources
export const checkResourcePermission = (resourceType: 'post' | 'event' | 'chat' | 'story') => {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id || (req.user?.claims?.sub ? 
        (await (await import('../storage')).storage.getUserByReplitId(req.user.claims.sub))?.id : null);

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const resourceId = req.params.id || req.params.eventId || req.params.postId;
      
      if (resourceId && req.method !== 'POST') {
        let query = '';
        let params = [resourceId, userId];

        switch (resourceType) {
          case 'post':
            query = 'SELECT user_id FROM posts WHERE id = $1 AND (user_id = $2 OR is_public = true)';
            break;
          case 'event':
            query = 'SELECT user_id FROM events WHERE id = $1 AND (user_id = $2 OR is_public = true)';
            break;
          case 'chat':
            query = `SELECT 1 FROM chat_room_users 
                     WHERE room_slug = $1 AND user_id = $2`;
            params = [req.params.roomSlug, userId];
            break;
          case 'story':
            query = `SELECT user_id FROM stories WHERE id = $1 AND 
                     (user_id = $2 OR EXISTS (
                       SELECT 1 FROM follows 
                       WHERE follower_id = $2 AND following_id = stories.user_id
                     ))`;
            break;
        }

        if (query) {
          const result = await pool.query(query, params);
          if (result.rows.length === 0) {
            return res.status(403).json({ 
              success: false, 
              message: 'Access denied to this resource' 
            });
          }
        }
      }

      next();
    } catch (error) {
      console.error('Resource permission check error:', error);
      res.status(500).json({ success: false, message: 'Permission check failed' });
    }
  };
};

// Rate limiting middleware for sensitive operations
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (maxRequests: number, windowMs: number) => {
  return (req: any, res: Response, next: NextFunction) => {
    const key = `${req.ip}:${req.user?.id || 'anonymous'}`;
    const now = Date.now();
    
    const current = rateLimitStore.get(key);
    
    if (!current || now > current.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      next();
    } else if (current.count < maxRequests) {
      current.count++;
      next();
    } else {
      console.log('🚫 Rate limit exceeded for:', key);
      res.status(429).json({ 
        success: false, 
        message: 'Too many requests, please try again later' 
      });
    }
  };
};

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute