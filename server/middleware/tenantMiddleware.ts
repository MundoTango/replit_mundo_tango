import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { tenants, tenantUsers } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

// Extend Express Request to include tenant information
declare global {
  namespace Express {
    interface Request {
      tenant?: {
        id: string;
        slug: string;
        name: string;
        logo_url: string | null;
        primary_color: string | null;
        secondary_color: string | null;
        domain: string | null;
        settings: any;
      };
      userTenant?: {
        role: string;
        is_admin: boolean;
        expertise_level: string;
        interests: string[];
      };
    }
  }
}

export async function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Get tenant information from various sources
    const tenantSlug = getTenantSlug(req);
    
    if (!tenantSlug) {
      // For non-tenant specific requests, continue without tenant context
      return next();
    }

    // Fetch tenant information from database
    const [tenant] = await db
      .select()
      .from(tenants)
      .where(and(eq(tenants.slug, tenantSlug), eq(tenants.is_active, true)))
      .limit(1);

    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant not found or inactive',
        details: `Tenant with slug '${tenantSlug}' does not exist or is not active`
      });
    }

    // Attach tenant to request
    req.tenant = {
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      logo_url: tenant.logo_url,
      primary_color: tenant.primary_color,
      secondary_color: tenant.secondary_color,
      domain: tenant.domain,
      settings: tenant.settings
    };

    // If user is authenticated, check their membership in this tenant
    if (req.user?.id) {
      const [tenantUser] = await db
        .select()
        .from(tenantUsers)
        .where(
          and(
            eq(tenantUsers.tenant_id, tenant.id),
            eq(tenantUsers.user_id, req.user.id)
          )
        )
        .limit(1);

      if (tenantUser) {
        req.userTenant = {
          role: tenantUser.role,
          is_admin: tenantUser.is_admin,
          expertise_level: tenantUser.expertise_level,
          interests: tenantUser.interests
        };
      }
    }

    // Set tenant context for database queries
    if (global.dbPool) {
      await global.dbPool.query(`SET LOCAL app.tenant_id TO '${tenant.id}'`);
      await global.dbPool.query(`SET LOCAL app.tenant_slug TO '${tenant.slug}'`);
    }

    next();
  } catch (error) {
    console.error('Tenant middleware error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

// Helper function to extract tenant slug from request
function getTenantSlug(req: Request): string | null {
  // 1. Check query parameter
  if (req.query.tenant) {
    return req.query.tenant as string;
  }

  // 2. Check custom header
  const tenantHeader = req.headers['x-tenant'] as string;
  if (tenantHeader) {
    return tenantHeader;
  }

  // 3. Check subdomain
  const host = req.headers.host || '';
  const subdomain = host.split('.')[0];
  
  // Skip if it's a special subdomain or main domain
  if (subdomain && !['api', 'www', 'mundotango', 'localhost'].includes(subdomain)) {
    return subdomain;
  }

  // 4. Check path prefix
  const pathMatch = req.path.match(/^\/t\/([^\/]+)/);
  if (pathMatch) {
    return pathMatch[1];
  }

  // 5. Default to mundo-tango if no tenant specified
  return 'mundo-tango';
}

// Middleware to require tenant context
export function requireTenant(req: Request, res: Response, next: NextFunction) {
  if (!req.tenant) {
    return res.status(400).json({
      error: 'Tenant context required',
      details: 'This endpoint requires a valid tenant context'
    });
  }
  next();
}

// Middleware to require tenant admin
export function requireTenantAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.tenant) {
    return res.status(400).json({
      error: 'Tenant context required',
      details: 'This endpoint requires a valid tenant context'
    });
  }

  if (!req.userTenant?.is_admin) {
    return res.status(403).json({
      error: 'Forbidden',
      details: 'This endpoint requires tenant admin privileges'
    });
  }

  next();
}

// Middleware to set current user context for database queries
export async function setUserContext(req: Request, res: Response, next: NextFunction) {
  if (req.user?.id && global.dbPool) {
    try {
      await global.dbPool.query(`SET LOCAL app.user_id TO '${req.user.id}'`);
    } catch (error) {
      console.error('Error setting user context:', error);
    }
  }
  next();
}