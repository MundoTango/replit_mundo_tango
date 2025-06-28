# Mundo Tango Database Security Implementation

## Row Level Security (RLS) Overview

The Mundo Tango platform implements comprehensive database security using PostgreSQL Row Level Security policies to protect user data and ensure proper access controls.

## Security Architecture

### Authentication Flow
1. **User Authentication**: Replit OAuth provides user identity
2. **Security Context**: Middleware sets `app.current_user_id` for database session
3. **RLS Policies**: PostgreSQL policies enforce data access rules
4. **Audit Logging**: Security events tracked in activities table

### Protected Tables

#### Posts Table
- **SELECT**: Users can read public posts, own posts, and posts from followed users
- **INSERT/UPDATE/DELETE**: Users can only modify their own posts

#### Events Table  
- **SELECT**: Users can read public events, own events, and events they've RSVP'd to
- **INSERT/UPDATE/DELETE**: Users can only modify their own events

#### Stories Table
- **SELECT**: Users can read own stories and stories from followed users
- **INSERT/DELETE**: Users can only create/delete their own stories

#### Follows Table
- **SELECT**: Users can see their own follow relationships
- **INSERT/DELETE**: Users can only create/remove their own follows

#### Experience Tables
- All experience tables (dance, DJ, teaching, etc.) restricted to owner access only

## Security Middleware

### User Context Middleware (`setUserContext`)
```typescript
// Applied to all /api routes
app.use('/api', setUserContext);
```
- Extracts user ID from authentication
- Sets PostgreSQL session variable for RLS policies
- Handles both Replit OAuth and JWT authentication

### Security Audit Middleware (`auditSecurityEvent`)
```typescript
// Example usage for sensitive operations
app.post('/api/posts', auditSecurityEvent('post_create'), ...)
```
- Logs security events to activities table
- Tracks user actions, IP addresses, timestamps
- Non-blocking - doesn't fail operations if logging fails

### Resource Permission Middleware (`checkResourcePermission`)
```typescript
// Validates access to specific resources
app.get('/api/post/:id', checkResourcePermission('post'), ...)
```
- Pre-validates user access to resources
- Returns 403 for unauthorized access attempts
- Works with posts, events, chat rooms, stories

### Rate Limiting Middleware (`rateLimit`)
```typescript
// Prevents abuse of sensitive operations
app.post('/api/friend-request', rateLimit(10, 60000), ...)
```
- In-memory rate limiting per user/IP
- Configurable limits and time windows
- Automatic cleanup of expired entries

## Database Functions

### Current User Context
```sql
CREATE FUNCTION get_current_user_id() RETURNS INTEGER
-- Returns the current authenticated user's ID from session context
-- Used by all RLS policies for access control
```

### Security Event Logging
```sql
CREATE FUNCTION log_security_event(event_type, table_name, user_id, details)
-- Logs security events to activities table
-- Includes error handling to prevent operation failures
```

## Performance Optimizations

### Indexes for RLS
```sql
-- Optimized indexes for RLS policy performance
CREATE INDEX idx_posts_user_id_public ON posts(user_id, is_public);
CREATE INDEX idx_events_user_id_public ON events(user_id, is_public);
CREATE INDEX idx_follows_follower_following ON follows(follower_id, following_id);
```

### Query Optimization
- RLS policies use efficient EXISTS clauses
- Composite indexes support common access patterns
- Policies avoid expensive joins where possible

## Security Features Active

### Real-time Protection
- ✅ User context middleware active (logs show: "🔒 Security context set for user: 3")
- ✅ RLS policies enabled on critical tables
- ✅ Performance indexes created
- ✅ Security audit logging implemented

### Access Controls
- **Data Isolation**: Users can only access their own data or public content
- **Social Privacy**: Follow relationships control story/post visibility
- **Event Security**: RSVP status grants event access
- **Chat Protection**: Room membership required for message access

### Audit Trail
- All database operations logged with user context
- Security events tracked in activities table
- IP addresses and user agents recorded
- Timestamps for forensic analysis

## Testing Security

### Verify RLS Policies
```sql
-- Test as specific user
SELECT set_config('app.current_user_id', '1', true);
SELECT * FROM posts; -- Should only show user 1's posts and public posts

-- Test without user context
SELECT set_config('app.current_user_id', '0', true);
SELECT * FROM posts; -- Should only show public posts
```

### Security Monitoring
```sql
-- Check recent security events
SELECT * FROM activities 
WHERE activity_type LIKE 'security_%' 
ORDER BY created_at DESC 
LIMIT 20;
```

## Production Deployment

### Security Checklist
- ✅ RLS policies enabled on all sensitive tables
- ✅ Security middleware integrated with authentication
- ✅ Performance indexes created
- ✅ Audit logging functional
- ✅ Rate limiting configured
- ✅ User context middleware active

### Monitoring
- Database query performance with RLS overhead
- Security event frequency and patterns
- Rate limiting effectiveness
- Failed access attempts

## Compliance

### Data Protection
- User data isolated by RLS policies
- Access logged for audit requirements
- Privacy controls respect user relationships
- Secure by default with explicit permissions

### Platform Security
- Defense in depth with multiple security layers
- Application-level and database-level controls
- Real-time monitoring and alerting
- Comprehensive audit trail

## Development Guidelines

### Adding New Tables
1. Enable RLS: `ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;`
2. Create policies for SELECT, INSERT, UPDATE, DELETE
3. Add performance indexes
4. Test with different user contexts

### Security Testing
1. Verify policies work correctly
2. Test performance with large datasets
3. Validate audit logging
4. Check rate limiting effectiveness

The security implementation is now fully active and protecting the Mundo Tango platform with comprehensive Row Level Security policies, middleware protection, and audit logging.