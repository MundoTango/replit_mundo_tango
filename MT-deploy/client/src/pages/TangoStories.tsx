import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Heart, 
  MessageCircle, 
  Share2, 
  Calendar,
  MapPin,
  Music,
  PenTool,
  Search,
  TrendingUp
} from 'lucide-react';

interface TangoStory {
  id: number;
  title: string;
  content: string;
  author: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
  tags: string[];
  location?: string;
  isLiked?: boolean;
}

export default function TangoStories() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStory, setNewStory] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    location: ''
  });

  // Fetch stories
  const { data: storiesData, isLoading } = useQuery({
    queryKey: ['/api/stories', searchQuery, selectedTag],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedTag) params.append('tag', selectedTag);
      
      const response = await fetch(`/api/stories?${params}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch stories');
      return response.json();
    }
  });

  const stories = storiesData?.data || [];

  // Create story mutation
  const createStoryMutation = useMutation({
    mutationFn: async (storyData: typeof newStory) => {
      const response = await apiRequest('/api/stories', {
        method: 'POST',
        body: storyData
      });
      if (!response.ok) throw new Error('Failed to create story');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Story Published!',
        description: 'Your tango story has been shared with the community.',
      });
      setShowCreateModal(false);
      setNewStory({ title: '', content: '', tags: [], location: '' });
      queryClient.invalidateQueries({ queryKey: ['/api/stories'] });
    }
  });

  // Like story mutation
  const likeStoryMutation = useMutation({
    mutationFn: async (storyId: number) => {
      const response = await apiRequest(`/api/stories/${storyId}/like`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to like story');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stories'] });
    }
  });

  const popularTags = [
    'First Tanda',
    'Buenos Aires',
    'Milonga Stories',
    'Teacher Memories',
    'Festival Adventures',
    'Tango Journey',
    'Dance Partners',
    'Music Discovery'
  ];

  const handleCreateStory = () => {
    if (!newStory.title || !newStory.content) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both title and content for your story.',
        variant: 'destructive'
      });
      return;
    }
    createStoryMutation.mutate(newStory);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            Tango Stories
          </h1>
          <p className="text-gray-600">Share and discover personal tango journeys from around the world</p>
        </div>

        {/* Search and Create */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glassmorphic-input"
            />
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-turquoise-600 to-cyan-600 hover:from-turquoise-700 hover:to-cyan-700 text-white"
          >
            <PenTool className="w-4 h-4 mr-2" />
            Share Your Story
          </Button>
        </div>

        {/* Popular Tags */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Popular Topics</h3>
          <div className="flex flex-wrap gap-2">
            {popularTags.map(tag => (
              <Button
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={selectedTag === tag ? "bg-turquoise-600 hover:bg-turquoise-700" : ""}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>

        {/* Stories Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-turquoise-600"></div>
          </div>
        ) : stories.length === 0 ? (
          <Card className="glassmorphic-card p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Stories Yet</h3>
            <p className="text-gray-600 mb-4">Be the first to share your tango journey!</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-turquoise-600 to-cyan-600 hover:from-turquoise-700 hover:to-cyan-700 text-white"
            >
              Share Your Story
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6">
            {stories.map((story: TangoStory) => (
              <Card key={story.id} className="glassmorphic-card overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-turquoise-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold">
                        {story.author.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{story.author.name}</h3>
                        <p className="text-sm text-gray-600">
                          @{story.author.username} • {new Date(story.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <h2 className="text-xl font-bold mb-3">{story.title}</h2>
                  <p className="text-gray-700 whitespace-pre-wrap mb-4 line-clamp-5">
                    {story.content}
                  </p>
                  
                  {/* Story Metadata */}
                  {(story.location || story.tags.length > 0) && (
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      {story.location && (
                        <span className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="w-3 h-3" />
                          {story.location}
                        </span>
                      )}
                      {story.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-turquoise-100 text-turquoise-700 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Engagement Stats */}
                  <div className="flex items-center gap-4 pt-4 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => likeStoryMutation.mutate(story.id)}
                      className={story.isLiked ? 'text-red-500' : ''}
                    >
                      <Heart className={`w-4 h-4 mr-1 ${story.isLiked ? 'fill-current' : ''}`} />
                      {story.likes}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {story.comments}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="w-4 h-4 mr-1" />
                      {story.shares}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Story Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl glassmorphic-card">
              <CardHeader>
                <CardTitle>Share Your Tango Story</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <Input
                      value={newStory.title}
                      onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                      placeholder="Give your story a title..."
                      className="glassmorphic-input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Story</label>
                    <Textarea
                      value={newStory.content}
                      onChange={(e) => setNewStory({ ...newStory, content: e.target.value })}
                      placeholder="Share your tango journey, memorable moments, or lessons learned..."
                      className="glassmorphic-input min-h-[200px]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Location (Optional)</label>
                    <Input
                      value={newStory.location}
                      onChange={(e) => setNewStory({ ...newStory, location: e.target.value })}
                      placeholder="Buenos Aires, Argentina"
                      className="glassmorphic-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {popularTags.map(tag => (
                        <Button
                          key={tag}
                          type="button"
                          variant={newStory.tags.includes(tag) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setNewStory({
                              ...newStory,
                              tags: newStory.tags.includes(tag)
                                ? newStory.tags.filter(t => t !== tag)
                                : [...newStory.tags, tag]
                            });
                          }}
                          className={newStory.tags.includes(tag) ? "bg-turquoise-600 hover:bg-turquoise-700" : ""}
                        >
                          {tag}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={handleCreateStory}
                      disabled={createStoryMutation.isPending}
                      className="flex-1 bg-gradient-to-r from-turquoise-600 to-cyan-600 hover:from-turquoise-700 hover:to-cyan-700 text-white"
                    >
                      {createStoryMutation.isPending ? 'Publishing...' : 'Publish Story'}
                    </Button>
                    <Button
                      onClick={() => setShowCreateModal(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}