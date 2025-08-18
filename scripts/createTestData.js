import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Test user data with diverse roles and backgrounds
const testUsers = [
  {
    name: "Maria Elena Rodriguez",
    username: "maria_tango",
    email: "maria@mundotango.test",
    password: "$2b$10$rX8kX9kX9kX9kX9kX9kX9u",
    firstName: "Maria Elena",
    lastName: "Rodriguez",
    country: "Argentina",
    city: "Buenos Aires",
    state: "Buenos Aires",
    bio: "Professional tango teacher with 15 years experience in Buenos Aires milongas",
    tangoRoles: ["teacher", "dancer", "organizer"],
    leaderLevel: 4,
    followerLevel: 5,
    yearsOfDancing: 15,
    startedDancingYear: 2009,
    languages: ["spanish", "english"],
    formStatus: 2,
    isOnboardingComplete: true,
    codeOfConductAccepted: true
  },
  {
    name: "Carlos Miguel Santos",
    username: "dj_carlos",
    email: "carlos@mundotango.test", 
    password: "$2b$10$rX8kX9kX9kX9kX9kX9kX9u",
    firstName: "Carlos Miguel",
    lastName: "Santos",
    country: "Uruguay", 
    city: "Montevideo",
    state: "Montevideo",
    bio: "DJ specializing in Golden Age tango, regular at top milongas",
    tangoRoles: ["dj", "dancer", "curator"],
    leaderLevel: 5,
    followerLevel: 3,
    yearsOfDancing: 20,
    startedDancingYear: 2004,
    languages: ["spanish", "english", "portuguese"],
    formStatus: 2,
    isOnboardingComplete: true,
    codeOfConductAccepted: true
  },
  {
    name: "Isabella Chen",
    username: "bella_organizer",
    email: "isabella@mundotango.test",
    password: "$2b$10$rX8kX9kX9kX9kX9kX9kX9u",
    firstName: "Isabella",
    lastName: "Chen", 
    country: "USA",
    city: "San Francisco",
    state: "California",
    bio: "Passionate organizer bringing tango to the Bay Area community",
    tangoRoles: ["organizer", "dancer", "traveler"],
    leaderLevel: 2,
    followerLevel: 4,
    yearsOfDancing: 8,
    startedDancingYear: 2016,
    languages: ["english", "mandarin"],
    formStatus: 2,
    isOnboardingComplete: true,
    codeOfConductAccepted: true
  },
  {
    name: "Fabio Benedetti",
    username: "fabio_performer",
    email: "fabio@mundotango.test",
    password: "$2b$10$rX8kX9kX9kX9kX9kX9kX9u",
    firstName: "Fabio",
    lastName: "Benedetti",
    country: "Italy",
    city: "Milan",
    state: "Lombardy", 
    bio: "Professional tango performer and choreographer, touring internationally",
    tangoRoles: ["performer", "teacher", "dancer"],
    leaderLevel: 5,
    followerLevel: 5,
    yearsOfDancing: 18,
    startedDancingYear: 2006,
    languages: ["italian", "english", "spanish"],
    formStatus: 2,
    isOnboardingComplete: true,
    codeOfConductAccepted: true
  },
  {
    name: "Sophie Laurent",
    username: "sophie_dancer",
    email: "sophie@mundotango.test",
    password: "$2b$10$rX8kX9kX9kX9kX9kX9kX9u",
    firstName: "Sophie",
    lastName: "Laurent",
    country: "France",
    city: "Paris", 
    state: "Île-de-France",
    bio: "Passionate follower exploring tango scenes worldwide",
    tangoRoles: ["dancer", "traveler", "supporter"],
    leaderLevel: 1,
    followerLevel: 4,
    yearsOfDancing: 6,
    startedDancingYear: 2018,
    languages: ["french", "english"],
    formStatus: 2,
    isOnboardingComplete: true,
    codeOfConductAccepted: true
  },
  {
    name: "Miguel Alvarez",
    username: "miguel_musician",
    email: "miguel@mundotango.test",
    password: "$2b$10$rX8kX9kX9kX9kX9kX9kX9u",
    firstName: "Miguel",
    lastName: "Alvarez",
    country: "Argentina",
    city: "Rosario",
    state: "Santa Fe",
    bio: "Bandoneon player and tango musician, traditional style specialist",
    tangoRoles: ["musician", "dancer", "historian"],
    leaderLevel: 3,
    followerLevel: 2,
    yearsOfDancing: 25,
    startedDancingYear: 1999,
    languages: ["spanish"],
    formStatus: 2,
    isOnboardingComplete: true,
    codeOfConductAccepted: true
  },
  {
    name: "Anna Kowalski",
    username: "anna_workshop",
    email: "anna@mundotango.test",
    password: "$2b$10$rX8kX9kX9kX9kX9kX9kX9u",
    firstName: "Anna",
    lastName: "Kowalski",
    country: "Poland",
    city: "Warsaw",
    state: "Mazovia",
    bio: "Workshop enthusiast and community builder in Eastern Europe",
    tangoRoles: ["organizer", "dancer", "teacher"],
    leaderLevel: 3,
    followerLevel: 4,
    yearsOfDancing: 10,
    startedDancingYear: 2014,
    languages: ["polish", "english", "german"],
    formStatus: 2,
    isOnboardingComplete: true,
    codeOfConductAccepted: true
  },
  {
    name: "Roberto Silva",
    username: "roberto_festival",
    email: "roberto@mundotango.test",
    password: "$2b$10$rX8kX9kX9kX9kX9kX9kX9u",
    firstName: "Roberto",
    lastName: "Silva",
    country: "Brazil",
    city: "São Paulo",
    state: "São Paulo",
    bio: "Festival director and producer, bringing world-class tango events to Brazil",
    tangoRoles: ["organizer", "producer", "dancer"],
    leaderLevel: 4,
    followerLevel: 3,
    yearsOfDancing: 22,
    startedDancingYear: 2002,
    languages: ["portuguese", "spanish", "english"],
    formStatus: 2,
    isOnboardingComplete: true,
    codeOfConductAccepted: true
  }
];

