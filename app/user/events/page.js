"use client";
import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../../auth/useAuthContext';
import EventCard from '../../../components/Events/EventCard';
import { Button, TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { Add, Search, FilterList } from '@mui/icons-material';

const EventsPage = () => {
  const { user } = useAuthContext();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/event?limit=20&offset=0');
      if (response.ok) {
        const data = await response.json();
        // Transform backend data to match EventCard props
        const transformedEvents = data.data?.map(event => ({
          id: event.id,
          title: event.title,
          description: event.description,
          imageUrl: event.imageUrl,
          startDate: new Date(event.startDate),
          endDate: event.endDate ? new Date(event.endDate) : undefined,
          location: event.location,
          price: event.price,
          maxAttendees: event.maxAttendees,
          attendeesCount: 0, // Would need to fetch from RSVP data
          organizer: {
            id: event.userId,
            name: 'Event Organizer', // Would need to join with user data
            profileImage: undefined
          }
        })) || [];
        setEvents(transformedEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (eventId) => {
    try {
      const response = await fetch('/api/event-rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: eventId,
          status: 'going'
        })
      });

      if (response.ok) {
        // Update local state to reflect RSVP
        setEvents(prev => prev.map(event => 
          event.id === eventId 
            ? { ...event, attendeesCount: event.attendeesCount + 1 }
            : event
        ));
      }
    } catch (error) {
      console.error('Error RSVPing to event:', error);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = !filterLocation || event.location.toLowerCase().includes(filterLocation.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view events</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-black">Tango Events</h1>
            <p className="text-[#64748B] mt-1">Discover and join tango events in your area</p>
          </div>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowCreateModal(true)}
            sx={{
              backgroundColor: '#0D448A',
              '&:hover': { backgroundColor: '#0a3570' },
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '8px',
              padding: '10px 20px',
            }}
          >
            Create Event
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextField
              fullWidth
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search className="text-gray-400 mr-2" />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
            />
            
            <TextField
              fullWidth
              placeholder="Filter by location..."
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
            />

            <FormControl fullWidth>
              <InputLabel>Event Type</InputLabel>
              <Select
                value={filterType}
                label="Event Type"
                onChange={(e) => setFilterType(e.target.value)}
                sx={{
                  borderRadius: '8px',
                }}
              >
                <MenuItem value="all">All Events</MenuItem>
                <MenuItem value="milonga">Milonga</MenuItem>
                <MenuItem value="practica">Practica</MenuItem>
                <MenuItem value="workshop">Workshop</MenuItem>
                <MenuItem value="festival">Festival</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Add className="text-6xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No events found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || filterLocation 
                ? "Try adjusting your search criteria" 
                : "Be the first to create an event in your area"}
            </p>
            <Button
              variant="contained"
              onClick={() => setShowCreateModal(true)}
              sx={{
                backgroundColor: '#0D448A',
                '&:hover': { backgroundColor: '#0a3570' },
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '8px',
              }}
            >
              Create First Event
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onRSVP={handleRSVP}
                isRSVPed={false} // Would need to check user's RSVP status
              />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {filteredEvents.length > 0 && (
          <div className="text-center mt-8">
            <Button
              variant="outlined"
              onClick={fetchEvents}
              sx={{
                borderColor: '#0D448A',
                color: '#0D448A',
                '&:hover': {
                  borderColor: '#0a3570',
                  backgroundColor: '#f5f5f5',
                },
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '8px',
                padding: '10px 30px',
              }}
            >
              Load More Events
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;