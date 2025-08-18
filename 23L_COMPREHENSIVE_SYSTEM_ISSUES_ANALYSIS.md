# 23L Comprehensive System Issues Analysis
## Date: January 9, 2025

### Executive Summary
Multiple critical features are failing due to cascading authentication issues. API endpoints are returning 401 Unauthorized errors, preventing data from loading across the platform.

## Layer-by-Layer Analysis

### Layer 1: Expertise & Technical Proficiency
**Current State**: Authentication expertise gap
- Replit OAuth authentication not properly propagating to API calls
- Mismatch between frontend expectations and backend auth structure
- Inconsistent user authentication patterns across endpoints

### Layer 2: Research & Discovery
**Findings from last 24 hours**:
- Enhanced Events authentication fixed in backend but frontend still failing
- City groups auto-join failing with 401
- Test data exists but not accessible due to auth failures
- Multiple endpoints using different auth patterns

### Layer 5: Data Architecture
**Database Issues**:
1. City groups data exists but API can't access it
2. Global statistics showing mock data instead of live counts
3. Test events data inaccessible
4. User-city relationships not loading

### Layer 7: Frontend Development
**UI Loading Issues**:
1. Tango World Map - No city groups markers
2. Global Statistics - Hardcoded mock data
3. Events - Empty state despite data existing
4. Groups - Outdated implementation

### Layer 9: Security & Authentication
**Critical Authentication Failures**:
```
10:27:05 AM [express] POST /api/user/auto-join-city-groups 401
10:26:28 AM [express] GET /api/events/enhanced 401
```

**Root Cause**: Frontend not sending proper authentication headers

### Layer 21: Production Resilience
**Missing Error Handling**:
- No fallback for auth failures
- Silent failures in data loading
- No user feedback on errors

## Critical Issues Breakdown

### 1. Tango World Map Issues
**Problem**: No city groups data on map
**Root Cause**: `/api/groups` endpoint not returning city-specific groups
**Solution**: Update groups API to include city coordinates and member counts

### 2. Global Statistics Issues
**Problem**: Showing hardcoded data (42,837 dancers, 286 cities)
**Root Cause**: Not querying live database counts
**Solution**: Create live statistics API endpoint

### 3. Enhanced Events Issues
**Problem**: No events showing despite test data existing
**Root Cause**: Authentication failing on frontend API calls
**Solution**: Fix credential inclusion in fetch requests

### 4. Groups Feature
**Problem**: Completely outdated implementation
**Root Cause**: Never updated from legacy code
**Solution**: Rebuild with city-based groups system

## Immediate Action Plan

### Phase 1: Fix Authentication (Priority 1)
1. Update all API calls to include credentials
2. Ensure consistent auth headers across platform
3. Fix auto-join city groups endpoint

### Phase 2: Restore Data Access (Priority 2)
1. Fix events API to return test data
2. Update groups API for city groups
3. Create live statistics endpoint

### Phase 3: Update UI Components (Priority 3)
1. Modernize create event form
2. Fix map view in events
3. Update groups page design

## Code Fixes Required

### 1. Frontend API Calls
All fetch requests need:
```javascript
credentials: 'include',
headers: {
  'Content-Type': 'application/json',
}
```

### 2. Backend Auth Middleware
Ensure consistent pattern:
```javascript
const userClaims = (req as any).user.claims;
const user = await storage.getUserByReplitId(userClaims.sub);
```

### 3. Database Queries
Add proper joins and counts for live data

## Timeline
- Hour 1: Fix authentication across all endpoints
- Hour 2: Restore data access and test data visibility
- Hour 3: Update UI components and styling

## Success Metrics
1. All API calls return 200 status
2. Test data visible in UI
3. Live statistics showing real counts
4. City groups appearing on map
5. Events map view functional