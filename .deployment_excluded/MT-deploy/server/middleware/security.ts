import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { randomBytes } from 'crypto';
import DOMPurify from 'isomorphic-dompurify';
import rateLimit from 'express-rate-limit';

// Content Security Policy configuration - Life CEO 44x21s Layer 1-5 Foundation Security
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
      "https://cdnjs.cloudflare.com",
      "https://replit.com",
      "https://*.replit.dev",
      "https://*.replit.com"
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
      "wss://18b562b7-65d8-4db8-8480-61e8ab9b1db1-00-145w1q6sp1kov.kirk.replit.dev",
      "https://*.replit.dev",
      "https://*.replit.com"
    ],
    mediaSrc: ["'self'", "https:", "blob:"],
    objectSrc: ["'none'"],
    childSrc: ["'self'", "blob:"],
    workerSrc: ["'self'", "blob:"],
    manifestSrc: ["'self'"],
    frameAncestors: ["'self'", "https://*.replit.dev", "https://*.replit.com", "https://replit.com"],
    upgradeInsecureRequests: []
  }
});

// CSRF Protection middleware
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for AUTH_BYPASS mode
  if (process.env.AUTH_BYPASS?.toLowerCase() === 'true') {
    return next();
  }

  // Skip CSRF for API routes that use authentication headers
  if (req.path.startsWith('/api/') && req.headers.authorization) {
    return next();
  }

  // Skip for GET requests
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  // Skip CSRF for test endpoints, AI chat, and file uploads
  if (req.path.startsWith('/api/supabase/test-') || 
      req.path.startsWith('/api/ai/') ||
      req.path.startsWith('/api/upload/') ||
      req.path.includes('/photo') ||
      req.path.includes('/upload') ||
      req.path.includes('/cover-image') ||
      req.path.includes('/profile-image') ||
      req.path.includes('/performance/metrics') || // Performance metrics collection
      req.headers['content-type']?.includes('multipart/form-data') ||
      (process.env.AUTH_BYPASS === 'true' && req.path === '/api/posts') || // Skip for posts in AUTH_BYPASS mode
      (req as any).skipCsrf) {
    return next();
  }

  // Skip CSRF for webhook endpoints
  if (req.path.includes('/webhook')) {
    return next();
  }

  // Type assertion to handle session types
  const session = req.session as any;
  
  // Ensure session exists before proceeding
  if (!session) {
    console.warn('CSRF protection skipped: No session initialized');
    return next();
  }

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

// Security headers middleware - Life CEO 44x21s Layer 44 Critical Replit Preview Fix
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Layer 44 Critical: MINIMAL security headers for Replit preview compatibility
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // CRITICAL: Allow ALL frame ancestors for Replit preview
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  
  // CORS headers for Replit preview
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
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

// ESA-44x21 Payment Security Middleware - Layer 9: Security & Permissions Layer
// Rate limiting for payment endpoints
export const paymentRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many payment requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for subscription management
export const subscriptionRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many subscription requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// CSRF token validation specifically for payment endpoints
export const validateCSRFToken = (req: Request, res: Response, next: NextFunction) => {
  // Skip for webhook endpoints
  if (req.path.includes('/webhook')) {
    return next();
  }

  const sessionCsrf = (req.session as any)?.csrfToken;
  const headerCsrf = req.headers['x-csrf-token'];

  if (!sessionCsrf || !headerCsrf || sessionCsrf !== headerCsrf) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  next();
};

// Sanitize error messages to prevent PII leakage
export const sanitizeError = (error: any): { message: string; code?: string } => {
  const sensitivePatterns = [
    /stripeCustomerId[^\\s]*/gi,
    /cus_[A-Za-z0-9]+/g,
    /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})/g,
    /\\b\\d{4}\\b/g, // Last 4 digits of card
    /card_[A-Za-z0-9]+/g,
    /pm_[A-Za-z0-9]+/g,
    /pi_[A-Za-z0-9]+/g,
    /sub_[A-Za-z0-9]+/g
  ];

  let message = error?.message || 'An error occurred';
  
  // Replace sensitive data with [REDACTED]
  sensitivePatterns.forEach(pattern => {
    message = message.replace(pattern, '[REDACTED]');
  });

  return {
    message,
    code: error?.code
  };
};

// Audit payment events without logging PII
export const auditPaymentEvent = (userId: number, action: string, metadata: Record<string, any>) => {
  const sanitizedMetadata = { ...metadata };
  const piiFields = ['email', 'stripeCustomerId', 'cardNumber', 'cvv', 'expiryDate'];
  
  piiFields.forEach(field => {
    delete sanitizedMetadata[field];
  });

  console.log('[PAYMENT_AUDIT]', {
    timestamp: new Date().toISOString(),
    userId,
    action,
    metadata: sanitizedMetadata
  });
};

// Create webhook signature verifier
export const createWebhookSignatureVerifier = (secret: string, headerName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers[headerName];
    
    if (!signature) {
      return res.status(401).json({ error: 'Missing signature' });
    }

    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body), 'utf8')
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('[SECURITY] Invalid webhook signature attempt');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    next();
  };
};