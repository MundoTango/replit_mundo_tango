import { db } from '../db';
import { hostHomes, recommendations } from '../../shared/schema';
import { sql } from 'drizzle-orm';

async function seedCommunityData() {
  console.log('🌱 Seeding community data...');

  // Seed host homes for Buenos Aires
  const hostHomesData = [
    {
      hostId: 7, // Scott
      title: 'Cozy Palermo Studio near Milongas',
      description: 'Perfect for tango dancers! Walking distance to La Viruta and Salon Canning.',
      address: 'Honduras 5245, Palermo',
      city: 'Buenos Aires',
      state: 'Buenos Aires',
      country: 'Argentina',
      lat: -34.5813,
      lng: -58.4357,
      photos: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
        'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800'
      ],
      amenities: ['WiFi', 'Air conditioning', 'Kitchen', 'Dance practice space', 'Washer'],
      maxGuests: 2,
      pricePerNight: 4500, // in cents
      availability: { available: true },
      isActive: true,
    },
    {
      hostId: 7, // Also Scott - can have multiple properties
      title: 'Tango House in San Telmo',
      description: 'Historic building in the heart of tango. Practice space included!',
      address: 'Defensa 890, San Telmo',
      city: 'Buenos Aires',
      state: 'Buenos Aires',
      country: 'Argentina',
      lat: -34.6208,
      lng: -58.3721,
      photos: [
        'https://images.unsplash.com/photo-1577791593843-906e7a98d78e?w=800',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'
      ],
      amenities: ['WiFi', 'Shared dance studio', 'Kitchen access', 'Historic building'],
      maxGuests: 2,
      pricePerNight: 3500, // in cents
      availability: { available: true },
      isActive: true,
    },
  ];

  // Seed recommendations for Buenos Aires
  const recommendationsData = [
    {
      userId: 7, // Scott
      title: 'El Preferido de Palermo',
      description: 'Best steak in Buenos Aires! Ask for the bife de chorizo. The local tango dancers all come here after La Viruta.',
      type: 'restaurant',
      address: 'Jorge Luis Borges 2108, Palermo',
      city: 'Buenos Aires',
      state: 'Buenos Aires',
      country: 'Argentina',
      lat: -34.5871,
      lng: -58.4304,
      rating: 5,
      photos: ['https://example.com/preferido1.jpg'],
      tags: ['steak', 'local-favorite', 'post-milonga'],
      isActive: true,
      createdAt: new Date(),
    },
    {
      userId: 7,
      title: 'Cafe Tortoni',
      description: 'Historic cafe with nightly tango shows. Great for afternoon coffee and medialunas.',
      type: 'cafe',
      address: 'Av. de Mayo 825',
      city: 'Buenos Aires',
      state: 'Buenos Aires',
      country: 'Argentina',
      lat: -34.6089,
      lng: -58.3793,
      rating: 4,
      photos: ['https://example.com/tortoni1.jpg'],
      tags: ['historic', 'tango-show', 'coffee'],
      isActive: true,
      createdAt: new Date(),
    },
    {
      userId: 7,
      title: 'La Cabrera',
      description: 'Amazing parrilla with huge portions. Go hungry! Popular with the international tango community.',
      type: 'restaurant',
      address: 'José Antonio Cabrera 5099',
      city: 'Buenos Aires',
      state: 'Buenos Aires',
      country: 'Argentina',
      lat: -34.5866,
      lng: -58.4330,
      rating: 5,
      photos: ['https://example.com/cabrera1.jpg'],
      tags: ['parrilla', 'meat', 'group-dining'],
      isActive: true,
      createdAt: new Date(),
    },
  ];

  try {
    // Clear existing data
    await db.delete(hostHomes).execute();
    await db.delete(recommendations).execute();

    // Insert host homes
    const insertedHomes = await db.insert(hostHomes).values(hostHomesData).returning();
    console.log(`✅ Inserted ${insertedHomes.length} host homes`);

    // Insert recommendations
    const insertedRecs = await db.insert(recommendations).values(recommendationsData).returning();
    console.log(`✅ Inserted ${insertedRecs.length} recommendations`);

    console.log('🎉 Community data seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding community data:', error);
    throw error;
  }
}

// Run the seed function
seedCommunityData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });