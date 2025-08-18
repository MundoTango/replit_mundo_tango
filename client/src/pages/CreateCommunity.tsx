import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { 
  Users, 
  Globe, 
  Lock, 
  MapPin, 
  Calendar,
  Music,
  Code,
  Star
} from 'lucide-react';

interface CommunityFormData {
  name: string;
  description: string;
  type: string;
  visibility: 'public' | 'private';
  requireApproval: boolean;
  city?: string;
  country?: string;
  rules?: string;
  categories: string[];
}

const COMMUNITY_TYPES = [
  { value: 'city', label: 'City Group', icon: MapPin },
  { value: 'practice', label: 'Practice Group', icon: Code },
  { value: 'professional', label: 'Professional Network', icon: Users },
  { value: 'music', label: 'Music & DJs', icon: Music },
  { value: 'festival', label: 'Festival', icon: Calendar },
  { value: 'special', label: 'Special Interest', icon: Star }
];

const CATEGORIES = [
  'Milonga',
  'Práctica',
  'Classes',
  'Workshops',
  'Social Events',
  'Performances',
  'Music',
  'Travel',
  'Online Events'
];

export default function CreateCommunity() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState<CommunityFormData>({
    name: '',
    description: '',
    type: 'city',
    visibility: 'public',
    requireApproval: false,
    city: '',
    country: '',
    rules: '',
    categories: []
  });

  const createCommunityMutation = useMutation({
    mutationFn: async (data: CommunityFormData) => {
      const response = await apiRequest('/api/groups', {
        method: 'POST',
        body: data
      });
      if (!response.ok) throw new Error('Failed to create community');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Community Created!',
        description: 'Your community has been created successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
      setLocation(`/groups/${data.slug}`);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create community. Please try again.',
        variant: 'destructive',
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    createCommunityMutation.mutate(formData);
  };

  const toggleCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="glassmorphic-card">
          <CardHeader className="bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent">
              Create a New Community
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                
                <div>
                  <Label htmlFor="name">Community Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Buenos Aires Tango Community"
                    className="glassmorphic-input"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Community Type *</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger className="glassmorphic-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMUNITY_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your community's purpose and what makes it unique..."
                    className="glassmorphic-input min-h-[120px]"
                    required
                  />
                </div>
              </div>

              {/* Location (for city groups) */}
              {formData.type === 'city' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Location</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Buenos Aires"
                        className="glassmorphic-input"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        placeholder="Argentina"
                        className="glassmorphic-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Categories */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Event Categories</h3>
                <p className="text-sm text-gray-600">Select the types of events your community will host</p>
                
                <div className="grid grid-cols-3 gap-3">
                  {CATEGORIES.map(category => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.categories.includes(category)
                          ? 'border-turquoise-500 bg-turquoise-50 text-turquoise-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Privacy Settings</h3>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {formData.visibility === 'public' ? (
                      <Globe className="w-5 h-5 text-turquoise-600" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-600" />
                    )}
                    <Label htmlFor="visibility" className="cursor-pointer">
                      {formData.visibility === 'public' ? 'Public Community' : 'Private Community'}
                    </Label>
                  </div>
                  <Switch
                    id="visibility"
                    checked={formData.visibility === 'private'}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, visibility: checked ? 'private' : 'public' })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="approval" className="cursor-pointer">
                    Require approval to join
                  </Label>
                  <Switch
                    id="approval"
                    checked={formData.requireApproval}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, requireApproval: checked })
                    }
                  />
                </div>
              </div>

              {/* Community Rules */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Community Rules (Optional)</h3>
                <Textarea
                  value={formData.rules}
                  onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                  placeholder="Add any specific rules or guidelines for your community members..."
                  className="glassmorphic-input min-h-[100px]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={createCommunityMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-turquoise-600 to-cyan-600 hover:from-turquoise-700 hover:to-cyan-700 text-white"
                >
                  {createCommunityMutation.isPending ? 'Creating...' : 'Create Community'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation('/groups')}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}