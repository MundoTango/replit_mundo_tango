import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function createTestRSVPs() {
  console.log('Creating comprehensive test RSVPs...');
  
  // Get all users and events
  const usersResult = await pool.query('SELECT id, username FROM users ORDER BY id');
  const eventsResult = await pool.query('SELECT id, title, user_id FROM events ORDER BY id');
  
  const users = usersResult.rows;
  const events = eventsResult.rows;
  
  console.log(`Found ${users.length} users and ${events.length} events`);
  
  // Create realistic RSVP patterns
  const rsvpStatuses = ['going', 'interested', 'maybe'];
  let rsvpCount = 0;
  
  for (const event of events) {
    // Randomly select 40-80% of users to have RSVPs for each event
    const participationRate = 0.4 + Math.random() * 0.4;
    const numParticipants = Math.floor(users.length * participationRate);
    
    // Shuffle users and take the first numParticipants
    const shuffledUsers = [...users].sort(() => Math.random() - 0.5);
    const participants = shuffledUsers.slice(0, numParticipants);
    
    for (const user of participants) {
      // Don't let organizers RSVP to their own events
      if (user.id === event.user_id) continue;
      
      const status = rsvpStatuses[Math.floor(Math.random() * rsvpStatuses.length)];
      
      try {
        await pool.query(`
          INSERT INTO event_rsvps (event_id, user_id, status)
          VALUES ($1, $2, $3)
          ON CONFLICT (event_id, user_id) DO UPDATE SET status = $3
        `, [event.id, user.id, status]);
        rsvpCount++;
      } catch (error) {
        console.error(`Error creating RSVP for event ${event.id}, user ${user.id}:`, error.message);
      }
    }
  }
  
  console.log(`Created ${rsvpCount} test RSVPs`);
}

async function createTestFollowedCities() {
  console.log('Creating test followed cities...');
  
  const cities = [
    { city: "Buenos Aires", country: "Argentina" },
    { city: "Paris", country: "France" }, 
    { city: "Berlin", country: "Germany" },
    { city: "Milan", country: "Italy" },
    { city: "Barcelona", country: "Spain" },
    { city: "New York", country: "USA" },
    { city: "San Francisco", country: "USA" },
    { city: "London", country: "UK" },
    { city: "Istanbul", country: "Turkey" },
    { city: "São Paulo", country: "Brazil" },
    { city: "Warsaw", country: "Poland" },
    { city: "Montevideo", country: "Uruguay" }
  ];
  
  const usersResult = await pool.query('SELECT id FROM users');
  const users = usersResult.rows;
  let cityCount = 0;
  
  for (const user of users) {
    // Each user follows 2-6 cities
    const numCities = 2 + Math.floor(Math.random() * 5);
    const shuffledCities = [...cities].sort(() => Math.random() - 0.5);
    const userCities = shuffledCities.slice(0, numCities);
    
    for (const cityData of userCities) {
      try {
        await pool.query(`
          INSERT INTO user_followed_cities (user_id, city, country)
          VALUES ($1, $2, $3)
          ON CONFLICT DO NOTHING
        `, [user.id, cityData.city, cityData.country]);
        cityCount++;
      } catch (error) {
        console.error(`Error creating followed city for user ${user.id}:`, error.message);
      }
    }
  }
  
  console.log(`Created ${cityCount} followed city relationships`);
}

