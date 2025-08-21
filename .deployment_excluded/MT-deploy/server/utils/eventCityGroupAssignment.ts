/**
 * Event-to-City Group Assignment Utility - 11L Framework Implementation
 * Automatically assigns events to appropriate city groups based on location data
 */

import { storage } from '../storage';

interface LocationData {
  city?: string;
  country?: string;
  location?: string;
  coordinates?: { lat: number; lng: number };
}

interface EventGroupAssignment {
  eventId: number;
  groupId: number;
  assignedAt: Date;
  assignmentType: 'automatic' | 'manual';
}

/**
 * Extract city and country from location string using various formats
 */
export function parseLocationString(location: string): { city: string; country: string } | null {
  if (!location || typeof location !== 'string') return null;

  // Clean and normalize location string
  const cleanLocation = location.trim().replace(/\s+/g, ' ');

  // Pattern matching for common location formats
  const patterns = [
    // "City, Country" format
    /^([^,]+),\s*([^,]+)$/,
    // "City - Country" format  
    /^([^-]+)\s*-\s*([^-]+)$/,
    // "City | Country" format
    /^([^|]+)\s*\|\s*([^|]+)$/,
    // "Address, City, Country" format (take last two parts)
    /^.+,\s*([^,]+),\s*([^,]+)$/
  ];

  for (const pattern of patterns) {
    const match = cleanLocation.match(pattern);
    if (match) {
      const city = match[1].trim();
      const country = match[2].trim();
      
      // Validate extracted values
      if (city.length >= 2 && country.length >= 2) {
        return { 
          city: city.charAt(0).toUpperCase() + city.slice(1).toLowerCase(),
          country: country.charAt(0).toUpperCase() + country.slice(1).toLowerCase()
        };
      }
    }
  }

  // If no pattern matches, try to extract just city name
  if (cleanLocation.length >= 2 && cleanLocation.length <= 100) {
    return {
      city: cleanLocation.charAt(0).toUpperCase() + cleanLocation.slice(1).toLowerCase(),
      country: 'Unknown'
    };
  }

  return null;
}

/**
 * Generate consistent city group slug from city and country
 */
