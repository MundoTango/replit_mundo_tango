import React, { useState, useEffect } from 'react';
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

interface EditTravelDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  travelDetail: TravelDetail;
}

interface TravelDetail {
  id: number;
  userId: number;
  eventName?: string;
  eventType?: string;
  city: string;
  country?: string;
  startDate: string;
  endDate: string;
  status: 'considering' | 'planned' | 'working' | 'ongoing' | 'completed' | 'cancelled';
  notes?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
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

export const EditTravelDetailModal: React.FC<EditTravelDetailModalProps> = ({ isOpen, onClose, travelDetail }) => {
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

  // Initialize form data when travel detail changes
  useEffect(() => {
    if (travelDetail) {
      setFormData({
        eventName: travelDetail.eventName || '',
        eventType: travelDetail.eventType || '',
        city: travelDetail.city || '',
        country: travelDetail.country || '',
        startDate: travelDetail.startDate ? new Date(travelDetail.startDate).toISOString().split('T')[0] : '',
        endDate: travelDetail.endDate ? new Date(travelDetail.endDate).toISOString().split('T')[0] : '',
        status: travelDetail.status || 'planned',
        notes: travelDetail.notes || '',
        isPublic: travelDetail.isPublic !== false
      });
    }
  }, [travelDetail]);

  const updateTravelDetailMutation = useMutation({
    mutationFn: async (data: TravelDetailForm) => {
      return apiRequest('PUT', `/api/user/travel-details/${travelDetail.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/travel-details'] });
      toast({
        title: "Success",
        description: "Travel detail updated successfully",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update travel detail",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTravelDetailMutation.mutate(formData);
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
            Edit Travel Detail
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventName">Event Name</Label>
              <Input
                id="eventName"
                value={formData.eventName}
                onChange={(e) => handleInputChange('eventName', e.target.value)}
                placeholder="e.g., Buenos Aires Tango Festival"
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
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="e.g., Buenos Aires"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                placeholder="e.g., Argentina"
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
              disabled={updateTravelDetailMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateTravelDetailMutation.isPending}
              className="bg-gradient-to-r from-turquoise-400 to-cyan-500 hover:from-turquoise-500 hover:to-cyan-600"
            >
              {updateTravelDetailMutation.isPending ? 'Updating...' : 'Update Travel Detail'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};