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
  HelpCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import TrangoTechSidebar from '@/components/TrangoTechSidebar';
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              {/* Search */}
              <div className="relative flex-1 max-w-md" ref={searchRef}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search users, events, communities..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 w-full"
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
                            <h3 className="text-sm font-semibold text-gray-900 px-2 py-1">Users</h3>
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
                                <span className="text-sm">{user.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Posts */}
                        {searchResults.posts?.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 px-2 py-1">Posts</h3>
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

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Friend Requests */}
              <Button
                variant="ghost"
                size="sm"
                className="relative"
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
                onClick={() => setLocation('/messages')}
              >
                <MessageCircle className="h-5 w-5" />
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="sm"
                className="relative"
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

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImage} />
                      <AvatarFallback>{user?.name?.[0] || user?.username?.[0]}</AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.name || user?.username}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation('/profile')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation('/privacy')}>
                    <Shield className="mr-2 h-4 w-4" />
                    Privacy Policy
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation('/help')}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Help & Support
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* TrangoTech Authentic Sidebar */}
        <TrangoTechSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        {/* Main Content - TT Layout */}
        <main className={cn(
          "flex-1 transition-all duration-300 bg-background-color",
          sidebarOpen ? "lg:ml-64" : "lg:ml-0"
        )}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}