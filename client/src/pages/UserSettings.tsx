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
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  CheckCircle,
  Settings2,
  Accessibility,
  Download,
  Upload,
  Search,
  Info,
  Zap,
  Wifi,
  HardDrive,
  Terminal,
  Webhook,
  FileText,
  Tag,
  Database,
  Cloud,
  AlertTriangle,
  RotateCcw,
  CheckCircle2
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
  mentionAlerts: boolean;
  replyNotifications: boolean;
  systemUpdates: boolean;
  securityAlerts: boolean;
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
  shareAnalytics: boolean;
  dataExportEnabled: boolean;
  thirdPartySharing: boolean;
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  fontSize: 'small' | 'medium' | 'large';
  reduceMotion: boolean;
  colorScheme: string;
  compactMode: boolean;
  showAnimations: boolean;
  customAccentColor: string | null;
}

interface AdvancedSettings {
  developerMode: boolean;
  betaFeatures: boolean;
  performanceMode: 'balanced' | 'power-saver' | 'high-performance';
  cacheSize: 'small' | 'medium' | 'large';
  offlineMode: boolean;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'manual';
  exportFormat: 'json' | 'csv' | 'xml';
  apiAccess: boolean;
  webhooksEnabled: boolean;
}

interface AccessibilitySettings {
  screenReaderOptimized: boolean;
  highContrast: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  altTextMode: 'basic' | 'enhanced' | 'detailed';
  audioDescriptions: boolean;
  captionsEnabled: boolean;
}

interface UserSettingsResponse {
  id?: number;
  user_id?: number;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  appearance: AppearanceSettings;
  advanced: AdvancedSettings;
  accessibility: AccessibilitySettings;
  created_at?: string;
  updated_at?: string;
}

