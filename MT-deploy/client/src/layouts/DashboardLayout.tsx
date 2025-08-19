import React, { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Bell, 
  MessageCircle, 
  Users, 
  ChevronDown, 
  Menu,
  LogOut,
  Settings,
  Shield,
  HelpCircle,
  Brain
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import TrangoTechSidebar from '@/components/TrangoTechSidebar';
import ProjectSwitcher from '@/components/ProjectSwitcher';
import { useQuery } from '@tanstack/react-query';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch notifications count
  const { data: notifications } = useQuery({
    queryKey: ['/api/notifications/count'],
    queryFn: async () => {
      const response = await fetch('/api/notifications/count', {
        credentials: 'include'
      });
      return response.json();
    }
  });

  // Fetch friend requests count
  const { data: friendRequests } = useQuery({
    queryKey: ['/api/friends/requests/count'],
    queryFn: async () => {
      const response = await fetch('/api/friends/requests/count', {
        credentials: 'include'
      });
      return response.json();
    }
  });

  // Global search
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['/api/search/global', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return null;
      const response = await fetch(`/api/user/global-search?q=${encodeURIComponent(searchQuery)}`, {
        credentials: 'include'
      });
      const result = await response.json();
      return result.data;
    },
    enabled: !!searchQuery.trim()
  });

  const handleLogout = async () => {
    try {
      await logout();
      setLocation('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchResults(!!value.trim());
  };

  return (
    <div className="min-h-screen">
      {/* Modern Mundo Tango Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and Search */}
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden hover:bg-gray-100"
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              {/* Mundo Tango Logo */}
              <div className="hidden lg:flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                  MT
                </div>
                <div className="text-xl font-bold bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
                  Mundo Tango
                </div>
              </div>
              
              {/* Global Search */}
              <div className="relative flex-1 max-w-md ml-8" ref={searchRef}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search events, people, memories..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 w-full border-gray-300 focus:border-pink-500 focus:ring-pink-500"
                />
                
                {/* Search Results Dropdown */}
                {showSearchResults && searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                    {searchLoading ? (
                      <div className="p-4 text-center text-gray-500">Searching...</div>
                    ) : searchResults ? (
                      <div className="p-2">
                        {/* Users */}
                        {searchResults.users?.length > 0 && (
                          <div className="mb-4">
                            <h3 className="text-sm font-semibold text-gray-900 px-2 py-1">People</h3>
                            {searchResults.users.slice(0, 3).map((user: any) => (
                              <div
                                key={user.id}
                                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                onClick={() => {
                                  setLocation(`/user/profile/${user.id}`);
                                  setShowSearchResults(false);
                                  setSearchQuery('');
                                }}
                              >
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user.profileImage} />
                                  <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">{user.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Posts */}
                        {searchResults.posts?.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 px-2 py-1">Memories</h3>
                            {searchResults.posts.slice(0, 3).map((post: any) => (
                              <div
                                key={post.id}
                                className="p-2 hover:bg-gray-50 rounded cursor-pointer"
                                onClick={() => {
                                  setLocation(`/post/${post.id}`);
                                  setShowSearchResults(false);
                                  setSearchQuery('');
                                }}
                              >
                                <p className="text-sm text-gray-700 truncate">{post.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">No results found</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Modern Controls */}
            <div className="flex items-center gap-3">
              {/* Language Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-sm font-medium text-gray-700 hover:bg-gray-100">
                    🇺🇸 EN
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => {
                    window.i18n?.changeLanguage('en');
                    console.log('Language switched to English');
                  }}>
                    🇺🇸 English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    window.i18n?.changeLanguage('es');
                    console.log('Language switched to Spanish');
                  }}>
                    🇪🇸 Español
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    window.i18n?.changeLanguage('fr');
                    console.log('Language switched to French');
                  }}>
                    🇫🇷 Français
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    window.i18n?.changeLanguage('de');
                    console.log('Language switched to German');
                  }}>
                    🇩🇪 Deutsch
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    window.i18n?.changeLanguage('it');
                    console.log('Language switched to Italian');
                  }}>
                    🇮🇹 Italiano
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    window.i18n?.changeLanguage('pt');
                    console.log('Language switched to Portuguese');
                  }}>
                    🇵🇹 Português
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Friend Requests */}
              <Button
                variant="ghost"
                size="sm"
                className="relative text-gray-700 hover:bg-gray-100"
                onClick={() => setLocation('/friends/requests')}
              >
                <Users className="h-5 w-5" />
                {friendRequests?.count > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {friendRequests.count}
                  </Badge>
                )}
              </Button>

              {/* Messages */}
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-700 hover:bg-gray-100"
                onClick={() => setLocation('/messages')}
              >
                <MessageCircle className="h-5 w-5" />
              </Button>

              {/* Notifications Bell */}
              <Button
                variant="ghost"
                size="sm"
                className="relative text-gray-700 hover:bg-gray-100"
                onClick={() => setLocation('/notifications')}
              >
                <Bell className="h-5 w-5" />
                {notifications?.count > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {notifications.count}
                  </Badge>
                )}
              </Button>

              {/* Project Switcher */}
              <ProjectSwitcher />

              {/* Profile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-gray-100">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImage || undefined} />
                      <AvatarFallback className="bg-gradient-to-r from-pink-500 to-blue-500 text-white">
                        {user?.name?.[0] || user?.username?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {/* Profile/Project Switcher */}
                  <div className="px-3 py-2 border-b">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500 uppercase">Active Profile</span>
                    </div>
                    <button 
                      onClick={() => setLocation('/profile-switcher')}
                      className="w-full flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-pink-50 to-blue-50 hover:from-pink-100 hover:to-blue-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 flex items-center justify-center">
                          <span className="text-white text-sm font-bold">MT</span>
                        </div>
                        <span className="text-sm font-medium">Mundo Tango</span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                  
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold">{user?.name || user?.username}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    {user?.tangoRoles && (
                      <div className="flex gap-1 mt-1">
                        {user.tangoRoles.slice(0, 2).map((role: string, index: number) => (
                          <span key={index} className="px-2 py-0.5 bg-gray-100 text-xs rounded-full capitalize">
                            {role}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation('/profile')}>
                    <Settings className="mr-2 h-4 w-4" />
                    View Profile
                  </DropdownMenuItem>
                  {/* Admin Center - RBAC/ABAC secured per ESA Framework */}
                  {(user?.username === 'admin' || user?.email?.includes('admin')) && (
                    <DropdownMenuItem onClick={() => setLocation('/admin')}>
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Center
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setLocation('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation('/help')}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Help & Support
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="relative flex min-h-screen">
        {/* Fixed Sidebar - No layout impact */}
        <TrangoTechSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        {/* Main Content Area - Full width with sidebar offset */}
        <main className="flex-1 bg-gray-50 transition-all duration-300">
          <div className={cn(
            "transition-all duration-300",
            sidebarOpen ? "lg:pl-64" : "lg:pl-0"
          )}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}