import { Request, Response, NextFunction } from 'express';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

interface SessionData {
  lastActivity?: number;
  userId?: number;
  warningShown?: boolean;
}

export function sessionTimeoutMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip for public routes
  const publicRoutes = ['/api/auth/login', '/api/auth/register', '/api/health'];
  if (publicRoutes.some(route => req.path.startsWith(route))) {
    return next();
  }

  const session = req.session as SessionData;
  const now = Date.now();

  // Check if user is authenticated
  if (session && session.userId) {
    const lastActivity = session.lastActivity || now;
    const timeSinceLastActivity = now - lastActivity;

    // Check if session has timed out
    if (timeSinceLastActivity > SESSION_TIMEOUT) {
      // Log security event
      console.log(`[SECURITY] Session timeout for user ${session.userId} after ${Math.floor(timeSinceLastActivity / 1000)}s of inactivity`);
      
      // Destroy session
      req.session.destroy((err) => {
        if (err) {
          console.error('[SECURITY] Error destroying session:', err);
        }
      });

      return res.status(401).json({
        code: 401,
        message: 'Session expired due to inactivity. Please log in again.',
        requiresAuth: true
      });
    }

    // Warn user if approaching timeout
    if (timeSinceLastActivity > (SESSION_TIMEOUT - WARNING_TIME) && !session.warningShown) {
      res.setHeader('X-Session-Warning', 'Your session will expire soon due to inactivity');
      session.warningShown = true;
    } else if (timeSinceLastActivity < (SESSION_TIMEOUT - WARNING_TIME)) {
      session.warningShown = false;
    }

    // Update last activity time
    session.lastActivity = now;
  }

  next();
}

// Session activity tracker for critical operations
export function trackCriticalActivity(req: Request, operation: string) {
  const session = req.session as SessionData;
  if (session && session.userId) {
    console.log(`[SECURITY] Critical operation "${operation}" by user ${session.userId}`);
    session.lastActivity = Date.now();
  }
}

// Get remaining session time
export function getRemainingSessionTime(req: Request): number {
  const session = req.session as SessionData;
  if (session && session.userId && session.lastActivity) {
    const elapsed = Date.now() - session.lastActivity;
    const remaining = SESSION_TIMEOUT - elapsed;
    return Math.max(0, remaining);
  }
  return 0;
}