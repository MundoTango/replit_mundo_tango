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
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```