import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { tenants, tenant_users, users } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { getCache, cacheKeys } from '../services/cacheService';

interface TenantInfo {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  domain: string | null;
  settings: any;
}

interface TenantUserInfo {
  tenant_id: string;
  user_id: number;
  role: string;
  is_admin: boolean;
  expertise_level?: string;
  interests?: string[];
}

// Cache TTLs
const TENANT_CACHE_TTL = 600; // 10 minutes
const USER_CACHE_TTL = 300; // 5 minutes

export async function optimizedTenantMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const cache = getCache();
  
  try {
    // Extract tenant information from request
    const host = req.headers.host || '';
    const tenantSlug = 
      req.query.tenant as string ||
      req.headers['x-tenant'] as string ||
      host.split('.')[0];

    // Skip for non-tenant requests
    if (!tenantSlug || tenantSlug === 'api' || tenantSlug === 'www') {
      return next();
    }

    // Check cache for tenant
    const tenantCacheKey = cacheKeys.tenant(tenantSlug);
    let tenant = await cache.get<TenantInfo>(tenantCacheKey);

    if (!tenant) {
      // Fetch from database
      const [tenantData] = await db
        .select({
          id: tenants.id,
          slug: tenants.slug,
          name: tenants.name,
          logo_url: tenants.logo_url,
          primary_color: tenants.primary_color,
          secondary_color: tenants.secondary_color,
          domain: tenants.domain,
          settings: tenants.settings,
        })
        .from(tenants)
        .where(and(
          eq(tenants.slug, tenantSlug),
          eq(tenants.is_active, true)
        ))
        .limit(1);

      if (!tenantData) {
        return res.status(404).json({
          error: 'Tenant not found or inactive'
        });
      }

      tenant = tenantData as TenantInfo;
      
      // Cache the tenant
      await cache.set(tenantCacheKey, tenant, TENANT_CACHE_TTL);
    }

    // Attach tenant to request
    (req as any).tenant = tenant;

    // Check if user is authenticated
    const userId = (req as any).user?.id;
    if (userId) {
      // Check cache for user-tenant relationship
      const userTenantCacheKey = cacheKeys.tenantUser(tenant.id, userId.toString());
      let tenantUser = await cache.get<TenantUserInfo>(userTenantCacheKey);

      if (!tenantUser) {
        // Fetch from database
        const [tenantUserData] = await db
          .select({
            tenant_id: tenant_users.tenant_id,
            user_id: tenant_users.user_id,
            role: tenant_users.role,
            is_admin: tenant_users.is_admin,
            expertise_level: tenant_users.expertise_level,
            interests: tenant_users.interests,
          })
          .from(tenant_users)
          .where(and(
            eq(tenant_users.tenant_id, tenant.id),
            eq(tenant_users.user_id, userId)
          ))
          .limit(1);

        if (tenantUserData) {
          tenantUser = tenantUserData as TenantUserInfo;
          
          // Cache the user-tenant relationship
          await cache.set(userTenantCacheKey, tenantUser, USER_CACHE_TTL);
        }
      }

      if (tenantUser) {
        (req as any).tenantUser = tenantUser;
      }
    }

    // Add cache control headers for CDN
    res.set('X-Tenant-ID', tenant.id);
    res.set('Cache-Control', 'public, max-age=60'); // 1 minute CDN cache

    next();
  } catch (error) {
    console.error('Optimized tenant middleware error:', error);
    next(error);
  }
}

// Helper to get all user tenants with caching
export async function getUserTenants(userId: number): Promise<TenantInfo[]> {
  const cache = getCache();
  const cacheKey = cacheKeys.userTenants(userId.toString());
  
  // Check cache
  let userTenants = await cache.get<TenantInfo[]>(cacheKey);
  
  if (!userTenants) {
    // Fetch from database
    const tenantData = await db
      .select({
        id: tenants.id,
        slug: tenants.slug,
        name: tenants.name,
        logo_url: tenants.logo_url,
        primary_color: tenants.primary_color,
        secondary_color: tenants.secondary_color,
        domain: tenants.domain,
        settings: tenants.settings,
      })
      .from(tenants)
      .innerJoin(
        tenant_users,
        and(
          eq(tenant_users.tenant_id, tenants.id),
          eq(tenant_users.user_id, userId)
        )
      )
      .where(eq(tenants.is_active, true));

    userTenants = tenantData as TenantInfo[];
    
    // Cache the results
    await cache.set(cacheKey, userTenants, USER_CACHE_TTL);
  }
  
  return userTenants;
}

// Cache invalidation helpers
export async function invalidateTenantCache(tenantId: string, tenantSlug?: string) {
  const cache = getCache();
  
  await cache.del(cacheKeys.tenantById(tenantId));
  if (tenantSlug) {
    await cache.del(cacheKeys.tenant(tenantSlug));
  }
  
  // Also invalidate tenant stats
  await cache.del(cacheKeys.tenantStats(tenantId));
}

export async function invalidateUserTenantCache(userId: string, tenantId?: string) {
  const cache = getCache();
  
  await cache.del(cacheKeys.userTenants(userId));
  if (tenantId) {
    await cache.del(cacheKeys.tenantUser(tenantId, userId));
  }
}