import { AbilityBuilder, Ability } from '@casl/ability';

type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete' | 'switch';
type Subjects = 'all' | 'Tenant' | 'User' | 'Post' | 'Event' | 'Group' | 'Community';

export type AppAbility = Ability<[Actions, Subjects]>;

export const defineAbilitiesFor = (user: any) => {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(Ability);

  if (user) {
    // Super admin can do everything
    if (user.roles?.includes('super_admin') || user.role_name === 'super_admin' || user.isSuperAdmin) {
      can('manage', 'all');
      can('switch', 'Tenant');
    } else {
      // Regular users
      can('read', 'Tenant');
      cannot('switch', 'Tenant');
      
      // Admin users
      if (user.roles?.includes('admin') || user.role_name === 'admin') {
        can('read', 'User');
        can('update', 'User');
        can('manage', 'Post');
        can('manage', 'Event');
        can('manage', 'Group');
      }
      
      // Regular authenticated users
      can('create', 'Post');
      can('update', 'Post', { userId: user.id });
      can('delete', 'Post', { userId: user.id });
      can('create', 'Event');
      can('update', 'Event', { userId: user.id });
    }
  } else {
    // Guest users
    can('read', 'Post');
    can('read', 'Event');
    cannot('switch', 'Tenant');
  }

  return build();
};