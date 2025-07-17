import { db } from '../server/db';
import { dailyActivities } from '../shared/schema';

async function populateTodayActivities() {
  console.log('Populating activities for today...');
  
  const today = new Date();
  const activities = [
    {
      user_id: 7,
      project_id: '30l-framework-integration',
      project_title: '30L Framework Navigation Restructure',
      activity_type: 'updated' as const,
      description: 'Fixed Daily Activity data extraction - API returns Response object that needs JSON parsing',
      changes: [
        'Removed "Daily Activity" and "Feature Deep Dive" from main Admin Center tabs',
        'Added "30L Framework" as new tab within "The Plan"',
        'Fixed apiRequest to properly parse JSON response'
      ],
      team: ['Frontend', 'Backend'],
      tags: ['30L', 'navigation', 'bugfix'],
      completion_before: 80,
      completion_after: 90,
      timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30),
      metadata: { layer: 7, framework: '30L' }
    },
    {
      user_id: 7,
      project_id: '30l-framework-integration',
      project_title: '30L Framework Navigation Restructure',
      activity_type: 'completed' as const,
      description: 'Completed navigation restructure and Daily Activity bug fixes',
      changes: [
        'Date filtering logic implemented',
        'Deduplication added to remove duplicate activities',
        'Fixed date picker showing wrong month'
      ],
      team: ['Frontend'],
      tags: ['30L', 'completed'],
      completion_before: 90,
      completion_after: 100,
      timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 15),
      metadata: { layer: 7, framework: '30L' }
    }
  ];

  try {
    await db.insert(dailyActivities).values(activities);
    console.log('Successfully populated', activities.length, 'activities for today');
  } catch (error) {
    console.error('Error populating activities:', error);
  }
  
  process.exit(0);
}

populateTodayActivities();