// Comprehensive test events covering all types and scenarios
const testEvents = [
  {
    title: "Weekly Milonga at Club Gricel",
    description: "Traditional weekly milonga featuring classic tango orchestras and live cortinas. Best dancers in Buenos Aires gather every Friday.",
    eventType: "milonga",
    venue: "Club Gricel",
    address: "La Rioja 1180, San Telmo",
    city: "Buenos Aires",
    country: "Argentina",
    startDate: new Date('2025-07-04T21:00:00Z'),
    endDate: new Date('2025-07-05T02:00:00Z'),
    maxAttendees: 200,
    currentAttendees: 85,
    price: "300 ARS",
    currency: "ARS",
    level: "all_levels",
    musicStyle: "traditional",
    tags: ["milonga", "traditional", "live_music"],
    isRecurring: true,
    recurringPattern: "weekly",
    organizerUsername: "maria_tango"
  },
  {
    title: "Tango Fundamentals - Beginner Course",
    description: "Complete beginner workshop covering basic walking, embrace, and fundamental steps. Perfect for those starting their tango journey.",
    eventType: "workshop", 
    venue: "Tango Studio SF",
    address: "1234 Mission Street",
    city: "San Francisco",
    country: "USA",
    startDate: new Date('2025-07-02T19:00:00Z'),
    endDate: new Date('2025-07-02T21:00:00Z'),
    maxAttendees: 20,
    currentAttendees: 16,
    price: "45 USD",
    currency: "USD",
    level: "beginner",
    musicStyle: "all_styles",
    tags: ["workshop", "beginner", "fundamentals"],
    isRecurring: false,
    organizerUsername: "bella_organizer"
  },
  {
    title: "La Viruta Traditional Milonga",
    description: "Authentic Buenos Aires milonga experience with traditional codes and exceptional music selection by renowned DJs.",
    eventType: "milonga",
    venue: "La Viruta",
    address: "Armenia 1366, Palermo",
    city: "Buenos Aires", 
    country: "Argentina",
    startDate: new Date('2025-07-01T23:00:00Z'),
    endDate: new Date('2025-07-02T04:00:00Z'),
    maxAttendees: 120,
    currentAttendees: 95,
    price: "250 ARS",
    currency: "ARS",
    level: "intermediate",
    musicStyle: "traditional",
    tags: ["milonga", "traditional", "palermo"],
    isRecurring: true,
    recurringPattern: "weekly",
    organizerUsername: "dj_carlos"
  },
  {
    title: "Festival Internacional de Tango 2025",
    description: "Three-day tango festival featuring world-class performers, workshops, and milongas. International masters teaching and performing.",
    eventType: "festival",
    venue: "Centro Cultural Recoleta", 
    address: "Junín 1930, Recoleta",
    city: "Buenos Aires",
    country: "Argentina",
    startDate: new Date('2025-08-15T10:00:00Z'),
    endDate: new Date('2025-08-17T23:59:00Z'),
    maxAttendees: 500,
    currentAttendees: 245,
    price: "850 USD",
    currency: "USD",
    level: "all_levels",
    musicStyle: "all_styles",
    tags: ["festival", "international", "workshops", "shows"],
    isRecurring: false,
    organizerUsername: "roberto_festival"
  },
  {
    title: "Practica Libre - Open Floor",
    description: "Relaxed practice session for dancers of all levels. Bring your own music or dance to our curated playlist.",
    eventType: "practica",
    venue: "Studio Tango Milano",
    address: "Via Brera 15",
    city: "Milan",
    country: "Italy", 
    startDate: new Date('2025-07-03T20:00:00Z'),
    endDate: new Date('2025-07-03T23:00:00Z'),
    maxAttendees: 40,
    currentAttendees: 22,
    price: "15 EUR",
    currency: "EUR",
    level: "all_levels",
    musicStyle: "mixed",
    tags: ["practica", "open_floor", "practice"],
    isRecurring: true,
    recurringPattern: "weekly",
    organizerUsername: "fabio_performer"
  },
  {
    title: "Marathon de Tango Paris 2025",
    description: "48-hour non-stop tango marathon with international DJs, outdoor milongas, and surprise performances throughout the city.",
    eventType: "marathon",
    venue: "Multiple Venues",
    address: "Various locations in Paris",
    city: "Paris",
    country: "France",
    startDate: new Date('2025-09-12T18:00:00Z'),
    endDate: new Date('2025-09-14T18:00:00Z'),
    maxAttendees: 800,
    currentAttendees: 320,
    price: "180 EUR",
    currency: "EUR",
    level: "intermediate",
    musicStyle: "all_styles",
    tags: ["marathon", "international", "djs", "outdoor"],
    isRecurring: false,
    organizerUsername: "sophie_dancer"
  },
  {
    title: "Encuentro Milonguero Tradicional",
    description: "Intimate gathering celebrating traditional milonguero style. Close embrace and authentic Buenos Aires atmosphere.",
    eventType: "encuentro",
    venue: "Salon Canning",
    address: "Scalabrini Ortiz 1331, Palermo",
    city: "Buenos Aires",
    country: "Argentina",
    startDate: new Date('2025-07-20T21:30:00Z'),
    endDate: new Date('2025-07-21T02:00:00Z'),
    maxAttendees: 80,
    currentAttendees: 65,
    price: "400 ARS",
    currency: "ARS",
    level: "advanced",
    musicStyle: "traditional",
    tags: ["encuentro", "milonguero", "close_embrace"],
    isRecurring: false,
    organizerUsername: "miguel_musician"
  },
  {
    title: "Tango Competition - Copa Argentina",
    description: "Annual tango competition featuring salon and stage categories. Professional judges and significant prizes.",
    eventType: "competition",
    venue: "Teatro San Martín",
    address: "Av. Corrientes 1530, San Nicolás",
    city: "Buenos Aires",
    country: "Argentina",
    startDate: new Date('2025-10-05T19:00:00Z'),
    endDate: new Date('2025-10-05T23:00:00Z'),
    maxAttendees: 300,
    currentAttendees: 45,
    price: "500 ARS",
    currency: "ARS",
    level: "advanced",
    musicStyle: "traditional",
    tags: ["competition", "salon", "stage", "prizes"],
    isRecurring: true,
    recurringPattern: "yearly",
    organizerUsername: "maria_tango"
  },
  {
    title: "Advanced Ganchos & Boleos Workshop",
    description: "Technical workshop focusing on advanced ganchos and boleos. For experienced dancers only.",
    eventType: "workshop",
    venue: "Warsaw Tango Studio",
    address: "ul. Nowy Świat 25",
    city: "Warsaw",
    country: "Poland",
    startDate: new Date('2025-07-08T18:00:00Z'),
    endDate: new Date('2025-07-08T20:30:00Z'),
    maxAttendees: 16,
    currentAttendees: 12,
    price: "80 PLN",
    currency: "PLN",
    level: "advanced",
    musicStyle: "traditional",
    tags: ["workshop", "advanced", "technique", "ganchos"],
    isRecurring: false,
    organizerUsername: "anna_workshop"
  },
  {
    title: "Sunday Afternoon Milonga",
    description: "Relaxed Sunday milonga with tea service and live bandoneon. Family-friendly atmosphere.",
    eventType: "milonga",
    venue: "Café Tortoni",
    address: "Av. de Mayo 825, Monserrat",
    city: "Buenos Aires",
    country: "Argentina",
    startDate: new Date('2025-06-29T16:00:00Z'),
    endDate: new Date('2025-06-29T20:00:00Z'),
    maxAttendees: 60,
    currentAttendees: 42,
    price: "200 ARS",
    currency: "ARS",
    level: "all_levels",
    musicStyle: "traditional",
    tags: ["milonga", "afternoon", "live_music", "family_friendly"],
    isRecurring: true,
    recurringPattern: "weekly",
    organizerUsername: "miguel_musician",
    status: "completed"
  },
  {
    title: "Tango Fusion Night",
    description: "Experimental tango evening featuring electronic tango, nuevo tango, and alternative music.",
    eventType: "milonga",
    venue: "Club Maldito",
    address: "Av. Rivadavia 8552, Liniers",
    city: "Buenos Aires",
    country: "Argentina",
    startDate: new Date('2025-06-25T22:00:00Z'),
    endDate: new Date('2025-06-26T03:00:00Z'),
    maxAttendees: 150,
    currentAttendees: 89,
    price: "350 ARS",
    currency: "ARS",
    level: "intermediate",
    musicStyle: "alternative",
    tags: ["milonga", "fusion", "electronic", "nuevo"],
    isRecurring: false,
    organizerUsername: "dj_carlos",
    status: "completed"
  },
  {
    title: "Milonga del Corazón",
    description: "Monthly milonga dedicated to the emotional connection in tango. Intimate venue with carefully selected music.",
    eventType: "milonga",
    venue: "Centro Región Leonesa",
    address: "Humberto Primo 1462, San Telmo",
    city: "Buenos Aires",
    country: "Argentina",
    startDate: new Date('2025-07-15T21:00:00Z'),
    endDate: new Date('2025-07-16T01:00:00Z'),
    maxAttendees: 100,
    currentAttendees: 0,
    price: "280 ARS",
    currency: "ARS",
    level: "intermediate",
    musicStyle: "traditional",
    tags: ["milonga", "monthly", "emotional", "intimate"],
    isRecurring: true,
    recurringPattern: "monthly",
    organizerUsername: "maria_tango"
  },
  {
    title: "Beginner Friendly Practica",
    description: "Guided practice session for beginners with basic instruction and friendly atmosphere.",
    eventType: "practica",
    venue: "Tango Space Berlin",
    address: "Kastanienallee 77",
    city: "Berlin",
    country: "Germany",
    startDate: new Date('2025-07-06T19:30:00Z'),
    endDate: new Date('2025-07-06T22:00:00Z'),
    maxAttendees: 30,
    currentAttendees: 18,
    price: "12 EUR",
    currency: "EUR",
    level: "beginner",
    musicStyle: "traditional",
    tags: ["practica", "beginner", "guided", "friendly"],
    isRecurring: true,
    recurringPattern: "weekly",
    organizerUsername: "anna_workshop"
  },
  {
    title: "Tango Argentino Masterclass",
    description: "Intensive masterclass with visiting Argentine maestros. Advanced techniques and styling.",
    eventType: "workshop",
    venue: "São Paulo Tango Academy",
    address: "Rua Augusta 2690, Jardins",
    city: "São Paulo",
    country: "Brazil",
    startDate: new Date('2025-07-12T14:00:00Z'),
    endDate: new Date('2025-07-12T18:00:00Z'),
    maxAttendees: 25,
    currentAttendees: 21,
    price: "150 BRL",
    currency: "BRL",
    level: "advanced",
    musicStyle: "traditional",
    tags: ["workshop", "masterclass", "argentine", "advanced"],
    isRecurring: false,
    organizerUsername: "roberto_festival"
  },
  {
    title: "Outdoor Milonga in the Park",
    description: "Special outdoor milonga celebrating summer. Dance under the stars with live music.",
    eventType: "milonga",
    venue: "Parque Centenario",
    address: "Av. Díaz Vélez & Leopoldo Marechal",
    city: "Buenos Aires",
    country: "Argentina",
    startDate: new Date('2025-07-25T20:00:00Z'),
    endDate: new Date('2025-07-26T00:00:00Z'),
    maxAttendees: 200,
    currentAttendees: 15,
    price: "Free",
    currency: "ARS",
    level: "all_levels",
    musicStyle: "traditional",
    tags: ["milonga", "outdoor", "summer", "live_music", "free"],
    isRecurring: false,
    organizerUsername: "sophie_dancer"
  },
  {
    title: "Intimate Salon Milonga",
    description: "Small, elegant milonga in traditional salon style. Dress code required.",
    eventType: "milonga",
    venue: "Salon La Nacional",
    address: "Alsina 1465, Monserrat",
    city: "Buenos Aires",
    country: "Argentina",
    startDate: new Date('2025-07-18T21:30:00Z'),
    endDate: new Date('2025-07-19T01:30:00Z'),
    maxAttendees: 60,
    currentAttendees: 8,
    price: "450 ARS",
    currency: "ARS",
    level: "intermediate",
    musicStyle: "traditional",
    dressCode: "formal",
    tags: ["milonga", "salon", "elegant", "dress_code"],
    isRecurring: false,
    organizerUsername: "fabio_performer"
  },
  {
    title: "Tango History & Music Workshop",
    description: "Educational workshop exploring the history of tango music and its evolution through the decades.",
    eventType: "workshop",
    venue: "Confitería Ideal",
    address: "Suipacha 384, San Nicolás",
    city: "Buenos Aires",
    country: "Argentina",
    startDate: new Date('2025-07-10T15:00:00Z'),
    endDate: new Date('2025-07-10T17:30:00Z'),
    maxAttendees: 40,
    currentAttendees: 28,
    price: "250 ARS",
    currency: "ARS",
    level: "all_levels",
    musicStyle: "historical",
    tags: ["workshop", "history", "music", "educational"],
    isRecurring: false,
    organizerUsername: "miguel_musician"
  },
  {
    title: "International Tango Day Celebration",
    description: "Special celebration for International Tango Day with performances, workshops, and grand milonga.",
    eventType: "festival",
    venue: "Plaza Dorrego",
    address: "Plaza Dorrego, San Telmo",
    city: "Buenos Aires",
    country: "Argentina",
    startDate: new Date('2025-12-11T14:00:00Z'),
    endDate: new Date('2025-12-11T23:59:00Z'),
    maxAttendees: 1000,
    currentAttendees: 125,
    price: "Free",
    currency: "ARS",
    level: "all_levels",
    musicStyle: "all_styles",
    tags: ["festival", "international_day", "celebration", "free", "performances"],
    isRecurring: true,
    recurringPattern: "yearly",
    organizerUsername: "roberto_festival"
  },
  {
    title: "Tango & Wine Tasting Evening",
    description: "Unique experience combining Argentine wine tasting with tango dancing and live music.",
    eventType: "milonga",
    venue: "Boedo Tango Club",
    address: "Av. Boedo 722, Boedo",
    city: "Buenos Aires",
    country: "Argentina",
    startDate: new Date('2025-07-22T20:00:00Z'),
    endDate: new Date('2025-07-23T01:00:00Z'),
    maxAttendees: 80,
    currentAttendees: 35,
    price: "600 ARS",
    currency: "ARS",
    level: "all_levels",
    musicStyle: "traditional",
    tags: ["milonga", "wine_tasting", "unique", "live_music"],
    isRecurring: false,
    organizerUsername: "maria_tango"
  }
];