export function generateCityGroupSlug(city: string, country: string): string {
  const normalizeString = (str: string): string => {
    return str
      .toLowerCase()
      .replace(/[áàâãäå]/g, 'a')
      .replace(/[éèêë]/g, 'e')
      .replace(/[íìîï]/g, 'i')
      .replace(/[óòôõö]/g, 'o')
      .replace(/[úùûü]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const citySlug = normalizeString(city);
  const countrySlug = normalizeString(country);
  
  return `tango-${citySlug}-${countrySlug}`;
}

/**
 * Find existing city group by location data
 */
export async function findCityGroupByLocation(locationData: LocationData): Promise<any | null> {
  try {
    let city: string | undefined;
    let country: string | undefined;

    // Extract city/country from various sources
    if (locationData.city && locationData.country) {
      city = locationData.city;
      country = locationData.country;
    } else if (locationData.location) {
      const parsed = parseLocationString(locationData.location);
      if (parsed) {
        city = parsed.city;
        country = parsed.country;
      }
    }

    if (!city) return null;

    // Generate expected slug and search for group
    const expectedSlug = generateCityGroupSlug(city, country || 'Unknown');
    const group = await storage.getGroupBySlug(expectedSlug);
    
    return group;
  } catch (error) {
    console.error('Error finding city group by location:', error);
    return null;
  }
}

/**
 * Create new city group if none exists for the location
 */
export async function createCityGroupIfNeeded(locationData: LocationData, createdBy: number): Promise<any | null> {
  try {
    let city: string | undefined;
    let country: string | undefined;

    // Extract city/country from location data
    if (locationData.city && locationData.country) {
      city = locationData.city;
      country = locationData.country;
    } else if (locationData.location) {
      const parsed = parseLocationString(locationData.location);
      if (parsed) {
        city = parsed.city;
        country = parsed.country;
      }
    }

    if (!city) return null;

    // Check if group already exists
    const existingGroup = await findCityGroupByLocation({ city, country });
    if (existingGroup) return existingGroup;

    // Generate group data
    const slug = generateCityGroupSlug(city, country || 'Unknown');
    const groupName = country && country !== 'Unknown' 
      ? `Tango ${city}, ${country}`
      : `Tango ${city}`;

    const groupData = {
      name: groupName,
      slug: slug,
      type: 'city',
      city: city,
      country: country || null,
      emoji: '🏙️',
      description: `Connect with tango dancers and enthusiasts in ${city}${country ? `, ${country}` : ''}. Share local events, find dance partners, and build community connections.`,
      isPrivate: false,
      createdBy: createdBy,
      memberCount: 1
    };

    console.log(`Creating new city group: ${groupName} (${slug})`);
    const newGroup = await storage.createGroup(groupData);

    // Automatically add creator as admin member
    if (newGroup && newGroup.id) {
      try {
        await storage.addUserToGroup(createdBy, newGroup.id, 'admin');
        console.log(`Added user ${createdBy} as admin to group ${newGroup.id}`);
      } catch (memberError) {
        console.error(`Failed to add creator as admin to group ${newGroup.id}:`, memberError);
        // Continue without failing the group creation
      }
    }

    return newGroup;
  } catch (error) {
    console.error('Error creating city group:', error);
    return null;
  }
}

/**
 * Assign event to city group based on location
 */
export async function assignEventToCityGroup(eventId: number, locationData: LocationData, createdBy: number): Promise<EventGroupAssignment | null> {
  try {
    console.log(`Assigning event ${eventId} to city group based on location:`, locationData);

    // Find or create appropriate city group
    let cityGroup = await findCityGroupByLocation(locationData);
    
    if (!cityGroup) {
      console.log('No existing city group found, creating new one...');
      cityGroup = await createCityGroupIfNeeded(locationData, createdBy);
    }

    if (!cityGroup) {
      console.log('Could not find or create city group for location');
      return null;
    }

    // Check if event is already assigned to this group
    const existingAssignment = await storage.getEventGroupAssignment?.(eventId, cityGroup.id);
    if (existingAssignment) {
      console.log(`Event ${eventId} already assigned to group ${cityGroup.id}`);
      return existingAssignment;
    }

    // Create event-group assignment
    const assignment = await storage.createEventGroupAssignment?.({
      eventId: eventId,
      groupId: cityGroup.id,
      assignedAt: new Date(),
      assignmentType: 'automatic'
    });

    console.log(`✅ Event ${eventId} successfully assigned to city group ${cityGroup.id} (${cityGroup.name})`);
    return assignment || null;

  } catch (error) {
    console.error('Error assigning event to city group:', error);
    return null;
  }
}

/**
 * Process event location and perform automatic city group assignment
 */
export async function processEventCityGroupAssignment(
  eventId: number, 
  eventData: { location?: string; city?: string; country?: string }, 
  createdBy: number
): Promise<{ success: boolean; groupAssigned?: any; error?: string }> {
  try {
    // Extract location data from event
    const locationData: LocationData = {
      city: eventData.city,
      country: eventData.country,
      location: eventData.location
    };

    // Validate location data
    if (!locationData.location && !locationData.city) {
      return {
        success: false,
        error: 'No location data provided for city group assignment'
      };
    }

    // Perform assignment
    const assignment = await assignEventToCityGroup(eventId, locationData, createdBy);
    
    if (assignment) {
      const cityGroup = await storage.getGroup(assignment.groupId);
      return {
        success: true,
        groupAssigned: cityGroup
      };
    } else {
      return {
        success: false,
        error: 'Failed to assign event to city group'
      };
    }

  } catch (error) {
    console.error('Error processing event city group assignment:', error);
    return {
      success: false,
      error: `Assignment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Get all events assigned to a city group
 */
export async function getCityGroupEvents(groupId: number): Promise<any[]> {
  try {
    return await storage.getEventsByGroup?.(groupId) || [];
  } catch (error) {
    console.error('Error fetching city group events:', error);
    return [];
  }
}

/**
 * Remove event from city group
 */
export async function removeEventFromCityGroup(eventId: number, groupId: number): Promise<boolean> {
  try {
    await storage.removeEventGroupAssignment?.(eventId, groupId);
    console.log(`Event ${eventId} removed from city group ${groupId}`);
    return true;
  } catch (error) {
    console.error('Error removing event from city group:', error);
    return false;
  }
}