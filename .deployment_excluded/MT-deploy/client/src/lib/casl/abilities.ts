import { AbilityBuilder, Ability, AbilityClass, subject } from '@casl/ability';

// Define actions
type Actions = 
  | 'manage' 
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete'
  | 'approve'
  | 'deny'
  | 'filter'
  | 'view_pending'
  | 'access_admin';

// Define subjects  
type Subjects = 
  | 'Memory'
  | 'ConsentRequest' 
  | 'MemoryFilter'
  | 'AdminPanel'
  | 'UserProfile'
  | 'all';

export type AppAbility = Ability<[Actions, Subjects]>;
export const AppAbility = Ability as AbilityClass<AppAbility>;

export interface User {
  id: number;
  roles: string[];
  primaryRole?: string;
}

export function defineAbilitiesFor(user: User): AppAbility {
  const { can, cannot, build } = new AbilityBuilder(AppAbility);

  if (user.roles.includes('super_admin') || user.roles.includes('admin')) {
    // Admins can do everything
    can('manage', 'all');
  } else {
    // Basic authenticated user permissions
    can('read', 'Memory', { userId: user.id });
    can('create', 'Memory');
    can('update', 'Memory', { userId: user.id });
    can('delete', 'Memory', { userId: user.id });
    
    // Memory consent permissions
    can('view_pending', 'ConsentRequest'); // Can view pending requests for memories they're tagged in
    can('approve', 'ConsentRequest', { coTaggedUsers: { $in: [user.id] } });
    can('deny', 'ConsentRequest', { coTaggedUsers: { $in: [user.id] } });
    
    // Memory filtering - all authenticated users can filter
    can('filter', 'MemoryFilter');
    
    // Profile permissions
    can('read', 'UserProfile', { id: user.id });
    can('update', 'UserProfile', { id: user.id });
  }

  // Role-specific permissions
  if (user.roles.includes('moderator')) {
    can('read', 'Memory'); // Moderators can read all memories
    can('approve', 'ConsentRequest'); // Can approve any consent request
    can('deny', 'ConsentRequest'); // Can deny any consent request
  }

  if (user.roles.includes('curator')) {
    can('filter', 'MemoryFilter'); // Enhanced filtering abilities
    can('read', 'Memory'); // Can read memories for curation
  }

  // Trust-level based permissions (dynamic based on memory trust level)
  if (user.roles.includes('dancer') || user.roles.includes('teacher') || user.roles.includes('organizer')) {
    can('read', 'Memory', { trustLevel: { $lte: 2 } }); // Can read basic and close level memories
  }

  return build();
}

// React hook for abilities
import { createContext, useContext } from 'react';

export const AbilityContext = createContext<AppAbility | undefined>(undefined);

export const useAbility = () => {
  const ability = useContext(AbilityContext);
  if (!ability) {
    throw new Error('useAbility must be used within an AbilityProvider');
  }
  return ability;
};

// Helper functions for common checks
export const useCanApproveConsent = (memory: any, user: User) => {
  const ability = useAbility();
  return ability.can('approve', 'ConsentRequest', memory);
};

export const useCanViewPendingRequests = () => {
  const ability = useAbility();
  return ability.can('view_pending', 'ConsentRequest');
};

export const useCanFilterMemories = () => {
  const ability = useAbility();
  return ability.can('filter', 'MemoryFilter');
};

export const useCanAccessAdmin = () => {
  const ability = useAbility();
  return ability.can('access_admin', 'AdminPanel');
};