const UserSettings: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('notifications');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch current settings
  const { data: settings, isLoading, error } = useQuery<UserSettingsResponse>({
    queryKey: ['/api/user/settings']
  });

  // Debug logging for Life CEO 41x21s methodology
  useEffect(() => {
    console.log('Settings Query State:', { isLoading, error, settings });
  }, [isLoading, error, settings]);

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
    marketingEmails: false,
    mentionAlerts: true,
    replyNotifications: true,
    systemUpdates: true,
    securityAlerts: true
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showLocation: true,
    showEmail: false,
    showPhone: false,
    allowMessagesFrom: 'friends',
    showActivityStatus: true,
    allowTagging: true,
    showInSearch: true,
    shareAnalytics: false,
    dataExportEnabled: true,
    thirdPartySharing: false
  });

  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: 'light',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    fontSize: 'medium',
    reduceMotion: false,
    colorScheme: 'ocean',
    compactMode: false,
    showAnimations: true,
    customAccentColor: null
  });

  const [advanced, setAdvanced] = useState<AdvancedSettings>({
    developerMode: false,
    betaFeatures: false,
    performanceMode: 'balanced',
    cacheSize: 'medium',
    offlineMode: false,
    syncFrequency: 'realtime',
    exportFormat: 'json',
    apiAccess: false,
    webhooksEnabled: false
  });

  const [accessibility, setAccessibility] = useState<AccessibilitySettings>({
    screenReaderOptimized: false,
    highContrast: false,
    keyboardNavigation: true,
    focusIndicators: true,
    altTextMode: 'basic',
    audioDescriptions: false,
    captionsEnabled: false
  });

  // Update local state when settings are fetched
  useEffect(() => {
    if (settings) {
      if (settings.notifications) setNotifications(settings.notifications);
      if (settings.privacy) setPrivacy(settings.privacy);
      if (settings.appearance) setAppearance(settings.appearance);
      if (settings.advanced) setAdvanced(settings.advanced);
      if (settings.accessibility) setAccessibility(settings.accessibility);
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
      appearance,
      advanced,
      accessibility
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

  const handleAdvancedChange = (key: keyof AdvancedSettings, value: any) => {
    setAdvanced(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleAccessibilityChange = (key: keyof AccessibilitySettings, value: any) => {
    setAccessibility(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  // Export settings functionality
  const handleExportSettings = () => {
    const allSettings = {
      notifications,
      privacy,
      appearance,
      advanced,
      accessibility,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(allSettings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mundo-tango-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Settings exported',
      description: 'Your settings have been downloaded as a JSON file.'
    });
  };

  // Import settings functionality
  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        
        if (importedSettings.notifications) setNotifications(importedSettings.notifications);
        if (importedSettings.privacy) setPrivacy(importedSettings.privacy);
        if (importedSettings.appearance) setAppearance(importedSettings.appearance);
        if (importedSettings.advanced) setAdvanced(importedSettings.advanced);
        if (importedSettings.accessibility) setAccessibility(importedSettings.accessibility);
        
        setHasUnsavedChanges(true);
        
        toast({
          title: 'Settings imported',
          description: 'Your settings have been loaded. Remember to save them.'
        });
      } catch (error) {
        toast({
          title: 'Import failed',
          description: 'The file could not be imported. Please check the format.',
          variant: 'destructive'
        });
      }
    };
    reader.readAsText(file);
  };

  // Search functionality for settings
  const filteredSettings = (category: string) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const categoryData = {
      notifications,
      privacy,
      appearance,
      advanced,
      accessibility
    }[category];
    
    if (!categoryData) return false;
    
    const categoryText = JSON.stringify(categoryData).toLowerCase();
    return categoryText.includes(query) || category.toLowerCase().includes(query);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-turquoise-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-gray-600">Manage your account preferences and privacy settings</p>
        </div>

      {/* Search and Actions Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search settings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 glassmorphic-input"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportSettings}
            className="flex items-center gap-2 hover:bg-turquoise-50 hover:border-turquoise-300 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <label>
            <Button
              variant="outline"
              className="flex items-center gap-2 hover:bg-turquoise-50 hover:border-turquoise-300 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Import
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={handleImportSettings}
              className="hidden"
            />
          </label>
          <Button
            variant="outline"
            onClick={() => {
              if (confirm('Are you sure you want to reset all settings to default?')) {
                window.location.reload();
              }
            }}
            className="flex items-center gap-2 hover:bg-red-50 hover:border-red-300 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
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
        <TabsList className="grid grid-cols-5 w-full mb-6 bg-white/80 backdrop-blur-xl border border-white/50 shadow-lg">
          <TabsTrigger value="notifications" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-turquoise-50 data-[state=active]:to-cyan-50" disabled={!filteredSettings('notifications')}>
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-turquoise-50 data-[state=active]:to-cyan-50" disabled={!filteredSettings('privacy')}>
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-turquoise-50 data-[state=active]:to-cyan-50" disabled={!filteredSettings('appearance')}>
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-turquoise-50 data-[state=active]:to-cyan-50" disabled={!filteredSettings('advanced')}>
            <Settings2 className="w-4 h-4" />
            <span className="hidden sm:inline">Advanced</span>
          </TabsTrigger>
          <TabsTrigger value="accessibility" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-turquoise-50 data-[state=active]:to-cyan-50" disabled={!filteredSettings('accessibility')}>
            <Accessibility className="w-4 h-4" />
            <span className="hidden sm:inline">Accessibility</span>
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-turquoise-50/50 to-cyan-50/50 rounded-t-lg">
              <CardTitle className="text-xl font-semibold bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent">
                Notification Preferences
              </CardTitle>
              <CardDescription className="text-gray-600">
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
                      className="mt-switch"
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
                        className="mt-switch"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="marketing" className="cursor-pointer">Marketing and announcements</Label>
                      <Switch
                        id="marketing"
                        checked={notifications.marketingEmails}
                        onCheckedChange={(checked) => handleNotificationChange('marketingEmails', checked)}
                        disabled={!notifications.emailNotifications}
                        className="mt-switch"
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
                      className="mt-switch"
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
                        className="mt-switch"
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
                        className="mt-switch"
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
                        className="mt-switch"
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
                        className="mt-switch"
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
                    className="mt-switch"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy">
          <Card className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-turquoise-50/50 to-cyan-50/50 rounded-t-lg">
              <CardTitle className="text-xl font-semibold bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent">Privacy Settings</CardTitle>
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
                      className="mt-switch"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-email" className="cursor-pointer">Show my email address</Label>
                    <Switch
                      id="show-email"
                      checked={privacy.showEmail}
                      onCheckedChange={(checked) => handlePrivacyChange('showEmail', checked)}
                      className="mt-switch"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-phone" className="cursor-pointer">Show my phone number</Label>
                    <Switch
                      id="show-phone"
                      checked={privacy.showPhone}
                      onCheckedChange={(checked) => handlePrivacyChange('showPhone', checked)}
                      className="mt-switch"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-search" className="cursor-pointer">Appear in search results</Label>
                    <Switch
                      id="show-search"
                      checked={privacy.showInSearch}
                      onCheckedChange={(checked) => handlePrivacyChange('showInSearch', checked)}
                      className="mt-switch"
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
                      className="mt-switch"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="allow-tagging" className="cursor-pointer">Allow others to tag me</Label>
                    <Switch
                      id="allow-tagging"
                      checked={privacy.allowTagging}
                      onCheckedChange={(checked) => handlePrivacyChange('allowTagging', checked)}
                      className="mt-switch"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-turquoise-50/50 to-cyan-50/50 rounded-t-lg">
              <CardTitle className="text-xl font-semibold bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent">Appearance & Display</CardTitle>
              <CardDescription className="text-gray-600">
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
                      className="mt-switch"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced">
          <Card className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-turquoise-50/50 to-cyan-50/50 rounded-t-lg">
              <CardTitle className="text-xl font-semibold bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent">Advanced Settings</CardTitle>
              <CardDescription className="text-gray-600">
                Configure advanced features and performance settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Developer Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-turquoise-600" />
                  Developer Options
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label htmlFor="developer-mode" className="cursor-pointer">Developer Mode</Label>
                      <p className="text-sm text-gray-500 mt-1">Enable console logs and debugging tools</p>
                    </div>
                    <Switch
                      id="developer-mode"
                      checked={advanced.developerMode}
                      onCheckedChange={(checked) => handleAdvancedChange('developerMode', checked)}
                      className="mt-switch"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label htmlFor="beta-features" className="cursor-pointer">Beta Features</Label>
                      <p className="text-sm text-gray-500 mt-1">Try experimental features before release</p>
                    </div>
                    <Switch
                      id="beta-features"
                      checked={advanced.betaFeatures}
                      onCheckedChange={(checked) => handleAdvancedChange('betaFeatures', checked)}
                      className="mt-switch"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label htmlFor="api-access" className="cursor-pointer">API Access</Label>
                      <p className="text-sm text-gray-500 mt-1">Enable programmatic access to your data</p>
                    </div>
                    <Switch
                      id="api-access"
                      checked={advanced.apiAccess}
                      onCheckedChange={(checked) => handleAdvancedChange('apiAccess', checked)}
                      className="mt-switch"
                    />
                  </div>
                </div>
              </div>

              {/* Performance Settings */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-turquoise-600" />
                  Performance
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="performance-mode">Performance Mode</Label>
                    <Select
                      value={advanced.performanceMode}
                      onValueChange={(value) => handleAdvancedChange('performanceMode', value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="power-saver">Power Saver</SelectItem>
                        <SelectItem value="high-performance">High Performance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="cache-size">Cache Size</Label>
                    <Select
                      value={advanced.cacheSize}
                      onValueChange={(value) => handleAdvancedChange('cacheSize', value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (50MB)</SelectItem>
                        <SelectItem value="medium">Medium (200MB)</SelectItem>
                        <SelectItem value="large">Large (500MB)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label htmlFor="offline-mode" className="cursor-pointer">Offline Mode</Label>
                      <p className="text-sm text-gray-500 mt-1">Cache content for offline access</p>
                    </div>
                    <Switch
                      id="offline-mode"
                      checked={advanced.offlineMode}
                      onCheckedChange={(checked) => handleAdvancedChange('offlineMode', checked)}
                      className="mt-switch"
                    />
                  </div>
                </div>
              </div>

              {/* Data & Sync */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-turquoise-600" />
                  Data & Sync
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sync-frequency">Sync Frequency</Label>
                    <Select
                      value={advanced.syncFrequency}
                      onValueChange={(value) => handleAdvancedChange('syncFrequency', value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">Real-time</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="export-format">Export Format</Label>
                    <Select
                      value={advanced.exportFormat}
                      onValueChange={(value) => handleAdvancedChange('exportFormat', value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="xml">XML</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label htmlFor="webhooks" className="cursor-pointer">Webhooks</Label>
                      <p className="text-sm text-gray-500 mt-1">Send events to external services</p>
                    </div>
                    <Switch
                      id="webhooks"
                      checked={advanced.webhooksEnabled}
                      onCheckedChange={(checked) => handleAdvancedChange('webhooksEnabled', checked)}
                      className="mt-switch"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accessibility Tab */}
        <TabsContent value="accessibility">
          <Card className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-turquoise-50/50 to-cyan-50/50 rounded-t-lg">
              <CardTitle className="text-xl font-semibold bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent">Accessibility Settings</CardTitle>
              <CardDescription className="text-gray-600">
                Make Mundo Tango work better for your needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Vision */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Eye className="w-5 h-5 text-turquoise-600" />
                  Vision
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label htmlFor="screen-reader" className="cursor-pointer">Screen Reader Optimization</Label>
                      <p className="text-sm text-gray-500 mt-1">Enhance compatibility with screen readers</p>
                    </div>
                    <Switch
                      id="screen-reader"
                      checked={accessibility.screenReaderOptimized}
                      onCheckedChange={(checked) => handleAccessibilityChange('screenReaderOptimized', checked)}
                      className="mt-switch"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label htmlFor="high-contrast" className="cursor-pointer">High Contrast Mode</Label>
                      <p className="text-sm text-gray-500 mt-1">Increase contrast for better visibility</p>
                    </div>
                    <Switch
                      id="high-contrast"
                      checked={accessibility.highContrast}
                      onCheckedChange={(checked) => handleAccessibilityChange('highContrast', checked)}
                      className="mt-switch"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label htmlFor="focus-indicators" className="cursor-pointer">Enhanced Focus Indicators</Label>
                      <p className="text-sm text-gray-500 mt-1">Make focused elements more visible</p>
                    </div>
                    <Switch
                      id="focus-indicators"
                      checked={accessibility.focusIndicators}
                      onCheckedChange={(checked) => handleAccessibilityChange('focusIndicators', checked)}
                      className="mt-switch"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="alt-text-mode">Alt Text Detail Level</Label>
                    <Select
                      value={accessibility.altTextMode}
                      onValueChange={(value) => handleAccessibilityChange('altTextMode', value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="enhanced">Enhanced</SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Interaction */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-turquoise-600" />
                  Interaction
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label htmlFor="keyboard-nav" className="cursor-pointer">Keyboard Navigation</Label>
                      <p className="text-sm text-gray-500 mt-1">Navigate the app using only keyboard</p>
                    </div>
                    <Switch
                      id="keyboard-nav"
                      checked={accessibility.keyboardNavigation}
                      onCheckedChange={(checked) => handleAccessibilityChange('keyboardNavigation', checked)}
                      className="mt-switch"
                    />
                  </div>
                </div>
              </div>

              {/* Media */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-turquoise-600" />
                  Media
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label htmlFor="audio-descriptions" className="cursor-pointer">Audio Descriptions</Label>
                      <p className="text-sm text-gray-500 mt-1">Narrate visual content in videos</p>
                    </div>
                    <Switch
                      id="audio-descriptions"
                      checked={accessibility.audioDescriptions}
                      onCheckedChange={(checked) => handleAccessibilityChange('audioDescriptions', checked)}
                      className="mt-switch"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label htmlFor="captions" className="cursor-pointer">Auto-Captions</Label>
                      <p className="text-sm text-gray-500 mt-1">Show captions on all videos</p>
                    </div>
                    <Switch
                      id="captions"
                      checked={accessibility.captionsEnabled}
                      onCheckedChange={(checked) => handleAccessibilityChange('captionsEnabled', checked)}
                      className="mt-switch"
                    />
                  </div>
                </div>
              </div>

              {/* Help & Resources */}
              <div className="mt-6 p-4 bg-turquoise-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-turquoise-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-turquoise-900 mb-1">Need Help?</h4>
                    <p className="text-sm text-turquoise-700">
                      Learn more about our accessibility features in the{' '}
                      <a href="/help/accessibility" className="underline hover:text-turquoise-800">
                        Accessibility Guide
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Fixed Save Button */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-8 right-8 z-50">
          <Button
            onClick={handleSaveSettings}
            disabled={saveSettingsMutation.isPending}
            size="lg"
            className="bg-gradient-to-r from-turquoise-600 to-cyan-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
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
    </div>
  );
};

export default UserSettings;