async function createTestUsers() {
  console.log('Creating test users...');
  
  for (const user of testUsers) {
    try {
      const result = await pool.query(`
        INSERT INTO users (
          name, username, email, password, first_name, last_name,
          country, city, state, bio, tango_roles, leader_level,
          follower_level, years_of_dancing, started_dancing_year,
          languages, form_status, is_onboarding_complete, 
          code_of_conduct_accepted, api_token
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
        ) RETURNING id
      `, [
        user.name, user.username, user.email, user.password,
        user.firstName, user.lastName, user.country, user.city,
        user.state, user.bio, user.tangoRoles, user.leaderLevel,
        user.followerLevel, user.yearsOfDancing, user.startedDancingYear,
        user.languages, user.formStatus, user.isOnboardingComplete,
        user.codeOfConductAccepted, Math.random().toString(36).substr(2, 9)
      ]);
      
      console.log(`Created user: ${user.name} (ID: ${result.rows[0].id})`);
    } catch (error) {
      if (error.code === '23505') {
        console.log(`User ${user.username} already exists, skipping...`);
      } else {
        console.error(`Error creating user ${user.username}:`, error.message);
      }
    }
  }
}

async function createTestEvents() {
  console.log('Creating test events...');
  
  // Get user IDs for organizers
  const userMap = {};
  for (const user of testUsers) {
    try {
      const result = await pool.query('SELECT id FROM users WHERE username = $1', [user.username]);
      if (result.rows.length > 0) {
        userMap[user.username] = result.rows[0].id;
      }
    } catch (error) {
      console.error(`Error finding user ${user.username}:`, error.message);
    }
  }
  
  for (const event of testEvents) {
    try {
      const organizerId = userMap[event.organizerUsername];
      if (!organizerId) {
        console.log(`Organizer ${event.organizerUsername} not found, skipping event: ${event.title}`);
        continue;
      }
      
      const result = await pool.query(`
        INSERT INTO events (
          user_id, title, description, event_type, venue, address,
          city, country, start_date, end_date, max_attendees,
          current_attendees, price, currency, level, music_style,
          tags, is_recurring, recurring_pattern, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
        ) RETURNING id
      `, [
        organizerId, event.title, event.description, event.eventType,
        event.venue, event.address, event.city, event.country,
        event.startDate, event.endDate, event.maxAttendees,
        event.currentAttendees, event.price, event.currency,
        event.level, event.musicStyle, event.tags, event.isRecurring,
        event.recurringPattern, event.status || 'active'
      ]);
      
      console.log(`Created event: ${event.title} (ID: ${result.rows[0].id})`);
    } catch (error) {
      console.error(`Error creating event ${event.title}:`, error.message);
    }
  }
}

