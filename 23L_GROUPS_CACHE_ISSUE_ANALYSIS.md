# 23L Framework Analysis: Groups Page Cache Issue

## Issue Description
Groups page showing outdated membership data despite database updates. User is member of 4 groups but UI shows old state.

## Layer 1-4: Foundation Analysis
### Layer 1: Expertise Assessment
- Service Worker caching patterns
- React Query cache management
- API response caching
- Browser cache behavior

### Layer 2: Research & Discovery
- Similar cache issues resolved in past 24 hours
- Service worker version: life-ceo-v5
- Cache version mismatch detected in logs
- Groups API endpoint updated but UI not reflecting changes

### Layer 3: Legal & Compliance
- User data accuracy requirements
- Real-time membership status critical for platform trust

### Layer 4: UX/UI Impact
- User sees incorrect membership status
- "Join" buttons showing when should show "Joined"
- Confusion about actual group memberships

## Layer 5-8: Architecture Analysis
### Layer 5: Data Architecture
```javascript
// Current cache points:
1. Service Worker: Caching API responses
2. React Query: useQuery cache with queryKey: ['/api/groups']
3. Browser Cache: JavaScript bundles
4. CDN Cache: Static assets
```

### Layer 6: Backend Development
- API endpoint correctly returns user's 4 group memberships
- Database queries working properly
- Authentication fixed to detect user ID 7

### Layer 7: Frontend Development
- React Query not invalidating cache after membership changes
- Service Worker serving stale API responses
- Component not re-fetching on navigation

### Layer 8: API & Integration
- API responses include proper cache headers
- Need cache-busting mechanism

## Layer 9-12: Operational Analysis
### Layer 9: Security
- Stale data could show private group information incorrectly

### Layer 10: Deployment
- Service worker update strategy not forcing new data

### Layer 11: Monitoring
- Cache monitoring shows version mismatch
- Need better cache invalidation logging

### Layer 12: Continuous Improvement
- Implement aggressive cache invalidation for critical data

## Layer 13-16: AI & Intelligence
### Layer 13: Pattern Recognition
- Similar to yesterday's enhanced timeline cache issue
- Pattern: Service worker caching API responses too aggressively

## Layer 17-20: Human-Centric
### Layer 17: User Trust
- Incorrect membership data erodes platform trust
- Users expect real-time accuracy

## Layer 21-23: Production Engineering
### Layer 21: Resilience
- Need cache bypass mechanism for critical data
- Implement cache versioning for API responses

### Layer 22: User Safety
- Ensure users see accurate group memberships
- Prevent unauthorized access due to stale cache

### Layer 23: Business Continuity
- Cache issues preventing core functionality
- Need immediate resolution

## Root Cause Analysis
1. **Service Worker**: Caching /api/groups responses with no invalidation
2. **React Query**: Not configured to refetch on window focus or mount
3. **Cache Headers**: API not sending no-cache headers for dynamic data
4. **Version Mismatch**: Service worker version not forcing data refresh

## Immediate Actions Required
1. Force service worker update and cache clear
2. Add cache-control headers to groups API
3. Configure React Query to always refetch groups data
4. Implement cache busting for API calls
5. Add timestamp to API responses for freshness check