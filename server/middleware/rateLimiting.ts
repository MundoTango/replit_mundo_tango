import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Critical endpoints that need stricter rate limiting
export const criticalEndpointsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per minute
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful logins
  standardHeaders: true,
  legacyHeaders: false
});

// Password reset rate limiting
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: 'Too many password reset requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// User registration rate limiting
export const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 registration attempts per hour
  message: 'Too many registration attempts, please try again later.',
  skipFailedRequests: true, // Don't count failed registrations
  standardHeaders: true,
  legacyHeaders: false
});

// API general rate limiting (more lenient)
export const apiGeneralLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per minute
  message: 'Too many requests, please slow down.',
  standardHeaders: true,
  legacyHeaders: false
});

// File upload rate limiting
export const fileUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 file uploads per 15 minutes
  message: 'Too many file uploads, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Report/flag content rate limiting
export const reportContentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 reports per hour
  message: 'Too many reports submitted, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Friend request rate limiting
export const friendRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 friend requests per hour
  message: 'Too many friend requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Event creation rate limiting
export const eventCreationLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10, // Limit each IP to 10 event creations per day
  message: 'Too many events created, please try again tomorrow.',
  standardHeaders: true,
  legacyHeaders: false
});

// Comment/post creation rate limiting
export const contentCreationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 posts/comments per minute
  message: 'Too many posts/comments, please slow down.',
  standardHeaders: true,
  legacyHeaders: false
});