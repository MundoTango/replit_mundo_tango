import React, { useState } from 'react';
import { Check, X, Edit2, Save, Users, TrendingUp, DollarSign, Settings, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Define subscription tiers
const SUBSCRIPTION_TIERS = {
  'free': { name: 'Free Tier', price: 0, color: 'bg-gray-100' },
  'basic': { name: 'Basic ($5/mo)', price: 5, color: 'bg-turquoise-100' },
  'enthusiast': { name: 'Enthusiast ($9.99/mo)', price: 9.99, color: 'bg-cyan-100' },
  'professional': { name: 'Professional ($24.99/mo)', price: 24.99, color: 'bg-blue-100' },
  'enterprise': { name: 'Enterprise ($99.99/mo)', price: 99.99, color: 'bg-purple-100' }
};

interface FeatureFlagMapping {
  flag: string;
  description: string;
  tiers: string[];
}

const SubscriptionManagement: React.FC = () => {
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [featureMappings, setFeatureMappings] = useState<FeatureFlagMapping[]>([]);

  // Fetch feature flags and their tier mappings
  const { data: flagsData, isLoading } = useQuery({
    queryKey: ['/api/admin/subscription/feature-flags'],
    enabled: true,
  });

  // Fetch subscription analytics
  const { data: analyticsData } = useQuery({
    queryKey: ['/api/admin/subscription/analytics'],
    enabled: true,
  });

  // Update feature flag tier mapping
  const updateMappingMutation = useMutation({
    mutationFn: async (data: { flag: string, tiers: string[] }) => {
      return apiRequest('PUT', '/api/admin/subscription/feature-mapping', {
        body: data
      });
    },
    onSuccess: () => {
      toast({ title: "Feature mapping updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/subscription/feature-flags'] });
      setEditMode(false);
    }
  });

  const handleTierToggle = (flagKey: string, tier: string, isEnabled: boolean) => {
    setFeatureMappings(prev => {
      const mapping = prev.find(m => m.flag === flagKey);
      if (!mapping) return prev;
      
      const newTiers = isEnabled 
        ? [...mapping.tiers, tier]
        : mapping.tiers.filter(t => t !== tier);
      
      return prev.map(m => 
        m.flag === flagKey ? { ...m, tiers: newTiers } : m
      );
    });
  };

  const saveChanges = () => {
    featureMappings.forEach(mapping => {
      updateMappingMutation.mutate({ flag: mapping.flag, tiers: mapping.tiers });
    });
  };

  React.useEffect(() => {
    if (flagsData) {
      setFeatureMappings(flagsData.mappings || []);
    }
  }, [flagsData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-turquoise-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="features" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
          <TabsTrigger value="features">Feature Mapping</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-4">
          {/* Header with Edit/Save button */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Feature Flag → Subscription Tier Mapping</h3>
            <Button
              onClick={() => editMode ? saveChanges() : setEditMode(true)}
              className="bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700"
            >
              {editMode ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Mappings
                </>
              )}
            </Button>
          </div>

          {/* Tier Legend */}
          <Card className="glassmorphic-card">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3">
                {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => (
                  <div key={key} className={`px-3 py-1 rounded-full ${tier.color} text-sm font-medium`}>
                    {tier.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Feature Flags Matrix */}
          <Card className="glassmorphic-card">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-turquoise-50 to-cyan-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-semibold">Feature Flag</th>
                      <th className="text-center p-4">Free</th>
                      <th className="text-center p-4">Basic</th>
                      <th className="text-center p-4">Enthusiast</th>
                      <th className="text-center p-4">Professional</th>
                      <th className="text-center p-4">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {featureMappings.map((mapping, index) => (
                      <tr key={mapping.flag} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {mapping.flag.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </div>
                            <div className="text-sm text-gray-500">{mapping.description}</div>
                          </div>
                        </td>
                        {Object.keys(SUBSCRIPTION_TIERS).map(tier => (
                          <td key={tier} className="text-center p-4">
                            {editMode ? (
                              <Switch
                                checked={mapping.tiers.includes(tier)}
                                onCheckedChange={(checked) => handleTierToggle(mapping.flag, tier, checked)}
                                className="mx-auto"
                              />
                            ) : (
                              <div className="flex justify-center">
                                {mapping.tiers.includes(tier) ? (
                                  <Check className="w-5 h-5 text-green-600" />
                                ) : (
                                  <X className="w-5 h-5 text-gray-300" />
                                )}
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Subscription Metrics Cards */}
            <Card className="glassmorphic-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Subscribers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {analyticsData?.totalSubscribers || 0}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  <TrendingUp className="w-4 h-4 inline text-green-500" /> +12% this month
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphic-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  ${analyticsData?.monthlyRevenue || 0}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  <DollarSign className="w-4 h-4 inline text-green-500" /> $5 ARPU
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphic-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {analyticsData?.conversionRate || 0}%
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Free → Paid conversion
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphic-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Churn Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {analyticsData?.churnRate || 0}%
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Monthly churn
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tier Distribution */}
          <Card className="glassmorphic-card">
            <CardHeader>
              <CardTitle>Subscriber Distribution by Tier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => {
                  const count = analyticsData?.tierDistribution?.[key] || 0;
                  const percentage = analyticsData?.totalSubscribers 
                    ? (count / analyticsData.totalSubscribers * 100).toFixed(1)
                    : 0;
                  
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${tier.color}`} />
                        <span className="font-medium">{tier.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-600">{count} users</span>
                        <span className="text-sm text-gray-500">({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card className="glassmorphic-card">
            <CardHeader>
              <CardTitle>Recent Subscription Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.recentActivity?.map((activity: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'upgrade' ? 'bg-green-500' :
                      activity.type === 'downgrade' ? 'bg-orange-500' :
                      activity.type === 'cancel' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{activity.userName}</div>
                      <div className="text-sm text-gray-600">
                        {activity.type === 'upgrade' && `Upgraded to ${activity.toTier}`}
                        {activity.type === 'downgrade' && `Downgraded to ${activity.toTier}`}
                        {activity.type === 'cancel' && 'Cancelled subscription'}
                        {activity.type === 'new' && `Started ${activity.tier} subscription`}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{activity.timestamp}</div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center text-gray-500 py-8">
                    <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    No recent activity
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SubscriptionManagement;