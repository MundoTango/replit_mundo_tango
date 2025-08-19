import React, { useState } from 'react';
import { Plus, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Highlight {
  id: string;
  title: string;
  coverImage?: string;
  stories: Array<{
    id: string;
    imageUrl: string;
    caption?: string;
  }>;
}

interface StoryHighlightsProps {
  highlights?: Highlight[];
  isOwnProfile?: boolean;
  onAddHighlight?: () => void;
}

export default function StoryHighlights({ 
  highlights = [], 
  isOwnProfile = false,
  onAddHighlight 
}: StoryHighlightsProps) {
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newHighlightTitle, setNewHighlightTitle] = useState('');
  const { toast } = useToast();

  const handleCreateHighlight = () => {
    if (!newHighlightTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your highlight.",
        variant: "destructive"
      });
      return;
    }

    // Here you would call the API to create a new highlight
    toast({
      title: "Highlight created",
      description: `"${newHighlightTitle}" highlight has been created.`
    });
    setCreateDialogOpen(false);
    setNewHighlightTitle('');
    onAddHighlight?.();
  };

  const defaultHighlights = [
    {
      id: '1',
      title: 'Milongas',
      coverImage: '/api/placeholder/80/80',
      stories: []
    },
    {
      id: '2', 
      title: 'Performances',
      coverImage: '/api/placeholder/80/80',
      stories: []
    },
    {
      id: '3',
      title: 'Travel',
      coverImage: '/api/placeholder/80/80',
      stories: []
    },
    {
      id: '4',
      title: 'Teaching',
      coverImage: '/api/placeholder/80/80',
      stories: []
    }
  ];

  const displayHighlights = highlights.length > 0 ? highlights : (isOwnProfile ? [] : defaultHighlights);

  return (
    <div className="py-6">
      <div className="flex items-center gap-6 overflow-x-auto pb-2 scrollbar-hide">
        {/* Add Highlight Button */}
        {isOwnProfile && (
          <button
            onClick={() => setCreateDialogOpen(true)}
            className="flex-shrink-0 group"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-turquoise-100 to-cyan-100 flex items-center justify-center group-hover:from-turquoise-200 group-hover:to-cyan-200 transition-all">
                <Plus className="h-8 w-8 text-turquoise-600" />
              </div>
              <p className="text-sm text-center mt-2 text-gray-700">New</p>
            </div>
          </button>
        )}

        {/* Highlights */}
        {displayHighlights.map((highlight) => (
          <button
            key={highlight.id}
            onClick={() => setSelectedHighlight(highlight)}
            className="flex-shrink-0 group"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-turquoise-400 to-cyan-600 p-[3px] group-hover:from-turquoise-500 group-hover:to-cyan-700 transition-all">
                <div className="w-full h-full rounded-full overflow-hidden bg-white">
                  {highlight.coverImage ? (
                    <img 
                      src={highlight.coverImage} 
                      alt={highlight.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-turquoise-50 to-cyan-50 flex items-center justify-center">
                      <Play className="h-6 w-6 text-turquoise-600" />
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-center mt-2 text-gray-700 max-w-20 truncate">
                {highlight.title}
              </p>
            </div>
          </button>
        ))}

        {/* Empty State */}
        {isOwnProfile && displayHighlights.length === 0 && (
          <div className="flex-1 min-w-[200px] text-center py-4">
            <p className="text-gray-500 text-sm">
              Create your first story highlight to showcase your tango journey
            </p>
          </div>
        )}
      </div>

      {/* Create Highlight Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Highlight</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="highlight-title">Highlight Title</Label>
              <Input
                id="highlight-title"
                placeholder="e.g., Buenos Aires 2024"
                value={newHighlightTitle}
                onChange={(e) => setNewHighlightTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateHighlight()}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setCreateDialogOpen(false);
                  setNewHighlightTitle('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateHighlight}
                className="bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white"
              >
                Create Highlight
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Highlight Viewer Dialog */}
      <Dialog open={!!selectedHighlight} onOpenChange={() => setSelectedHighlight(null)}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
          <div className="relative aspect-[9/16] max-h-[80vh] bg-black">
            {selectedHighlight?.stories.length ? (
              <div className="w-full h-full flex items-center justify-center">
                <img 
                  src={selectedHighlight.stories[0].imageUrl} 
                  alt={selectedHighlight.title}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <Play className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">{selectedHighlight?.title}</p>
                  <p className="text-sm text-gray-400 mt-2">No stories yet</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}