# 23L Framework: Community Map Layers & Housing Implementation

## Executive Summary
Implement comprehensive community features including layered map view with events/housing/recommendations, friend relationship filtering, host onboarding visibility, and Google Maps integration for directions.

## Requirements Analysis

### 1. City Groups Photo Consistency
- City groups list photo should match detail page header photo
- Use CityPhotoService for consistent Pexels photos

### 2. Enhanced Toolbar Features
- Add Housing tab
- Add Recommendations tab
- Add comprehensive Map view with all layers

### 3. Layered Map Implementation
- Base: Open source map (Leaflet)
- Layers: Events, Housing, Recommendations
- Filters:
  - Date range filter
  - Toggle layers on/off
  - Per-layer specific filters

### 4. Events Layer Filters
- Existing metadata (type, price, space)
- Date/time filtering
- Location radius

### 5. Housing Layer Filters
- Friend relationship degrees (1st, 2nd, 3rd degree connections)
- Friendship strength (based on interactions)
- Property type (room, shared, entire place)
- Amenities and features

### 6. Recommendations Layer Filters
- Friend relationship degrees
- Local vs visitor recommendations
- Category (restaurant, bar, tourist attraction, etc)
- Rating/popularity

### 7. Google Maps Integration
- Business data from Google Places API
- "Get Directions" functionality
- Address autocomplete

### 8. Super Admin Features
- Surface host onboarding flow
- View all host homes
- Guest view for regular users

## 23L Framework Analysis

### Layer 1: Expertise & Technical Proficiency
- Leaflet map with multiple data layers
- Google Maps API integration
- Friend relationship graph algorithms
- React state management for complex filters

### Layer 2: Research & Discovery
- Analyze existing host onboarding implementation
- Review friendship calculation methods
- Study Google Maps API requirements
- Research map layer optimization

### Layer 3: Legal & Compliance
- Google Maps API terms compliance
- User privacy for location data
- Friend relationship visibility rules
- Property listing regulations

### Layer 4: UX/UI Design
- Intuitive layer toggles
- Clear filter interfaces
- Mobile-responsive map controls
- MT theme consistency

### Layer 5: Data Architecture
- Friend relationship calculations
- Recommendation storage structure
- Housing availability queries
- Efficient spatial queries

### Layer 6: Backend Development
- Friend degree calculation algorithms
- Recommendation API endpoints
- Housing filter queries
- Google Places proxy endpoints

### Layer 7: Frontend Development
- React components for map layers
- Filter state management
- Toggle controls UI
- Responsive design

### Layer 8: API & Integration
- Google Maps/Places API
- Geocoding services
- Direction services
- Rate limiting

### Layer 9: Security & Authentication
- API key protection
- User permission checks
- Location privacy
- Super admin verification

### Layer 10: Deployment & Infrastructure
- Environment variables for API keys
- Caching strategy
- Performance optimization
- CDN for map tiles

### Layer 11: Analytics & Monitoring
- Map usage tracking
- Filter usage patterns
- API quota monitoring
- Error tracking

### Layer 12: Continuous Improvement
- User feedback loops
- Performance metrics
- Feature adoption rates
- Iterative enhancements

## Implementation Plan

### Phase 1: Fix City Group Photos
1. Update group list to use same photo as detail page
2. Ensure CityPhotoService consistency

### Phase 2: Create Housing & Recommendations Pages
1. Add routes for /housing and /recommendations
2. Create basic page components
3. Add to sidebar navigation

### Phase 3: Implement Friend Relationship System
1. Create friend degree calculation
2. Add interaction strength metrics
3. Build API endpoints

### Phase 4: Build Layered Map Component
1. Create CommunityMapWithLayers component
2. Add layer toggle controls
3. Implement date filter
4. Add per-layer filters

### Phase 5: Housing Features
1. Surface host onboarding for super admin
2. Create guest view for regular users
3. Implement housing filters
4. Add to map layer

### Phase 6: Recommendations System
1. Create recommendation model
2. Build submission interface
3. Add filtering logic
4. Integrate with map

### Phase 7: Google Maps Integration
1. Add Google Maps API key
2. Create Places API proxy
3. Implement "Get Directions"
4. Add business data overlay

## Technical Architecture

### Database Schema Additions
```sql
-- Friend relationships with strength
CREATE TABLE friend_relationships (
  user_id INT,
  friend_id INT,
  degree INT DEFAULT 1,
  interaction_score INT DEFAULT 0,
  posts_together INT DEFAULT 0,
  events_together INT DEFAULT 0,
  messages_count INT DEFAULT 0
);

-- Recommendations
CREATE TABLE recommendations (
  id SERIAL PRIMARY KEY,
  user_id INT,
  title VARCHAR(255),
  description TEXT,
  category VARCHAR(50),
  is_local_recommendation BOOLEAN,
  location POINT,
  address TEXT,
  google_place_id VARCHAR(255),
  rating INT,
  price_level INT
);
```

### Component Structure
```
CommunityMapWithLayers/
  ├── MapContainer.tsx
  ├── LayerControls.tsx
  ├── FilterPanel.tsx
  ├── EventsLayer.tsx
  ├── HousingLayer.tsx
  ├── RecommendationsLayer.tsx
  └── DirectionsModal.tsx
```

### API Endpoints
```
GET /api/friends/degrees/:userId
GET /api/recommendations
POST /api/recommendations
GET /api/housing/search
GET /api/google/places/search
GET /api/google/directions
```

## Success Metrics
- City photo consistency: 100%
- Map layer performance: <2s load time
- Filter responsiveness: <200ms
- Friend calculation accuracy: 95%+
- User adoption: 60% use map features

## Risk Mitigation
- Google API quota limits: Implement caching
- Map performance: Use clustering for markers
- Complex filters: Add loading states
- Mobile experience: Progressive enhancement

## Timeline
- Phase 1-2: 2 hours
- Phase 3-4: 4 hours  
- Phase 5-6: 4 hours
- Phase 7: 2 hours
- Testing: 2 hours
Total: ~14 hours