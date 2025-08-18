# 23L Framework Analysis: Buenos Aires Group Navigation Issue

## Issue Description
User clicked on Buenos Aires group and encountered an issue (likely blank page or error)

## Layer-by-Layer Analysis

### Layer 1: Expertise & Technical Proficiency
- Frontend: React, TypeScript, React Query
- Backend: Express.js with flexible authentication
- Issue: Route navigation and API data fetching

### Layer 2: Research & Discovery
- Group slug: "tango-buenos-aires-argentina" 
- Route: `/groups/:slug` → GroupDetailPage
- API endpoint: `/api/groups/:slug`
- Navigation: `setLocation(/groups/${group.slug})`

### Layer 3: Legal & Compliance
- Group access permissions checked
- Authentication middleware in place

### Layer 4: UX/UI Design
- GroupDetailPage has proper loading states
- Error handling displays "Group not found"
- Back button to return to groups list

### Layer 5: Data Architecture
**ISSUE IDENTIFIED**: API response format mismatch
- GroupDetailPage expects: Direct group object
- API returns: `{ success: true, message: '...', data: group }`
- Query is accessing response directly, not response.data

### Layer 6: Backend Development
- `/api/groups/:slug` endpoint exists and works
- Uses flexible authentication pattern
- Returns proper response structure

### Layer 7: Frontend Development
**ROOT CAUSE FOUND**: React Query expecting wrong data structure
- Query key: `/api/groups/${slug}`
- Component expects: `group` directly
- API returns: `{ data: group }`

### Layer 8: API & Integration
- Endpoint returns standard API response format
- Frontend not handling nested data structure

## Solution Implementation

### Fix 1: Update GroupDetailPage to handle API response format
```typescript
// Extract group data from API response
const { data: response, isLoading } = useQuery({
  queryKey: [`/api/groups/${slug}`],
  enabled: !!slug,
});

const group = response?.data;
```

### Fix 2: Update mutations to use correct endpoints
- Join: `/api/user/join-group/${slug}` (not `/api/groups/${slug}/join`)
- Leave: `/api/user/leave-group/${slug}` (not `/api/groups/${slug}/leave`)

## Impact Assessment
- **Severity**: High - Prevents group detail viewing
- **Users Affected**: All users trying to view group details
- **Fix Complexity**: Low - Simple data access pattern fix

## Testing Strategy
1. Navigate to groups page
2. Click on Buenos Aires group
3. Verify group details load correctly
4. Test join/leave functionality

## Prevention Measures
- Standardize API response handling across all components
- Create type definitions for API responses
- Add integration tests for navigation flows