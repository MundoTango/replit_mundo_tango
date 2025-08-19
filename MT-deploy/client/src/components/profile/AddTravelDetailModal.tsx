import React, { useState } from 'react';
import { X, Calendar, MapPin, Globe } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { LocationAutocomplete } from '@/components/ui/LocationAutocomplete';
import EventAutocomplete from '@/components/autocomplete/EventAutocomplete';
import CityGroupAutocomplete from '@/components/autocomplete/CityGroupAutocomplete';

interface AddTravelDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TravelDetailForm {
  eventName: string;
  eventType: string;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  status: 'considering' | 'planned' | 'working' | 'ongoing' | 'completed' | 'cancelled';
  notes: string;
  isPublic: boolean;
}

const eventTypes = [
  { value: 'festival', label: 'Festival' },
  { value: 'marathon', label: 'Marathon' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'conference', label: 'Conference' },
  { value: 'vacation', label: 'Vacation' },
  { value: 'competition', label: 'Competition' },
  { value: 'performance', label: 'Performance' },
  { value: 'other', label: 'Other' }
];

export const AddTravelDetailModal: React.FC<AddTravelDetailModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<TravelDetailForm>({
    eventName: '',
    eventType: '',
    city: '',
    country: '',
    startDate: '',
    endDate: '',
    status: 'planned',
    notes: '',
    isPublic: true
  });
  
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedCityGroup, setSelectedCityGroup] = useState<any>(null);

  const createTravelDetailMutation = useMutation({
    mutationFn: async (data: TravelDetailForm) => {
      return apiRequest('/api/user/travel-details', {
        method: 'POST',
        body: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/travel-details'] });
      toast({
        title: "Success",
        description: "Travel detail added successfully",
      });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add travel detail",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      eventName: '',
      eventType: '',
      city: '',
      country: '',
      startDate: '',
      endDate: '',
      status: 'planned',
      notes: '',
      isPublic: true
    });
    setSelectedEvent(null);
    setSelectedCityGroup(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTravelDetailMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof TravelDetailForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-turquoise-500" />
            Add Travel Detail
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <EventAutocomplete
                label="Event Name"
                value={selectedEvent}
                onSelect={(event) => {
                  setSelectedEvent(event);
                  if (event) {
                    handleInputChange('eventName', event.title);
                    handleInputChange('eventType', event.eventType || formData.eventType);
                    handleInputChange('city', event.city || formData.city);
                    handleInputChange('country', event.country || formData.country);
                    if (event.startDate) {
                      handleInputChange('startDate', event.startDate.split('T')[0]);
                    }
                    if (event.endDate) {
                      handleInputChange('endDate', event.endDate.split('T')[0]);
                    }
                  } else {
                    handleInputChange('eventName', '');
                  }
                }}
                placeholder="Search for an event or type a new name"
                allowCreate={true}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventType">Event Type</Label>
              <Select 
                value={formData.eventType} 
                onValueChange={(value) => handleInputChange('eventType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="location">Location</Label>
              <LocationAutocomplete
                value={formData.city && formData.country ? `${formData.city}, ${formData.country}` : ''}
                onChange={(value, details) => {
                  if (details) {
                    handleInputChange('city', details.city);
                    handleInputChange('country', details.country);
                  } else {
                    // Handle free text input
                    const parts = value.split(',').map(p => p.trim());
                    if (parts.length >= 2) {
                      handleInputChange('city', parts[0] || '');
                      handleInputChange('country', parts[parts.length - 1] || '');
                    } else {
                      handleInputChange('city', value);
                      handleInputChange('country', '');
                    }
                  }
                }}
                placeholder="Enter city, country (e.g., Buenos Aires, Argentina)"
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="pl-10"
                  required
                  min={formData.startDate}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: any) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="considering">Considering</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="working">Working</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select 
                value={formData.isPublic ? 'public' : 'private'} 
                onValueChange={(value) => handleInputChange('isPublic', value === 'public')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="close_friends">Close Friends</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional details about your travel..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createTravelDetailMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTravelDetailMutation.isPending}
              className="bg-gradient-to-r from-turquoise-400 to-cyan-500 hover:from-turquoise-500 hover:to-cyan-600"
            >
              {createTravelDetailMutation.isPending ? 'Adding...' : 'Add Travel Detail'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};