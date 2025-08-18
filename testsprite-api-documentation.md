# Mundo Tango & Life CEO Platform - Complete API Documentation for TestSprite

## Platform Overview
**Base URL:** `https://18b562b7-65d8-4db8-8480-61e8ab9b1db1-00-145w1q6sp1kov.kirk.replit.dev`

This is a comprehensive Life CEO + Mundo Tango social platform featuring:
- 44x21s Framework Architecture with 16 AI Agents
- Multi-tenant social community platform
- Memory-driven content system with recommendations
- Real-time messaging and notifications
- Advanced authentication and role-based access control
- Global payment system with Stripe integration
- 60+ language internationalization
- PWA capabilities with mobile-first design

## Authentication System

### Primary Authentication
- **Method:** Session-based authentication using Replit OAuth
- **Cookie:** `connect.sid` (HttpOnly, Secure)
- **Test User:** admin@mundotango.life (ID: 7, roles: super_admin)
- **Bypass Header:** `AUTH_BYPASS: true` (development only)

### Authentication Endpoints
```
GET /api/login - Initiate Replit OAuth login
GET /api/logout - Logout and session cleanup
GET /api/callback - OAuth callback handler
GET /api/auth/user - Get current authenticated user
```

## Core API Endpoints to Test

### 1. MEMORY SYSTEM (Primary Content System)

#### Create Memory/Recommendation
```
POST /api/memories
Content-Type: application/json

Body Schema:
{
  "content": "string (required)",
  "location": "string (optional)",
  "tags": ["array of strings"],
  "isRecommendation": boolean,
  "recommendationType": "restaurant|hotel|event|activity",
  "priceRange": "$|$$|$$$|$$$$",
  "visibility": "public|private"
}

Success Response: 201
{
  "success": true,
  "message": "Memory created successfully",
  "data": {
    "id": number,
    "userId": number,
    "content": "string",
    "hashtags": ["array"],
    "location": "string",
    "createdAt": "ISO date"
  }
}
```

#### Get Memory Feed
```
GET /api/memories/feed
Success Response: 200
{
  "success": true,
  "data": [array of memories with user data],
  "count": number
}
```

#### Memory Comments
```
POST /api/memories/:postId/comments
Body: {"content": "string"}

GET /api/memories/:postId/comments
Response: {"success": true, "data": [comments array]}
```

### 2. USER MANAGEMENT SYSTEM

#### User Profile & Stats
```
GET /api/auth/user - Current user info
GET /api/user/stats - User statistics
GET /api/user/posts - User's posts/memories
POST /api/user/profile - Update profile
GET /api/user/profile/:userId - Get user profile
```

#### User Roles & Permissions
```
GET /api/user/roles - Get user roles
POST /api/user/roles/request - Request custom role
GET /api/rbac/permissions - Get user permissions
```

### 3. ADMIN SYSTEM

#### Admin Dashboard
```
GET /api/admin/stats - Platform statistics
GET /api/admin/users - User management
POST /api/admin/users/:id/roles - Assign roles
GET /api/admin/posts - Content moderation
DELETE /api/admin/posts/:id - Remove content
```

#### System Health
```
GET /api/admin/system-health - System status
GET /api/admin/performance - Performance metrics
GET /api/admin/security-audit - Security status
```

### 4. SOCIAL FEATURES

#### Posts & Interactions
```
POST /api/posts - Create post (legacy endpoint)
GET /api/posts/feed - Get posts feed
POST /api/post-like - Like post
DELETE /api/post-like/:id - Unlike post
POST /api/post-comment - Add comment
```

#### Social Connections
```
GET /api/friends/requests/count - Friend request count
POST /api/follow/:userId - Follow user
DELETE /api/unfollow/:userId - Unfollow user
GET /api/followers/:userId - Get followers
```

### 5. GROUP & COMMUNITY SYSTEM

