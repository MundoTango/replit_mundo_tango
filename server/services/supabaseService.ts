import { supabase } from '../supabaseClient';
import type { User, Post, Event, InsertUser, InsertPost, InsertEvent } from '../../shared/schema';

export class SupabaseService {
  // User Operations
  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
    
    return data;
  }

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }
    
    return data;
  }

  async createUser(userData: Omit<InsertUser, 'id'>): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      return null;
    }
    
    return data;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user:', error);
      return null;
    }
    
    return data;
  }

  // Post Operations
  async createPost(postData: Omit<InsertPost, 'id'>): Promise<Post | null> {
    const { data, error } = await supabase
      .from('posts')
      .insert(postData)
      .select(`
        *,
        user:user_id (id, name, username, profile_image),
        activity:activity_id (id, name),
        feeling:feeling_id (id, name, emoji)
      `)
      .single();
    
    if (error) {
      console.error('Error creating post:', error);
      return null;
    }
    
    return data;
  }

  async getFeedPosts(userId: string, limit = 20, offset = 0): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:user_id (id, name, username, profile_image),
        activity:activity_id (id, name),
        feeling:feeling_id (id, name, emoji),
        post_likes!inner (user_id),
        post_comments (id, content, user:user_id (name))
      `)
      .or(`visibility.eq.public,and(visibility.eq.friends,user_id.in.(${await this.getFriendIds(userId)}))`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching feed posts:', error);
      return [];
    }
    
    return data || [];
  }

  async getUserPosts(userId: string, limit = 20, offset = 0): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:user_id (id, name, username, profile_image),
        activity:activity_id (id, name),
        feeling:feeling_id (id, name, emoji)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching user posts:', error);
      return [];
    }
    
    return data || [];
  }

  async likePost(postId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('post_likes')
      .insert({ post_id: postId, user_id: userId });
    
    if (error) {
      console.error('Error liking post:', error);
      return false;
    }

    // Update likes count
    await this.updatePostLikesCount(postId);
    return true;
  }

  async unlikePost(postId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error unliking post:', error);
      return false;
    }

    // Update likes count
    await this.updatePostLikesCount(postId);
    return true;
  }

  // Event Operations
  async createEvent(eventData: Omit<InsertEvent, 'id'>): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .insert(eventData)
      .select(`
        *,
        organizer:organizer_id (id, name, username),
        event_type:event_type_id (id, name, icon)
      `)
      .single();
    
    if (error) {
      console.error('Error creating event:', error);
      return null;
    }
    
    return data;
  }

  async getEvents(limit = 20, offset = 0): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        organizer:organizer_id (id, name, username, profile_image),
        event_type:event_type_id (id, name, icon),
        event_participants (user_id, status)
      `)
      .eq('status', 'published')
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }
    
    return data || [];
  }

  async rsvpEvent(eventId: string, userId: string, status: string): Promise<boolean> {
    const { error } = await supabase
      .from('event_participants')
      .upsert({ 
        event_id: eventId, 
        user_id: userId, 
        status,
        payment_status: status === 'confirmed' ? 'paid' : 'unpaid'
      });
    
    if (error) {
      console.error('Error RSVPing to event:', error);
      return false;
    }
    
    return true;
  }

  // Search Operations
  async searchUsers(query: string, limit = 20): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, username, profile_image, bio, city, country')
      .or(`name.ilike.%${query}%,username.ilike.%${query}%,bio.ilike.%${query}%`)
      .eq('is_active', true)
      .limit(limit);
    
    if (error) {
      console.error('Error searching users:', error);
      return [];
    }
    
    return data || [];
  }

  async searchPosts(query: string, limit = 20): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:user_id (id, name, username, profile_image)
      `)
      .ilike('content', `%${query}%`)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error searching posts:', error);
      return [];
    }
    
    return data || [];
  }

  // Helper Methods
  private async getFriendIds(userId: string): Promise<string> {
    const { data } = await supabase
      .from('friends')
      .select('requester_id, addressee_id')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .eq('status', 'accepted');
    
    if (!data) return '';
    
    const friendIds = data.map(friend => 
      friend.requester_id === userId ? friend.addressee_id : friend.requester_id
    );
    
    return friendIds.join(',');
  }

  private async updatePostLikesCount(postId: string): Promise<void> {
    const { count } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);
    
    await supabase
      .from('posts')
      .update({ likes_count: count || 0 })
      .eq('id', postId);
  }

  // Real-time subscriptions
  subscribeToUserPosts(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`user-posts-${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'posts',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  }

  subscribeToPostLikes(postId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`post-likes-${postId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'post_likes',
        filter: `post_id=eq.${postId}`
      }, callback)
      .subscribe();
  }

  // Analytics
  async getUserStats(userId: string) {
    const [postsCount, followersCount, followingCount, eventsCount] = await Promise.all([
      this.getCount('posts', 'user_id', userId),
      this.getCount('friends', 'addressee_id', userId, { status: 'accepted' }),
      this.getCount('friends', 'requester_id', userId, { status: 'accepted' }),
      this.getCount('events', 'organizer_id', userId)
    ]);

    return {
      postsCount,
      followersCount,
      followingCount,
      eventsCount
    };
  }

  private async getCount(table: string, column: string, value: string, additionalFilters?: Record<string, any>): Promise<number> {
    let query = supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .eq(column, value);

    if (additionalFilters) {
      Object.entries(additionalFilters).forEach(([key, val]) => {
        query = query.eq(key, val);
      });
    }

    const { count } = await query;
    return count || 0;
  }
}

export const supabaseService = new SupabaseService();