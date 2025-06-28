# Mundo Tango - Social Media Platform

## Overview

Mundo Tango is a modern full-stack social media application designed for the global tango community. It's built as a progressive web application with real-time features, allowing users to connect, share posts, organize events, and engage in messaging.

## System Architecture

The application follows a clean, modern full-stack architecture:

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: JavaScript with TypeScript support
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Redux Toolkit with RTK Query for API state
- **Routing**: Next.js App Router for file-based routing
- **Build Tool**: Next.js built-in bundler
- **UI Library**: React with Tailwind CSS custom components

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Real-time**: WebSocket server for live messaging and notifications
- **File Uploads**: Multer for handling media uploads
- **Authentication**: JWT-based authentication with bcrypt password hashing

### Database
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (configured for Neon serverless)
- **Migrations**: Drizzle Kit for schema management
- **Connection**: @neondatabase/serverless for optimal performance

## Key Components

### Authentication System
- JWT token-based authentication
- Secure password hashing with bcrypt
- Protected routes with middleware
- Persistent sessions with local storage

### Social Media Features
- User profiles with customizable information
- Post creation with image/video support
- Like, comment, and share functionality
- Stories with view tracking
- Follow/unfollow user relationships

### Real-time Messaging
- WebSocket-based chat system
- Private and group messaging
- Real-time message delivery
- Chat room management

### Event Management
- Event creation and RSVP system
- Calendar integration
- Location-based event discovery
- Event attendance tracking

### Media Handling
- File upload system for images and videos
- Profile and background image management
- Secure file storage with validation

## Data Flow

1. **Client Requests**: React frontend makes API calls through React Query
2. **Authentication**: JWT middleware validates user tokens
3. **Data Processing**: Express routes handle business logic
4. **Database Operations**: Drizzle ORM manages PostgreSQL interactions
5. **Real-time Updates**: WebSocket server pushes live updates to connected clients
6. **File Handling**: Multer processes and stores uploaded media files

## External Dependencies

### Core Libraries
- React ecosystem (React, React DOM, React Query)
- Express.js with TypeScript support
- Drizzle ORM with PostgreSQL adapter
- Radix UI component primitives
- Tailwind CSS for styling

### Authentication & Security
- jsonwebtoken for JWT handling
- bcrypt for password hashing
- CORS and security middleware

### File & Media Handling
- multer for file uploads
- File type validation and size limits

### Real-time Features
- ws (WebSocket) library for real-time communication
- Custom socket service for message handling

### Development Tools
- TypeScript for type safety
- Vite for fast development
- ESBuild for production builds
- Drizzle Kit for database migrations

## Deployment Strategy

### Development Environment
- Vite dev server for frontend with HMR
- tsx for running TypeScript server in development
- PostgreSQL database connection via environment variables

### Production Build
1. Frontend built with Vite to static assets
2. Backend bundled with ESBuild as ES modules
3. Single Node.js process serves both frontend and API
4. PostgreSQL database hosted on Neon (serverless)

### Infrastructure
- **Platform**: Replit with autoscale deployment
- **Database**: Neon PostgreSQL (serverless)
- **File Storage**: Local filesystem (uploads directory)
- **WebSocket**: Integrated with Express server

### Environment Configuration
- `DATABASE_URL` for PostgreSQL connection
- `JWT_SECRET` for authentication security
- `NODE_ENV` for environment-specific behavior

## Changelog

