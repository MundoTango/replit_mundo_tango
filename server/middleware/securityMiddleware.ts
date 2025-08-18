import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';

// ESA-44x21 Layer 9: Security & Permissions Layer
// Critical security middleware implementations

// CSRF Token generation and validation
export const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const validateCSRFToken = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for webhook endpoints that use signature verification
  if (req.path.includes('/webhooks/')) {
    return next();
  }

  const sessionToken = (req.session as any)?.csrfToken;
  const requestToken = req.headers['x-csrf-token'] || req.body._csrf;

  if (!sessionToken || !requestToken || sessionToken !== requestToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  next();
};

// ESA-44x21 Fix: Trust proxy configuration for rate limiters
const securityRateLimitConfig = {
  trustProxy: 1, // Trust first proxy (Replit)
  standardHeaders: true,
  legacyHeaders: false,
};

// Payment endpoint rate limiting
export const paymentRateLimiter = rateLimit({
  ...securityRateLimitConfig,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many payment requests from this IP, please try again later',
  // Store configuration for production (Redis recommended)
  handler: (req, res) => {
    console.error(`[SECURITY] Rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      error: 'Too many requests',
      message: 'Please try again later',
      retryAfter: (req as any).rateLimit?.resetTime
    });
  }
});

// Subscription endpoint rate limiting
export const subscriptionRateLimiter = rateLimit({
  ...securityRateLimitConfig,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many subscription requests from this IP, please try again later',
});

// General API rate limiting
export const apiRateLimiter = rateLimit({
  ...securityRateLimitConfig,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  skip: (req) => {
    // Skip rate limiting for health checks and static assets
    return req.path === '/api/health' || req.path.startsWith('/assets');
  }
});

// Webhook signature verification middleware factory
export const createWebhookSignatureVerifier = (
  secret: string,
  headerName: string,
  signaturePrefix: string = ''
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers[headerName] as string;
    
    if (!signature) {
      console.error(`[SECURITY] Missing webhook signature header: ${headerName}`);
      return res.status(401).json({ error: 'Missing signature' });
    }

    const body = JSON.stringify(req.body);
    const expectedSignature = signaturePrefix + crypto
      .createHmac('sha256', secret)
      .update(body, 'utf8')
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error(`[SECURITY] Invalid webhook signature for ${req.path}`);
      return res.status(401).json({ error: 'Invalid signature' });
    }

    next();
  };
};

// Sanitize error messages to prevent PII leakage
export const sanitizeError = (error: any): { message: string, code?: string } => {
  // Never log sensitive fields
  const sensitiveFields = [
    'stripeCustomerId', 'stripeSubscriptionId', 'paymentMethodId',
    'email', 'phone', 'address', 'card', 'bank', 'ssn', 'password'
  ];

  let sanitizedMessage = error.message || 'An error occurred';
  
  // Remove any sensitive data from error messages
  sensitiveFields.forEach(field => {
    const regex = new RegExp(`${field}[^\\s]*`, 'gi');
    sanitizedMessage = sanitizedMessage.replace(regex, '[REDACTED]');
  });

  // Log safe error for debugging without PII
  console.error('[SECURITY] Sanitized error:', {
    type: error.type || 'unknown',
    code: error.code || 'UNKNOWN_ERROR',
    path: error.path || 'unknown',
    timestamp: new Date().toISOString()
  });

  return {
    message: sanitizedMessage,
    code: error.code
  };
};

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://api.stripe.com; " +
    "frame-src https://js.stripe.com https://hooks.stripe.com;"
  );
  
  next();
};

// Audit logging for payment events
export const auditPaymentEvent = (
  userId: number,
  action: string,
  metadata: Record<string, any>
) => {
  // Log payment events without PII
  console.log('[AUDIT] Payment event:', {
    userId,
    action,
    timestamp: new Date().toISOString(),
    // Only log non-sensitive metadata
    metadata: {
      amount: metadata.amount,
      currency: metadata.currency,
      status: metadata.status,
      tier: metadata.tier
    }
  });
};