async function createTestRSVPs() {
  console.log('Creating test RSVPs...');
  
  // Get all users and events
  const usersResult = await pool.query('SELECT id, username FROM users');
  const eventsResult = await pool.query('SELECT id, title FROM events');
  
  const users = usersResult.rows;
  const events = eventsResult.rows;
  
  // Create realistic RSVP patterns
  const rsvpStatuses = ['going', 'interested', 'maybe'];
  
  for (const event of events) {
    // Randomly select 30-70% of users to have RSVPs for each event
    const participationRate = 0.3 + Math.random() * 0.4;
    const numParticipants = Math.floor(users.length * participationRate);
    
    // Shuffle users and take the first numParticipants
    const shuffledUsers = [...users].sort(() => Math.random() - 0.5);
    const participants = shuffledUsers.slice(0, numParticipants);
    
    for (const user of participants) {
      const status = rsvpStatuses[Math.floor(Math.random() * rsvpStatuses.length)];
      
      try {
        await pool.query(`
          INSERT INTO event_rsvps (event_id, user_id, status)
          VALUES ($1, $2, $3)
          ON CONFLICT (event_id, user_id) DO NOTHING
        `, [event.id, user.id, status]);
      } catch (error) {
        console.error(`Error creating RSVP for event ${event.id}, user ${user.id}:`, error.message);
      }
    }
  }
  
  console.log('Created test RSVPs');
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
    { city: "São Paulo", country: "Brazil" }
  ];
  
  const usersResult = await pool.query('SELECT id FROM users LIMIT 5');
  const users = usersResult.rows;
  
  for (const user of users) {
    // Each user follows 2-5 cities
    const numCities = 2 + Math.floor(Math.random() * 4);
    const shuffledCities = [...cities].sort(() => Math.random() - 0.5);
    const userCities = shuffledCities.slice(0, numCities);
    
    for (const cityData of userCities) {
      try {
        await pool.query(`
          INSERT INTO user_followed_cities (user_id, city, country)
          VALUES ($1, $2, $3)
          ON CONFLICT DO NOTHING
        `, [user.id, cityData.city, cityData.country]);
      } catch (error) {
        console.error(`Error creating followed city for user ${user.id}:`, error.message);
      }
    }
  }
  
  console.log('Created test followed cities');
}

