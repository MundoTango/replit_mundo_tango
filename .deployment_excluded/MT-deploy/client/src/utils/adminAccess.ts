/**
 * Administrative Access Control Utilities
 * Implements comprehensive RBAC/ABAC for Mundo Tango platform
 */

export interface AdminRole {
  name: string;
  level: number; // Higher number = more privileges
  description: string;
  permissions: string[];
}

export const ADMIN_ROLES: Record<string, AdminRole> = {
  super_admin: {
    name: 'super_admin',
    level: 100,
    description: 'Platform Super Administrator',
    permissions: [
      'manage_platform',
      'manage_all_groups',
      'manage_all_users',
      'delete_groups',
      'transfer_ownership',
      'access_analytics',
      'moderate_content',
      'manage_roles'
    ]
  },
  admin: {
    name: 'admin',
    level: 90,
    description: 'Platform Administrator',
    permissions: [
      'manage_groups',
      'manage_users',
      'access_analytics',
      'moderate_content',
      'manage_events',
      'promote_members'
    ]
  },
  city_admin: {
    name: 'city_admin',
    level: 80,
    description: 'City Administrator',
    permissions: [
      'manage_city_groups',
      'manage_city_users',
      'access_city_analytics',
      'moderate_city_content',
      'manage_city_events'
    ]
  },
  group_admin: {
    name: 'group_admin',
    level: 70,
    description: 'Group Administrator',
    permissions: [
      'manage_group',
      'manage_members',
      'moderate_content',
      'manage_events',
      'change_settings'
    ]
  },
  moderator: {
    name: 'moderator',
    level: 60,
    description: 'Platform Moderator',
    permissions: [
      'moderate_content',
      'manage_members',
      'view_analytics'
    ]
  },
  group_moderator: {
    name: 'group_moderator',
    level: 50,
    description: 'Group Moderator',
    permissions: [
      'moderate_group_content',
      'manage_group_members',
      'view_group_analytics'
    ]
  }
};

/**
 * Check if a user role has administrative privileges
 */
export function isAdminRole(userRole: string): boolean {
  return Object.keys(ADMIN_ROLES).includes(userRole);
}

/**
 * Check if a user role has specific permission
 */
export function hasPermission(userRole: string, permission: string): boolean {
  const role = ADMIN_ROLES[userRole];
  return role ? role.permissions.includes(permission) : false;
}

/**
 * Get the admin access level for a role (higher = more access)
 */
export function getAdminLevel(userRole: string): number {
  const role = ADMIN_ROLES[userRole];
  return role ? role.level : 0;
}

/**
 * Check if user can access group admin interface
 */
export function canAccessGroupAdmin(userRole: string, groupType?: string): boolean {
  if (!isAdminRole(userRole)) return false;
  
  const role = ADMIN_ROLES[userRole];
  
  // Super admins and platform admins can access any group
  if (role.level >= 90) return true;
  
  // City admins can access city groups
  if (userRole === 'city_admin' && groupType === 'city') return true;
  
  // Group admins and moderators can access their specific groups
  if (userRole === 'group_admin' || userRole === 'group_moderator') return true;
  
  // Platform moderators can access groups for moderation
  if (userRole === 'moderator') return true;
  
  return false;
}

/**
 * Get allowed admin actions for a role
 */
export function getAllowedAdminActions(userRole: string): string[] {
  const role = ADMIN_ROLES[userRole];
  return role ? role.permissions : [];
}

/**
 * Check if user role can perform specific admin action
 */
export function canPerformAction(userRole: string, action: string): boolean {
  return hasPermission(userRole, action);
}

/**
 * Get admin role display information
 */
export function getAdminRoleDisplay(userRole: string): { 
  label: string; 
  color: string; 
  icon: string; 
} {
  const roleDisplayMap: Record<string, { label: string; color: string; icon: string }> = {
    super_admin: { 
      label: 'Super Admin', 
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: '👑'
    },
    admin: { 
      label: 'Admin', 
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: '⚡'
    },
    city_admin: { 
      label: 'City Admin', 
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: '🏙️'
    },
    group_admin: { 
      label: 'Group Admin', 
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: '👥'
    },
    moderator: { 
      label: 'Moderator', 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: '🛡️'
    },
    group_moderator: { 
      label: 'Group Mod', 
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: '🔧'
    }
  };

  return roleDisplayMap[userRole] || { 
    label: userRole, 
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: '👤'
  };
}