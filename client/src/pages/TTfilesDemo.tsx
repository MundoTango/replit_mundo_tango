import React from 'react';
import TTEventCard from '@/components/ttfiles/TTEventCard';
import TTProfileHead from '@/components/ttfiles/TTProfileHead';
import TTCommunityCard from '@/components/ttfiles/TTCommunityCard';
import { useNavigate } from 'wouter';
import '../styles/ttfiles.css';

const TTfilesDemo = () => {
  const [, setLocation] = useNavigate();

  // Sample data
  const sampleEvent = {
    id: '1',
    title: 'Classic Milonga Night at Salon Canning',
    description: 'Traditional milonga with live orchestra featuring Orquesta Típica Fernández Fierro. Dance the night away in one of Buenos Aires\' most iconic venues.',
    date: new Date(2025, 6, 15),
    time: '9:00 PM - 3:00 AM',
    location: 'Salon Canning, Av. Scalabrini Ortiz 1331, Buenos Aires',
    organizer: {
      name: 'Milonga Parakultural',
      avatar: undefined
    },
    attendees: 142,
    maxAttendees: 200,
    eventType: 'Milonga',
    price: '25',
    isGoing: false
  };

  const sampleUser = {
    id: '1',
    name: 'Scott Boddye',
    username: 'scottboddye',
    bio: 'Passionate tango dancer exploring the authentic Buenos Aires milonga scene. Always learning, always dancing.',
    location: 'Buenos Aires, Argentina',
    joinDate: new Date(2024, 0, 15),
    roles: ['dancer', 'organizer', 'teacher'],
    followers: 523,
    following: 287,
    events: 156,
    yearsOfDancing: 8
  };

  const sampleCommunity = {
    id: '1',
    name: 'Buenos Aires Tango Collective',
    description: 'The largest community of tango dancers in Buenos Aires. Share experiences, find partners, and discover the best milongas.',
    memberCount: 3542,
    location: 'Buenos Aires, Argentina',
    category: 'Social',
    activeEvents: 23,
    rating: 4.8,
    isJoined: false
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">TrangoTech Original Components</h1>
          <p className="text-lg text-gray-600">Authentic vintage-styled components from the original TTfiles</p>
        </div>

        {/* Profile Head Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">TTProfileHead Component</h2>
          <div className="rounded-lg overflow-hidden shadow-lg">
            <TTProfileHead 
              user={sampleUser}
              isOwnProfile={true}
              onEditProfile={() => alert('Edit profile clicked')}
            />
          </div>
        </div>

        {/* Event Cards Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">TTEventCard Components</h2>
          <div className="tt-grid tt-grid-cols-3">
            <TTEventCard 
              {...sampleEvent}
              onRSVP={(id) => alert(`RSVP for event ${id}`)}
              onClick={() => alert('Event card clicked')}
            />
            <TTEventCard 
              {...sampleEvent}
              id="2"
              title="Beginner Tango Workshop"
              description="Learn the fundamentals of Argentine Tango with experienced instructors in a friendly environment."
              eventType="Workshop"
              price="0"
              date={new Date(2025, 6, 18)}
              time="6:00 PM - 8:00 PM"
              attendees={28}
              maxAttendees={30}
            />
            <TTEventCard 
              {...sampleEvent}
              id="3"
              title="Tango Festival Buenos Aires 2025"
              description="Annual tango festival featuring world-renowned dancers, orchestras, and special performances."
              eventType="Festival"
              price="150"
              date={new Date(2025, 7, 5)}
              time="All Day Event"
              attendees={850}
              isGoing={true}
            />
          </div>
        </div>

        {/* Community Cards Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">TTCommunityCard Components</h2>
          <div className="tt-grid tt-grid-cols-4">
            <TTCommunityCard 
              {...sampleCommunity}
              onJoin={(id) => alert(`Join community ${id}`)}
              onClick={() => alert('Community card clicked')}
            />
            <TTCommunityCard 
              id="2"
              name="Milonga Organizers Network"
              description="Connect with milonga organizers across Buenos Aires to coordinate events and share resources."
              memberCount={245}
              category="Professional"
              activeEvents={8}
              rating={4.9}
              isJoined={true}
            />
            <TTCommunityCard 
              id="3"
              name="Tango Musicians Guild"
              description="A community for tango musicians, DJs, and orchestra members to collaborate and perform."
              memberCount={512}
              category="Music"
              activeEvents={15}
              location="Argentina"
            />
            <TTCommunityCard 
              id="4"
              name="Tango Practice Group"
              description="Find practice partners and join informal practice sessions throughout the city."
              memberCount={1823}
              category="Practice"
              activeEvents={31}
              rating={4.6}
            />
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <button 
            className="tt-btn tt-btn-secondary"
            onClick={() => setLocation('/admin')}
          >
            Back to Admin Center
          </button>
        </div>
      </div>
    </div>
  );
};

export default TTfilesDemo;