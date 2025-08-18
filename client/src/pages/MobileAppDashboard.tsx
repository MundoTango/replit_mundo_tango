import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Smartphone, 
  Download, 
  Bell, 
  Wifi, 
  WifiOff,
  Battery,
  Zap,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Share2,
  Settings,
  Activity,
  Globe,
  Shield,
  Gauge
} from "lucide-react";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const MobileAppDashboard: React.FC = () => {
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [networkType, setNetworkType] = useState<string>('unknown');
  
  // PWA installation detection
  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as InstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    // Check notification permission
    if ('Notification' in window) {
      setPushPermission(Notification.permission);
    }

    // Network status
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Battery status
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(battery.level * 100);
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(battery.level * 100);
        });
      });
    }

    // Network information
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setNetworkType(connection.effectiveType || 'unknown');
      connection.addEventListener('change', () => {
        setNetworkType(connection.effectiveType || 'unknown');
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
      toast({
        title: "App Installed!",
        description: "Mundo Tango has been added to your home screen",
      });
    }
    
    setInstallPrompt(null);
  };

  const handleNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);
      
      if (permission === 'granted') {
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive push notifications",
        });
      }
    }
  };

  const handleUpdateCheck = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.update();
        toast({
          title: "Checking for updates...",
          description: "We'll notify you if an update is available",
        });
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
          Mobile App Dashboard
        </h1>
        <p className="text-gray-600">Manage your Progressive Web App experience and mobile features</p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="glassmorphic-card hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">App Status</p>
                <p className="text-2xl font-bold">
                  {isInstalled ? 'Installed' : 'Web Version'}
                </p>
              </div>
              <div className={`p-3 rounded-full ${isInstalled ? 'bg-green-100' : 'bg-yellow-100'}`}>
                <Smartphone className={`h-6 w-6 ${isInstalled ? 'text-green-600' : 'text-yellow-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphic-card hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Connection</p>
                <p className="text-2xl font-bold">
                  {isOnline ? networkType.toUpperCase() : 'Offline'}
                </p>
              </div>
              <div className={`p-3 rounded-full ${isOnline ? 'bg-turquoise-100' : 'bg-red-100'}`}>
                {isOnline ? (
                  <Wifi className="h-6 w-6 text-turquoise-600" />
                ) : (
                  <WifiOff className="h-6 w-6 text-red-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphic-card hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Battery</p>
                <p className="text-2xl font-bold">
                  {batteryLevel !== null ? `${Math.round(batteryLevel)}%` : 'N/A'}
                </p>
              </div>
              <div className="p-3 rounded-full bg-cyan-100">
                <Battery className="h-6 w-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphic-card hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Notifications</p>
                <p className="text-2xl font-bold capitalize">
                  {pushPermission}
                </p>
              </div>
              <div className={`p-3 rounded-full ${pushPermission === 'granted' ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Bell className={`h-6 w-6 ${pushPermission === 'granted' ? 'text-green-600' : 'text-gray-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="install" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="install">Install</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="offline">Offline</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Install Tab */}
        <TabsContent value="install" className="space-y-4">
          <Card className="glassmorphic-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-turquoise-500" />
                App Installation
              </CardTitle>
              <CardDescription>
                Install Mundo Tango as a Progressive Web App for the best mobile experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isInstalled ? (
                <>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Installing the app provides offline access, push notifications, and faster performance
                    </AlertDescription>
                  </Alert>
                  
                  {installPrompt && (
                    <Button 
                      onClick={handleInstallClick}
                      className="w-full bg-gradient-to-r from-turquoise-400 to-cyan-500 hover:from-turquoise-500 hover:to-cyan-600"
                      size="lg"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Install Mundo Tango App
                    </Button>
                  )}
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Manual Installation Steps:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                      <li>Open browser menu (⋮ or ⋯)</li>
                      <li>Look for "Add to Home Screen" or "Install App"</li>
                      <li>Follow the prompts to install</li>
                      <li>Find Mundo Tango on your home screen</li>
                    </ol>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">App Installed Successfully!</h3>
                  <p className="text-gray-600">You're enjoying the full PWA experience</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-4">
          <Card className="glassmorphic-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                PWA Features
              </CardTitle>
              <CardDescription>
                Enhanced capabilities available in the installed app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Push Notifications */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-turquoise-50 to-cyan-50">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-turquoise-600" />
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-gray-600">Receive event reminders and updates</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleNotificationPermission}
                    disabled={pushPermission === 'granted'}
                    variant={pushPermission === 'granted' ? 'default' : 'outline'}
                  >
                    {pushPermission === 'granted' ? 'Enabled' : 'Enable'}
                  </Button>
                </div>

                {/* Offline Mode */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50">
                  <div className="flex items-center gap-3">
                    <WifiOff className="h-5 w-5 text-cyan-600" />
                    <div>
                      <p className="font-medium">Offline Mode</p>
                      <p className="text-sm text-gray-600">Access content without internet</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>

                {/* App Shortcuts */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center gap-3">
                    <Share2 className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">App Shortcuts</p>
                      <p className="text-sm text-gray-600">Quick access from home screen</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Available</Badge>
                </div>

                {/* Background Sync */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Background Sync</p>
                      <p className="text-sm text-gray-600">Sync data when back online</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Enabled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card className="glassmorphic-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-green-500" />
                Performance Metrics
              </CardTitle>
              <CardDescription>
                Monitor app performance and optimization status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Load Time */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Page Load Time</span>
                  <span className="text-sm text-gray-600">2.1s</span>
                </div>
                <Progress value={79} className="h-2" />
                <p className="text-xs text-gray-500">Target: Under 3 seconds</p>
              </div>

              {/* Cache Hit Rate */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Cache Hit Rate</span>
                  <span className="text-sm text-gray-600">87%</span>
                </div>
                <Progress value={87} className="h-2" />
                <p className="text-xs text-gray-500">Higher is better</p>
              </div>

              {/* Offline Coverage */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Offline Coverage</span>
                  <span className="text-sm text-gray-600">65%</span>
                </div>
                <Progress value={65} className="h-2" />
                <p className="text-xs text-gray-500">Pages available offline</p>
              </div>

              {/* Storage Usage */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Storage Usage</span>
                  <span className="text-sm text-gray-600">124 MB</span>
                </div>
                <Progress value={24} className="h-2" />
                <p className="text-xs text-gray-500">24% of 500MB quota</p>
              </div>

              <Button 
                onClick={handleUpdateCheck}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Check for App Updates
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Offline Tab */}
        <TabsContent value="offline" className="space-y-4">
          <Card className="glassmorphic-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <WifiOff className="h-5 w-5 text-orange-500" />
                Offline Capabilities
              </CardTitle>
              <CardDescription>
                Manage offline content and sync settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Offline Content */}
                <div>
                  <h4 className="font-medium mb-3">Cached Content</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <span className="text-sm">Profile Data</span>
                      <Badge variant="secondary">Synced</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <span className="text-sm">Recent Posts</span>
                      <Badge variant="secondary">50 items</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <span className="text-sm">Event Details</span>
                      <Badge variant="secondary">12 events</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <span className="text-sm">Images</span>
                      <Badge variant="secondary">234 files</Badge>
                    </div>
                  </div>
                </div>

                {/* Sync Settings */}
                <div>
                  <h4 className="font-medium mb-3">Sync Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-sync" className="cursor-pointer">
                        Auto-sync when online
                      </Label>
                      <Switch id="auto-sync" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="wifi-only" className="cursor-pointer">
                        Sync on WiFi only
                      </Label>
                      <Switch id="wifi-only" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="save-data" className="cursor-pointer">
                        Data saver mode
                      </Label>
                      <Switch id="save-data" />
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  Clear Offline Cache
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card className="glassmorphic-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-500" />
                App Settings
              </CardTitle>
              <CardDescription>
                Configure your mobile app experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* App Theme */}
                <div>
                  <h4 className="font-medium mb-3">Appearance</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="dark-mode" className="cursor-pointer">
                        Dark mode
                      </Label>
                      <Switch id="dark-mode" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="reduce-motion" className="cursor-pointer">
                        Reduce motion
                      </Label>
                      <Switch id="reduce-motion" />
                    </div>
                  </div>
                </div>

                {/* Privacy */}
                <div>
                  <h4 className="font-medium mb-3">Privacy</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="analytics" className="cursor-pointer">
                        Usage analytics
                      </Label>
                      <Switch id="analytics" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="crash-reports" className="cursor-pointer">
                        Crash reports
                      </Label>
                      <Switch id="crash-reports" defaultChecked />
                    </div>
                  </div>
                </div>

                {/* Advanced */}
                <div>
                  <h4 className="font-medium mb-3">Advanced</h4>
                  <Button variant="outline" className="w-full mb-2">
                    Export App Data
                  </Button>
                  <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                    Reset App
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MobileAppDashboard;