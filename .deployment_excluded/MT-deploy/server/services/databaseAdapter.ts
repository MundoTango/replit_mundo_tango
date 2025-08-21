import { storage as currentStorage } from '../storage';
import { supabaseService } from './supabaseService';
import type { User, Post, Event } from '../../shared/schema';

// Database adapter that can switch between current PostgreSQL and Supabase
class DatabaseAdapter {
  private useSupabase: boolean;

  constructor() {
    // Check if Supabase is configured
    this.useSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  }

  // User operations
  async getUserByEmail(email: string): Promise<User | undefined> {
    if (this.useSupabase) {
      const user = await supabaseService.getUserByEmail(email);
      return user || undefined;
    }
    return currentStorage.getUserByEmail(email);
  }

  async getUserById(id: number | string): Promise<User | undefined> {
    if (this.useSupabase) {
      const user = await supabaseService.getUserById(String(id));
      return user || undefined;
    }
    return currentStorage.getUser(Number(id));
  }

  async createUser(userData: any): Promise<User> {
    if (this.useSupabase) {
      const user = await supabaseService.createUser(userData);
      if (!user) throw new Error('Failed to create user');
      return user;
    }
    return currentStorage.createUser(userData);
  }

  async updateUser(id: number | string, updates: any): Promise<User> {
    if (this.useSupabase) {
      const user = await supabaseService.updateUser(String(id), updates);
      if (!user) throw new Error('Failed to update user');
      return user;
    }
    return currentStorage.updateUser(Number(id), updates);
  }

  // Post operations
  async createPost(postData: any): Promise<Post> {
    if (this.useSupabase) {
      const post = await supabaseService.createPost(postData);
      if (!post) throw new Error('Failed to create post');
      return post;
    }
    return currentStorage.createPost(postData);
  }

  async getFeedPosts(userId: number | string, limit = 20, offset = 0): Promise<Post[]> {
    if (this.useSupabase) {
      return supabaseService.getFeedPosts(String(userId), limit, offset);
    }
    return currentStorage.getFeedPosts(Number(userId), limit, offset);
  }

  async getUserPosts(userId: number | string, limit = 20, offset = 0): Promise<Post[]> {
    if (this.useSupabase) {
      return supabaseService.getUserPosts(String(userId), limit, offset);
    }
    return currentStorage.getUserPosts(Number(userId), limit, offset);
  }

  async likePost(postId: number | string, userId: number | string): Promise<void> {
    if (this.useSupabase) {
      await supabaseService.likePost(String(postId), String(userId));
      return;
    }
    return currentStorage.likePost(Number(postId), Number(userId));
  }

  async unlikePost(postId: number | string, userId: number | string): Promise<void> {
    if (this.useSupabase) {
      await supabaseService.unlikePost(String(postId), String(userId));
      return;
    }
    return currentStorage.unlikePost(Number(postId), Number(userId));
  }

  // Event operations
  async createEvent(eventData: any): Promise<Event> {
    if (this.useSupabase) {
      const event = await supabaseService.createEvent(eventData);
      if (!event) throw new Error('Failed to create event');
      return event;
    }
    return currentStorage.createEvent(eventData);
  }

  async getEvents(limit = 20, offset = 0): Promise<Event[]> {
    if (this.useSupabase) {
      return supabaseService.getEvents(limit, offset);
    }
    return currentStorage.getEvents(limit, offset);
  }

  async rsvpEvent(eventId: number | string, userId: number | string, status: string): Promise<any> {
    if (this.useSupabase) {
      await supabaseService.rsvpEvent(String(eventId), String(userId), status);
      return { event_id: eventId, user_id: userId, status };
    }
    return currentStorage.rsvpEvent(Number(eventId), Number(userId), status);
  }

  // Search operations
  async searchUsers(query: string, limit = 20): Promise<User[]> {
    if (this.useSupabase) {
      return supabaseService.searchUsers(query, limit);
    }
    return currentStorage.searchUsers(query, limit);
  }

  async searchPosts(query: string, limit = 20): Promise<Post[]> {
    if (this.useSupabase) {
      return supabaseService.searchPosts(query, limit);
    }
    return currentStorage.searchPosts(query, limit);
  }

  // Analytics
  async getUserStats(userId: number | string) {
    if (this.useSupabase) {
      return supabaseService.getUserStats(String(userId));
    }
    return currentStorage.getUserStats(Number(userId));
  }

  // Real-time subscriptions (Supabase only)
  subscribeToUserPosts(userId: string, callback: (payload: any) => void) {
    if (this.useSupabase) {
      return supabaseService.subscribeToUserPosts(userId, callback);
    }
    console.warn('Real-time subscriptions only available with Supabase');
    return null;
  }

  subscribeToPostLikes(postId: string, callback: (payload: any) => void) {
    if (this.useSupabase) {
      return supabaseService.subscribeToPostLikes(postId, callback);
    }
    console.warn('Real-time subscriptions only available with Supabase');
    return null;
  }

  // Configuration
  isUsingSupabase(): boolean {
    return this.useSupabase;
  }

  switchToSupabase(): void {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      this.useSupabase = true;
      console.log('Switched to Supabase database');
    } else {
      console.error('Supabase configuration missing');
    }
  }

  switchToPostgreSQL(): void {
    this.useSupabase = false;
    console.log('Switched to PostgreSQL database');
  }
}

export const databaseAdapter = new DatabaseAdapter();