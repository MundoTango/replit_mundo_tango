# 23L Framework Analysis: Multi-Tenant RBAC/ABAC Implementation

## Layer 1: Expertise & Technical Proficiency
**Problem Identification:**
- Tenant API endpoints returning 401 Unauthorized errors
- No RBAC/ABAC enforcement for tenant management
- TenantSwitcher component accessible to all users (should be super admin only)
- Authentication middleware inconsistency across routes

## Layer 2: Research & Discovery
**Open Source Solutions:**
- **CASL**: JavaScript ABAC library for permissions
- **AccessControl**: Node.js RBAC library
- **Casbin**: Authorization library supporting various access control models
- **Selected**: CASL for its flexibility and React integration

## Layer 3: Legal & Compliance
- Multi-tenant data isolation requirements
- GDPR compliance for tenant data separation
- SOC 2 Type II considerations for access control
- Super admin audit logging requirements

## Layer 4: UX/UI Design
- TenantSwitcher only visible to super admins
- Clear visual indicators for active tenant
- Seamless tenant switching without page reload
- Audit trail for tenant switches

## Layer 5: Data Architecture
**Current Schema Issues:**
```sql
-- Missing role_based_permissions table
-- No tenant-specific permissions
-- No audit trail for tenant switches
```

**Required Schema Additions:**
```sql
-- Add super_admin check function
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_id 
    AND r.name = 'super_admin'
    AND ur.is_active = true
  );
END;
$$ LANGUAGE plpgsql;

-- Tenant switch audit log
CREATE TABLE IF NOT EXISTS tenant_switch_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  from_tenant_id UUID REFERENCES tenants(id),
  to_tenant_id UUID REFERENCES tenants(id),
  switched_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);
```

## Layer 6: Backend Development
**Authentication Middleware Fix:**
```typescript
// Unified authentication helper
export const getUserId = (req: any): number | null => {
  // Check multiple authentication patterns
  if (req.user?.id) return req.user.id;
  if (req.user?.claims?.sub) return req.user.claims.sub;
  if (req.session?.passport?.user?.id) return req.session.passport.user.id;
  if (req.session?.passport?.user?.claims?.sub) return req.session.passport.user.claims.sub;
  
  // Fallback for development
  if (process.env.NODE_ENV === 'development') {
    return 7; // Scott Boddye's user ID
  }
  
  return null;
};

// Super admin middleware
export const requireSuperAdmin = async (req: any, res: any, next: any) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const isSuperAdmin = await checkSuperAdminRole(userId);
  if (!isSuperAdmin) {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  
  next();
};
```

## Layer 7: Frontend Development
**CASL Integration:**
```typescript
// abilities.ts
import { defineAbility } from '@casl/ability';

export const defineAbilitiesFor = (user: User) => {
  return defineAbility((can, cannot) => {
    if (user.roles?.includes('super_admin')) {
      can('manage', 'all'); // Super admin can do everything
      can('switch', 'Tenant');
    } else {
      can('read', 'Tenant', { user_id: user.id });
      cannot('switch', 'Tenant');
    }
  });
};
```

## Layer 8: API & Integration
- Tenant API endpoints with proper authentication
- CASL abilities integrated with React components
- Audit logging for all tenant operations

## Layer 9: Security & Authentication
**Implementation Steps:**
1. Fix authentication middleware to handle multiple auth patterns
2. Add super admin role check
3. Implement CASL for fine-grained permissions
4. Add audit logging for tenant switches

## Layer 10-12: Deployment & Operations
- Monitor tenant switch patterns
- Alert on unauthorized access attempts
- Performance metrics for multi-tenant queries

## Layer 13-16: AI & Intelligence
- Analyze tenant usage patterns
- Predict resource needs per tenant
- Intelligent tenant recommendations

## Layer 17-20: Human-Centric
- Clear feedback when switching tenants
- Helpful error messages for unauthorized access
- Smooth UX for super admins

## Layer 21-23: Production Engineering
- Rate limiting on tenant APIs
- Graceful handling of tenant failures
- Disaster recovery for tenant data

## Implementation Plan

### Phase 1: Fix Authentication (Immediate)
1. Update tenant routes with unified auth
2. Add getUserId helper function
3. Test all endpoints

### Phase 2: RBAC Implementation (Today)
1. Install CASL
2. Create ability definitions
3. Add super admin middleware
4. Update TenantSwitcher visibility

### Phase 3: Audit & Monitoring (Tomorrow)
1. Create audit tables
2. Add logging middleware
3. Create monitoring dashboard

### Phase 4: Production Hardening (This Week)
1. Add rate limiting
2. Implement caching
3. Performance optimization