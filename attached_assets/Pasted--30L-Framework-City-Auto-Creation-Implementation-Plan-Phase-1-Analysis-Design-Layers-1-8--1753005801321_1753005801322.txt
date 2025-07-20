# 30L Framework: City Auto-Creation Implementation Plan

## Phase 1: Analysis & Design (Layers 1-8)

### Layer 1: Expertise Assessment
- **Current State**: Manual city group creation only
- **Target State**: Automatic city group creation from 3 triggers
- **Technical Expertise Required**: PostgreSQL triggers, geocoding, async processing

### Layer 2: Research & Discovery
- **Trigger Points Identified**:
  1. User Registration (when city field filled)
  2. Recommendation Creation (when new city mentioned)
  3. Event Creation (when event location is new city)
- **Edge Cases**: 
  - City name variations (NYC vs New York City)
  - International city names (München vs Munich)
  - City disambiguation (Portland, ME vs Portland, OR)

### Layer 3: Legal & Compliance
- **Data Privacy**: City creation must respect user location privacy
- **GDPR**: Auto-created groups must have clear data controllers
- **Terms Update**: Need to inform users about automatic group creation

### Layer 4: UX/UI Design
- **User Notification**: Toast when city group auto-created
- **Admin Assignment**: First 5 users become city admins
- **Welcome Flow**: Auto-send city guide to new members

### Layer 5-8: Architecture Design

```typescript
// Core Service Architecture
interface CityAutoCreationService {
  // Main trigger handlers
  handleUserRegistration(userId: number, city: string): Promise<Group>;
  handleRecommendation(recommendationId: number, city: string): Promise<Group>;
  handleEvent(eventId: number, city: string): Promise<Group>;
  
  // Core logic
  findOrCreateCityGroup(cityInfo: CityInfo): Promise<Group>;
  assignCityAdmins(groupId: number, cityName: string): Promise<void>;
  sendWelcomeGuide(userId: number, groupId: number): Promise<void>;
}

interface CityInfo {
  name: string;
  state?: string;
  country: string;
  coordinates?: { lat: number; lng: number };
  normalized: string; // NYC -> New York City
}
```

## Implementation Steps

### Step 1: Database Schema Updates
```sql
-- Add city normalization table
CREATE TABLE city_normalizations (
  id SERIAL PRIMARY KEY,
  original_name VARCHAR(255) NOT NULL,
  normalized_name VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  state VARCHAR(255),
  country VARCHAR(255) NOT NULL,
  coordinates POINT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(original_name, country)
);

-- Add trigger tracking table
CREATE TABLE city_group_creation_log (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES groups(id),
  trigger_type VARCHAR(50) NOT NULL, -- 'registration', 'recommendation', 'event'
  trigger_id INTEGER NOT NULL,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_city_normalizations_lookup ON city_normalizations(original_name, country);
CREATE INDEX idx_groups_city_type ON groups(city, type) WHERE type = 'city';
```

### Step 2: City Normalization Service
```typescript
// services/cityNormalizationService.ts
class CityNormalizationService {
  private static commonAbbreviations = {
    'NYC': 'New York City',
    'LA': 'Los Angeles',
    'SF': 'San Francisco',
    'BsAs': 'Buenos Aires',
    // ... more
  };
  
  async normalizeCity(input: string, country?: string): Promise<CityInfo> {
    // Check abbreviations
    // Check existing normalizations
    // Call geocoding service if new
    // Store normalization for future use
  }
  
  async geocodeCity(city: string, country?: string): Promise<Coordinates> {
    // Use OpenStreetMap Nominatim API
    // Fall back to rough coordinates by country
  }
}
```

### Step 3: Auto-Creation Service Implementation
```typescript
// services/cityAutoCreationService.ts
export class CityAutoCreationService {
  async handleUserRegistration(userId: number, cityInput: string, country: string) {
    const cityInfo = await this.normalizeCity(cityInput, country);
    const group = await this.findOrCreateCityGroup(cityInfo);
    
    // Auto-join user to their city group
    await this.joinUserToGroup(userId, group.id);
    
    // Check if should be admin (first 5 users)
    await this.checkAndAssignAdmin(userId, group.id);
    
    // Log the creation
    await this.logCreation(group.id, 'registration', userId);
    
    return group;
  }
  
  async findOrCreateCityGroup(cityInfo: CityInfo): Promise<Group> {
    // Check if group exists
    const existing = await db.query(`
      SELECT * FROM groups 
      WHERE type = 'city' 
      AND city = $1 
      AND country = $2
    `, [cityInfo.city, cityInfo.country]);
    
    if (existing.rows.length > 0) {
      return existing.rows[0];
    }
    
    // Create new group
    return await this.createCityGroup(cityInfo);
  }
  
  private async createCityGroup(cityInfo: CityInfo): Promise<Group> {
    const slug = this.generateSlug(cityInfo);
    
    const group = await db.query(`
      INSERT INTO groups (
        name, slug, type, city, country, 
        description, emoji, is_private, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING *
    `, [
      `${cityInfo.city}, ${cityInfo.country}`,
      slug,
      'city',
      cityInfo.city,
      cityInfo.country,
      `Welcome to the ${cityInfo.city} tango community! Share events, find dance partners, and discover the best milongas in town.`,
      '🏙️',
      false
    ]);
    
    // Fetch city photo from Pexels
    await this.updateCityPhoto(group.rows[0].id, cityInfo);
    
    return group.rows[0];
  }
}
```

## Testing Strategy

### Unit Tests
1. City normalization accuracy
2. Duplicate prevention
3. Admin assignment logic
4. Geocoding fallbacks

### Integration Tests
1. Registration trigger flow
2. Recommendation trigger flow
3. Event trigger flow
4. Concurrent creation handling

### E2E Tests
1. User registers → City group created → User auto-joined
2. User creates recommendation → New city detected → Group created
3. Multiple users same city → Admin assignment correct

## Rollout Plan

### Phase 1: Shadow Mode (Week 1)
- Log what would be created
- Monitor for issues
- Build normalization database

### Phase 2: Limited Rollout (Week 2)
- Enable for new registrations only
- Monitor creation rate
- Gather user feedback

### Phase 3: Full Rollout (Week 3)
- Enable all triggers
- Backfill existing cities
- Launch admin features

## Success Metrics
- City coverage: 95% of active users have city group
- Creation accuracy: <1% incorrect city groups
- User satisfaction: >80% find auto-creation helpful
- Admin engagement: >50% of auto-assigned admins active

## Risk Mitigation
1. **Spam Prevention**: Rate limit city creation per user
2. **Quality Control**: Admin review queue for new cities
3. **Merger Tool**: UI to merge duplicate city groups
4. **Rollback Plan**: Feature flag for quick disable