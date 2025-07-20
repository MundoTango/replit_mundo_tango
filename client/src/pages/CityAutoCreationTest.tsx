import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { AlertCircle, CheckCircle, MapPin, Plus, Users } from 'lucide-react';

export default function CityAutoCreationTest() {
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [triggerType, setTriggerType] = useState('registration');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user ID
  const userId = 7; // Scott Boddye for testing

  // Fetch city creation stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/test/city-creation-stats'],
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  // Test city normalization
  const normalizationMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/test/city-normalization', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Normalization Result',
        description: `${data.result.normalizedCity}, ${data.result.normalizedCountry}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Normalization Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Test city auto-creation
  const autoCreationMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/test/city-auto-creation', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'City Group Created!',
        description: `${data.result.city}, ${data.result.country} group created successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/test/city-creation-stats'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Auto-Creation Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleTestNormalization = () => {
    if (!city || !country) {
      toast({
        title: 'Missing Information',
        description: 'Please enter city and country',
        variant: 'destructive',
      });
      return;
    }

    normalizationMutation.mutate({ city, country, state });
  };

  const handleTestAutoCreation = () => {
    if (!city || !country) {
      toast({
        title: 'Missing Information',
        description: 'Please enter city and country',
        variant: 'destructive',
      });
      return;
    }

    autoCreationMutation.mutate({
      city,
      country,
      state,
      userId,
      triggerType
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">City Auto-Creation Test Suite</h1>
        <p className="text-muted-foreground">Test the automatic city group creation system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Test City Creation
            </CardTitle>
            <CardDescription>
              Simulate different triggers for city group creation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., Paris"
              />
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g., France"
              />
            </div>

            <div>
              <Label htmlFor="state">State/Province (optional)</Label>
              <Input
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g., Île-de-France"
              />
            </div>

            <div>
              <Label htmlFor="trigger">Trigger Type</Label>
              <Select value={triggerType} onValueChange={setTriggerType}>
                <SelectTrigger id="trigger">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="registration">User Registration</SelectItem>
                  <SelectItem value="recommendation">Recommendation Created</SelectItem>
                  <SelectItem value="event">Event Created</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleTestNormalization}
                variant="outline"
                disabled={normalizationMutation.isPending}
              >
                Test Normalization
              </Button>
              <Button
                onClick={handleTestAutoCreation}
                disabled={autoCreationMutation.isPending}
              >
                Create City Group
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Creation Statistics
            </CardTitle>
            <CardDescription>
              Current city groups and creation history
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ) : stats ? (
              <div className="space-y-4">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total City Groups:</span>
                    <span className="font-semibold">{stats.totalCityGroups}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created Today:</span>
                    <span className="font-semibold">{stats.stats?.created_today || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created This Week:</span>
                    <span className="font-semibold">{stats.stats?.created_this_week || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created This Month:</span>
                    <span className="font-semibold">{stats.stats?.created_this_month || 0}</span>
                  </div>
                </div>

                {stats.stats?.last_created_at && (
                  <div className="text-xs text-muted-foreground">
                    Last created: {new Date(stats.stats.last_created_at).toLocaleString()}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground">No statistics available</div>
            )}
          </CardContent>
        </Card>

        {/* City Groups List */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Existing City Groups
            </CardTitle>
            <CardDescription>
              All city groups currently in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.cityGroups && stats.cityGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {stats.cityGroups.map((group: any) => (
                  <div
                    key={group.id}
                    className="border rounded-lg p-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{group.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {group.city}, {group.country}
                        </p>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>No city groups created yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}