import React, { useState } from 'react';
import { Calendar, Plus, Users, Clock, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RecurringEventManager from './RecurringEventManager';
import EventDelegationPanel from './EventDelegationPanel';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  eventType: string;
  userId: number;
  isEventPage: boolean;
  allowEventPagePosts: boolean;
  currentAttendees: number;
  maxAttendees: number;
}

export default function EventsBoard({ currentUserId }: { currentUserId: number }) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRecurringManager, setShowRecurringManager] = useState(false);
  const [showDelegationPanel, setShowDelegationPanel] = useState(false);

  // Fetch user's events
  const { data: myEvents, isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events/my-events'],
  });

  const isEventOwner = (event: Event) => event.userId === currentUserId;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
          Event Management
        </h1>
        <Dialog open={showRecurringManager} onOpenChange={setShowRecurringManager}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-turquoise-400 to-cyan-500 hover:from-turquoise-500 hover:to-cyan-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Recurring Events
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <RecurringEventManager />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="my-events" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-events">My Events</TabsTrigger>
          <TabsTrigger value="recurring">Recurring Series</TabsTrigger>
          <TabsTrigger value="delegated">Delegated Events</TabsTrigger>
        </TabsList>

        <TabsContent value="my-events">
          {isLoading ? (
            <p>Loading events...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myEvents?.map((event) => (
                <Card key={event.id} className="glassmorphic-card p-4 hover:shadow-lg transition-shadow">
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg text-gray-800">{event.title}</h3>
                    <Badge className="bg-turquoise-100 text-turquoise-800">
                      {event.eventType}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(event.startDate), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {format(new Date(event.startDate), 'h:mm a')}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {event.currentAttendees} / {event.maxAttendees} attendees
                    </div>
                  </div>

                  {event.isEventPage && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Event Page: {event.allowEventPagePosts ? 'Posts allowed' : 'Posts disabled'}
                      </p>
                    </div>
                  )}

                  {isEventOwner(event) && (
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowDelegationPanel(true);
                        }}
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        Manage
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recurring">
          <div className="glassmorphic-card p-6">
            <h2 className="text-xl font-semibold mb-4">Recurring Event Series</h2>
            <p className="text-gray-600 mb-4">
              Manage your recurring events here. You can create weekly milongas, monthly workshops, or any repeating event pattern.
            </p>
            <Button
              onClick={() => setShowRecurringManager(true)}
              className="bg-gradient-to-r from-turquoise-400 to-cyan-500"
            >
              Create New Series
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="delegated">
          <div className="glassmorphic-card p-6">
            <h2 className="text-xl font-semibold mb-4">Delegated Events</h2>
            <p className="text-gray-600">
              Events where you have been assigned as an admin or moderator will appear here.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delegation Panel Dialog */}
      <Dialog open={showDelegationPanel} onOpenChange={setShowDelegationPanel}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Event Administration - {selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <EventDelegationPanel
              eventId={selectedEvent.id}
              isOwner={isEventOwner(selectedEvent)}
              currentUserId={currentUserId}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}