#### Groups Management
```
GET /api/groups - Get all groups
POST /api/groups - Create group
GET /api/groups/:id - Get group details
POST /api/groups/:id/join - Join group
POST /api/groups/:id/leave - Leave group
GET /api/groups/user/:userId - User's groups
```

#### Events System
```
GET /api/events - Get events
POST /api/events - Create event
GET /api/events/:id - Get event details
POST /api/events/:id/rsvp - RSVP to event
GET /api/events/user/:userId - User's events
```

### 6. NOTIFICATIONS SYSTEM

#### Real-time Notifications
```
GET /api/notifications - Get notifications
GET /api/notifications/count - Unread count
POST /api/notifications/mark-read - Mark as read
DELETE /api/notifications/:id - Delete notification
```

### 7. PAYMENT SYSTEM (Stripe Integration)

#### Subscription Management
```
GET /api/payments/trial-status - Trial status
POST /api/payments/create-subscription - Create subscription
GET /api/payments/subscription-status - Subscription status
POST /api/payments/cancel-subscription - Cancel subscription
```

### 8. TENANT SYSTEM (Multi-tenant Architecture)

#### Tenant Management
```
GET /api/tenants/user - User's tenants
POST /api/tenants - Create tenant
GET /api/tenants/:id - Get tenant details
POST /api/tenants/:id/switch - Switch tenant context
```

### 9. SEARCH & DISCOVERY

#### Search Endpoints
```
GET /api/search/users?q=query - Search users
GET /api/search/posts?q=query - Search posts
GET /api/search/groups?q=query - Search groups
GET /api/search/events?q=query - Search events
```

### 10. UPLOAD & MEDIA SYSTEM

#### File Uploads
```
POST /api/upload/image - Upload image
POST /api/upload/video - Upload video
DELETE /api/upload/:filename - Delete file
GET /api/upload/:filename - Get file
```

## Testing Scenarios for TestSprite

### Critical User Flows to Test:

1. **Authentication Flow**
   - Login/logout process
   - Session persistence
   - Role-based access control

2. **Memory Creation & Recommendation System**
   - Create regular memory
   - Create recommendation with location/tags
   - Memory feed retrieval
   - Comment system functionality

3. **Social Interactions**
   - Follow/unfollow users
   - Like/unlike posts
   - Comment on posts
   - Real-time notifications

4. **Admin Functions**
   - User management
   - Content moderation
   - System statistics
   - Security audits

5. **Group & Event Management**
   - Create/join groups
   - Event creation and RSVP
   - Group-specific content

6. **Payment Integration**
   - Subscription creation
   - Payment processing
   - Trial status tracking

7. **Multi-tenant Functionality**
   - Tenant switching
   - Data isolation
   - Cross-tenant security

## Error Handling Patterns

All endpoints follow consistent error response format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Technical error details",
  "data": null
}
```

Common HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Database Schema Context

### Key Tables:
- users: User accounts and profiles
- posts: Content posts and memories
- groups: Community groups
- events: Social events
- notifications: Real-time notifications
- user_roles: Role-based access control
- tenants: Multi-tenant architecture

### Security Features:
- Row Level Security (RLS)
- Input sanitization
- CSRF protection
- Rate limiting
- Audit logging
- Compliance monitoring

## Performance Considerations

- Redis caching for frequently accessed data
- Database connection pooling
- Response compression
- CDN integration for static assets
- Lazy loading for large datasets
- Real-time WebSocket connections

## Mobile & PWA Features

- Mobile-first responsive design
- Offline capability
- Push notifications
- App-like navigation
- Touch-optimized interfaces
- Progressive Web App manifest

## Testing Priority Order

1. **High Priority:** Authentication, Memory system, Admin functions
2. **Medium Priority:** Social features, Groups, Events
3. **Low Priority:** File uploads, Search, Analytics

This platform represents a comprehensive social learning ecosystem with advanced AI integration, multi-tenant architecture, and global payment capabilities.