async function createTestEventParticipants() {
  console.log('Creating test event participants with roles...');
  
  const roles = ['DJ', 'Teacher', 'Musician', 'Performer', 'Host', 'Volunteer', 'Photographer', 'Organizer'];
  
  const eventsResult = await pool.query('SELECT id, user_id FROM events LIMIT 10');
  const usersResult = await pool.query('SELECT id FROM users');
  
  const events = eventsResult.rows;
  const users = usersResult.rows;
  
  for (const event of events) {
    // Each event has 2-5 role participants
    const numRoles = 2 + Math.floor(Math.random() * 4);
    
    for (let i = 0; i < numRoles; i++) {
      const role = roles[Math.floor(Math.random() * roles.length)];
      const participant = users[Math.floor(Math.random() * users.length)];
      const status = Math.random() > 0.3 ? 'accepted' : 'pending';
      
      try {
        await pool.query(`
          INSERT INTO event_participants (event_id, user_id, role, status, invited_by)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (event_id, user_id, role) DO NOTHING
        `, [event.id, participant.id, role, status, event.user_id]);
      } catch (error) {
        console.error(`Error creating event participant:`, error.message);
      }
    }
  }
  
  console.log('Created test event participants');
}

async function validateTestData() {
  console.log('Validating test data...');
  
  try {
    const usersCount = await pool.query('SELECT COUNT(*) FROM users WHERE username LIKE \'%_test\' OR username IN (SELECT username FROM unnest($1::text[]) AS username)', [testUsers.map(u => u.username)]);
    console.log(`Test users created: ${usersCount.rows[0].count}`);
    
    const eventsCount = await pool.query('SELECT COUNT(*) FROM events');
    console.log(`Total events in database: ${eventsCount.rows[0].count}`);
    
    const rsvpsCount = await pool.query('SELECT COUNT(*) FROM event_rsvps');
    console.log(`Total RSVPs in database: ${rsvpsCount.rows[0].count}`);
    
    const followedCitiesCount = await pool.query('SELECT COUNT(*) FROM user_followed_cities');
    console.log(`Total followed cities: ${followedCitiesCount.rows[0].count}`);
    
    const participantsCount = await pool.query('SELECT COUNT(*) FROM event_participants');
    console.log(`Total event participants: ${participantsCount.rows[0].count}`);
    
    // Test event queries that the UI uses
    const upcomingEvents = await pool.query(`
      SELECT COUNT(*) FROM events 
      WHERE start_date > NOW() AND status = 'active'
    `);
    console.log(`Upcoming active events: ${upcomingEvents.rows[0].count}`);
    
    const eventsWithRsvps = await pool.query(`
      SELECT e.title, COUNT(r.id) as rsvp_count
      FROM events e
      LEFT JOIN event_rsvps r ON e.id = r.event_id
      GROUP BY e.id, e.title
      ORDER BY rsvp_count DESC
      LIMIT 5
    `);
    console.log('Top events by RSVP count:', eventsWithRsvps.rows);
    
  } catch (error) {
    console.error('Validation error:', error.message);
  }
}

async function main() {
  try {
    console.log('Starting test data creation...');
    
    await createTestUsers();
    await createTestEvents();
    await createTestRSVPs();
    await createTestFollowedCities();
    await createTestEventParticipants();
    await validateTestData();
    
    console.log('Test data creation completed successfully!');
  } catch (error) {
    console.error('Error in main process:', error);
  } finally {
    await pool.end();
  }
}

main();