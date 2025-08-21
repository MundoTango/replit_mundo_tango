import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Tenant, TenantUser } from '@shared/schema';

interface TenantContextValue {
  currentTenant: Tenant | null;
  userTenants: (Tenant & { membership: TenantUser })[] | null;
  isLoading: boolean;
  error: string | null;
  switchTenant: (tenantId: string) => Promise<void>;
  refreshTenants: () => Promise<void>;
  viewMode: 'single_community' | 'all_communities' | 'custom';
  setViewMode: (mode: 'single_community' | 'all_communities' | 'custom') => void;
  selectedTenantIds: string[];
  setSelectedTenantIds: (ids: string[]) => void;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [userTenants, setUserTenants] = useState<(Tenant & { membership: TenantUser })[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'single_community' | 'all_communities' | 'custom'>('single_community');
  const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>([]);

  // Load user's tenants when they log in
  useEffect(() => {
    if (user) {
      loadUserTenants();
    } else {
      setUserTenants(null);
      setCurrentTenant(null);
      setIsLoading(false);
    }
  }, [user]);

  // Load tenant from localStorage on mount
  useEffect(() => {
    const savedTenantId = localStorage.getItem('current_tenant_id');
    const savedViewMode = localStorage.getItem('tenant_view_mode');
    const savedSelectedIds = localStorage.getItem('selected_tenant_ids');

    if (savedViewMode) {
      setViewMode(savedViewMode as any);
    }

    if (savedSelectedIds) {
      try {
        setSelectedTenantIds(JSON.parse(savedSelectedIds));
      } catch (e) {
        console.error('Failed to parse selected tenant IDs:', e);
      }
    }

    // Set current tenant after user tenants are loaded
    if (savedTenantId && userTenants) {
      const tenant = userTenants.find(t => t.id === savedTenantId);
      if (tenant) {
        setCurrentTenant(tenant);
      }
    }
  }, [userTenants]);

  async function loadUserTenants() {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/tenants/user', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to load user tenants');
      }

      const data = await response.json();
      setUserTenants(data.tenants);

      // Set current tenant if not already set
      if (!currentTenant && data.tenants.length > 0) {
        // Try to use primary tenant or first tenant
        const primaryTenant = data.tenants.find((t: any) => t.membership.is_primary);
        setCurrentTenant(primaryTenant || data.tenants[0]);
      }
    } catch (err) {
      console.error('Error loading user tenants:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tenants');
    } finally {
      setIsLoading(false);
    }
  }

  async function switchTenant(tenantId: string) {
    try {
      const tenant = userTenants?.find(t => t.id === tenantId);
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      // Update current tenant
      setCurrentTenant(tenant);
      localStorage.setItem('current_tenant_id', tenantId);

      // Update view preferences
      const response = await fetch('/api/tenants/view-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          view_mode: 'single_community',
          selected_tenant_id: tenantId
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        console.error('Failed to update view preferences');
      }

      // Reload the page to refresh all data with new tenant context
      window.location.reload();
    } catch (err) {
      console.error('Error switching tenant:', err);
      setError(err instanceof Error ? err.message : 'Failed to switch tenant');
    }
  }

  async function refreshTenants() {
    await loadUserTenants();
  }

  // Save view mode changes
  useEffect(() => {
    localStorage.setItem('tenant_view_mode', viewMode);
    localStorage.setItem('selected_tenant_ids', JSON.stringify(selectedTenantIds));
  }, [viewMode, selectedTenantIds]);

  const value: TenantContextValue = {
    currentTenant,
    userTenants,
    isLoading,
    error,
    switchTenant,
    refreshTenants,
    viewMode,
    setViewMode,
    selectedTenantIds,
    setSelectedTenantIds
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

// Helper hook to get tenant-aware API headers
export function useTenantHeaders() {
  const { currentTenant } = useTenant();

  return {
    'x-tenant': currentTenant?.slug || 'mundo-tango',
    'x-tenant-id': currentTenant?.id || ''
  };
}