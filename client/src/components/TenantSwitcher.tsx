import React, { useState, useEffect } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { ChevronDown, Building2, Check, Settings, Globe, Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useNavigate } from '@tanstack/react-router';

const TenantSwitcher = () => {
  const navigate = useNavigate();
  const { 
    currentTenant, 
    userTenants, 
    isLoading, 
    switchTenant,
    viewMode,
    setViewMode,
    selectedTenantIds,
    setSelectedTenantIds
  } = useTenant();
  
  const [open, setOpen] = useState(false);

  const handleTenantSwitch = async (tenantId: string) => {
    await switchTenant(tenantId);
    setOpen(false);
  };

  const handleViewModeChange = (mode: 'single_community' | 'all_communities' | 'custom') => {
    setViewMode(mode);
    if (mode === 'single_community' && currentTenant) {
      setSelectedTenantIds([currentTenant.id]);
    } else if (mode === 'all_communities' && userTenants) {
      setSelectedTenantIds(userTenants.map(t => t.id));
    }
  };

  const handleCustomTenantToggle = (tenantId: string) => {
    if (viewMode !== 'custom') return;
    
    if (selectedTenantIds.includes(tenantId)) {
      setSelectedTenantIds(selectedTenantIds.filter(id => id !== tenantId));
    } else {
      setSelectedTenantIds([...selectedTenantIds, tenantId]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse">
        <div className="w-8 h-8 rounded bg-gray-300 dark:bg-gray-700" />
        <div className="flex-1">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24" />
        </div>
      </div>
    );
  }

  if (!currentTenant || !userTenants || userTenants.length === 0) {
    return null;
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center justify-between w-full gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            {currentTenant.logo_url ? (
              <img 
                src={currentTenant.logo_url} 
                alt={currentTenant.name} 
                className="w-8 h-8 rounded object-cover"
              />
            ) : (
              <Building2 className="w-8 h-8 p-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400" />
            )}
            <div className="text-left">
              <div className="text-sm font-medium">{currentTenant.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {viewMode === 'single_community' && 'Single Community'}
                {viewMode === 'all_communities' && `All Communities (${userTenants.length})`}
                {viewMode === 'custom' && `Custom (${selectedTenantIds.length})`}
              </div>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="start" className="w-72">
        {/* Community Selection */}
        <DropdownMenuLabel>Switch Community</DropdownMenuLabel>
        {userTenants.map((tenant) => (
          <DropdownMenuItem
            key={tenant.id}
            onClick={() => handleTenantSwitch(tenant.id)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              {tenant.logo_url ? (
                <img 
                  src={tenant.logo_url} 
                  alt={tenant.name} 
                  className="w-6 h-6 rounded object-cover"
                />
              ) : (
                <Building2 className="w-6 h-6 p-1 rounded bg-gray-200 dark:bg-gray-700" />
              )}
              <div>
                <div className="text-sm font-medium">{tenant.name}</div>
                <div className="text-xs text-gray-500">
                  {tenant.membership.role} • {tenant.membership.expertise_level}
                </div>
              </div>
            </div>
            {currentTenant.id === tenant.id && (
              <Check className="w-4 h-4 text-green-600" />
            )}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        {/* View Mode Selection */}
        <DropdownMenuLabel>View Mode</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={viewMode} onValueChange={handleViewModeChange as any}>
          <DropdownMenuRadioItem value="single_community">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <div>
                <div className="text-sm">Single Community</div>
                <div className="text-xs text-gray-500">View content from current community only</div>
              </div>
            </div>
          </DropdownMenuRadioItem>
          
          <DropdownMenuRadioItem value="all_communities">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <div>
                <div className="text-sm">All Communities</div>
                <div className="text-xs text-gray-500">View content from all your communities</div>
              </div>
            </div>
          </DropdownMenuRadioItem>
          
          <DropdownMenuRadioItem value="custom">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <div>
                <div className="text-sm">Custom Selection</div>
                <div className="text-xs text-gray-500">Choose specific communities</div>
              </div>
            </div>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        
        {/* Custom Community Selection */}
        {viewMode === 'custom' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Select Communities</DropdownMenuLabel>
            {userTenants.map((tenant) => (
              <DropdownMenuCheckboxItem
                key={tenant.id}
                checked={selectedTenantIds.includes(tenant.id)}
                onCheckedChange={() => handleCustomTenantToggle(tenant.id)}
              >
                <div className="flex items-center gap-2">
                  {tenant.logo_url ? (
                    <img 
                      src={tenant.logo_url} 
                      alt={tenant.name} 
                      className="w-5 h-5 rounded object-cover"
                    />
                  ) : (
                    <Building2 className="w-5 h-5 p-0.5 rounded bg-gray-200 dark:bg-gray-700" />
                  )}
                  <span className="text-sm">{tenant.name}</span>
                </div>
              </DropdownMenuCheckboxItem>
            ))}
          </>
        )}
        
        <DropdownMenuSeparator />
        
        {/* Admin Options */}
        {currentTenant && userTenants.find(t => t.id === currentTenant.id)?.membership.is_admin && (
          <DropdownMenuItem
            onClick={() => navigate({ to: `/communities/${currentTenant.slug}/settings` })}
          >
            <Settings className="w-4 h-4 mr-2" />
            Community Settings
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TenantSwitcher;