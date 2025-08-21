import React from 'react';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import '../../styles/ttfiles.css';

interface TTEventCardProps {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  organizer: {
    name: string;
    avatar?: string;
  };
  attendees: number;
  maxAttendees?: number;
  imageUrl?: string;
  eventType: string;
  price?: string;
  isGoing?: boolean;
  onRSVP?: (eventId: string) => void;
  onClick?: () => void;
}

const TTEventCard: React.FC<TTEventCardProps> = ({
  id,
  title,
  description,
  date,
  time,
  location,
  organizer,
  attendees,
  maxAttendees,
  imageUrl,
  eventType,
  price,
  isGoing = false,
  onRSVP,
  onClick
}) => {
  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    return { day, month };
  };

  const { day, month } = formatDate(date);

  const handleRSVP = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRSVP) {
      onRSVP(id);
    }
  };

  return (
    <div className="tt-card tt-event-card tt-fade-in" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      {/* Event Image */}
      <div className="relative">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="tt-event-card-image" />
        ) : (
          <div className="tt-event-card-image bg-gradient-to-br from-indigo-500 to-purple-600" />
        )}
        
        {/* Date Badge */}
        <div className="tt-event-card-date">
          <div className="tt-event-card-date-day">{day}</div>
          <div className="tt-event-card-date-month">{month}</div>
        </div>

        {/* Event Type Badge */}
        <div className="absolute top-4 right-4">
          <span className="tt-badge tt-badge-primary">
            {eventType}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="tt-card-body">
        <h3 className="text-xl font-bold mb-2 text-gray-900">{title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>

        {/* Event Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>{time}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-indigo-600" />
            <span className="line-clamp-1">{location}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>
              {attendees} attending
              {maxAttendees && ` • ${maxAttendees - attendees} spots left`}
            </span>
          </div>
        </div>

        {/* Organizer Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="tt-avatar tt-avatar-sm">
              {organizer.avatar ? (
                <img src={organizer.avatar} alt={organizer.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {organizer.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">{organizer.name}</div>
              <div className="text-xs text-gray-500">Organizer</div>
            </div>
          </div>

          {price && (
            <div className="text-lg font-bold tt-text-primary">
              {price === '0' || price === 'Free' ? 'Free' : `$${price}`}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="tt-card-footer">
        <button 
          className={`w-full ${isGoing ? 'tt-btn tt-btn-outline' : 'tt-btn tt-btn-primary'}`}
          onClick={handleRSVP}
        >
          {isGoing ? 'Cancel RSVP' : 'I\'m Going'}
        </button>
      </div>
    </div>
  );
};

export default TTEventCard;