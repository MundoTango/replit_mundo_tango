import React, { useEffect, useState } from 'react';
import { Shield, AlertTriangle, Lock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DOMPurify from 'dompurify';

interface SecurityMetrics {
  cspViolations: number;
  xssAttempts: number;
  sqlInjectionAttempts: number;
  rateLimitHits: number;
  lastSecurityScan: Date;
  securityScore: number;
}

export const ProfileSecurityLayer: React.FC<{ userId: number }> = ({ userId }) => {
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    cspViolations: 0,
    xssAttempts: 0,
    sqlInjectionAttempts: 0,
    rateLimitHits: 0,
    lastSecurityScan: new Date(),
    securityScore: 98
  });

  // Monitor CSP violations
  useEffect(() => {
    const handleSecurityPolicyViolation = (e: SecurityPolicyViolationEvent) => {
      console.error('CSP Violation:', {
        violatedDirective: e.violatedDirective,
        blockedURI: e.blockedURI,
        sourceFile: e.sourceFile
      });
      
      setSecurityMetrics(prev => ({
        ...prev,
        cspViolations: prev.cspViolations + 1
      }));

      // Report to security monitoring endpoint
      fetch('/api/security/csp-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          violatedDirective: e.violatedDirective,
          blockedURI: e.blockedURI,
          sourceFile: e.sourceFile,
          userId
        })
      });
    };

    document.addEventListener('securitypolicyviolation', handleSecurityPolicyViolation);
    return () => document.removeEventListener('securitypolicyviolation', handleSecurityPolicyViolation);
  }, [userId]);

  return (
    <div className="space-y-4">
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Shield className="w-5 h-5" />
            Profile Security Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Security Score</span>
                <Badge className="bg-green-600">{securityMetrics.securityScore}%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">CSP Violations</span>
                <span className="font-medium">{securityMetrics.cspViolations}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">XSS Attempts Blocked</span>
                <span className="font-medium">{securityMetrics.xssAttempts}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">SQL Injection Blocked</span>
                <span className="font-medium">{securityMetrics.sqlInjectionAttempts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Rate Limit Hits</span>
                <span className="font-medium">{securityMetrics.rateLimitHits}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Security Scan</span>
                <span className="text-xs">{securityMetrics.lastSecurityScan.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {securityMetrics.cspViolations > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            Content Security Policy violations detected. Review security logs for details.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

// Input sanitization utility
export const sanitizeInput = (input: string): string => {
  // Remove any script tags and dangerous HTML
  const cleaned = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p'],
    ALLOWED_ATTR: ['href', 'target']
  });
  
  // Additional SQL injection prevention
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(--|\/\*|\*\/|xp_|sp_)/gi,
    /(<script|<\/script|javascript:|onerror=|onload=)/gi
  ];
  
  let sanitized = cleaned;
  sqlPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  return sanitized.trim();
};

// Rate limiting hook
export const useRateLimit = (action: string, limit: number = 10, windowMs: number = 60000) => {
  const [attempts, setAttempts] = useState<number[]>([]);
  
  const checkRateLimit = (): boolean => {
    const now = Date.now();
    const recentAttempts = attempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= limit) {
      return false; // Rate limit exceeded
    }
    
    setAttempts([...recentAttempts, now]);
    return true;
  };
  
  return { checkRateLimit, attemptsRemaining: limit - attempts.length };
};

// Security headers component
export const SecurityHeaders: React.FC = () => {
  useEffect(() => {
    // Set security headers via meta tags
    const headers = [
      { name: 'X-Content-Type-Options', content: 'nosniff' },
      { name: 'X-Frame-Options', content: 'DENY' },
      { name: 'X-XSS-Protection', content: '1; mode=block' },
      { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' }
    ];
    
    headers.forEach(({ name, content }) => {
      const meta = document.createElement('meta');
      meta.httpEquiv = name;
      meta.content = content;
      document.head.appendChild(meta);
    });
    
    return () => {
      headers.forEach(({ name }) => {
        const meta = document.querySelector(`meta[http-equiv="${name}"]`);
        if (meta) meta.remove();
      });
    };
  }, []);
  
  return null;
};