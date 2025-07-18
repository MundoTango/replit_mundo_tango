# 30L Framework Analysis: Map Centering and Recommendations Display Issues

## Executive Summary
Three critical issues identified:
1. Buenos Aires showing in Africa on world map (wrong coordinates)
2. Kolašin hub not showing zoomed map view
3. Recommendations not displaying in Kolašin hub

## Issue #1: Buenos Aires in Africa

### Layer 2: Research & Discovery
- Buenos Aires appears near Africa coast on world map
- Suggests longitude sign error (-58.3816 interpreted as +58.3816)

### Layer 5: Data Architecture
- Need to verify coordinates in `/api/community/city-groups` endpoint
- Buenos Aires should be: lat: -34.6037, lng: -58.3816

## Issue #2: Kolašin Map Not Zoomed

### Layer 7: Frontend Development
- GroupDetailPageMT should pass centerLat/centerLng to CommunityMapWithLayers
- Map should zoom to level 13 for city views

### Layer 8: API & Integration
- Verify props are being passed correctly from parent to child component

## Issue #3: Recommendations Not Showing

### Layer 6: Backend Development
- API shows 2 recommendations exist for Kolašin
- Frontend shows "No recommendations yet"

### Layer 8: API & Integration
- Check `/api/recommendations` endpoint with city filter
- Verify query parameters are correct

## Action Plan
1. Fix Buenos Aires coordinates in city-groups endpoint
2. Debug map centering props in GroupDetailPageMT
3. Fix recommendations API query parameters