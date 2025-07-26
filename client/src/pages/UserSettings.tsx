import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Bell,
  Shield,
  Globe,
  Palette,
  Mail,
  MessageSquare,
  Calendar,
  Users,
  Lock,
  Eye,
  EyeOff,
  Volume2,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Languages,
  Save,
  RefreshCw,
  ChevronRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  eventReminders: boolean;
  newFollowerAlerts: boolean;
  messageAlerts: boolean;
  groupInvites: boolean;
  weeklyDigest: boolean;
  marketingEmails: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showLocation: boolean;
  showEmail: boolean;
  showPhone: boolean;
  allowMessagesFrom: 'everyone' | 'friends' | 'nobody';
  showActivityStatus: boolean;
  allowTagging: boolean;
  showInSearch: boolean;
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  fontSize: 'small' | 'medium' | 'large';
  reduceMotion: boolean;
}

const UserSettings: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('notifications');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/user/settings']
  });

  // Initialize local state with fetched settings
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    eventReminders: true,
    newFollowerAlerts: true,
    messageAlerts: true,
    groupInvites: true,
    weeklyDigest: false,
    marketingEmails: false
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showLocation: true,
    showEmail: false,
    showPhone: false,
    allowMessagesFrom: 'friends',
    showActivityStatus: true,
    allowTagging: true,
    showInSearch: true
  });

  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: 'light',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    fontSize: 'medium',
    reduceMotion: false
  });

  // Update local state when settings are fetched
  useEffect(() => {
    if (settings) {
      if (settings.notifications) setNotifications(settings.notifications);
      if (settings.privacy) setPrivacy(settings.privacy);
      if (settings.appearance) setAppearance(settings.appearance);
    }
  }, [settings]);

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (settingsData: any) => {
      return apiRequest('/api/user/settings', 'PUT', settingsData);
    },
    onSuccess: () => {
      toast({
        title: 'Settings saved',
        description: 'Your preferences have been updated successfully.'
      });
      setHasUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: ['/api/user/settings'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const handleSaveSettings = () => {
    saveSettingsMutation.mutate({
      notifications,
      privacy,
      appearance
    });
  };

  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handlePrivacyChange = (key: keyof PrivacySettings, value: any) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleAppearanceChange = (key: keyof AppearanceSettings, value: any) => {
    setAppearance(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
    
    // Apply theme immediately
    if (key === 'theme') {
      if (value === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-turquoise-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent mb-2">
          Settings
        </h1>
        <p className="text-gray-600">Manage your account preferences and privacy settings</p>
      </div>

      {/* Unsaved Changes Banner */}
      {hasUnsavedChanges && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800">You have unsaved changes</span>
          </div>
          <Button
            onClick={handleSaveSettings}
            disabled={saveSettingsMutation.isPending}
            className="bg-gradient-to-r from-turquoise-600 to-cyan-600 text-white"
          >
            {saveSettingsMutation.isPending ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      )}

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full mb-6">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="glassmorphic-card">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified about activity on Mundo Tango
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Notifications Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Mail className="w-5 h-5 text-turquoise-600" />
                  Email Notifications
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-all" className="flex items-center gap-2 cursor-pointer">
                      <span>All email notifications</span>
                      <Badge variant="outline" className="text-xs">Master toggle</Badge>
                    </Label>
                    <Switch
                      id="email-all"
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                    />
                  </div>

                  <div className="ml-6 space-y-3 opacity-90">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="weekly-digest" className="cursor-pointer">Weekly activity digest</Label>
                      <Switch
                        id="weekly-digest"
                        checked={notifications.weeklyDigest}
                        onCheckedChange={(checked) => handleNotificationChange('weeklyDigest', checked)}
                        disabled={!notifications.emailNotifications}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="marketing" className="cursor-pointer">Marketing and announcements</Label>
                      <Switch
                        id="marketing"
                        checked={notifications.marketingEmails}
                        onCheckedChange={(checked) => handleNotificationChange('marketingEmails', checked)}
                        disabled={!notifications.emailNotifications}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Push Notifications Section */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-turquoise-600" />
                  Push Notifications
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-all" className="cursor-pointer">Enable push notifications</Label>
                    <Switch
                      id="push-all"
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) => handleNotificationChange('pushNotifications', checked)}
                    />
                  </div>

                  <div className="ml-6 space-y-3 opacity-90">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="event-reminders" className="flex items-center gap-2 cursor-pointer">
                        <Calendar className="w-4 h-4" />
                        Event reminders
                      </Label>
                      <Switch
                        id="event-reminders"
                        checked={notifications.eventReminders}
                        onCheckedChange={(checked) => handleNotificationChange('eventReminders', checked)}
                        disabled={!notifications.pushNotifications}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="follower-alerts" className="flex items-center gap-2 cursor-pointer">
                        <Users className="w-4 h-4" />
                        New follower alerts
                      </Label>
                      <Switch
                        id="follower-alerts"
                        checked={notifications.newFollowerAlerts}
                        onCheckedChange={(checked) => handleNotificationChange('newFollowerAlerts', checked)}
                        disabled={!notifications.pushNotifications}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="message-alerts" className="flex items-center gap-2 cursor-pointer">
                        <MessageSquare className="w-4 h-4" />
                        Message notifications
                      </Label>
                      <Switch
                        id="message-alerts"
                        checked={notifications.messageAlerts}
                        onCheckedChange={(checked) => handleNotificationChange('messageAlerts', checked)}
                        disabled={!notifications.pushNotifications}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="group-invites" className="flex items-center gap-2 cursor-pointer">
                        <Users className="w-4 h-4" />
                        Group invitations
                      </Label>
                      <Switch
                        id="group-invites"
                        checked={notifications.groupInvites}
                        onCheckedChange={(checked) => handleNotificationChange('groupInvites', checked)}
                        disabled={!notifications.pushNotifications}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SMS Notifications */}
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sms" className="flex items-center gap-2 cursor-pointer">
                    <MessageSquare className="w-5 h-5 text-turquoise-600" />
                    <span>SMS notifications</span>
                    <Badge variant="secondary" className="text-xs">Premium</Badge>
                  </Label>
                  <Switch
                    id="sms"
                    checked={notifications.smsNotifications}
                    onCheckedChange={(checked) => handleNotificationChange('smsNotifications', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy">
          <Card className="glassmorphic-card">
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Control who can see your information and interact with you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Visibility */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Eye className="w-5 h-5 text-turquoise-600" />
                  Profile Visibility
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="profile-visibility">Who can see your profile</Label>
                    <Select
                      value={privacy.profileVisibility}
                      onValueChange={(value) => handlePrivacyChange('profileVisibility', value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            Everyone
                          </div>
                        </SelectItem>
                        <SelectItem value="friends">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Friends only
                          </div>
                        </SelectItem>
                        <SelectItem value="private">
                          <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Only me
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-location" className="cursor-pointer">Show my location</Label>
                    <Switch
                      id="show-location"
                      checked={privacy.showLocation}
                      onCheckedChange={(checked) => handlePrivacyChange('showLocation', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-email" className="cursor-pointer">Show my email address</Label>
                    <Switch
                      id="show-email"
                      checked={privacy.showEmail}
                      onCheckedChange={(checked) => handlePrivacyChange('showEmail', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-phone" className="cursor-pointer">Show my phone number</Label>
                    <Switch
                      id="show-phone"
                      checked={privacy.showPhone}
                      onCheckedChange={(checked) => handlePrivacyChange('showPhone', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-search" className="cursor-pointer">Appear in search results</Label>
                    <Switch
                      id="show-search"
                      checked={privacy.showInSearch}
                      onCheckedChange={(checked) => handlePrivacyChange('showInSearch', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Communication */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-turquoise-600" />
                  Communication
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="messages-from">Who can message me</Label>
                    <Select
                      value={privacy.allowMessagesFrom}
                      onValueChange={(value) => handlePrivacyChange('allowMessagesFrom', value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="everyone">Everyone</SelectItem>
                        <SelectItem value="friends">Friends only</SelectItem>
                        <SelectItem value="nobody">Nobody</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="activity-status" className="cursor-pointer">Show when I'm active</Label>
                    <Switch
                      id="activity-status"
                      checked={privacy.showActivityStatus}
                      onCheckedChange={(checked) => handlePrivacyChange('showActivityStatus', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="allow-tagging" className="cursor-pointer">Allow others to tag me</Label>
                    <Switch
                      id="allow-tagging"
                      checked={privacy.allowTagging}
                      onCheckedChange={(checked) => handlePrivacyChange('allowTagging', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card className="glassmorphic-card">
            <CardHeader>
              <CardTitle>Appearance & Display</CardTitle>
              <CardDescription>
                Customize how Mundo Tango looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Palette className="w-5 h-5 text-turquoise-600" />
                  Theme
                </h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => handleAppearanceChange('theme', 'light')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      appearance.theme === 'light'
                        ? 'border-turquoise-500 bg-turquoise-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Sun className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                    <p className="text-sm font-medium">Light</p>
                  </button>
                  
                  <button
                    onClick={() => handleAppearanceChange('theme', 'dark')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      appearance.theme === 'dark'
                        ? 'border-turquoise-500 bg-turquoise-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Moon className="w-8 h-8 mx-auto mb-2 text-gray-700" />
                    <p className="text-sm font-medium">Dark</p>
                  </button>
                  
                  <button
                    onClick={() => handleAppearanceChange('theme', 'auto')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      appearance.theme === 'auto'
                        ? 'border-turquoise-500 bg-turquoise-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Monitor className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <p className="text-sm font-medium">System</p>
                  </button>
                </div>
              </div>

              {/* Language & Region */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Languages className="w-5 h-5 text-turquoise-600" />
                  Language & Region
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={appearance.language}
                      onValueChange={(value) => handleAppearanceChange('language', value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="pt">Português</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="it">Italiano</SelectItem>
                        <SelectItem value="ja">日本語</SelectItem>
                        <SelectItem value="zh">中文</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="date-format">Date format</Label>
                    <Select
                      value={appearance.dateFormat}
                      onValueChange={(value) => handleAppearanceChange('dateFormat', value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="time-format">Time format</Label>
                    <Select
                      value={appearance.timeFormat}
                      onValueChange={(value) => handleAppearanceChange('timeFormat', value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                        <SelectItem value="24h">24-hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Accessibility */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">Accessibility</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="font-size">Font size</Label>
                    <Select
                      value={appearance.fontSize}
                      onValueChange={(value) => handleAppearanceChange('fontSize', value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="reduce-motion" className="cursor-pointer">Reduce motion</Label>
                    <Switch
                      id="reduce-motion"
                      checked={appearance.reduceMotion}
                      onCheckedChange={(checked) => handleAppearanceChange('reduceMotion', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Fixed Save Button */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-8 right-8">
          <Button
            onClick={handleSaveSettings}
            disabled={saveSettingsMutation.isPending}
            size="lg"
            className="bg-gradient-to-r from-turquoise-600 to-cyan-600 text-white shadow-lg"
          >
            {saveSettingsMutation.isPending ? (
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            Save All Changes
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserSettings;