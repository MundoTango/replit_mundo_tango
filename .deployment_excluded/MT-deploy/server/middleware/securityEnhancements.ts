/**
 * ESA-44x21s Security Enhancements Middleware
 * Life CEO Agents 11-16: Implementation & Security Hardening
 * 
 * This middleware addresses GitHub security vulnerabilities:
 * - Input validation for RegExp DoS prevention
 * - Request size limits
 * - Header manipulation protection
 * - SSRF prevention
 * - XSS protection enhancements
 */

import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';

// Configuration for security limits
const SECURITY_LIMITS = {
  MAX_STRING_LENGTH: 10000,
  MAX_REGEX_COMPLEXITY: 100,
  MAX_REQUEST_SIZE: '10mb',
  MAX_URL_LENGTH: 2048,
  MAX_HEADER_SIZE: 8192,
  REQUEST_TIMEOUT: 30000, // 30 seconds for regular requests
  UPLOAD_TIMEOUT: 300000, // ESA LIFE CEO 56x21 - 5 minutes for uploads
};

// RegExp DoS Protection - prevents catastrophic backtracking
export const regexpProtection = (req: Request, res: Response, next: NextFunction) => {
  const checkRegExpComplexity = (pattern: string): boolean => {
    // Check for dangerous patterns
    const dangerousPatterns = [
      /(\w+\+)+/,  // Nested quantifiers
      /(\S+\*)+/,  // Multiple wildcards
      /(a+)+b/,    // Catastrophic backtracking pattern
      /(\d+)*\d+/, // Overlapping patterns
    ];
    
    for (const dangerous of dangerousPatterns) {
      if (dangerous.test(pattern)) {
        return false;
      }
    }
    
    // Check pattern length
    if (pattern.length > SECURITY_LIMITS.MAX_REGEX_COMPLEXITY) {
      return false;
    }
    
    return true;
  };
  
  // Validate RegExp patterns in request data
  const validateRegExpInData = (obj: any): void => {
    if (typeof obj === 'string') {
      // Check if string looks like a regex pattern
      if (obj.startsWith('/') && obj.includes('/', 1)) {
        const pattern = obj.slice(1, obj.lastIndexOf('/'));
        if (!checkRegExpComplexity(pattern)) {
          throw new Error('RegExp pattern too complex - potential DoS');
        }
      }
    }
    
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          validateRegExpInData(obj[key]);
        }
      }
    }
  };
  
  try {
    // Validate query parameters and body for regex patterns
    validateRegExpInData(req.query);
    if (req.body) {
      validateRegExpInData(req.body);
    }
    next();
  } catch (error: any) {
    res.status(400).json({
      error: 'Invalid input',
      message: error.message
    });
  }
};

// Input Length Validation - prevents memory exhaustion
export const inputLengthValidation = (req: Request, res: Response, next: NextFunction) => {
  const validateLength = (obj: any, path: string = ''): void => {
    if (typeof obj === 'string' && obj.length > SECURITY_LIMITS.MAX_STRING_LENGTH) {
      throw new Error(`Input too long at ${path}: ${obj.length} chars`);
    }
    
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          validateLength(obj[key], `${path}.${key}`);
        }
      }
    }
  };
  
  try {
    // Validate query parameters
    validateLength(req.query, 'query');
    
    // Validate body
    if (req.body) {
      validateLength(req.body, 'body');
    }
    
    // Validate headers
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === 'string' && value.length > SECURITY_LIMITS.MAX_HEADER_SIZE) {
        return res.status(431).json({
          error: 'Request Header Fields Too Large'
        });
      }
    }
    
    next();
  } catch (error: any) {
    res.status(400).json({
      error: 'Invalid input length',
      message: error.message
    });
  }
};

