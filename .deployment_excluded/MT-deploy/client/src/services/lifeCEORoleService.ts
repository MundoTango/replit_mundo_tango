// Life CEO Role Service - RBAC/ABAC Implementation

export interface LifeCEORole {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  type: 'platform' | 'project' | 'team';
  hierarchyLevel: number;
  permissions: Record<string, any>;
  attributes?: Record<string, any>;
  isActive: boolean;
}

export interface LifeCEOUserRole {
  userId: number;
  roleId: number;
  assignedBy?: number;
  assignedAt: Date;
  expiresAt?: Date;
  attributes?: Record<string, any>;
  isActive: boolean;
}

export interface LifeCEOPermission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

class LifeCEORoleService {
  // Role hierarchy levels
  static readonly HIERARCHY_LEVELS = {
    SUPER_ADMIN: 1,
    ADMIN: 2,
    PROJECT_ADMIN: 3,
    TEAM_LEAD: 4,
    CONTRIBUTOR: 5,
    VIEWER: 6
  };

  // Permission resources
  static readonly RESOURCES = {
    PROJECTS: 'projects',
    USERS: 'users',
    AGENTS: 'agents',
    WORKFLOWS: 'workflows',
    ANALYTICS: 'analytics',
    SETTINGS: 'settings'
  };

  // Permission actions
  static readonly ACTIONS = {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete',
    MANAGE: 'manage',
    EXECUTE: 'execute'
  };

  // Check if user has a specific role
  static hasRole(userRoles: string[], requiredRole: string): boolean {
    return userRoles.includes(requiredRole);
  }

  // Check if user has any of the required roles
  static hasAnyRole(userRoles: string[], requiredRoles: string[]): boolean {
    return requiredRoles.some(role => userRoles.includes(role));
  }

  // Check if user has all required roles
  static hasAllRoles(userRoles: string[], requiredRoles: string[]): boolean {
    return requiredRoles.every(role => userRoles.includes(role));
  }

  // Get user's highest role level
  static getHighestRoleLevel(roles: LifeCEORole[]): number {
    if (!roles.length) return Number.MAX_SAFE_INTEGER;
    return Math.min(...roles.map(r => r.hierarchyLevel));
  }

  // Check if user can perform action on resource
  static canPerformAction(
    userRoles: LifeCEORole[],
    resource: string,
    action: string,
    attributes?: Record<string, any>
  ): boolean {
    // Super admin can do anything
    if (userRoles.some(r => r.hierarchyLevel === this.HIERARCHY_LEVELS.SUPER_ADMIN)) {
      return true;
    }

    // Check each role's permissions
    for (const role of userRoles) {
      // Check general permission
      if (role.permissions.all === true) return true;
      
      // Check resource-specific permission
      const resourcePerms = role.permissions[resource];
      if (!resourcePerms) continue;

      // Resource has full access
      if (resourcePerms === true || resourcePerms.all === true) return true;

      // Check specific action
      if (resourcePerms[action] === true) {
        // Check ABAC conditions if present
        if (attributes && role.attributes) {
          return this.evaluateAttributes(role.attributes, attributes);
        }
        return true;
      }
    }

    return false;
  }

  // Evaluate ABAC attributes
  private static evaluateAttributes(
    roleAttributes: Record<string, any>,
    contextAttributes: Record<string, any>
  ): boolean {
    // Simple attribute matching for now
    // Can be extended with more complex logic
    for (const [key, value] of Object.entries(roleAttributes)) {
      if (contextAttributes[key] !== value) {
        return false;
      }
    }
    return true;
  }

  // Get role display info
  static getRoleInfo(roleName: string): { icon: string; color: string; badge: string } {
    const roleMap: Record<string, { icon: string; color: string; badge: string }> = {
      life_ceo_super_admin: { icon: '👑', color: 'text-purple-600', badge: 'Super Admin' },
      life_ceo_admin: { icon: '⚡', color: 'text-blue-600', badge: 'Admin' },
      life_ceo_project_admin: { icon: '📊', color: 'text-green-600', badge: 'Project Admin' },
      life_ceo_team_lead: { icon: '👥', color: 'text-orange-600', badge: 'Team Lead' },
      life_ceo_contributor: { icon: '✏️', color: 'text-indigo-600', badge: 'Contributor' },
      life_ceo_viewer: { icon: '👁️', color: 'text-gray-600', badge: 'Viewer' }
    };

    return roleMap[roleName] || { icon: '👤', color: 'text-gray-500', badge: 'User' };
  }

  // Check if user can access Life CEO admin
  static canAccessLifeCEOAdmin(userRoles: string[]): boolean {
    const adminRoles = [
      'life_ceo_super_admin',
      'life_ceo_admin',
      'life_ceo_project_admin',
      'super_admin', // Mundo Tango super admin can access
      'admin' // Mundo Tango admin can access
    ];
    
    return this.hasAnyRole(userRoles, adminRoles);
  }

  // Get permission matrix for a role
  static getPermissionMatrix(roleLevel: number): Record<string, Record<string, boolean>> {
    const matrix: Record<string, Record<string, boolean>> = {};

    // Define permissions based on hierarchy level
    switch (roleLevel) {
      case this.HIERARCHY_LEVELS.SUPER_ADMIN:
        // Super admin has all permissions
        Object.values(this.RESOURCES).forEach(resource => {
          matrix[resource] = {};
          Object.values(this.ACTIONS).forEach(action => {
            matrix[resource][action] = true;
          });
        });
        break;

      case this.HIERARCHY_LEVELS.ADMIN:
        // Admin can manage most resources
        matrix[this.RESOURCES.PROJECTS] = { create: true, read: true, update: true, delete: true };
        matrix[this.RESOURCES.USERS] = { read: true, update: true };
        matrix[this.RESOURCES.AGENTS] = { create: true, read: true, update: true };
        matrix[this.RESOURCES.WORKFLOWS] = { create: true, read: true, update: true, execute: true };
        matrix[this.RESOURCES.ANALYTICS] = { read: true };
        matrix[this.RESOURCES.SETTINGS] = { read: true, update: true };
        break;

      case this.HIERARCHY_LEVELS.PROJECT_ADMIN:
        // Project admin manages projects and teams
        matrix[this.RESOURCES.PROJECTS] = { read: true, update: true };
        matrix[this.RESOURCES.USERS] = { read: true };
        matrix[this.RESOURCES.AGENTS] = { read: true, update: true };
        matrix[this.RESOURCES.WORKFLOWS] = { read: true, execute: true };
        matrix[this.RESOURCES.ANALYTICS] = { read: true };
        break;

      case this.HIERARCHY_LEVELS.TEAM_LEAD:
        // Team lead manages team tasks
        matrix[this.RESOURCES.PROJECTS] = { read: true, update: true };
        matrix[this.RESOURCES.WORKFLOWS] = { read: true, execute: true };
        matrix[this.RESOURCES.ANALYTICS] = { read: true };
        break;

      case this.HIERARCHY_LEVELS.CONTRIBUTOR:
        // Contributor updates own tasks
        matrix[this.RESOURCES.PROJECTS] = { read: true, update: true };
        matrix[this.RESOURCES.WORKFLOWS] = { read: true };
        break;

      case this.HIERARCHY_LEVELS.VIEWER:
        // Viewer has read-only access
        matrix[this.RESOURCES.PROJECTS] = { read: true };
        matrix[this.RESOURCES.ANALYTICS] = { read: true };
        break;
    }

    return matrix;
  }
}

export default LifeCEORoleService;