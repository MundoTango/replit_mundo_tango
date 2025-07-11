# 23L Framework Analysis: Group Events Functionality
Date: January 11, 2025

## Executive Summary
Deep dive analysis of Mundo Tango group events functionality to ensure live data integration, proper MT theme implementation, and full 23-Layer production validation.

## Layer 1: Expertise & Technical Proficiency
- **Current State**: Group detail page exists with MT theme styling
- **Issues Identified**:
  - About tab shows static/hardcoded data
  - Posts tab displays mock data instead of real posts
  - Events tab needs verification of data flow
- **Required Expertise**: React, TypeScript, PostgreSQL, API integration

## Layer 2: Research & Discovery
- **Findings**:
  - Groups can be city-based or normal groups
  - Posts API supports group_id filtering
  - Events are tied to city for city-type groups
  - Original MundoTango had Timeline component for group posts
- **Data Flow**: Groups → Posts (via group_id) → Timeline display

## Layer 3: Legal & Compliance
- **Privacy**: Group posts respect visibility settings
- **Access Control**: Member-only features properly gated
- **Data Protection**: User content tied to authentication

## Layer 4: UX/UI Design (MT Theme)
- **MT Design System**:
  - Pink/blue gradients (from-pink-500 to-purple-600)
  - Card-based layouts with shadows
  - Rounded corners (rounded-xl)
  - Hover animations and transitions
- **Current Implementation**: mt-group.css properly styled

## Layer 5: Database Architecture
- **Tables**:
  - groups: Core group data
  - posts: Has group_id foreign key
  - events: Tied to cities for city groups
  - groupMembers: User-group relationships
- **Relationships**: Posts → Groups (many-to-one)

## Layer 6: Backend Development
- **Existing Endpoints**:
  - GET /api/groups/:slug - Group details
  - GET /api/groups/:slug/events - Group events
  - GET /api/groups/:slug/members - Group members
- **Missing**: GET /api/groups/:slug/posts endpoint

## Layer 7: Frontend Development
- **Components**:
  - GroupDetailPageMT.tsx - Main page
  - About tab - Needs live data integration
  - Posts tab - Needs real post fetching
  - Events tab - Functional but needs verification

## Layer 8: API & Integration
- **Post API Pattern**: /post/get-all-post?group_id={id}
- **Integration Needed**: Connect Posts tab to posts API

## Layer 9: Security & Authentication
- **Current**: Proper member checks for actions
- **Validation**: Join/leave group mutations secured

## Layer 10: Deployment & Infrastructure
- **Status**: Ready for implementation
- **Dependencies**: None blocking

## Layer 11: Analytics & Monitoring
- **Tracking**: Group views, member actions
- **Metrics**: Posts per group, event attendance

## Layer 12: Continuous Improvement
- **Future**: Real-time post updates
- **Enhancement**: Rich media in posts

## Layer 13: AI Agent Orchestration
- **Not Applicable**: Human-driven interactions

## Layer 14: Context & Memory Management
- **Group Context**: Maintained in component state
- **User Context**: Via useAuth hook

## Layer 15: Voice & Environmental Intelligence
- **Not Applicable**: Text-based interface

## Layer 16: Ethics & Behavioral Alignment
- **Community Standards**: Enforced via group rules
- **Moderation**: Admin controls present

## Layer 17: Emotional Intelligence
- **Engagement**: Social features (likes, comments)
- **Community Feel**: Member showcase

## Layer 18: Cultural Awareness
- **Tango Culture**: Reflected in group types
- **Localization**: City-based groups

## Layer 19: Energy Management
- **Performance**: Lazy loading of tabs
- **Efficiency**: Only fetch active tab data

## Layer 20: Proactive Intelligence
- **Suggestions**: Event recommendations
- **Notifications**: Group activity alerts

## Layer 21: Production Resilience Engineering
- **Error Handling**: Loading/error states present
- **Fallbacks**: Empty state messages

## Layer 22: User Safety Net
- **Privacy Controls**: Group privacy settings
- **Reporting**: Flag inappropriate content

## Layer 23: Business Continuity
- **Data Persistence**: All group data in PostgreSQL
- **Backup**: Via database backups

## Implementation Plan

### Phase 1: Fix About Tab (Immediate)
1. Use live group data for description
2. Show actual member count
3. Display real creation date
4. Show group location from database

### Phase 2: Implement Posts API (Next)
1. Create /api/groups/:slug/posts endpoint
2. Fetch posts with group_id filter
3. Replace mock data in Posts tab

### Phase 3: Verify Events Integration (Final)
1. Ensure events show for city groups
2. Add event type filtering
3. Implement map view properly

### Phase 4: Enhancement
1. Add real-time updates
2. Implement post creation in group
3. Add rich media support

## Success Criteria
- [ ] About tab shows live group data
- [ ] Posts tab displays real group posts
- [ ] Events tab verified working
- [ ] All data from database, no mock data
- [ ] MT theme consistently applied
- [ ] 23L framework validation complete