import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/authUtils";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react";

interface Story {
  id: number;
  userId: number;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
  viewsCount: number;
  expiresAt: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
}

interface StoryViewerProps {
  stories: Story[];
}

export default function StoryViewer({ stories }: StoryViewerProps) {
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [isAddingStory, setIsAddingStory] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Group stories by user
  const groupedStories = stories.reduce((acc, story) => {
    const userId = story.userId;
    if (!acc[userId]) {
      acc[userId] = {
        user: story.user,
        stories: [],
      };
    }
    acc[userId].stories.push(story);
    return acc;
  }, {} as Record<number, { user: any; stories: Story[] }>);

  const userGroups = Object.values(groupedStories);

  // View story mutation
  const viewStoryMutation = useMutation({
    mutationFn: async (storyId: number) => {
      const response = await fetch(`/api/stories/${storyId}/view`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      if (!response.ok) throw new Error('Failed to record story view');
      return response.json();
    },
  });

  // Create story mutation
  const createStoryMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to create story');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stories/following'] });
      setIsAddingStory(false);
      toast({
        title: "Story uploaded!",
        description: "Your story has been shared with your followers.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload story",
        variant: "destructive",
      });
    },
  });

  const handleStoryClick = (groupIndex: number) => {
    setSelectedStoryIndex(groupIndex);
    const firstStory = userGroups[groupIndex].stories[0];
    viewStoryMutation.mutate(firstStory.id);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('media', file);
      createStoryMutation.mutate(formData);
    }
  };

  const navigateStory = (direction: 'prev' | 'next') => {
    if (selectedStoryIndex === null) return;
    
    if (direction === 'prev' && selectedStoryIndex > 0) {
      setSelectedStoryIndex(selectedStoryIndex - 1);
    } else if (direction === 'next' && selectedStoryIndex < userGroups.length - 1) {
      setSelectedStoryIndex(selectedStoryIndex + 1);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const storyDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - storyDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  if (userGroups.length === 0) {
    return (
      <Card className="card-shadow mb-6">
        <CardContent className="p-4">
          <h4 className="font-semibold text-tango-black mb-4">Tango Stories</h4>
          <div className="flex space-x-4">
            {/* Add Story Button */}
            <div className="flex flex-col items-center flex-shrink-0">
              <label className="cursor-pointer">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-1 hover:bg-gray-300 transition-colors">
                  <Plus className="h-8 w-8 text-gray-600" />
                </div>
                <span className="text-xs text-gray-600">Add Story</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500 text-sm">No stories yet. Be the first to share!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="card-shadow mb-6">
        <CardContent className="p-4">
          <h4 className="font-semibold text-tango-black mb-4">Tango Stories</h4>
          <div className="flex space-x-4 overflow-x-auto">
            {/* Add Story Button */}
            <div className="flex flex-col items-center flex-shrink-0">
              <label className="cursor-pointer">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-1 hover:bg-gray-300 transition-colors">
                  <Plus className="h-8 w-8 text-gray-600" />
                </div>
                <span className="text-xs text-gray-600">Add Story</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Story Thumbnails */}
            {userGroups.map((group, index) => (
              <div
                key={group.user.id}
                className="flex flex-col items-center flex-shrink-0 cursor-pointer"
                onClick={() => handleStoryClick(index)}
              >
                <div className="story-ring">
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={group.user.profileImage} alt={group.user.name} />
                    <AvatarFallback>{group.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                <span className="text-xs text-gray-600 mt-1 truncate max-w-[64px]">
                  {group.user.username}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Story Modal */}
      <Dialog open={selectedStoryIndex !== null} onOpenChange={() => setSelectedStoryIndex(null)}>
        <DialogContent className="max-w-sm w-full h-[80vh] p-0 bg-black">
          {selectedStoryIndex !== null && (
            <div className="relative h-full flex flex-col">
              {/* Header */}
              <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={userGroups[selectedStoryIndex].user.profileImage} />
                      <AvatarFallback>{userGroups[selectedStoryIndex].user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-white text-sm font-medium">
                        {userGroups[selectedStoryIndex].user.name}
                      </h4>
                      <p className="text-white/70 text-xs">
                        {formatTimeAgo(userGroups[selectedStoryIndex].stories[0].createdAt)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedStoryIndex(null)}
                    className="text-white hover:bg-white/10"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Progress Indicators */}
                <div className="flex space-x-1 mt-4">
                  {userGroups[selectedStoryIndex].stories.map((_, storyIndex) => (
                    <div key={storyIndex} className="flex-1 h-0.5 bg-white/30 rounded">
                      <div className="h-full bg-white rounded" style={{ width: storyIndex === 0 ? '100%' : '0%' }}></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Story Content */}
              <div className="flex-1 relative">
                {userGroups[selectedStoryIndex].stories[0].mediaType === 'image' ? (
                  <img
                    src={userGroups[selectedStoryIndex].stories[0].mediaUrl}
                    alt="Story"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={userGroups[selectedStoryIndex].stories[0].mediaUrl}
                    autoPlay
                    loop
                    muted
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Navigation */}
                {selectedStoryIndex > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateStory('prev')}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/10"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                )}
                
                {selectedStoryIndex < userGroups.length - 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateStory('next')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/10"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                )}
              </div>

              {/* Caption */}
              {userGroups[selectedStoryIndex].stories[0].caption && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                  <p className="text-white text-sm">
                    {userGroups[selectedStoryIndex].stories[0].caption}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
