# 23L Framework: Role-Based Groups System Implementation

## Layer 1: Expertise & Domain Knowledge
- **Group Types**: City groups, role groups (Organizers, Teachers, DJs, Musicians, Performers)
- **Auto-population**: Based on user's "What do you do in Tango" registration data
- **RBAC/ABAC**: Different privileges for members vs followers
- **Reference**: TrangoTech group system patterns

## Layer 2: Research & Discovery
- **Current State**: City groups exist but role groups missing
- **Issue**: `/api/groups/:id` endpoint not implemented causing 404
- **Data Flow**: user_roles → automatic group assignment → membership privileges

## Layer 3: Legal & Compliance
- **Privacy**: Public groups visible to all, private groups require approval
- **Data Protection**: Member lists only visible to authenticated users
- **Consent**: Users auto-joined based on their explicit role selection

## Layer 4: UX/UI Design
- **Groups Page**: Display role-based groups with member counts
- **Icons**: Unique icons for each role type (🎵 Musicians, 🎭 Performers, etc.)
- **Actions**: Join/Leave/Follow buttons with clear state indicators
- **Navigation**: Fix group detail pages to show proper content

## Layer 5: Data Architecture
```sql
-- Existing groups table structure supports type field
-- Need to create role-based groups with proper type
-- Auto-join logic based on user_roles table
```

## Layer 6: Backend Development
- **Missing Endpoint**: `/api/groups/:id` for individual group details
- **Auto-population**: Query user_roles and auto-assign to matching groups
- **Follow System**: Implement group following for non-members

## Layer 7: Frontend Development
- **Groups List**: Show all role-based groups with proper filtering
- **Group Detail**: Create detail page showing members, events, posts
- **State Management**: Track membership and follow status

## Layer 8: API & Integration
- **Endpoints Needed**:
  - GET `/api/groups/:id` - Get single group details
  - POST `/api/groups/:id/follow` - Follow a group
  - DELETE `/api/groups/:id/follow` - Unfollow a group
  - GET `/api/groups/role-based` - Get all role-based groups

## Layer 9: Security & Authentication
- **Authorization**: Check user authentication for all group operations
- **Permissions**: Members have full access, followers get updates only
- **Rate Limiting**: Prevent spam follows/unfollows

## Layer 10: Deployment & Infrastructure
- **Database Migration**: Create role-based groups in production
- **Performance**: Index group_members for fast queries
- **Caching**: Cache group member counts

## Layer 11: Analytics & Monitoring
- **Track**: Group joins, follows, activity levels
- **Monitor**: Auto-join success rates
- **Alert**: Failed group operations

## Layer 12: Continuous Improvement
- **Feedback**: Monitor user engagement with role groups
- **Iterate**: Add new group types based on usage
- **Optimize**: Improve auto-join accuracy

## Implementation Plan

### Phase 1: Fix Immediate Issues (Now)
1. Create `/api/groups/:id` endpoint
2. Fix Buenos Aires group navigation
3. Create GroupDetail component

### Phase 2: Role-Based Groups (Next)
1. Create role-based groups in database
2. Implement auto-join logic
3. Update Groups page UI

### Phase 3: Follow System (Then)
1. Add follow/unfollow endpoints
2. Implement follow UI
3. Add notification system

### Phase 4: RBAC/ABAC (Finally)
1. Define permission levels
2. Implement access controls
3. Add admin features