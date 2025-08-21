import React, { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Plus, Search } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { format } from 'date-fns';

interface Event {
  id: number;
  title: string;
  startDate: string;
  endDate?: string;
  location?: string;
  city?: string;
  country?: string;
  eventType?: string;
  currentAttendees?: number;
  maxAttendees?: number;
}

interface EventAutocompleteProps {
  value?: Event | null;
  onSelect: (event: Event | null) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  allowCreate?: boolean;
  onCreateNew?: () => void;
}

export default function EventAutocomplete({
  value,
  onSelect,
  placeholder = "Search for an event...",
  label = "Event",
  required = false,
  allowCreate = true,
  onCreateNew
}: EventAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [inputValue, setInputValue] = useState(value?.title || '');
  
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Update input when value changes externally
  useEffect(() => {
    setInputValue(value?.title || '');
  }, [value]);

  // Search events API
  const { data: events, isLoading } = useQuery({
    queryKey: ['/api/events/enhanced', { search: debouncedSearch }],
    queryFn: async () => {
      if (!debouncedSearch || debouncedSearch.length < 2) return [];
      
      const params = new URLSearchParams({
        search: debouncedSearch,
        limit: '10'
      });
      
      const response = await fetch(`/api/events/enhanced?${params}`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to search events');
      const result = await response.json();
      return result.data || [];
    },
    enabled: debouncedSearch.length >= 2 && isOpen
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSearchTerm(value);
    setIsOpen(true);
    
    // Clear selection if input is cleared
    if (!value) {
      onSelect(null);
    }
  };

  const handleSelectEvent = (event: Event) => {
    setInputValue(event.title);
    onSelect(event);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCreateNew = () => {
    setIsOpen(false);
    if (onCreateNew) {
      onCreateNew();
    }
  };

  const formatEventDate = (date: string) => {
    try {
      return format(new Date(date), 'MMM d, yyyy');
    } catch {
      return date;
    }
  };

  const getEventTypeEmoji = (type?: string) => {
    switch (type) {
      case 'milonga': return '💃';
      case 'practica': return '🎯';
      case 'workshop': return '📚';
      case 'festival': return '🎪';
      case 'concert': return '🎵';
      default: return '🗓️';
    }
  };

  return (
    <div className="relative">
      {label && (
        <Label htmlFor="event-search" className="mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          id="event-search"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          className="pl-10"
          required={required}
        />
      </div>

      {/* Selected event display */}
      {value && (
        <div className="mt-2 p-3 bg-turquoise-50 dark:bg-turquoise-900/20 rounded-lg border border-turquoise-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">{getEventTypeEmoji(value.eventType)}</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{value.title}</span>
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatEventDate(value.startDate)}</span>
                </div>
                {value.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{value.city}{value.country ? `, ${value.country}` : ''}</span>
                  </div>
                )}
                {value.currentAttendees !== undefined && (
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{value.currentAttendees} going</span>
                  </div>
                )}
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onSelect(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <Card className="absolute z-50 w-full mt-1 max-h-80 overflow-auto shadow-lg">
          {isLoading && (
            <div className="p-4 text-center text-gray-500">
              Searching events...
            </div>
          )}

          {!isLoading && events && events.length > 0 && (
            <div className="py-1">
              {events.map((event: Event) => (
                <button
                  key={event.id}
                  onClick={() => handleSelectEvent(event)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">{getEventTypeEmoji(event.eventType)}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {event.title}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatEventDate(event.startDate)}</span>
                        </div>
                        {event.city && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{event.city}</span>
                          </div>
                        )}
                        {event.currentAttendees !== undefined && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{event.currentAttendees}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!isLoading && debouncedSearch && (!events || events.length === 0) && (
            <div className="p-4">
              <p className="text-center text-gray-500 mb-3">
                No events found matching "{debouncedSearch}"
              </p>
              {allowCreate && (
                <Button
                  onClick={handleCreateNew}
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Event
                </Button>
              )}
            </div>
          )}

          {!isLoading && !debouncedSearch && (
            <div className="p-4 text-center text-gray-500">
              Type to search for events
            </div>
          )}
        </Card>
      )}
    </div>
  );
}