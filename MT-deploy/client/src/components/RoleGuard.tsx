import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';

interface RoleRoute {
  role: string;
  route: string;
  definition: {
    name: string;
    description: string;
    isPlatformRole: boolean;
    permissions: string[];
    color: string;
    icon: string;
    routePath: string;
  };
}

interface RoleGuardProps {
  children: React.ReactNode;
}

export default function RoleGuard({ children }: RoleGuardProps) {
  const { user, isLoading } = useAuthContext();
  const [location, setLocation] = useLocation();
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [primaryRole, setPrimaryRole] = useState<string>('guest');
  const [recommendedRoute, setRecommendedRoute] = useState<string>('/moments');
  const [availableRoutes, setAvailableRoutes] = useState<RoleRoute[]>([]);
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  useEffect(() => {
    if (user && !isLoading) {
      fetchUserRoles();
    }
  }, [user, isLoading]);

  const fetchUserRoles = async () => {
    try {
      setIsRoleLoading(true);
      const response = await fetch('/api/roles/enhanced/me', {
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        const { roles, primaryRole: primary, route, availableRoutes: routes } = result.data;
        
        setUserRoles(roles || ['guest']);
        setPrimaryRole(primary || 'guest');
        setRecommendedRoute(route || '/moments');
        setAvailableRoutes(routes || []);

        // Auto-redirect based on role and current location
        handleRoleBasedRedirect(primary, route, routes);
      } else {
        // Fallback to guest role
        setUserRoles(['guest']);
        setPrimaryRole('guest');
        setRecommendedRoute('/moments');
        setAvailableRoutes([]);
      }
    } catch (error) {
      console.error('Error fetching user roles:', error);
      // Fallback to guest role
      setUserRoles(['guest']);
      setPrimaryRole('guest');
      setRecommendedRoute('/moments');
      setAvailableRoutes([]);
    } finally {
      setIsRoleLoading(false);
    }
  };

  const handleRoleBasedRedirect = (primary: string, route: string, routes: RoleRoute[]) => {
    const currentPath = location;
    
    // Don't redirect if already on correct route or basic pages
    if (currentPath === route || 
        currentPath === '/login' || 
        currentPath === '/register' ||
        currentPath === '/onboarding' ||
        currentPath === '/code-of-conduct') {
      return;
    }

    // Check if user is accessing a role-specific route they don't have access to
    const roleSpecificRoutes = ['/platform', '/admin', '/organizer', '/teacher'];
    const isAccessingRoleRoute = roleSpecificRoutes.some(r => currentPath.startsWith(r));
    
    if (isAccessingRoleRoute) {
      const hasAccessToCurrentRoute = routes.some(r => currentPath.startsWith(r.route));
      
      if (!hasAccessToCurrentRoute) {
        console.log(`Redirecting from ${currentPath} to ${route} based on role: ${primary}`);
        setLocation(route);
        return;
      }
    }

    // Auto-redirect based on primary role (only on first load)
    const shouldAutoRedirect = localStorage.getItem('roleRedirectComplete') !== 'true';
    
    if (shouldAutoRedirect && currentPath === '/moments') {
      // Determine redirect based on primary role
      switch (primary) {
        case 'super_admin':
          setLocation('/platform');
          break;
        case 'admin':
        case 'moderator':
        case 'curator':
          setLocation('/admin');
          break;
        case 'organizer':
        case 'tour_operator':
        case 'tango_school':
          setLocation('/organizer');
          break;
        case 'teacher':
          setLocation('/teacher');
          break;
        default:
          // Community roles stay on /moments
          break;
      }
      
      localStorage.setItem('roleRedirectComplete', 'true');
    }
  };

  const switchRole = (targetRoute: string) => {
    setLocation(targetRoute);
    localStorage.setItem('selectedRole', targetRoute);
  };

  // Show loading state while determining roles
  if (isLoading || isRoleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading user roles...</span>
      </div>
    );
  }

  // Show role switcher if user has multiple role routes
  const showRoleSwitcher = availableRoutes.length > 1 && location !== '/login' && location !== '/register';

  return (
    <>
      {showRoleSwitcher && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-800">
                Active Role: {primaryRole.replace(/_/g, ' ').toUpperCase()}
              </span>
              {availableRoutes.length > 1 && (
                <div className="flex space-x-2">
                  <span className="text-sm text-blue-600">Switch to:</span>
                  {availableRoutes
                    .filter(route => route.route !== location)
                    .map(route => (
                    <button
                      key={route.route}
                      onClick={() => switchRole(route.route)}
                      className="text-sm bg-white border border-blue-300 rounded px-2 py-1 hover:bg-blue-50 transition-colors"
                    >
                      {route.role.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="text-xs text-blue-600">
              {userRoles.length} role{userRoles.length !== 1 ? 's' : ''} active
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  );
}