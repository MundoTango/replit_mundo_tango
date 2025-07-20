import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Camera, Calendar, MapPin, Image, Video, Users, Trophy, UserCheck } from 'lucide-react';

// Layer 22: User Safety Net - Fallback Components for Failed States

export const ProfileHeaderFallback = () => (
  <div className="bg-gradient-to-br from-turquoise-100/50 to-cyan-100/50 p-8 rounded-xl">
    <div className="flex items-center space-x-6">
      <Skeleton className="w-32 h-32 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-4 mt-4">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    </div>
  </div>
);

export const PostsFallback = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">Posts</h3>
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 text-center">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-600 dark:text-gray-300">Unable to load posts</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-turquoise-600 hover:text-turquoise-700 text-sm font-medium"
        >
          Try refreshing the page
        </button>
      </div>
    </div>
  </div>
);

export const TravelDetailsFallback = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">Travel History</h3>
      <Skeleton className="h-10 w-40" />
    </div>
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 text-center">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <MapPin className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-600 dark:text-gray-300">Travel details temporarily unavailable</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">We're having trouble loading your travel history</p>
      </div>
    </div>
  </div>
);

export const TabContentFallback = ({ icon: Icon, title, message }: { 
  icon: any, 
  title: string, 
  message?: string 
}) => (
  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-8 text-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-20 h-20 bg-gradient-to-br from-turquoise-100 to-cyan-100 dark:from-turquoise-900/20 dark:to-cyan-900/20 rounded-full flex items-center justify-center">
        <Icon className="w-10 h-10 text-turquoise-600 dark:text-turquoise-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 max-w-sm">
        {message || `${title} content is temporarily unavailable. Please try again later.`}
      </p>
    </div>
  </div>
);

// Specific fallbacks for each tab
export const EventsFallback = () => (
  <TabContentFallback 
    icon={Calendar} 
    title="Events" 
    message="Your tango events will appear here once they're loaded."
  />
);

export const PhotosFallback = () => (
  <TabContentFallback 
    icon={Image} 
    title="Photos" 
    message="Your photo collection is being prepared."
  />
);

export const VideosFallback = () => (
  <TabContentFallback 
    icon={Video} 
    title="Videos" 
    message="Your dance videos and performances will be displayed here."
  />
);

export const FriendsFallback = () => (
  <TabContentFallback 
    icon={Users} 
    title="Friends" 
    message="Your tango connections are loading."
  />
);

export const ExperienceFallback = () => (
  <TabContentFallback 
    icon={Trophy} 
    title="Experience" 
    message="Your tango journey and achievements are being calculated."
  />
);

export const GuestProfileFallback = () => (
  <TabContentFallback 
    icon={UserCheck} 
    title="Guest Profile" 
    message="Guest profile information is loading."
  />
);

// Offline indicator component
export const OfflineIndicator = () => (
  <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
    <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg px-4 py-2 flex items-center space-x-2 shadow-lg">
      <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
      <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
        You're offline. Some features may be limited.
      </span>
    </div>
  </div>
);

// Network error retry component
export const NetworkErrorRetry = ({ onRetry }: { onRetry: () => void }) => (
  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 text-center border border-red-200 dark:border-red-800">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Connection Error</h3>
      <p className="text-gray-600 dark:text-gray-300 max-w-sm">
        We're having trouble connecting to our servers. Please check your internet connection.
      </p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-gradient-to-r from-turquoise-400 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-opacity"
      >
        Try Again
      </button>
    </div>
  </div>
);