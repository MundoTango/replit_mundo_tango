"use client";
import React from 'react';
import { Avatar, Button } from '@mui/material';
import { CalendarToday, LocationOn, Person } from '@mui/icons-material';
import { format } from 'date-fns';

interface EventCardProps {
  event: {
    id: number;
    title: string;
    description: string;
    imageUrl?: string;
    startDate: Date;
    endDate?: Date;
    location: string;
    price?: number;
    maxAttendees?: number;
    attendeesCount: number;
    organizer: {
      id: number;
      name: string;
      profileImage?: string;
    };
  };
  onRSVP?: (eventId: number) => void;
  isRSVPed?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, onRSVP, isRSVPed = false }) => {
  return (
    <div className="bg-white rounded-[12px] shadow-md overflow-hidden mb-4">
      {/* Event Image */}
      <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-500">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#8E142E] to-[#0D448A] flex items-center justify-center">
            <CalendarToday className="text-white text-4xl" />
          </div>
        )}
        
        {/* Price Tag */}
        {event.price && (
          <div className="absolute top-3 right-3 bg-[#8E142E] text-white px-3 py-1 rounded-full text-sm font-semibold">
            ${event.price}
          </div>
        )}
      </div>

      {/* Event Content */}
      <div className="p-4">
        {/* Event Title */}
        <h3 className="text-xl font-bold text-black mb-2 line-clamp-2">
          {event.title}
        </h3>

        {/* Event Description */}
        <p className="text-[#64748B] text-sm mb-3 line-clamp-3">
          {event.description}
        </p>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          {/* Date */}
          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <CalendarToday className="text-[#0D448A] text-lg" />
            <span>
              {format(event.startDate, 'MMM dd, yyyy')}
              {event.endDate && format(event.startDate, 'yyyy-MM-dd') !== format(event.endDate, 'yyyy-MM-dd') && (
                <> - {format(event.endDate, 'MMM dd, yyyy')}</>
              )}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <LocationOn className="text-[#0D448A] text-lg" />
            <span className="line-clamp-1">{event.location}</span>
          </div>

          {/* Attendees */}
          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <Person className="text-[#0D448A] text-lg" />
            <span>
              {event.attendeesCount} attending
              {event.maxAttendees && ` (${event.maxAttendees} max)`}
            </span>
          </div>
        </div>

        {/* Organizer and RSVP */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar
              src={event.organizer.profileImage}
              alt={event.organizer.name}
              sx={{ width: 32, height: 32 }}
            >
              {event.organizer.name.charAt(0)}
            </Avatar>
            <span className="text-sm text-[#64748B]">
              by {event.organizer.name}
            </span>
          </div>

          <Button
            variant={isRSVPed ? "outlined" : "contained"}
            size="small"
            onClick={() => onRSVP?.(event.id)}
            sx={{
              backgroundColor: isRSVPed ? 'transparent' : '#0D448A',
              color: isRSVPed ? '#0D448A' : 'white',
              borderColor: '#0D448A',
              '&:hover': {
                backgroundColor: isRSVPed ? '#f5f5f5' : '#0a3570',
              },
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '8px',
              padding: '6px 16px',
            }}
          >
            {isRSVPed ? 'Going' : 'RSVP'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;