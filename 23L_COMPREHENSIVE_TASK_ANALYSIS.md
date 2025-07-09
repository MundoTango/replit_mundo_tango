# 23L Comprehensive Task Analysis for Mundo Tango Platform Enhancement

## Overview
This document provides a systematic 23-layer analysis of the 9 major system requirements provided, with specific focus on branding consistency and TTfiles implementation gaps.

## Branding Guidelines (Consistent Throughout)
- **Primary**: Indigo/Blue (#4F46E5, #3B82F6)
- **Highlights**: Coral/Pink (#EC4899, #F472B6)
- **Share Actions**: Green (#10B981)
- **Special Features**: Purple (#9333EA)
- **Hover Effects**: Smooth transitions with scale and shadow
- **Gradients**: from-indigo-500 to-purple-500 for primary actions

## Task 1: Events System Deep Analysis

### Layer 1: Expertise & Technical Proficiency
**Current State**: 
- Basic event creation exists at `/events`
- Missing: Cover photos, participant roles, Google Maps full integration
- TTfiles reference: EventCard.jsx shows DJ, Teacher, Host role assignments

**TTfiles Components to Implement**:
```jsx
// From EventCard.jsx
const AdminGroup = [
  { title: "Delete Event", onClick: async () => {...} },
  { title: "Edit Event", onClick: async () => setEDitOpenModal() }
];

// Role assignment from TTfiles
const roles = ['DJ', 'Teacher', 'Musician', 'Performer', 'Host', 'Volunteer', 'Photographer', 'Organizer'];
```

### Layer 2: Research & Discovery
**Platform Inspirations**:
- **Facebook Events**: Cover photos, co-hosts, recurring events
- **Airbnb Experiences**: Rich media, host profiles, reviews
- **Eventbrite**: Ticketing, analytics, attendee management
- **Open Source**: Mobilizon (federated events), Gancio (simple events)

### Layer 5: Data Architecture
**Required Schema Updates**:
```sql
-- Add to events table
ALTER TABLE events ADD COLUMN cover_photo_url TEXT;
ALTER TABLE events ADD COLUMN event_type TEXT[] DEFAULT '{}'; -- milonga, workshop, practica, etc
ALTER TABLE events ADD COLUMN vibe TEXT[] DEFAULT '{}'; -- restaurant, bar, LGBTQ+, etc
ALTER TABLE events ADD COLUMN google_place_id TEXT;
ALTER TABLE events ADD COLUMN latitude DECIMAL(10,8);
ALTER TABLE events ADD COLUMN longitude DECIMAL(11,8);
```

### Implementation Requirements:
1. **Google Maps Integration**:
   - Full autocomplete with place details
   - Store place_id, lat/lng for map display
   - Support business names like "El Beso, Buenos Aires"

2. **Cover Photo Upload**:
   - Use UploadMedia component
   - 16:9 aspect ratio recommended
   - Fallback to gradient if no photo

3. **Participant Roles**:
   - Send invitations via `event_participants` table
   - Email/notification on invite
   - Display on user's Tango Resume when accepted

4. **Test Data Generation**:
   ```typescript
   // Create diverse events with our test users
   const testEvents = [
     { type: 'milonga', organizer: 'dj_tango', city: 'Buenos Aires' },
     { type: 'workshop', organizer: 'teacher123', city: 'Berlin' },
     { type: 'festival', organizer: 'organizer_pro', city: 'Istanbul' }
   ];
   ```

## Task 2: Project Planner → "The Plan" Analysis

### Layer 11: Analytics & Monitoring
**Issues Identified (Last 24-48 hours)**:
1. Component name inconsistency (ProjectTracker vs "The Plan")
2. Modal closing issues in JiraStyleItemDetailModal
3. State management problems with selectedItem

### Fixes Required:
1. **Rename Components**:
   - `ProjectTrackerDashboard` → `ThePlanDashboard`
   - Update all imports and references
   - Update navigation labels

2. **Modal Stability**:
   ```typescript
   // Fix modal closing issues
   const handleClose = useCallback(() => {
     setSelectedItem(null);
     // Clear any stuck state
     document.body.style.overflow = 'auto';
   }, []);
   ```

## Task 3: Missing TTfiles Implementations

### Missing Features from TTfiles:
1. **Memory Reporting to Admin Center**:
   - TTfiles shows report functionality on posts
   - Current: ReportModal exists but not connected to admin center
   - Need: Admin report queue in AdminCenter

2. **Help Request System (Jira/Zendesk style)**:
   ```typescript
   // New schema needed
   const helpRequests = pgTable("help_requests", {
     id: uuid("id").primaryKey(),
     userId: integer("user_id").references(() => users.id),
     category: text("category"), // technical, account, content, other
     priority: text("priority"), // low, medium, high, urgent
     status: text("status"), // new, in_progress, resolved, closed
     subject: text("subject"),
     description: text("description"),
     assignedTo: integer("assigned_to").references(() => users.id),
   });
   ```

## Task 4: Unified Posting Feature Analysis

### Layer 6: Backend Development
**Current Issues**:
- Posting functionality duplicated across events, groups, memories
- No unified template component
- Missing location intelligence

**Solution: Create Unified PostComposer**:
```typescript
interface UnifiedPostComposerProps {
  context: 'memory' | 'event' | 'group' | 'comment';
  contextId?: string;
  onPost: (data: PostData) => void;
  features?: {
    location?: boolean;
    media?: boolean;
    mentions?: boolean;
    emotions?: boolean;
    visibility?: boolean;
  };
}
```

**Location Intelligence Requirements**:
1. Auto-suggest based on user's current location
2. Extract location from photo/video EXIF data
3. Cross-reference with upcoming events
4. Smart recommendations: "Looks like you're at [Event Name]"

## Task 5: Community Navigation & World Map

### Layer 7: Frontend Development
**Implementation Plan**:
```typescript
// World map with city pins
interface CityPin {
  city: string;
  lat: number;
  lng: number;
  userCount: number;
  eventCount: number;
  housingCount: number;
  recommendationCount: number;
}

// Use react-leaflet or mapbox for implementation
```

## Task 6: Enhanced Friendship System

### Layer 17: Emotional Intelligence
**Friendship Request Form**:
```typescript
interface FriendshipRequest {
  didWeDance: boolean;
  whereDidWeDance?: string; // Google place or event
  photos?: string[];
  funStory?: string;
  privateNote?: string; // Only visible to sender
  snoozeUntil?: Date; // 10am next day reminder
}
```

**Degrees of Separation**:
- 1st degree: Direct friends
- 2nd degree: Friends of friends
- 3rd degree: Two connections away

## Task 7: Housing System (Airbnb/VRBO style)

### Layer 8: API & Integration
**Schema Requirements**:
```sql
CREATE TABLE housing_listings (
  id UUID PRIMARY KEY,
  host_id INTEGER REFERENCES users(id),
  title TEXT,
  description TEXT,
  property_type TEXT, -- apartment, house, room
  max_guests INTEGER,
  amenities TEXT[],
  house_rules TEXT,
  photos TEXT[],
  availability JSONB,
  min_friendship_degree INTEGER DEFAULT 1,
  city_group_id INTEGER REFERENCES city_groups(id)
);
```

## Task 8: Global Statistics

### Layer 9: Security & Authentication
**Live Statistics Requirements**:
```typescript
// Real-time statistics from database
const getGlobalStats = async () => {
  return {
    totalUsers: await db.select().from(users).count(),
    totalEvents: await db.select().from(events).count(),
    activeCities: await db.select().from(cityGroups).where(active).count(),
    monthlyActiveUsers: await getMAU(),
  };
};
```

## Task 9: Database Security Implementation

### Layer 21: Production Resilience Engineering
**Audit System Implementation**:
1. Create audit schema and logs table
2. Apply RLS to sensitive tables
3. Add performance indexes
4. Implement security health checks

## Next Steps & Clarifying Questions

### Questions for Implementation:
1. **Events**: Should event types (milonga, workshop, etc.) be predefined or user-defined?
2. **Housing**: Should we implement payment processing or just contact/booking requests?
3. **Friendship**: Should the snooze reminder be customizable (time/frequency)?
4. **Statistics**: Which specific metrics are most important to display?
5. **Help Requests**: Should this integrate with external support tools or be fully internal?

### Immediate Priorities:
1. Fix "The Plan" naming and modal issues
2. Implement missing report queue in admin center
3. Create unified posting component template
4. Add cover photos to event creation

### Development Sequence:
1. **Phase 1** (Immediate): Project planner fixes, admin report queue
2. **Phase 2** (This week): Unified posting, event enhancements
3. **Phase 3** (Next week): Friendship system, community navigation
4. **Phase 4** (Following week): Housing system, global statistics
5. **Phase 5** (Final): Database security audit implementation

Each implementation will follow Mundo Tango branding guidelines and incorporate TTfiles patterns where applicable.