import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// ESA-44x21 Fix: Configure trust proxy for rate limiters
const rateLimitConfig = {
  trustProxy: 1, // Trust first proxy (Replit)
  standardHeaders: true,
  legacyHeaders: false,
};

// Critical endpoints that need stricter rate limiting
export const criticalEndpointsLimiter = rateLimit({
  ...rateLimitConfig,
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per minute
  message: 'Too many requests from this IP, please try again later.',
  handler: (req: Request, res: Response) => {
    console.warn(`Rate limit exceeded for ${req.ip} on ${req.path}`);
    res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please wait before making more requests.',
      retryAfter: 60
    });
  }
});

// Authentication endpoints rate limiting
export const authEndpointsLimiter = rateLimit({
  ...rateLimitConfig,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Password reset rate limiting
export const passwordResetLimiter = rateLimit({
  ...rateLimitConfig,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: 'Too many password reset requests, please try again later.',
});

// User registration rate limiting
export const registrationLimiter = rateLimit({
  ...rateLimitConfig,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 registration attempts per hour
  message: 'Too many registration attempts, please try again later.',
  skipFailedRequests: true, // Don't count failed registrations
});

// API general rate limiting (more lenient)
export const apiGeneralLimiter = rateLimit({
  ...rateLimitConfig,
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per minute
  message: 'Too many requests, please slow down.',
});

// File upload rate limiting
export const fileUploadLimiter = rateLimit({
  ...rateLimitConfig,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 file uploads per 15 minutes
  message: 'Too many file uploads, please try again later.',
});

// Report/flag content rate limiting
export const reportContentLimiter = rateLimit({
  ...rateLimitConfig,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 reports per hour
  message: 'Too many reports submitted, please try again later.',
});

// Friend request rate limiting
export const friendRequestLimiter = rateLimit({
  ...rateLimitConfig,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 friend requests per hour
  message: 'Too many friend requests, please try again later.',
});

// Event creation rate limiting
export const eventCreationLimiter = rateLimit({
  ...rateLimitConfig,
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10, // Limit each IP to 10 event creations per day
  message: 'Too many events created, please try again tomorrow.',
});

// Comment/post creation rate limiting - ESA LIFE CEO 56x21 FIXED
export const contentCreationLimiter = rateLimit({
  ...rateLimitConfig,
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // ESA LIFE CEO 56x21 - Increased to 100 posts/comments per minute for uploads
  message: 'Too many posts/comments, please slow down.',
});