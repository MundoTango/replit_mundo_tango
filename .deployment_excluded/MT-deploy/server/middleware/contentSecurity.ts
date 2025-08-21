/**
 * ESA 50x21s Layer 50: Content Security Middleware
 * Sanitizes all outbound responses to remove proprietary references
 */

import { Request, Response, NextFunction } from 'express';

// Proprietary terms to sanitize
const PROPRIETARY_TERMS = [
  'Life CEO 44x21',
  'Life CEO 50x21',
  '44x21 Framework',
  '50x21 Framework',
  '16 AI Agents',
  'ESA methodology',
  'proprietary methodology',
  'trade secrets'
];

// Safe replacements
const SAFE_REPLACEMENTS = new Map([
  ['Life CEO 44x21', 'Comprehensive Platform'],
  ['Life CEO 50x21', 'Comprehensive Platform'],
  ['44x21 Framework', 'Development Framework'],
  ['50x21 Framework', 'Development Framework'],
  ['16 AI Agents', 'AI-powered features'],
  ['ESA methodology', 'systematic approach'],
  ['proprietary methodology', 'platform features'],
  ['trade secrets', 'platform capabilities']
]);

/**
 * Sanitize content by removing proprietary references
 */
function sanitizeContent(content: any): any {
  if (typeof content === 'string') {
    let sanitized = content;
    PROPRIETARY_TERMS.forEach(term => {
      const replacement = SAFE_REPLACEMENTS.get(term) || 'platform feature';
      const regex = new RegExp(term, 'gi');
      sanitized = sanitized.replace(regex, replacement);
    });
    return sanitized;
  }
  
  if (Array.isArray(content)) {
    return content.map(item => sanitizeContent(item));
  }
  
  if (content && typeof content === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(content)) {
      sanitized[key] = sanitizeContent(value);
    }
    return sanitized;
  }
  
  return content;
}

/**
 * Content Security Middleware
 * Applies to all external API responses
 */
export function contentSecurityMiddleware(req: Request, res: Response, next: NextFunction) {
  // Only apply to external-facing endpoints
  const externalPaths = [
    '/api/public',
    '/api/partner',
    '/api/webhook',
    '/api/integration'
  ];
  
  const isExternal = externalPaths.some(path => req.path.startsWith(path));
  
  if (!isExternal) {
    return next();
  }
  
  // Override the json method to sanitize responses
  const originalJson = res.json.bind(res);
  res.json = function(body: any) {
    const sanitized = sanitizeContent(body);
    return originalJson(sanitized);
  };
  
  next();
}

/**
 * Documentation Security Check
 * Validates that no proprietary terms exist in public docs
 */
export function validateDocumentation(content: string): {
  isSecure: boolean;
  violations: string[];
} {
  const violations: string[] = [];
  
  PROPRIETARY_TERMS.forEach(term => {
    const regex = new RegExp(term, 'gi');
    const matches = content.match(regex);
    if (matches) {
      violations.push(`Found ${matches.length} instances of "${term}"`);
    }
  });
  
  return {
    isSecure: violations.length === 0,
    violations
  };
}

/**
 * Partner Communication Sanitizer
 * Ensures all partner communications are secure
 */
export function sanitizePartnerCommunication(message: string): string {
  let sanitized = message;
  
  // Apply all replacements
  SAFE_REPLACEMENTS.forEach((replacement, term) => {
    const regex = new RegExp(term, 'gi');
    sanitized = sanitized.replace(regex, replacement);
  });
  
  // Additional security checks
  sanitized = sanitized.replace(/internal architecture/gi, 'platform capabilities');
  sanitized = sanitized.replace(/core IP/gi, 'platform features');
  sanitized = sanitized.replace(/methodology/gi, 'approach');
  
  return sanitized;
}

/**
 * Marketing Content Validator
 * Ensures marketing materials are secure
 */
export function validateMarketingContent(content: string): {
  approved: boolean;
  suggestions: string[];
} {
  const suggestions: string[] = [];
  
  // Check for proprietary terms
  const docCheck = validateDocumentation(content);
  if (!docCheck.isSecure) {
    suggestions.push(...docCheck.violations.map(v => `Security violation: ${v}`));
  }
  
  // Check for competitive intelligence leaks
  if (/how we built/i.test(content)) {
    suggestions.push('Remove "how we built" - reveals methodology');
  }
  
  if (/our secret/i.test(content)) {
    suggestions.push('Remove "our secret" - implies proprietary knowledge');
  }
  
  if (/unique approach/i.test(content) && /technical/i.test(content)) {
    suggestions.push('Avoid combining "unique approach" with technical details');
  }
  
  return {
    approved: suggestions.length === 0,
    suggestions
  };
}

export default contentSecurityMiddleware;