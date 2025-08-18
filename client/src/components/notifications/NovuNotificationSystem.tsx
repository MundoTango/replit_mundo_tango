import React, { useEffect, useState } from 'react';
import { NovuProvider, PopoverNotificationCenter, useNotifications } from '@novu/react';
import { Bell, MessageCircle, Heart, UserPlus, Calendar, Award } from 'lucide-react';
import { useAuthContext } from '../../auth/useAuthContext';
import { toast } from '@/hooks/use-toast';

interface NotificationSystemProps {
  applicationIdentifier: string;
  subscriberId: string;
  className?: string;
}

export default function NovuNotificationSystem({ 
  applicationIdentifier, 
  subscriberId, 
  className = '' 
}: NotificationSystemProps) {
  const { user } = useAuthContext();
  const [unreadCount, setUnreadCount] = useState(0);

  // Custom notification templates for tango community
  const notificationTemplates = {
    'comment-on-post': {
      icon: MessageCircle,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      title: 'New Comment',
      sound: '/sounds/comment.mp3'
    },
    'like-on-post': {
      icon: Heart,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      title: 'Post Liked',
      sound: '/sounds/like.mp3'
    },
    'new-follower': {
      icon: UserPlus,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      title: 'New Follower',
      sound: '/sounds/follow.mp3'
    },
    'event-invitation': {
      icon: Calendar,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      title: 'Event Invitation',
      sound: '/sounds/event.mp3'
    },
    'role-invitation': {
      icon: Award,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      title: 'Role Invitation',
      sound: '/sounds/role.mp3'
    },
    'mention': {
      icon: MessageCircle,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      title: 'You were mentioned',
      sound: '/sounds/mention.mp3'
    }
  };

  // Play notification sound
  const playNotificationSound = (soundFile: string) => {
    try {
      const audio = new Audio(soundFile);
      audio.volume = 0.3;
      audio.play().catch(e => console.log('Could not play notification sound:', e));
    } catch (error) {
      console.log('Audio not supported:', error);
    }
  };

  // Custom notification renderer
  const renderNotification = (notification: any) => {
    const template = notificationTemplates[notification.templateIdentifier] || notificationTemplates['comment-on-post'];
    const IconComponent = template.icon;
    
    return (
      <div className={`flex items-start space-x-3 p-4 rounded-lg ${template.bgColor} border border-gray-100 hover:shadow-md transition-all cursor-pointer`}>
        <div className={`p-2 rounded-full ${template.bgColor} ${template.color}`}>
          <IconComponent className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">{template.title}</p>
            <span className="text-xs text-gray-500">
              {new Date(notification.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-gray-700 mt-1">{notification.content}</p>
          {notification.data?.actionUrl && (
            <button 
              className="text-sm text-blue-600 hover:text-blue-800 mt-2 font-medium"
              onClick={() => window.location.href = notification.data.actionUrl}
            >
              View →
            </button>
          )}
        </div>
        {!notification.read && (
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        )}
      </div>
    );
  };

  return (
    <NovuProvider
      applicationIdentifier={applicationIdentifier}
      subscriberId={subscriberId}
      initialFetchingStrategy={{
        fetchNotifications: true,
        fetchUserPreferences: true
      }}
    >
      <div className={className}>
        <PopoverNotificationCenter
          colorScheme="light"
          theme={{
            light: {
              colors: {
                main: '#E91E63',
                foreground: '#374151',
                background: '#FFFFFF',
                primary: '#E91E63',
                secondary: '#9CA3AF'
              },
              common: {
                fontFamily: 'Inter, system-ui, sans-serif'
              }
            }
          }}
          onNotificationClick={(notification) => {
            // Handle notification click
            if (notification.data?.actionUrl) {
              window.location.href = notification.data.actionUrl;
            }
            
            // Play sound for real-time notifications
            const template = notificationTemplates[notification.templateIdentifier];
            if (template?.sound) {
              playNotificationSound(template.sound);
            }
          }}
          onUnseenCountChanged={(count) => {
            setUnreadCount(count);
          }}
          tabs={[
            {
              name: 'All',
              storeId: 'default_store'
            },
            {
              name: 'Comments',
              storeId: 'comments_store'
            },
            {
              name: 'Likes',
              storeId: 'likes_store'
            },
            {
              name: 'Events',
              storeId: 'events_store'
            }
          ]}
          allowedNotificationActions={false}
          showUserPreferences={true}
          emptyState={
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No notifications yet</p>
              <p className="text-sm text-gray-400 mt-1">
                You'll see updates about your tango community here
              </p>
            </div>
          }
        >
          {({ unseenCount }) => (
            <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Bell className="h-5 w-5" />
              {unseenCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {unseenCount > 99 ? '99+' : unseenCount}
                </span>
              )}
            </button>
          )}
        </PopoverNotificationCenter>
      </div>
    </NovuProvider>
  );
}

// Real-time notification hook for manual triggering
export function useRealtimeNotifications() {
  const { user } = useAuthContext();

  const triggerNotification = async (
    templateId: string, 
    recipientId: string, 
    data: any,
    options?: {
      sound?: boolean;
      browser?: boolean;
      email?: boolean;
    }
  ) => {
    try {
      const response = await fetch('/api/notifications/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          templateId,
          recipientId,
          data,
          options: {
            sound: options?.sound ?? true,
            browser: options?.browser ?? true,
            email: options?.email ?? false
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to trigger notification');
      }

      const result = await response.json();
      
      // Show browser notification if permissions granted
      if (options?.browser && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(data.title || 'Mundo Tango', {
          body: data.message,
          icon: '/favicon.ico',
          tag: templateId
        });
      }

      return result;
    } catch (error) {
      console.error('Error triggering notification:', error);
      throw error;
    }
  };

  // Request browser notification permissions
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast({
          title: "Notifications Enabled",
          description: "You'll receive browser notifications for important updates.",
        });
      }
    }
  };

  return {
    triggerNotification,
    requestNotificationPermission
  };
}

