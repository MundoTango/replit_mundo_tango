/**
 * City Group Automation Utilities
 * Handles automatic city group creation and user assignment
 */

// Slugify function to convert city names to URL-friendly slugs
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

// Generate group description based on city
export function generateCityGroupDescription(city: string, country?: string): string {
  const location = country ? `${city}, ${country}` : city;
  return `Connect with tango dancers and enthusiasts in ${location}. Share local events, find dance partners, and build community connections.`;
}

// Generate group name from city (without "Tango" prefix per user preference)
export function generateCityGroupName(city: string, country?: string): string {
  const location = country ? `${city}, ${country}` : city;
  return location;
}

// Validate city name for group creation
export function isValidCityName(city: string): boolean {
  return city && city.trim().length >= 2 && city.trim().length <= 100;
}

// Log group automation events
export function logGroupAutomation(action: string, details: any): void {
  console.log(`🏙️ City Group Automation - ${action}:`, details);
}