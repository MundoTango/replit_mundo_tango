import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, Save, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface EventType {
  id: number;
  name: string;
  description?: string;
  icon: string;
  color: string;
  sort_order: number;
  is_active: boolean;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export const EventTypesManager: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const queryClient = useQueryClient();

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'Calendar',
    color: '#6366F1',
    sort_order: 0
  });

  // Fetch event types
  const { data: eventTypes = [], isLoading } = useQuery({
    queryKey: ['/api/admin/event-types', showInactive],
    queryFn: async () => {
      const response = await apiRequest(`/api/admin/event-types?includeInactive=${showInactive}`);
      return response.data;
    }
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest('/api/admin/event-types', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/event-types'] });
      toast({
        title: 'Success',
        description: 'Event type created successfully'
      });
      setIsCreating(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create event type',
        variant: 'destructive'
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<EventType> }) => {
      return await apiRequest(`/api/admin/event-types/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/event-types'] });
      toast({
        title: 'Success',
        description: 'Event type updated successfully'
      });
      setEditingId(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update event type',
        variant: 'destructive'
      });
    }
  });

  // Delete/Deactivate mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/admin/event-types/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/event-types'] });
      toast({
        title: 'Success',
        description: 'Event type deactivated successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to deactivate event type',
        variant: 'destructive'
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: 'Calendar',
      color: '#6366F1',
      sort_order: 0
    });
  };

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const handleUpdate = (id: number) => {
    updateMutation.mutate({ id, data: formData });
  };

  const handleEdit = (eventType: EventType) => {
    setEditingId(eventType.id);
    setFormData({
      name: eventType.name,
      description: eventType.description || '',
      icon: eventType.icon,
      color: eventType.color,
      sort_order: eventType.sort_order
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  const handleSortOrderChange = (id: number, direction: 'up' | 'down') => {
    const currentIndex = eventTypes.findIndex((et: EventType) => et.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === eventTypes.length - 1)
    ) {
      return;
    }

    const newSortOrder = direction === 'up' 
      ? eventTypes[currentIndex - 1].sort_order 
      : eventTypes[currentIndex + 1].sort_order;

    updateMutation.mutate({
      id,
      data: { sort_order: newSortOrder }
    });
  };

  // Icon options
  const iconOptions = [
    'Calendar', 'Music', 'Users', 'Star', 'Heart', 'Trophy',
    'Book', 'MapPin', 'Globe', 'Zap', 'Gift', 'Award'
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading event types...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Event Types Management</h2>
          <p className="text-gray-600 mt-1">
            Manage event types for your platform. Super admin can create, edit, and deactivate event types.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">Show inactive</span>
          </label>
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Event Type
            </button>
          )}
        </div>
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-indigo-500">
          <h3 className="text-lg font-semibold mb-4">Create New Event Type</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Workshop"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icon
              </label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                {iconOptions.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-10 px-1 py-1 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort Order
              </label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                rows={2}
                placeholder="Brief description of this event type"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => {
                setIsCreating(false);
                resetForm();
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!formData.name || createMutation.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Create
            </button>
          </div>
        </div>
      )}

      {/* Event Types List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                System
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {eventTypes.map((eventType: EventType) => (
              <tr key={eventType.id} className={!eventType.is_active ? 'opacity-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSortOrderChange(eventType.id, 'up')}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      disabled={eventType.id === eventTypes[0]?.id}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleSortOrderChange(eventType.id, 'down')}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      disabled={eventType.id === eventTypes[eventTypes.length - 1]?.id}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === eventType.id ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="px-2 py-1 border border-gray-300 rounded"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: eventType.color }}
                      >
                        <Calendar className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium">{eventType.name}</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === eventType.id ? (
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                      rows={1}
                    />
                  ) : (
                    <span className="text-sm text-gray-600">
                      {eventType.description || '-'}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    eventType.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {eventType.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    eventType.is_system 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {eventType.is_system ? 'System' : 'Custom'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {editingId === eventType.id ? (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleUpdate(eventType.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(eventType)}
                        className="text-indigo-600 hover:text-indigo-900"
                        disabled={eventType.is_system}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {!eventType.is_system && eventType.is_active && (
                        <button
                          onClick={() => deleteMutation.mutate(eventType.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {eventTypes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No event types found. Create your first event type above.
          </div>
        )}
      </div>
    </div>
  );
};