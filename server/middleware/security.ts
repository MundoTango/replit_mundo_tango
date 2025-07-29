import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { randomBytes } from 'crypto';
import DOMPurify from 'isomorphic-dompurify';

// Content Security Policy configuration
export const contentSecurityPolicy = helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      "https://maps.googleapis.com",
      "https://cdn.plausible.io",
      "https://unpkg.com",
      "https://cdnjs.cloudflare.com"
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      "https://fonts.googleapis.com",
      "https://cdnjs.cloudflare.com"
    ],
    fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
    imgSrc: ["'self'", "data:", "https:", "blob:"],
    connectSrc: [
      "'self'",
      "https://api.pexels.com",
      "https://nominatim.openstreetmap.org",
      "https://plausible.io",
      "wss://18b562b7-65d8-4db8-8480-61e8ab9b1db1-00-145w1q6sp1kov.kirk.replit.dev"
    ],
    mediaSrc: ["'self'", "https:", "blob:"],
    objectSrc: ["'none'"],
    childSrc: ["'self'", "blob:"],
    workerSrc: ["'self'", "blob:"],
    manifestSrc: ["'self'"],
    upgradeInsecureRequests: []
  }
});

// CSRF Protection middleware
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for API routes that use authentication headers
  if (req.path.startsWith('/api/') && req.headers.authorization) {
    return next();
  }

  // Skip for GET requests
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  // Skip CSRF for test endpoints and AI chat
  if (req.path.startsWith('/api/supabase/test-') || 
      req.path.startsWith('/api/ai/') || 
      (req as any).skipCsrf) {
    return next();
  }

  // Type assertion to handle session types
  const session = req.session as any;

  // Generate CSRF token if not exists
  if (!session.csrfToken) {
    session.csrfToken = randomBytes(32).toString('hex');
  }

  // Verify CSRF token for state-changing requests
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  if (token !== session.csrfToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  next();
};

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    sanitizeObject(req.query);
  }

  // Sanitize params
  if (req.params && typeof req.params === 'object') {
    sanitizeObject(req.params);
  }

  next();
};

function sanitizeObject(obj: any): void {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'string') {
        // Sanitize HTML content
        obj[key] = DOMPurify.sanitize(obj[key], {
          ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p', 'ul', 'ol', 'li'],
          ALLOWED_ATTR: ['href', 'target', 'rel']
        });
        
        // Additional SQL injection prevention
        obj[key] = obj[key].replace(/['";\\]/g, '');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  }
}

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(self), microphone=(), camera=()');
  
  // HSTS for production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
};

// Rate limiting configuration for critical endpoints
export const criticalEndpointRateLimits = {
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: 'Too many login attempts, please try again later'
  },
  register: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 registrations per hour
    message: 'Too many registration attempts, please try again later'
  },
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 reset attempts
    message: 'Too many password reset attempts, please try again later'
  },
  apiWrite: {
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 write operations per minute
    message: 'Too many requests, please slow down'
  }
};

// Password strength validation
export const validatePasswordStrength = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Session security configuration
export const sessionSecurityConfig = {
  secret: process.env.SESSION_SECRET || randomBytes(64).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict' as const
  },
  name: 'mundotango.sid' // Custom session name
};