// SSRF Prevention - validates URLs and prevents internal network access
export const ssrfPrevention = (req: Request, res: Response, next: NextFunction) => {
  const isInternalUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.toLowerCase();
      
      // Block internal IPs and domains
      const blockedPatterns = [
        /^localhost$/,
        /^127\./,
        /^10\./,
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
        /^192\.168\./,
        /^169\.254\./,
        /^::1$/,
        /^fc00:/,
        /^fe80:/,
        /\.local$/,
        /\.internal$/,
      ];
      
      return blockedPatterns.some(pattern => pattern.test(hostname));
    } catch {
      return false;
    }
  };
  
  // Check for URL parameters in request
  const checkForUrls = (obj: any): void => {
    if (typeof obj === 'string') {
      // Check if it looks like a URL
      if (/^https?:\/\//.test(obj) && isInternalUrl(obj)) {
        throw new Error('Access to internal URLs is forbidden');
      }
    }
    
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          checkForUrls(obj[key]);
        }
      }
    }
  };
  
  try {
    checkForUrls(req.query);
    checkForUrls(req.body);
    next();
  } catch (error: any) {
    res.status(403).json({
      error: 'Forbidden',
      message: error.message
    });
  }
};

// Enhanced XSS Protection
export const enhancedXssProtection = (req: Request, res: Response, next: NextFunction) => {
  // Set additional security headers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Content-Security-Policy-Report-Only', 
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  );
  
  // Sanitize common XSS vectors in request
  const sanitizeXss = (obj: any): any => {
    if (typeof obj === 'string') {
      // Remove script tags and event handlers
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/javascript:/gi, '');
    }
    
    if (typeof obj === 'object' && obj !== null) {
      const cleaned: any = Array.isArray(obj) ? [] : {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cleaned[key] = sanitizeXss(obj[key]);
        }
      }
      return cleaned;
    }
    
    return obj;
  };
  
  // Sanitize request data
  if (req.body) {
    req.body = sanitizeXss(req.body);
  }
  
  next();
};

// Request Timeout Protection
export const requestTimeoutProtection = (req: Request, res: Response, next: NextFunction) => {
  // ESA LIFE CEO 56x21 - Use longer timeout for upload endpoints
  const isUploadEndpoint = req.path.includes('/upload') || 
                          req.path === '/api/memories' || 
                          req.path.includes('/api/posts');
  
  const timeout = isUploadEndpoint ? SECURITY_LIMITS.UPLOAD_TIMEOUT : SECURITY_LIMITS.REQUEST_TIMEOUT;
  
  const timer = setTimeout(() => {
    if (!res.headersSent) {
      res.status(408).json({
        error: 'Request Timeout',
        message: 'The request took too long to process'
      });
    }
  }, timeout);
  
  // Clear timeout when response is sent
  res.on('finish', () => clearTimeout(timer));
  res.on('close', () => clearTimeout(timer));
  
  next();
};

// Memory Leak Prevention
export const memoryLeakPrevention = (req: Request, res: Response, next: NextFunction) => {
  // Track request start
  const startMemory = process.memoryUsage();
  const startTime = performance.now();
  
  // Monitor memory usage
  res.on('finish', () => {
    const endMemory = process.memoryUsage();
    const endTime = performance.now();
    
    const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;
    const timeDelta = endTime - startTime;
    
    // Log if memory usage is concerning
    if (memoryDelta > 50 * 1024 * 1024) { // 50MB
      console.warn(`High memory usage detected: ${Math.round(memoryDelta / 1024 / 1024)}MB in ${Math.round(timeDelta)}ms for ${req.method} ${req.path}`);
    }
  });
  
  next();
};

// Comprehensive Security Middleware Stack
export const comprehensiveSecurityMiddleware = [
  regexpProtection,
  inputLengthValidation,
  ssrfPrevention,
  enhancedXssProtection,
  requestTimeoutProtection,
  memoryLeakPrevention,
];

// Export individual middleware for selective use
export default {
  regexpProtection,
  inputLengthValidation,
  ssrfPrevention,
  enhancedXssProtection,
  requestTimeoutProtection,
  memoryLeakPrevention,
  comprehensiveSecurityMiddleware,
};