import { useQuery } from '@tanstack/react-query';
import { Bell, MessageCircle, Users } from 'lucide-react';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';

interface CountResponse {
  count: number;
}

export default function NotificationIndicator() {
  // Get notification count
  const { data: notificationCount } = useQuery<CountResponse>({
    queryKey: ['/api/notifications/count'],
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  // Get friend request count
  const { data: friendRequestCount } = useQuery<CountResponse>({
    queryKey: ['/api/friends/requests/count'],
    refetchInterval: 30000
  });

  const notifications = notificationCount?.count || 0;
  const friendRequests = friendRequestCount?.count || 0;
  const totalCount = notifications + friendRequests;

  return (
    <div className="flex items-center space-x-4">
      {/* Messages */}
      <Link href="/messages">
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <MessageCircle className="w-5 h-5 text-gray-600" />
        </button>
      </Link>

      {/* Notifications */}
      <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
        <Bell className="w-5 h-5 text-gray-600" />
        {totalCount > 0 && (
          <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2">
            <Badge className="h-5 min-w-[20px] px-1 bg-gradient-to-r from-turquoise-400 to-cyan-500 border-0">
              <span className="text-xs text-white">{totalCount}</span>
            </Badge>
          </span>
        )}
      </button>

      {/* Friend Requests */}
      <Link href="/friends">
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Users className="w-5 h-5 text-gray-600" />
          {friendRequests > 0 && (
            <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2">
              <Badge className="h-5 min-w-[20px] px-1 bg-gradient-to-r from-turquoise-400 to-cyan-500 border-0">
                <span className="text-xs text-white">{friendRequests}</span>
              </Badge>
            </span>
          )}
        </button>
      </Link>
    </div>
  );
}