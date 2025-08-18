/**
 * Test script for City Group Automation functionality
 * Run with: node scripts/test-city-groups.js
 */

import { slugify, generateCityGroupName, generateCityGroupDescription, isValidCityName, logGroupAutomation } from '../utils/cityGroupAutomation.js';

console.log('🏙️ Testing City Group Automation Utils');
console.log('=====================================\n');

// Test slugify function
console.log('📝 Slugify Tests:');
console.log('  Buenos Aires ->', slugify('Buenos Aires'));
console.log('  São Paulo ->', slugify('São Paulo'));
console.log('  New York City ->', slugify('New York City'));
console.log('  México D.F. ->', slugify('México D.F.'));
console.log('  Saint-Petersburg ->', slugify('Saint-Petersburg'));
console.log('');

// Test group name generation
console.log('🏷️ Group Name Generation:');
console.log('  Buenos Aires, Argentina ->', generateCityGroupName('Buenos Aires', 'Argentina'));
console.log('  Paris, France ->', generateCityGroupName('Paris', 'France'));
console.log('  Tokyo ->', generateCityGroupName('Tokyo'));
console.log('  New York City ->', generateCityGroupName('New York City'));
console.log('');

// Test group description generation
console.log('📄 Group Description Generation:');
console.log('  Tokyo, Japan:');
console.log('  "' + generateCityGroupDescription('Tokyo', 'Japan') + '"');
console.log('');
console.log('  Buenos Aires:');
console.log('  "' + generateCityGroupDescription('Buenos Aires') + '"');
console.log('');

// Test validation
console.log('✅ Validation Tests:');
const testCities = [
  'Buenos Aires',
  'BA',
  'A',
  '',
  'São Paulo, Brazil',
  'X'.repeat(101) // Test max length
];

testCities.forEach(city => {
  console.log(`  "${city}" -> ${isValidCityName(city)}`);
});

console.log('');

// Test automation logging
console.log('📊 Testing Automation Logging:');
logGroupAutomation('Test Event', {
  groupId: 123,
  city: 'Buenos Aires',
  country: 'Argentina',
  userId: 456
});

console.log('\n✨ All tests completed successfully!');