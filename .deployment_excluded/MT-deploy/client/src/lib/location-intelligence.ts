import { apiRequest } from '@/lib/queryClient';

interface LocationContext {
  userCurrentLocation?: { lat: number; lng: number };
  userRegistrationCity?: string;
  upcomingEvents?: Array<{
    id: string;
    title: string;
    location: { lat: number; lng: number; name: string };
    startDate: Date;
  }>;
  contextualHints?: string[];
}

interface LocationHint {
  text: string;
  confidence: number;
  type: 'business' | 'address' | 'event' | 'landmark';
  possibleLocation?: {
    name: string;
    lat?: number;
    lng?: number;
  };
}

interface EventCorrelation {
  eventId: string;
  eventTitle: string;
  location: string;
  confidence: number;
  reason: string;
}

// Detect location context based on user activity
export async function detectLocationContext(userId?: number): Promise<LocationContext> {
  if (!userId) return {};

  try {
    const response = await fetch(`/api/users/${userId}/location-context`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch location context');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching location context:', error);
    return {};
  }
}

// Extract location hints from text content
export function detectLocationFromContent(content: string): LocationHint[] {
  const hints: LocationHint[] = [];
  
  // Common location patterns
  const patterns = [
    // Business names with "at" or "@"
    {
      regex: /(?:at|@)\s+([A-Z][A-Za-z\s&'.-]+?)(?:\s*[,.]|\s+in\s+|\s*$)/g,
      type: 'business' as const,
      confidence: 0.8
    },
    // Addresses with numbers
    {
      regex: /\b(\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Place|Pl|Way))\b/gi,
      type: 'address' as const,
      confidence: 0.9
    },
    // City, State/Country patterns
    {
      regex: /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g,
      type: 'address' as const,
      confidence: 0.7
    },
    // Event venue patterns
    {
      regex: /(?:venue:|location:|happening at|taking place at)\s*([A-Za-z\s&'.-]+?)(?:\s*[,.]|\s*$)/gi,
      type: 'event' as const,
      confidence: 0.85
    },
    // Landmark patterns
    {
      regex: /(?:near|by|close to|around)\s+(?:the\s+)?([A-Z][A-Za-z\s]+?)(?:\s*[,.]|\s*$)/g,
      type: 'landmark' as const,
      confidence: 0.6
    }
  ];
  
  patterns.forEach(({ regex, type, confidence }) => {
    let match;
    while ((match = regex.exec(content)) !== null) {
      const locationText = match[1].trim();
      
      // Filter out common false positives
      if (locationText.length > 3 && !isCommonPhrase(locationText)) {
        hints.push({
          text: locationText,
          confidence,
          type,
          possibleLocation: {
            name: locationText
          }
        });
      }
    }
  });
  
  // Deduplicate and sort by confidence
  const uniqueHints = hints.reduce((acc, hint) => {
    const existing = acc.find(h => h.text.toLowerCase() === hint.text.toLowerCase());
    if (!existing || existing.confidence < hint.confidence) {
      return [...acc.filter(h => h.text.toLowerCase() !== hint.text.toLowerCase()), hint];
    }
    return acc;
  }, [] as LocationHint[]);
  
  return uniqueHints.sort((a, b) => b.confidence - a.confidence);
}

// Correlate post timing with user's events
export async function correlateWithUserEvents(
  userId: number,
  timestamp: Date
): Promise<EventCorrelation[]> {
  try {
    const response = await fetch(
      `/api/users/${userId}/events?date=${timestamp.toISOString()}`,
      { credentials: 'include' }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch user events');
    }
    
    const events = await response.json();
    const correlations: EventCorrelation[] = [];
    
    events.forEach((event: any) => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate || eventStart);
      eventEnd.setHours(eventEnd.getHours() + 4); // Assume 4-hour event if no end time
      
      const timeDiff = Math.abs(timestamp.getTime() - eventStart.getTime());
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      let confidence = 0;
      let reason = '';
      
      // During event
      if (timestamp >= eventStart && timestamp <= eventEnd) {
        confidence = 0.95;
        reason = 'Posted during event';
      }
      // Within 1 hour before event
      else if (timestamp < eventStart && hoursDiff <= 1) {
        confidence = 0.8;
        reason = 'Posted shortly before event';
      }
      // Within 2 hours after event
      else if (timestamp > eventEnd && hoursDiff <= 2) {
        confidence = 0.85;
        reason = 'Posted shortly after event';
      }
      // Same day
      else if (timestamp.toDateString() === eventStart.toDateString()) {
        confidence = 0.5;
        reason = 'Posted on same day as event';
      }
      
      if (confidence > 0) {
        correlations.push({
          eventId: event.id,
          eventTitle: event.title,
          location: event.location,
          confidence,
          reason
        });
      }
    });
    
    return correlations.sort((a, b) => b.confidence - a.confidence);
  } catch (error) {
    console.error('Error correlating with events:', error);
    return [];
  }
}

// Extract business mentions from content
export function extractBusinessMentions(content: string): string[] {
  const businesses: string[] = [];
  
  // Common business indicators
  const indicators = [
    'restaurant', 'cafe', 'café', 'bar', 'club', 'milonga',
    'studio', 'school', 'shop', 'store', 'hotel', 'hostel',
    'theater', 'theatre', 'venue', 'gallery', 'museum'
  ];
  
  // Look for capitalized words near indicators
  indicators.forEach(indicator => {
    const regex = new RegExp(
      `([A-Z][A-Za-z'&\\s-]+)\\s+${indicator}|${indicator}\\s+([A-Z][A-Za-z'&\\s-]+)`,
      'gi'
    );
    
    let match;
    while ((match = regex.exec(content)) !== null) {
      const business = (match[1] || match[2]).trim();
      if (business && !businesses.includes(business)) {
        businesses.push(business);
      }
    }
  });
  
  // Look for quoted business names
  const quotedRegex = /["']([A-Z][^"']+)["']/g;
  let quotedMatch;
  while ((quotedMatch = quotedRegex.exec(content)) !== null) {
    const business = quotedMatch[1].trim();
    if (business.length > 2 && !businesses.includes(business)) {
      businesses.push(business);
    }
  }
  
  return businesses;
}

// Suggest recommendation type based on content
export function suggestRecommendationType(
  content: string,
  location?: { name?: string; type?: string }
): string {
  const contentLower = content.toLowerCase();
  
  // Check location type first
  if (location?.type) {
    const typeMap: Record<string, string> = {
      restaurant: 'restaurant',
      cafe: 'restaurant',
      bar: 'restaurant',
      lodging: 'accommodation',
      hotel: 'accommodation',
      school: 'school',
      store: 'shop',
      shopping_mall: 'shop',
      night_club: 'venue',
      establishment: 'other'
    };
    
    const mappedType = typeMap[location.type];
    if (mappedType) return mappedType;
  }
  
  // Content-based detection
  const typeKeywords: Record<string, string[]> = {
    restaurant: ['eat', 'food', 'meal', 'dinner', 'lunch', 'breakfast', 'cuisine', 'dish', 'menu', 'chef', 'taste', 'delicious'],
    venue: ['dance', 'milonga', 'practica', 'class', 'lesson', 'floor', 'music', 'dj', 'tanda'],
    school: ['learn', 'teacher', 'instructor', 'lesson', 'class', 'workshop', 'technique', 'beginner', 'advanced'],
    shop: ['buy', 'shop', 'purchase', 'shoes', 'clothes', 'dress', 'outfit', 'accessories'],
    accommodation: ['stay', 'sleep', 'room', 'bed', 'host', 'guest', 'apartment', 'house'],
    service: ['massage', 'therapy', 'physiotherapy', 'repair', 'tailor', 'photography'],
    event: ['festival', 'marathon', 'championship', 'encuentro', 'weekend']
  };
  
  for (const [type, keywords] of Object.entries(typeKeywords)) {
    if (keywords.some(keyword => contentLower.includes(keyword))) {
      return type;
    }
  }
  
  return 'other';
}

// Determine if user is local or visitor
export async function determineUserLocality(
  userId: number,
  cityName: string
): Promise<{ isLocal: boolean; confidence: number; reason: string }> {
  try {
    const response = await fetch(
      `/api/users/${userId}/locality?city=${encodeURIComponent(cityName)}`,
      { credentials: 'include' }
    );
    
    if (!response.ok) {
      throw new Error('Failed to determine user locality');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error determining locality:', error);
    return {
      isLocal: false,
      confidence: 0,
      reason: 'Unable to determine'
    };
  }
}

// Helper function to filter out common phrases
function isCommonPhrase(text: string): boolean {
  const commonPhrases = [
    'the', 'this', 'that', 'here', 'there', 'today', 'tonight',
    'yesterday', 'tomorrow', 'last night', 'this morning'
  ];
  
  return commonPhrases.includes(text.toLowerCase());
}