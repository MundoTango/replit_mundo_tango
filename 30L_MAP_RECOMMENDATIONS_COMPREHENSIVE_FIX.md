# 30L Framework Analysis: Map & Recommendations Comprehensive Fix

## Issue Summary
1. Buenos Aires appearing in Africa on world map (longitude sign issue)
2. Kolašin recommendations not displaying (NULL post_id handling)  
3. Kolašin map not zoomed in properly (center coordinates not being used)

## Layer 1: Foundation - Expertise & Technical Proficiency
- **Leaflet.js Map Rendering**: Understanding coordinate systems and marker positioning
- **Drizzle ORM Query Construction**: LEFT JOIN behavior with NULL values
- **React Props Propagation**: Ensuring props are passed correctly through component hierarchy

## Layer 2: Research & Discovery
- **Database Investigation**: Confirmed Kolašin has 2 active recommendations without associated posts
- **API Response Verification**: Buenos Aires coordinates are correct in API (-34.6037, -58.3816)
- **Component Analysis**: CommunityMapWithLayers accepts centerLat/centerLng props correctly

## Layer 5: Database Architecture
- **Schema Issue**: Recommendations can exist without posts (post_id can be NULL)
- **Query Fix**: Ensure LEFT JOIN doesn't filter out NULL post_id records
- **Data Integrity**: 2 Kolašin recommendations exist with proper lat/lng values

## Layer 7: Frontend Development
- **Coordinate Transformation**: Check if coordinates are being transformed incorrectly
- **Map Centering**: Ensure centerLat/centerLng props are used for initial map view
- **Debug Logging**: Add console logs to trace coordinate values

## Layer 8: API & Integration
- **Query Construction**: Fix recommendations API to handle NULL post_id gracefully
- **Response Format**: Ensure all required fields are returned even for postless recommendations

## Implementation Steps

### 1. Fix Recommendations API Query
The current query structure is causing issues with NULL post_id values.

### 2. Debug Buenos Aires Coordinates
Add logging to trace coordinate transformation in LeafletMap component.

### 3. Fix Kolašin Map Centering
Ensure city-specific coordinates are properly passed to map components.

## Next Actions
1. Simplify recommendations query to ensure NULL post_id records are included
2. Add coordinate transformation debugging to LeafletMap
3. Verify map centering logic in CommunityMapWithLayers