// Auto-notification for common events
export function useAutoNotifications() {
  const { triggerNotification } = useRealtimeNotifications();

  const notifyNewComment = (postId: number, commenterName: string, postOwnerId: string) => {
    return triggerNotification('comment-on-post', postOwnerId, {
      title: 'New Comment',
      message: `${commenterName} commented on your post`,
      actionUrl: `/moments?post=${postId}`,
      commenterName,
      postId
    });
  };

  const notifyPostLike = (postId: number, likerName: string, postOwnerId: string) => {
    return triggerNotification('like-on-post', postOwnerId, {
      title: 'Post Liked',
      message: `${likerName} liked your tango moment`,
      actionUrl: `/moments?post=${postId}`,
      likerName,
      postId
    });
  };

  const notifyNewFollower = (followerId: number, followerName: string, followedUserId: string) => {
    return triggerNotification('new-follower', followedUserId, {
      title: 'New Follower',
      message: `${followerName} started following you`,
      actionUrl: `/u/${followerName}`,
      followerId,
      followerName
    });
  };

  const notifyEventInvitation = (eventId: number, eventTitle: string, inviteeId: string, role?: string) => {
    return triggerNotification('event-invitation', inviteeId, {
      title: 'Event Invitation',
      message: role ? `You've been invited as ${role} to ${eventTitle}` : `You've been invited to ${eventTitle}`,
      actionUrl: `/events?event=${eventId}`,
      eventId,
      eventTitle,
      role
    });
  };

  const notifyMention = (postId: number, mentionerName: string, mentionedUserId: string) => {
    return triggerNotification('mention', mentionedUserId, {
      title: 'You were mentioned',
      message: `${mentionerName} mentioned you in a post`,
      actionUrl: `/moments?post=${postId}`,
      mentionerName,
      postId
    });
  };

  return {
    notifyNewComment,
    notifyPostLike,
    notifyNewFollower,
    notifyEventInvitation,
    notifyMention
  };
}