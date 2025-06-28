import { describe, it, expect, beforeEach } from 'vitest'
import { pool } from '../server/db.ts'
import { storage } from '../server/storage.ts'

describe('Database Integration Tests', () => {
  beforeEach(async () => {
    // Ensure database connection is working
    const client = await pool.connect()
    await client.query('SELECT 1')
    client.release()
  })

  describe('Database Connection', () => {
    it('should connect to PostgreSQL database', async () => {
      const result = await pool.query('SELECT NOW() as current_time')
      expect(result.rows).toBeDefined()
      expect(result.rows.length).toBe(1)
      expect(result.rows[0].current_time).toBeDefined()
    })

    it('should have required tables', async () => {
      const tableQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      `
      const result = await pool.query(tableQuery)
      const tableNames = result.rows.map(row => row.table_name)
      
      const requiredTables = ['users', 'posts', 'events', 'activities']
      requiredTables.forEach(table => {
        expect(tableNames).toContain(table)
      })
    })
  })

  describe('User Operations', () => {
    it('should create and retrieve users', async () => {
      const testUser = {
        name: 'Test User',
        username: `test_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        firstName: 'Test',
        lastName: 'User'
      }

      const createdUser = await storage.createUser(testUser)
      expect(createdUser).toBeDefined()
      expect(createdUser.name).toBe(testUser.name)
      expect(createdUser.email).toBe(testUser.email)

      const retrievedUser = await storage.getUser(createdUser.id)
      expect(retrievedUser).toBeDefined()
      expect(retrievedUser.id).toBe(createdUser.id)
      expect(retrievedUser.email).toBe(testUser.email)
    })

    it('should find users by email', async () => {
      const email = `test_email_${Date.now()}@example.com`
      const testUser = {
        name: 'Email Test User',
        username: `email_test_${Date.now()}`,
        email,
        firstName: 'Email',
        lastName: 'Test'
      }

      const createdUser = await storage.createUser(testUser)
      const foundUser = await storage.getUserByEmail(email)
      
      expect(foundUser).toBeDefined()
      expect(foundUser.id).toBe(createdUser.id)
      expect(foundUser.email).toBe(email)
    })

    it('should update user information', async () => {
      const testUser = {
        name: 'Update Test User',
        username: `update_test_${Date.now()}`,
        email: `update_test_${Date.now()}@example.com`,
        firstName: 'Update',
        lastName: 'Test'
      }

      const createdUser = await storage.createUser(testUser)
      const updates = {
        bio: 'Updated bio for testing',
        city: 'Buenos Aires'
      }

      const updatedUser = await storage.updateUser(createdUser.id, updates)
      expect(updatedUser.bio).toBe(updates.bio)
      expect(updatedUser.city).toBe(updates.city)
      expect(updatedUser.id).toBe(createdUser.id)
    })
  })

  describe('Post Operations', () => {
    let testUser = null

    beforeEach(async () => {
      // Create a test user for posts
      testUser = await storage.createUser({
        name: 'Post Test User',
        username: `post_user_${Date.now()}`,
        email: `post_user_${Date.now()}@example.com`,
        firstName: 'Post',
        lastName: 'User'
      })
    })

    it('should create posts', async () => {
      const testPost = {
        userId: testUser.id,
        content: 'This is a test post for the database integration tests',
        isPublic: true,
        hashtags: ['test', 'database', 'integration']
      }

      const createdPost = await storage.createPost(testPost)
      expect(createdPost).toBeDefined()
      expect(createdPost.content).toBe(testPost.content)
      expect(createdPost.userId).toBe(testUser.id)
      expect(createdPost.hashtags).toEqual(testPost.hashtags)
    })

    it('should retrieve user posts', async () => {
      // Create multiple posts
      const posts = [
        {
          userId: testUser.id,
          content: 'First test post',
          isPublic: true
        },
        {
          userId: testUser.id,
          content: 'Second test post',
          isPublic: true
        }
      ]

      for (const post of posts) {
        await storage.createPost(post)
      }

      const userPosts = await storage.getUserPosts(testUser.id, 10, 0)
      expect(userPosts.length).toBeGreaterThanOrEqual(2)
      expect(userPosts.every(post => post.userId === testUser.id)).toBe(true)
    })

    it('should handle post likes', async () => {
      const testPost = {
        userId: testUser.id,
        content: 'Post for testing likes',
        isPublic: true
      }

      const createdPost = await storage.createPost(testPost)
      
      // Like the post
      await storage.likePost(createdPost.id, testUser.id)
      
      // Verify like was recorded
      const postWithLikes = await storage.getPostById(createdPost.id)
      expect(postWithLikes).toBeDefined()
      
      // Unlike the post
      await storage.unlikePost(createdPost.id, testUser.id)
    })
  })

  describe('Event Operations', () => {
    let testUser = null

    beforeEach(async () => {
      testUser = await storage.createUser({
        name: 'Event Test User',
        username: `event_user_${Date.now()}`,
        email: `event_user_${Date.now()}@example.com`,
        firstName: 'Event',
        lastName: 'User'
      })
    })

    it('should create events', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)

      const testEvent = {
        title: 'Test Milonga',
        description: 'A test tango event for database integration testing',
        organizerId: testUser.id,
        startDate: futureDate,
        location: 'Test Venue',
        city: 'Buenos Aires',
        country: 'Argentina',
        isPublic: true
      }

      const createdEvent = await storage.createEvent(testEvent)
      expect(createdEvent).toBeDefined()
      expect(createdEvent.title).toBe(testEvent.title)
      expect(createdEvent.organizerId).toBe(testUser.id)
      expect(createdEvent.location).toBe(testEvent.location)
    })

    it('should retrieve events', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 14)

      const testEvent = {
        title: 'Retrieval Test Event',
        description: 'Testing event retrieval functionality',
        organizerId: testUser.id,
        startDate: futureDate,
        location: 'Test Location',
        isPublic: true
      }

      const createdEvent = await storage.createEvent(testEvent)
      const events = await storage.getEvents(10, 0)
      
      expect(events).toBeDefined()
      expect(Array.isArray(events)).toBe(true)
      expect(events.some(event => event.id === createdEvent.id)).toBe(true)
    })

    it('should handle event RSVPs', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 21)

      const testEvent = {
        title: 'RSVP Test Event',
        description: 'Testing RSVP functionality',
        organizerId: testUser.id,
        startDate: futureDate,
        location: 'RSVP Test Venue',
        isPublic: true
      }

      const createdEvent = await storage.createEvent(testEvent)
      
      // RSVP to the event
      const rsvp = await storage.rsvpEvent(createdEvent.id, testUser.id, 'confirmed')
      expect(rsvp).toBeDefined()
      expect(rsvp.eventId).toBe(createdEvent.id)
      expect(rsvp.userId).toBe(testUser.id)
      expect(rsvp.status).toBe('confirmed')
    })
  })

  describe('Search Functionality', () => {
    let testUser = null

    beforeEach(async () => {
      testUser = await storage.createUser({
        name: 'Search Test User',
        username: `search_user_${Date.now()}`,
        email: `search_user_${Date.now()}@example.com`,
        firstName: 'Search',
        lastName: 'Test',
        bio: 'This user is for testing search functionality'
      })
    })

    it('should search users', async () => {
      const searchResults = await storage.searchUsers('Search Test', 10)
      expect(searchResults).toBeDefined()
      expect(Array.isArray(searchResults)).toBe(true)
      expect(searchResults.some(user => user.id === testUser.id)).toBe(true)
    })

    it('should search posts', async () => {
      const searchablePost = {
        userId: testUser.id,
        content: 'This post contains unique search terms like "searchable_content_123"',
        isPublic: true
      }

      await storage.createPost(searchablePost)
      
      const searchResults = await storage.searchPosts('searchable_content_123', 10)
      expect(searchResults).toBeDefined()
      expect(Array.isArray(searchResults)).toBe(true)
      expect(searchResults.length).toBeGreaterThan(0)
    })
  })

  describe('Analytics and Stats', () => {
    let testUser = null

    beforeEach(async () => {
      testUser = await storage.createUser({
        name: 'Stats Test User',
        username: `stats_user_${Date.now()}`,
        email: `stats_user_${Date.now()}@example.com`,
        firstName: 'Stats',
        lastName: 'Test'
      })
    })

    it('should provide user statistics', async () => {
      // Create some content for the user
      await storage.createPost({
        userId: testUser.id,
        content: 'Stats test post 1',
        isPublic: true
      })

      await storage.createPost({
        userId: testUser.id,
        content: 'Stats test post 2',
        isPublic: true
      })

      const stats = await storage.getUserStats(testUser.id)
      expect(stats).toBeDefined()
      expect(typeof stats.postsCount).toBe('number')
      expect(typeof stats.followersCount).toBe('number')
      expect(typeof stats.followingCount).toBe('number')
      expect(stats.postsCount).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Data Integrity', () => {
    it('should maintain referential integrity', async () => {
      const testUser = await storage.createUser({
        name: 'Integrity Test User',
        username: `integrity_${Date.now()}`,
        email: `integrity_${Date.now()}@example.com`,
        firstName: 'Integrity',
        lastName: 'Test'
      })

      const testPost = await storage.createPost({
        userId: testUser.id,
        content: 'Testing referential integrity',
        isPublic: true
      })

      // Verify the post has the correct user relationship
      const retrievedPost = await storage.getPostById(testPost.id)
      expect(retrievedPost.userId).toBe(testUser.id)
    })

    it('should handle concurrent operations', async () => {
      const testUser = await storage.createUser({
        name: 'Concurrency Test User',
        username: `concurrency_${Date.now()}`,
        email: `concurrency_${Date.now()}@example.com`,
        firstName: 'Concurrency',
        lastName: 'Test'
      })

      // Create multiple posts concurrently
      const postPromises = Array.from({ length: 5 }, (_, i) =>
        storage.createPost({
          userId: testUser.id,
          content: `Concurrent post ${i}`,
          isPublic: true
        })
      )

      const posts = await Promise.all(postPromises)
      expect(posts.length).toBe(5)
      expect(posts.every(post => post.userId === testUser.id)).toBe(true)
    })
  })
})