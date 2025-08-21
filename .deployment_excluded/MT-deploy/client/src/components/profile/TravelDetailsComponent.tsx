import React, { useState } from 'react';
import { Calendar, MapPin, Globe, Edit2, Trash2, Plus, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { AddTravelDetailModal } from './AddTravelDetailModal';
import { EditTravelDetailModal } from './EditTravelDetailModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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

interface TravelDetailsComponentProps {
  userId: number;
  isOwnProfile: boolean;
}

export const TravelDetailsComponent: React.FC<TravelDetailsComponentProps> = ({ userId, isOwnProfile }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTravel, setEditingTravel] = useState<TravelDetail | null>(null);
  const [deletingTravelId, setDeletingTravelId] = useState<number | null>(null);

  // Fetch travel details
  const { data: travelDetails, isLoading } = useQuery({
    queryKey: isOwnProfile ? ['/api/user/travel-details'] : [`/api/user/travel-details/${userId}`],
    queryFn: async () => {
      const endpoint = isOwnProfile ? '/api/user/travel-details' : `/api/user/travel-details/${userId}`;
      const response = await fetch(endpoint, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch travel details');
      const result = await response.json();
      return result.data || [];
    },
    enabled: !!userId
  });

  // Delete travel detail mutation
  const deleteTravelDetailMutation = useMutation({
    mutationFn: async (travelId: number) => {
      const response = await apiRequest(`/api/user/travel-details/${travelId}`, {
        method: 'DELETE'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/travel-details'] });
      toast({
        title: "Success",
        description: "Travel detail deleted successfully",
      });
      setDeletingTravelId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete travel detail",
        variant: "destructive",
      });
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'considering':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'planned':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'working':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'ongoing':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'completed':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getEventTypeIcon = (eventType?: string) => {
    switch (eventType) {
      case 'festival':
        return '🎉';
      case 'marathon':
        return '🏃';
      case 'workshop':
        return '📚';
      case 'conference':
        return '🎤';
      case 'vacation':
        return '🏖️';
      case 'competition':
        return '🏆';
      case 'performance':
        return '🎭';
      default:
        return '📍';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-turquoise-500"></div>
      </div>
    );
  }

  const upcomingTravels = travelDetails?.filter((t: TravelDetail) => 
    t.status === 'planned' || t.status === 'ongoing'
  ).sort((a: TravelDetail, b: TravelDetail) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const pastTravels = travelDetails?.filter((t: TravelDetail) => 
    t.status === 'completed'
  ).sort((a: TravelDetail, b: TravelDetail) => 
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Globe className="w-5 h-5 text-turquoise-500" />
          Travel Details
        </h3>
        {isOwnProfile && (
          <Button
            onClick={() => setShowAddModal(true)}
            size="sm"
            className="bg-gradient-to-r from-turquoise-400 to-cyan-500 hover:from-turquoise-500 hover:to-cyan-600"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Travel
          </Button>
        )}
      </div>

      {/* No travel details message */}
      {(!travelDetails || travelDetails.length === 0) && (
        <Card className="p-8 text-center border-dashed glassmorphic-card">
          <Globe className="w-12 h-12 mx-auto mb-4 text-turquoise-500" />
          <p className="text-gray-600 mb-4">
            {isOwnProfile ? "You haven't added any travel details yet." : "No travel details available."}
          </p>
          {isOwnProfile && (
            <Button
              onClick={() => setShowAddModal(true)}
              variant="outline"
              className="border-turquoise-300 hover:bg-turquoise-50 dark:hover:bg-turquoise-900/20"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Your First Travel
            </Button>
          )}
        </Card>
      )}

      {/* Upcoming Travels */}
      {upcomingTravels && upcomingTravels.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700 dark:text-gray-300">Upcoming & Ongoing</h4>
          <div className="grid gap-4">
            {upcomingTravels.map((travel: TravelDetail) => (
              <TravelCard
                key={travel.id}
                travel={travel}
                isOwnProfile={isOwnProfile}
                onEdit={() => setEditingTravel(travel)}
                onDelete={() => setDeletingTravelId(travel.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past Travels */}
      {pastTravels && pastTravels.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700 dark:text-gray-300">Past Travels</h4>
          <div className="grid gap-4">
            {pastTravels.map((travel: TravelDetail) => (
              <TravelCard
                key={travel.id}
                travel={travel}
                isOwnProfile={isOwnProfile}
                onEdit={() => setEditingTravel(travel)}
                onDelete={() => setDeletingTravelId(travel.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddTravelDetailModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editingTravel && (
        <EditTravelDetailModal
          isOpen={!!editingTravel}
          onClose={() => setEditingTravel(null)}
          travelDetail={editingTravel}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingTravelId} onOpenChange={() => setDeletingTravelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Travel Detail?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your travel detail.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingTravelId && deleteTravelDetailMutation.mutate(deletingTravelId)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Travel Card Component
interface TravelCardProps {
  travel: TravelDetail;
  isOwnProfile: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const TravelCard: React.FC<TravelCardProps> = ({ travel, isOwnProfile, onEdit, onDelete }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'considering':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'planned':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'working':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'ongoing':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'completed':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getEventTypeIcon = (eventType?: string) => {
    switch (eventType) {
      case 'festival':
        return '🎉';
      case 'marathon':
        return '🏃';
      case 'workshop':
        return '📚';
      case 'conference':
        return '🎤';
      case 'vacation':
        return '🏖️';
      case 'competition':
        return '🏆';
      case 'performance':
        return '🎭';
      default:
        return '📍';
    }
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow glassmorphic-card beautiful-hover">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          {/* Event Name and Type */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getEventTypeIcon(travel.eventType)}</span>
            <div>
              {travel.eventName && (
                <h5 className="font-medium text-gray-900 dark:text-gray-100">
                  {travel.eventName}
                </h5>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-3 h-3" />
                <span>{travel.city}{travel.country ? `, ${travel.country}` : ''}</span>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(travel.startDate)}</span>
            </div>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(travel.endDate)}</span>
            </div>
          </div>

          {/* Notes */}
          {travel.notes && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {travel.notes}
            </p>
          )}

          {/* Status and Visibility */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={getStatusColor(travel.status)}>
              {travel.status}
            </Badge>
            {!travel.isPublic && (
              <Badge variant="outline" className="text-xs">
                Private
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        {isOwnProfile && (
          <div className="flex items-center gap-1 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-8 w-8 p-0"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};