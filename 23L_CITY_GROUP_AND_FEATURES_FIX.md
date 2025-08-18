# 23L Framework Analysis: City Group Names and Community Features Fix

## Layer 1: Expertise & Technical Proficiency
- **Issue 1**: City group names contain "Tango" prefix - need standardization
- **Issue 2**: Members clicking error in group detail page
- **Issue 3**: RecommendationsList profileImage undefined error
- **Issue 4**: Host onboarding needs Google Maps integration
- **Issue 5**: Submit listing error in host onboarding
- **Technologies**: React, TypeScript, Express, PostgreSQL, Leaflet Maps, Google Maps API

## Layer 2: Research & Discovery
### Issue 1: City Group Names
- Groups table has names like "Tango Buenos Aires, Argentina"
- Need to update database and frontend display logic
- Affects: groups list, group detail pages, navigation

### Issue 2: Members Clicking Error
- Need to investigate click handler in members tab
- Likely missing navigation or modal logic

### Issue 3: ProfileImage Error
```
TypeError: Cannot read properties of undefined (reading 'profileImage')
```
- Recommender object structure mismatch
- Missing null checks in RecommendationsList component

### Issue 4: Google Maps Integration
- Currently using basic text input for location
- Need interactive map picker with autocomplete
- Requires Google Places API integration

### Issue 5: Submit Listing Error
- Error shows "fetch on 'Window' ... to use with HTTP(S)"
- Indicates relative URL issue or CORS problem

## Layer 3: Legal & Compliance
- Google Maps API requires API key and billing
- Must handle user location data securely
- Ensure proper error messages for privacy

## Layer 4: UX/UI Design
- City names should be clean and readable
- Map picker should show visual location selection
- Error handling should be user-friendly

## Layer 5: Data Architecture
### Database Changes Needed:
1. Update groups table names to remove "Tango" prefix
2. Ensure recommendations have proper user relationships
3. Verify host_homes location data structure

## Layer 6: Backend Development
### API Fixes:
1. Update group name generation logic
2. Fix recommendations user data inclusion
3. Add Google Maps proxy endpoint if needed

## Layer 7: Frontend Development
### Component Fixes:
1. RecommendationsList - add null checks
2. GroupDetailPageMT - fix member click handlers
3. HostOnboarding - integrate Google Maps
4. Fix API URLs in host onboarding

## Layer 8: API & Integration
- Integrate Google Maps JavaScript API
- Add Places Autocomplete
- Handle geocoding for addresses

## Layer 9: Security & Authentication
- Protect Google Maps API key
- Validate location data
- Ensure proper CORS headers

## Layer 10: Deployment & Infrastructure
- Environment variable for Google Maps API key
- Ensure production URLs work correctly

## Implementation Plan:
1. Fix city group names in database
2. Fix RecommendationsList profileImage error
3. Fix members clicking functionality
4. Add Google Maps to host onboarding
5. Fix submit listing API call

## Testing Strategy:
1. Test group name updates across all pages
2. Verify recommendations display correctly
3. Test member clicks and navigation
4. Test Google Maps integration
5. Test host onboarding submission