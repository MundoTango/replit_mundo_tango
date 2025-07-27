import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Grid, List } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Event {
  id: number;
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  imageUrl?: string;
  eventType?: string;
  level?: string;
  price?: string;
  currency?: string;
  isVirtual?: boolean;
  isRecurring?: boolean;
  user?: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
}

interface EventsCalendarProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
  onDateClick?: (date: Date) => void;
}

export default function EventsCalendar({ events, onEventClick, onDateClick }: EventsCalendarProps) {
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  // Transform events to FullCalendar format
  const calendarEvents = events.map(event => ({
    id: event.id.toString(),
    title: event.title,
    start: event.startDate,
    end: event.endDate || event.startDate,
    extendedProps: event,
    className: getEventClassName(event),
    backgroundColor: getEventColor(event),
    borderColor: getEventColor(event),
  }));

  function getEventClassName(event: Event) {
    const classes = ['cursor-pointer', 'transition-all', 'hover:opacity-90'];
    if (event.isVirtual) classes.push('virtual-event');
    if (event.isRecurring) classes.push('recurring-event');
    return classes.join(' ');
  }

  function getEventColor(event: Event) {
    switch (event.eventType) {
      case 'milonga': return '#38b2ac'; // turquoise
      case 'workshop': return '#06b6d4'; // cyan
      case 'festival': return '#3182ce'; // blue
      case 'class': return '#10b981'; // emerald
      case 'performance': return '#8b5cf6'; // violet
      case 'practica': return '#ec4899'; // pink
      case 'marathon': return '#f59e0b'; // amber
      default: return '#6b7280'; // gray
    }
  }

  const handleEventClick = (clickInfo: any) => {
    const event = clickInfo.event.extendedProps as Event;
    setSelectedEvent(event);
    if (onEventClick) {
      onEventClick(event);
    }
  };

  const handleDateClick = (dateClickInfo: any) => {
    if (onDateClick) {
      onDateClick(dateClickInfo.date);
    }
  };

  return (
    <Card className="glassmorphic-card">
      <CardContent className="p-6">
        {/* View Toggle */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
            Events Calendar
          </h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={view === 'month' ? 'default' : 'outline'}
              onClick={() => setView('month')}
              className={view === 'month' ? 'bg-gradient-to-r from-turquoise-500 to-cyan-600' : ''}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Month
            </Button>
            <Button
              size="sm"
              variant={view === 'week' ? 'default' : 'outline'}
              onClick={() => setView('week')}
              className={view === 'week' ? 'bg-gradient-to-r from-turquoise-500 to-cyan-600' : ''}
            >
              <Grid className="h-4 w-4 mr-1" />
              Week
            </Button>
            <Button
              size="sm"
              variant={view === 'day' ? 'default' : 'outline'}
              onClick={() => setView('day')}
              className={view === 'day' ? 'bg-gradient-to-r from-turquoise-500 to-cyan-600' : ''}
            >
              <List className="h-4 w-4 mr-1" />
              Day
            </Button>
          </div>
        </div>

        {/* Calendar */}
        <div className="calendar-wrapper">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={view === 'month' ? 'dayGridMonth' : view === 'week' ? 'timeGridWeek' : 'timeGridDay'}
            events={calendarEvents}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: '',
            }}
            height="auto"
            eventDisplay="block"
            dayMaxEvents={3}
            moreLinkText="more"
            eventTimeFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: 'short'
            }}
            slotMinTime="06:00:00"
            slotMaxTime="24:00:00"
            slotDuration="00:30:00"
            eventMouseEnter={(info) => {
              info.el.style.transform = 'scale(1.05)';
              info.el.style.zIndex = '10';
            }}
            eventMouseLeave={(info) => {
              info.el.style.transform = 'scale(1)';
              info.el.style.zIndex = '1';
            }}
          />
        </div>

        {/* Event Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Event Types</h4>
          <div className="flex flex-wrap gap-2">
            {[
              { type: 'milonga', color: '#38b2ac', label: 'Milonga' },
              { type: 'workshop', color: '#06b6d4', label: 'Workshop' },
              { type: 'festival', color: '#3182ce', label: 'Festival' },
              { type: 'class', color: '#10b981', label: 'Class' },
              { type: 'performance', color: '#8b5cf6', label: 'Performance' },
              { type: 'practica', color: '#ec4899', label: 'Práctica' },
              { type: 'marathon', color: '#f59e0b', label: 'Marathon' },
            ].map(({ type, color, label }) => (
              <div key={type} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-gray-600">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      {/* Event Quick View Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
                {selectedEvent?.title}
              </span>
              {selectedEvent?.isVirtual && (
                <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full">
                  Virtual
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4">
              {selectedEvent.imageUrl && (
                <img 
                  src={selectedEvent.imageUrl} 
                  alt={selectedEvent.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600">{selectedEvent.description}</p>
                
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{format(new Date(selectedEvent.startDate), 'PPP p')}</span>
                </div>
                
                {selectedEvent.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">📍</span>
                    <span>{selectedEvent.location}</span>
                  </div>
                )}
                
                {selectedEvent.price && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">💵</span>
                    <span>{selectedEvent.currency} {selectedEvent.price}</span>
                  </div>
                )}
              </div>
              
              <Button 
                className="w-full bg-gradient-to-r from-turquoise-500 to-cyan-600"
                onClick={() => {
                  window.location.href = `/events/${selectedEvent.id}`;
                }}
              >
                View Full Details
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}