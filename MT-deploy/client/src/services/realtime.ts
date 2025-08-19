import React from 'react';
import { RealtimeChannel, RealtimePresenceState } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface ChatMessage {
  id: number;
  roomSlug: string;
  userId: number;
  content: string;
  createdAt: string;
  user?: {
    name: string;
    username: string;
    profileImage?: string;
  };
}

interface EventFeedback {
  id: number;
  eventId: number;
  userId: number;
  type: 'rating' | 'comment' | 'safety_report';
  content: string;
  rating?: number;
  createdAt: string;
}

interface FriendRequest {
  id: number;
  userId: number;
  friendId: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface PresenceUser {
  userId: number;
  username: string;
  profileImage?: string;
  isTyping?: boolean;
  lastSeen: string;
}

export class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private presenceChannels: Map<string, RealtimeChannel> = new Map();
  private currentUserId: number | null = null;

  constructor() {
    console.log('🔄 RealtimeService initialized');
  }

  setCurrentUser(userId: number) {
    this.currentUserId = userId;
    console.log('👤 Realtime user set:', userId);
  }

  // CHAT MESSAGE LISTENERS
  subscribeToChatRoom(
    roomSlug: string,
    onMessage: (message: ChatMessage) => void,
    onError?: (error: any) => void
  ): () => void {
    const channelName = `chat_room:${roomSlug}`;
    
    if (this.channels.has(channelName)) {
      console.log('📱 Already subscribed to chat room:', roomSlug);
      return () => this.unsubscribeFromChannel(channelName);
    }

    console.log('📱 Subscribing to chat room:', roomSlug);
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_slug=eq.${roomSlug}`
        },
        (payload) => {
          console.log('💬 New chat message:', payload);
          
          const message: ChatMessage = {
            id: payload.new.id,
            roomSlug: payload.new.room_slug,
            userId: payload.new.user_id,
            content: payload.new.content,
            createdAt: payload.new.created_at,
          };
          
          onMessage(message);
          
          // Track with analytics
          if (window.plausible) {
            window.plausible('Chat Message Received', {
              props: {
                roomSlug: roomSlug,
                messageLength: message.content.length
              }
            });
          }
        }
      )
      .subscribe((status) => {
        console.log(`📱 Chat room ${roomSlug} subscription status:`, status);
        if (status === 'SUBSCRIPTION_ERROR' && onError) {
          onError(new Error('Failed to subscribe to chat room'));
        }
      });

    this.channels.set(channelName, channel);
    
    return () => this.unsubscribeFromChannel(channelName);
  }

  // EVENT FEEDBACK LISTENERS
  subscribeToEventFeedback(
    eventId: number,
    onFeedback: (feedback: EventFeedback) => void,
    onError?: (error: any) => void
  ): () => void {
    const channelName = `event_feedback:${eventId}`;
    
    if (this.channels.has(channelName)) {
      console.log('📊 Already subscribed to event feedback:', eventId);
      return () => this.unsubscribeFromChannel(channelName);
    }

    console.log('📊 Subscribing to event feedback:', eventId);
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_feedback',
          filter: `event_id=eq.${eventId}`
        },
        (payload) => {
          console.log('📊 Event feedback update:', payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const feedback: EventFeedback = {
              id: payload.new.id,
              eventId: payload.new.event_id,
              userId: payload.new.user_id,
              type: payload.new.type,
              content: payload.new.content,
              rating: payload.new.rating,
              createdAt: payload.new.created_at,
            };
            
            onFeedback(feedback);
            
            // Track with analytics
            if (window.plausible) {
              window.plausible('Event Feedback Received', {
                props: {
                  eventId: eventId,
                  feedbackType: feedback.type,
                  hasRating: feedback.rating ? 'yes' : 'no'
                }
              });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log(`📊 Event feedback ${eventId} subscription status:`, status);
        if (status === 'SUBSCRIPTION_ERROR' && onError) {
          onError(new Error('Failed to subscribe to event feedback'));
        }
      });

    this.channels.set(channelName, channel);
    
    return () => this.unsubscribeFromChannel(channelName);
  }

  // FRIEND REQUEST LISTENERS
  subscribeToFriendRequests(
    userId: number,
    onRequest: (request: FriendRequest) => void,
    onError?: (error: any) => void
  ): () => void {
    const channelName = `friend_requests:${userId}`;
    
    if (this.channels.has(channelName)) {
      console.log('👥 Already subscribed to friend requests:', userId);
      return () => this.unsubscribeFromChannel(channelName);
    }

    console.log('👥 Subscribing to friend requests:', userId);
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friends',
          filter: `friend_id=eq.${userId}`
        },
        (payload) => {
          console.log('👥 Friend request update:', payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const request: FriendRequest = {
              id: payload.new.id,
              userId: payload.new.user_id,
              friendId: payload.new.friend_id,
              status: payload.new.status,
              createdAt: payload.new.created_at,
              updatedAt: payload.new.updated_at,
            };
            
            onRequest(request);
            
            // Track with analytics
            if (window.plausible) {
              window.plausible('Friend Request Update', {
                props: {
                  status: request.status,
                  isNewRequest: payload.eventType === 'INSERT' ? 'yes' : 'no'
                }
              });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log(`👥 Friend requests ${userId} subscription status:`, status);
        if (status === 'SUBSCRIPTION_ERROR' && onError) {
          onError(new Error('Failed to subscribe to friend requests'));
        }
      });

    this.channels.set(channelName, channel);
    
    return () => this.unsubscribeFromChannel(channelName);
  }

  // PRESENCE CHANNELS
  joinRoomPresence(
    roomSlug: string,
    user: PresenceUser,
    onPresenceUpdate: (users: PresenceUser[]) => void
  ): () => void {
    const channelName = `presence:room:${roomSlug}`;
    
    if (this.presenceChannels.has(channelName)) {
      console.log('👻 Already in room presence:', roomSlug);
      return () => this.leavePresence(channelName);
    }

    console.log('👻 Joining room presence:', roomSlug);
    
    const channel = supabase
      .channel(channelName, {
        config: {
          presence: {
            key: user.userId.toString(),
          },
        },
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = this.extractPresenceUsers(state);
        console.log('👻 Room presence sync:', users);
        onPresenceUpdate(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('👻 User joined room:', key, newPresences);
        const state = channel.presenceState();
        const users = this.extractPresenceUsers(state);
        onPresenceUpdate(users);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('👻 User left room:', key, leftPresences);
        const state = channel.presenceState();
        const users = this.extractPresenceUsers(state);
        onPresenceUpdate(users);
      })
      .subscribe(async (status) => {
        console.log(`👻 Room presence ${roomSlug} status:`, status);
        if (status === 'SUBSCRIBED') {
          const presenceTrackStatus = await channel.track(user);
          console.log('👻 Presence track status:', presenceTrackStatus);
        }
      });

    this.presenceChannels.set(channelName, channel);
    
    return () => this.leavePresence(channelName);
  }

  // TYPING INDICATORS
  updateTypingStatus(roomSlug: string, isTyping: boolean) {
    const channelName = `presence:room:${roomSlug}`;
    const channel = this.presenceChannels.get(channelName);
    
    if (channel && this.currentUserId) {
      const currentState = channel.presenceState();
      const userKey = this.currentUserId.toString();
      const existingPresence = currentState[userKey]?.[0];
      
      if (existingPresence) {
        channel.track({
          ...existingPresence,
          isTyping: isTyping,
          lastSeen: new Date().toISOString()
        });
        
        console.log('⌨️ Updated typing status:', { roomSlug, isTyping });
      }
    }
  }

  // UTILITY METHODS
  private extractPresenceUsers(state: RealtimePresenceState): PresenceUser[] {
    return Object.entries(state).map(([userId, presences]) => {
      const presence = presences[0] as PresenceUser;
      return {
        userId: parseInt(userId),
        username: presence.username,
        profileImage: presence.profileImage,
        isTyping: presence.isTyping || false,
        lastSeen: presence.lastSeen
      };
    });
  }

  private unsubscribeFromChannel(channelName: string) {
    const channel = this.channels.get(channelName);
    if (channel) {
      console.log('🔄 Unsubscribing from channel:', channelName);
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  private leavePresence(channelName: string) {
    const channel = this.presenceChannels.get(channelName);
    if (channel) {
      console.log('👻 Leaving presence channel:', channelName);
      channel.untrack();
      supabase.removeChannel(channel);
      this.presenceChannels.delete(channelName);
    }
  }

  // CLEANUP
  unsubscribeAll() {
    console.log('🧹 Cleaning up all realtime subscriptions');
    
    for (const [name, channel] of this.channels) {
      console.log('🔄 Removing channel:', name);
      supabase.removeChannel(channel);
    }
    
    for (const [name, channel] of this.presenceChannels) {
      console.log('👻 Removing presence channel:', name);
      channel.untrack();
      supabase.removeChannel(channel);
    }
    
    this.channels.clear();
    this.presenceChannels.clear();
  }
}

// Global instance
export const realtimeService = new RealtimeService();

// React hooks for easy integration
export const useRealtimeChat = (roomSlug: string, onMessage: (message: ChatMessage) => void) => {
  const [isConnected, setIsConnected] = React.useState(false);
  
  React.useEffect(() => {
    setIsConnected(true);
    const unsubscribe = realtimeService.subscribeToChatRoom(
      roomSlug,
      onMessage,
      () => setIsConnected(false)
    );
    
    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, [roomSlug]);
  
  return { isConnected };
};

export const useRealtimePresence = (
  roomSlug: string,
  currentUser: PresenceUser,
  onPresenceUpdate: (users: PresenceUser[]) => void
) => {
  const [isPresent, setIsPresent] = React.useState(false);
  
  React.useEffect(() => {
    setIsPresent(true);
    const leave = realtimeService.joinRoomPresence(roomSlug, currentUser, onPresenceUpdate);
    
    return () => {
      leave();
      setIsPresent(false);
    };
  }, [roomSlug, currentUser.userId]);
  
  const updateTyping = (isTyping: boolean) => {
    realtimeService.updateTypingStatus(roomSlug, isTyping);
  };
  
  return { isPresent, updateTyping };
};