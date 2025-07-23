import { Request } from 'express';

interface LoginAttempt {
  userId: number;
  ip: string;
  userAgent: string;
  timestamp: number;
  success: boolean;
  location?: string;
}

interface UserLoginPattern {
  commonIPs: Set<string>;
  commonUserAgents: Set<string>;
  lastSuccessfulLogin?: LoginAttempt;
  recentAttempts: LoginAttempt[];
}

// In-memory storage for login patterns (in production, use Redis or database)
const userLoginPatterns = new Map<number, UserLoginPattern>();
const failedAttempts = new Map<string, number>(); // IP -> count

const MAX_FAILED_ATTEMPTS = 5;
const FAILED_ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes
const SUSPICIOUS_DISTANCE_KM = 1000; // Flag if login from >1000km away

export function detectSuspiciousLogin(req: Request, userId: number): {
  isSuspicious: boolean;
  reasons: string[];
  riskScore: number;
} {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const reasons: string[] = [];
  let riskScore = 0;

  // Get or create user pattern
  let pattern = userLoginPatterns.get(userId);
  if (!pattern) {
    pattern = {
      commonIPs: new Set(),
      commonUserAgents: new Set(),
      recentAttempts: []
    };
    userLoginPatterns.set(userId, pattern);
  }

  // Check for new IP
  if (!pattern.commonIPs.has(ip)) {
    reasons.push('Login from new IP address');
    riskScore += 20;
  }

  // Check for new user agent
  if (!pattern.commonUserAgents.has(userAgent)) {
    reasons.push('Login from new device/browser');
    riskScore += 15;
  }

  // Check for rapid location change
  if (pattern.lastSuccessfulLogin) {
    const timeSinceLastLogin = Date.now() - pattern.lastSuccessfulLogin.timestamp;
    const hoursSinceLastLogin = timeSinceLastLogin / (1000 * 60 * 60);
    
    // If login from different IP within 1 hour
    if (pattern.lastSuccessfulLogin.ip !== ip && hoursSinceLastLogin < 1) {
      reasons.push('Rapid location change detected');
      riskScore += 30;
    }
  }

  // Check for brute force attempts
  const ipFailures = failedAttempts.get(ip) || 0;
  if (ipFailures >= MAX_FAILED_ATTEMPTS) {
    reasons.push('Multiple failed login attempts from this IP');
    riskScore += 40;
  }

  // Check for unusual time patterns (e.g., login at 3 AM if user usually logs in during day)
  const currentHour = new Date().getHours();
  if (currentHour >= 2 && currentHour <= 5) {
    reasons.push('Login at unusual time');
    riskScore += 10;
  }

  // Check for suspicious user agents
  const suspiciousAgents = ['bot', 'crawler', 'spider', 'scraper'];
  if (suspiciousAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
    reasons.push('Suspicious user agent detected');
    riskScore += 50;
  }

  return {
    isSuspicious: riskScore >= 30,
    reasons,
    riskScore
  };
}

export function recordLoginAttempt(req: Request, userId: number, success: boolean) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  
  const attempt: LoginAttempt = {
    userId,
    ip,
    userAgent,
    timestamp: Date.now(),
    success
  };

  // Update user pattern
  let pattern = userLoginPatterns.get(userId);
  if (!pattern) {
    pattern = {
      commonIPs: new Set(),
      commonUserAgents: new Set(),
      recentAttempts: []
    };
    userLoginPatterns.set(userId, pattern);
  }

  // Record attempt
  pattern.recentAttempts.push(attempt);
  
  // Keep only recent attempts (last 100)
  if (pattern.recentAttempts.length > 100) {
    pattern.recentAttempts = pattern.recentAttempts.slice(-100);
  }

  if (success) {
    // Update successful login pattern
    pattern.commonIPs.add(ip);
    pattern.commonUserAgents.add(userAgent);
    pattern.lastSuccessfulLogin = attempt;
    
    // Clear failed attempts for this IP
    failedAttempts.delete(ip);
    
    console.log(`[SECURITY] Successful login for user ${userId} from IP ${ip}`);
  } else {
    // Track failed attempts
    const current = failedAttempts.get(ip) || 0;
    failedAttempts.set(ip, current + 1);
    
    console.log(`[SECURITY] Failed login attempt for user ${userId} from IP ${ip} (${current + 1} failures)`);
    
    // Clean up old failed attempts periodically
    setTimeout(() => {
      const currentCount = failedAttempts.get(ip) || 0;
      if (currentCount > 0) {
        failedAttempts.set(ip, currentCount - 1);
      }
    }, FAILED_ATTEMPT_WINDOW);
  }
}

export function shouldBlockIP(ip: string): boolean {
  const failures = failedAttempts.get(ip) || 0;
  return failures >= MAX_FAILED_ATTEMPTS;
}

export function getLoginRiskReport(userId: number): any {
  const pattern = userLoginPatterns.get(userId);
  if (!pattern) {
    return {
      userId,
      risk: 'unknown',
      message: 'No login history available'
    };
  }

  const recentSuspicious = pattern.recentAttempts
    .filter(a => !a.success)
    .filter(a => Date.now() - a.timestamp < 24 * 60 * 60 * 1000); // Last 24 hours

  return {
    userId,
    commonIPs: Array.from(pattern.commonIPs),
    commonDevices: Array.from(pattern.commonUserAgents).length,
    recentFailedAttempts: recentSuspicious.length,
    lastSuccessfulLogin: pattern.lastSuccessfulLogin?.timestamp 
      ? new Date(pattern.lastSuccessfulLogin.timestamp).toISOString() 
      : null,
    riskLevel: recentSuspicious.length > 3 ? 'high' : 
               recentSuspicious.length > 0 ? 'medium' : 'low'
  };
}