import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Heart, 
  Calendar, 
  Users, 
  MessageSquare, 
  User, 
  Settings,
  Shield,
  UserCheck,
  GraduationCap,
  Music,
  Camera,
  Plane,
  Store,
  Activity,
  Building,
  Crown,
  X,
  Map,
  HelpCircle,
  Mail
} from 'lucide-react';

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavigationItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
  badge?: number;
}

export default function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  // Get user's primary role for routing
  const userRoles = user?.tangoRoles || [];
  const primaryRole = userRoles[0] || 'guest';

  // Role-based navigation items
  const navigationItems: NavigationItem[] = [
    {
      label: 'Timeline',
      path: '/enhanced-timeline',
      icon: Heart,
    },
    {
      label: 'Events',
      path: '/events',
      icon: Calendar,
    },
    {
      label: 'Community',
      path: '/community',
      icon: Users,
    },
    {
      label: 'Messages',
      path: '/messages',
      icon: MessageSquare,
    },
    {
      label: 'Profile',
      path: '/profile',
      icon: User,
    },
    {
      label: 'TTfiles Help',
      path: '/ttfiles-help-center',
      icon: HelpCircle,
    },
    // Role-specific items
    {
      label: 'Teaching Hub',
      path: '/teacher',
      icon: GraduationCap,
      roles: ['teacher', 'learning_source'],
    },
    {
      label: 'DJ Console',
      path: '/dj',
      icon: Music,
      roles: ['dj', 'musician'],
    },
    {
      label: 'Performance',
      path: '/performer',
      icon: Camera,
      roles: ['performer', 'choreographer'],
    },
    {
      label: 'Tours',
      path: '/tours',
      icon: Plane,
      roles: ['tour_operator', 'tango_traveler'],
    },
    {
      label: 'Marketplace',
      path: '/vendor',
      icon: Store,
      roles: ['vendor'],
    },
    {
      label: 'Wellness',
      path: '/wellness',
      icon: Activity,
      roles: ['wellness_provider'],
    },
    {
      label: 'Organization',
      path: '/organizer',
      icon: Building,
      roles: ['organizer', 'host'],
    },
    // Admin items
    {
      label: 'Admin Panel',
      path: '/admin',
      icon: Shield,
      roles: ['admin', 'super_admin'],
    },
    {
      label: 'Platform',
      path: '/platform',
      icon: Crown,
      roles: ['super_admin'],
    },
    // Temporary navigation helper
    {
      label: 'Feature Map',
      path: '/feature-navigation',
      icon: Map,
    },
  ];

  // Filter navigation items based on user roles
  const visibleItems = navigationItems.filter(item => {
    if (!item.roles) return true; // Show public items to everyone
    return item.roles.some(role => userRoles.includes(role));
  });

  const handleNavigation = (path: string) => {
    setLocation(path);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 z-50",
        isOpen ? "w-64" : "w-16 lg:w-16",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Close button for mobile */}
          {isOpen && (
            <div className="flex justify-end p-4 lg:hidden">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* User info when expanded */}
          {isOpen && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name?.[0] || user?.username?.[0] || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name || user?.username}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {primaryRole.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-1">
            {visibleItems.map((item) => {
              const isActive = location === item.path;
              const Icon = item.icon;

              return (
                <Button
                  key={item.path}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isOpen ? "px-3" : "px-2 justify-center",
                    isActive && "bg-blue-50 text-blue-700 border-blue-200"
                  )}
                  onClick={() => handleNavigation(item.path)}
                >
                  <Icon className={cn("h-5 w-5", isOpen ? "mr-3" : "")} />
                  {isOpen && (
                    <span className="truncate">{item.label}</span>
                  )}
                  {isOpen && item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-2 border-t border-gray-200">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                isOpen ? "px-3" : "px-2 justify-center"
              )}
              onClick={() => handleNavigation('/settings')}
            >
              <Settings className={cn("h-5 w-5", isOpen ? "mr-3" : "")} />
              {isOpen && <span>Settings</span>}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}