async function createTestEventParticipants() {
  console.log('Creating test event participants with roles...');
  
  const roles = ['DJ', 'Teacher', 'Musician', 'Performer', 'Host', 'Volunteer', 'Photographer', 'Organizer'];
  
  const eventsResult = await pool.query('SELECT id, user_id, title FROM events');
  const usersResult = await pool.query('SELECT id FROM users');
  
  const events = eventsResult.rows;
  const users = usersResult.rows;
  let participantCount = 0;
  
  for (const event of events) {
    // Each event has 2-6 role participants
    const numRoles = 2 + Math.floor(Math.random() * 5);
    const usedRoles = new Set();
    
    for (let i = 0; i < numRoles; i++) {
      let role = roles[Math.floor(Math.random() * roles.length)];
      
      // Ensure no duplicate roles for the same event
      while (usedRoles.has(role)) {
        role = roles[Math.floor(Math.random() * roles.length)];
      }
      usedRoles.add(role);
      
      const participant = users[Math.floor(Math.random() * users.length)];
      const status = Math.random() > 0.2 ? 'accepted' : 'pending';
      
      try {
        await pool.query(`
          INSERT INTO event_participants (event_id, user_id, role, status, invited_by)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (event_id, user_id, role) DO UPDATE SET status = $4
        `, [event.id, participant.id, role, status, event.user_id]);
        participantCount++;
      } catch (error) {
        console.error(`Error creating event participant:`, error.message);
      }
    }
  }
  
  console.log(`Created ${participantCount} event role participants`);
}

async function updateEventAttendeeCount() {
  console.log('Updating event attendee counts based on RSVPs...');
  
  await pool.query(`
    UPDATE events 
    SET current_attendees = (
      SELECT COUNT(*) 
      FROM event_rsvps 
      WHERE event_rsvps.event_id = events.id 
      AND event_rsvps.status = 'going'
    )
  `);
  
  console.log('Updated event attendee counts');
}

async function validateTestData() {
  console.log('Validating comprehensive test data...');
  
  try {
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`Total users in database: ${usersCount.rows[0].count}`);
    
    const eventsCount = await pool.query('SELECT COUNT(*) FROM events');
    console.log(`Total events in database: ${eventsCount.rows[0].count}`);
    
    const rsvpsCount = await pool.query('SELECT COUNT(*) FROM event_rsvps');
    console.log(`Total RSVPs in database: ${rsvpsCount.rows[0].count}`);
    
    const followedCitiesCount = await pool.query('SELECT COUNT(*) FROM user_followed_cities');
    console.log(`Total followed cities: ${followedCitiesCount.rows[0].count}`);
    
    const participantsCount = await pool.query('SELECT COUNT(*) FROM event_participants');
    console.log(`Total event participants: ${participantsCount.rows[0].count}`);
    
    // Test specific event queries that the UI uses
    const upcomingEvents = await pool.query(`
      SELECT COUNT(*) FROM events 
      WHERE start_date > NOW() AND status = 'active'
    `);
    console.log(`Upcoming active events: ${upcomingEvents.rows[0].count}`);
    
    const pastEvents = await pool.query(`
      SELECT COUNT(*) FROM events 
      WHERE start_date < NOW()
    `);
    console.log(`Past events: ${pastEvents.rows[0].count}`);
    
    const eventsWithRsvps = await pool.query(`
      SELECT e.title, e.current_attendees, COUNT(r.id) as total_rsvps
      FROM events e
      LEFT JOIN event_rsvps r ON e.id = r.event_id
      GROUP BY e.id, e.title, e.current_attendees
      ORDER BY total_rsvps DESC
      LIMIT 5
    `);
    console.log('Top events by RSVP count:', eventsWithRsvps.rows);
    
    const eventsByType = await pool.query(`
      SELECT event_type, COUNT(*) as count
      FROM events
      GROUP BY event_type
      ORDER BY count DESC
    `);
    console.log('Events by type:', eventsByType.rows);
    
  } catch (error) {
    console.error('Validation error:', error.message);
  }
}

async function main() {
  try {
    console.log('Starting comprehensive test data completion...');
    
    await createTestRSVPs();
    await createTestFollowedCities();
    await createTestEventParticipants();
    await updateEventAttendeeCount();
    await validateTestData();
    
    console.log('Test data creation completed successfully!');
    console.log('The Events page should now be fully populated with realistic data.');
  } catch (error) {
    console.error('Error in main process:', error);
  } finally {
    await pool.end();
  }
}

main();