```
Changelog:
- June 27, 2025. Initial setup
- June 27, 2025. Fixed app startup issues:
  * Resolved ES module require() error in routes.ts
  * Fixed missing auth context exports
  * Added missing auth pages (login/register)
  * Fixed import paths for useAuth hook
  * Created test user with sample content
  * Restored complete social media interface
- June 27, 2025. Complete Next.js App Router conversion:
  * Converted from Vite/React to Next.js 14 with App Router
  * Implemented Redux Toolkit with RTK Query for state management
  * Created complete JWT authentication system with context providers
  * Built authentication guards (GuestGuard) and protected routes
  * Established app/ directory structure with layout and page components
  * Created login page with form handling and authentication flow
  * Built user dashboard with timeline functionality
  * Integrated with existing Express backend API endpoints
  * Added proper route rewrites in Next.js config for API proxy
  * Maintained original Mundo Tango styling and component architecture
- June 27, 2025. Fixed database schema and onboarding improvements:
  * Fixed database schema mismatch by adding missing columns (leader_level, follower_level, years_of_dancing)
  * Updated tango role options with comprehensive list including new categories (Content Creator, Historian, Tango House, Tango School)
  * Converted dancing experience from slider to interactive tile selection with descriptive options
  * Enhanced LocationPicker component with better error handling and validation
  * Resolved runtime errors and improved component stability
  * App now runs successfully with all onboarding features functional
- June 27, 2025. Complete registration flow with code of conduct:
  * Added comprehensive code of conduct screen with community values
  * Created two-step registration flow: onboarding → code of conduct → main app
  * Enhanced dancing experience with both level tiles and year input field
  * Implemented complete location database with 157,251 global cities and country flags
  * Fixed location picker to work with client-side database for better performance
  * Added database columns for started_dancing_year and code_of_conduct_accepted
  * Updated routing logic to handle multi-step registration process
- June 27, 2025. Fixed navigation and authentication issues:
  * Resolved refresh navigation redirecting to timeline instead of home screen
  * Fixed authentication middleware inconsistency between JWT and Replit OAuth
  * Updated posts feed API to use Replit session authentication
  * App now properly loads posts data on home screen
  * Stories endpoint authentication resolved - all API endpoints working
- June 27, 2025. Secured and completed database architecture:
  * Added all specialized experience tables from original database (DJ, Teaching, Performer, Photographer, Tour Operator)
  * Created blocked users and user API tokens tables for complete functionality
  * Registration flow is now locked and secure with comprehensive user onboarding
  * Database covers all original Mundo Tango functionality with PostgreSQL implementation
  * All authentication endpoints use consistent Replit OAuth session management
- June 27, 2025. Complete Trango Tech backend and frontend integration:
  * Integrated all original Trango Tech API endpoints with exact structure matching (Post, User, Experience endpoints)
  * Implemented comprehensive Post API: /api/post/store, /api/post/get-all-post, /api/post/get-my-post, etc.
  * Added all User management APIs: /api/user, /api/user/get-user-profile, /api/user/global-search, etc.
  * Created specialized Experience endpoints: dance-experience, creator-experience, dj-experience, teaching-experience, performer-experience, photographer-experience, tour-operator-experience
  * Built original frontend components: EventCard, ProfileHead, CommunityCard matching Trango Tech design
  * Created comprehensive Events page (/user/events) with search, filtering, and RSVP functionality
  * Implemented Community page (/user/community) with join/leave functionality and community discovery
  * Maintained Replit OAuth authentication while adopting original API response structures
  * All endpoints return original Trango Tech response format: {code, message, data}
  * Frontend components integrate seamlessly with backend APIs using authentic data patterns
- June 28, 2025. Complete Supabase database migration prepared:
  * Created comprehensive migration from TrangoTech MySQL to Supabase PostgreSQL
  * Migrated all 55 tables with UUID primary keys and Supabase Auth integration
  * Implemented complete Row-Level Security (RLS) policies for data protection
  * Added PostGIS support for advanced geographic queries and location-based features
  * Enhanced schema with modern PostgreSQL features: JSONB, arrays, triggers, comprehensive indexing
  * Created database/ directory with complete documentation: README.md, table_relationships.md, migration_notes.md
  * Generated realistic seed data with 5 diverse users, events, communities, posts, and social interactions
  * Migration ready for deployment to Supabase with full backward compatibility maintained
- June 28, 2025. Complete integration services and testing infrastructure:
  * Built comprehensive Supabase integration services for server and client
  * Created database adapter for seamless switching between PostgreSQL and Supabase
  * Implemented real-time subscriptions and WebSocket features
  * Added Vitest testing framework with comprehensive database test suite
  * Created validation scripts and deployment checklists for production readiness
  * Established environment configuration templates and documentation
  * Email service integration validated and working correctly
  * Complete migration package ready for production deployment
- June 28, 2025. Enhanced Plausible Analytics integration completed:
  * Upgraded to advanced Plausible script with file downloads, hash navigation, outbound links tracking
  * Added pageview properties, revenue tracking, and tagged events support
  * Integrated comprehensive analytics API with 20+ predefined tracking functions
  * Enhanced analytics library supports A/B testing, conversion tracking, and user journey analysis
  * Updated README.md with complete documentation of enhanced tracking capabilities
  * Script configured for mundotango.life domain with privacy-first GDPR compliance
  * Analytics active and confirmed working - tracks user interactions without cookies
- June 28, 2025. Supabase Storage integration fully implemented:
  * Created comprehensive upload service with server and client implementations
  * Established media-uploads bucket with RLS policies (public read, authenticated write)
  * Built React UploadMedia component with drag-drop, preview, and progress tracking
  * Added server-side upload endpoints with authentication and file validation
  * Supports images, videos, documents with 10MB size limit and automatic CDN distribution
  * Complete file organization by user and folder structure for scalable media management
  * Integration confirmed working - ready for production file uploads
- June 28, 2025. Phase 2 media capabilities completed:
  * Enhanced upload service with metadata storage in media_assets table
  * Added comprehensive tagging system with media_tags table for content organization
  * Implemented visibility controls (public, private, mutual) with signed URL generation
  * Built complete media management API with 8 new endpoints for CRUD operations
  * Added image dimension tracking and file size monitoring for asset management
  * Created advanced search capabilities by tags and user-specific media filtering
  * Enhanced upload endpoint supports tags, visibility settings, and metadata capture
  * All media assets now have UUID-based identification and comprehensive metadata tracking
- June 28, 2025. Extended Supabase Storage integration completed:
  * Created supporting database tables: media_usage for content tracking and friends for mutual visibility
  * Implemented mutual visibility logic with reciprocal friendship requirements
  * Built comprehensive UploadMedia React component with drag-drop, tagging, and visibility controls
  * Enhanced file constraints: 5MB max size, 1200x1200px dimensions, automatic resizing and JPEG conversion
  * Integrated UploadMedia across all forms: memory creation, event creation, profile edits, experience forms
  * Added analytics tracking for all uploads with folder, context, visibility, and file type metrics
  * Created complete upload service with progress tracking and error handling
  * Updated storage operations to support media usage tracking and friendship management
- June 28, 2025. Real-time chat and email notification system implemented:
  * Built comprehensive Supabase Realtime service with WebSocket channel subscriptions
  * Implemented real-time listeners for chat_messages, event_feedback, and friend_requests tables
  * Created presence channels with typing indicators and online status tracking
  * Built ChatRoom component with real-time messaging, presence awareness, and typing status
  * Integrated Resend email service with dynamic templates for friend requests, memory tags, event feedback, and safety reports
  * Added email notification system with production controls and analytics tracking
  * Created comprehensive email templates with responsive HTML and text versions
  * All real-time features include proper error handling, reconnection logic, and console logging for development
- June 28, 2025. Database security with Row Level Security (RLS) policies implemented:
  * Created comprehensive PostgreSQL Row Level Security policies for all sensitive tables (posts, events, stories, follows)
  * Built security middleware system with user context setting, audit logging, resource permission checks, and rate limiting
  * Implemented get_current_user_id() function for RLS policy authentication using session variables
  * Added security audit logging to activities table with comprehensive event tracking
  * Applied user context middleware to all API routes with real-time security context logging active
  * Created performance-optimized indexes for RLS policies and established security monitoring
  * Complete database security implementation protects user data with defense-in-depth approach
- June 28, 2025. Enhanced multi-role authentication system with 16+ community roles implemented:
  * Created comprehensive roles table with 17 community roles (dancer, performer, teacher, DJ, organizer, etc.) and 6 platform roles (admin, super_admin, moderator, curator, guest, bot)
  * Built user_roles junction table supporting multiple roles per user with primary role designation
  * Enhanced user_profiles table with roles array and primary_role columns for multi-role support
  * Implemented EnhancedRoleService with role assignment, removal, permission checking, and role-based routing
  * Created comprehensive API endpoints for role management: /api/roles/enhanced/* for assignment, removal, and route determination
  * Built EnhancedRoleManager React component with tabbed interface for role testing, user management, and permission verification
  * Added role-based routing system directing users to appropriate dashboards based on primary role
  * Complete multi-role system supports complex permission structures and community-specific role hierarchies
- June 28, 2025. Full Mundo Tango role taxonomy with client-side routing guards completed:
  * Implemented comprehensive roles.ts service with 23 role definitions and complete permission mappings
  * Enhanced roleAuth.ts middleware supporting array-based role checks and enhanced authentication options
  * Created RoleGuard component with automatic role-based routing (super_admin→/platform, admin→/admin, organizer→/organizer, dancer→/moments)
  * Built RoleBadge component with role-specific colors, icons, and styling for visual role identification
  * Added role switching interface for users with multiple roles and route persistence
  * Scott Boddye assigned super_admin, admin, and dancer roles for comprehensive testing
  * Complete 23-role system operational with community roles (17) and platform roles (6) supporting multi-role users
- June 28, 2025. Complete TT UI migration to Supabase-integrated structure completed:
  * Migrated all TrangoTech UI components to current Mundo Tango architecture with Tailwind CSS
  * Created DashboardLayout and DashboardSidebar with role-based navigation and responsive design
  * Built modernized EventCard component with RSVP functionality, media support, and participant tracking
  * Implemented ProfileHead component with role badges, experience levels, and tabbed interface
  * Created comprehensive Moments page with post creation, media upload, filtering, and social interactions
  * Built enhanced Events page with event creation, RSVP management, and time-based filtering
  * All components integrated with Supabase backend, authentication context, and UploadMedia service
  * Complete responsive design with mobile-first approach and consistent design language
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```