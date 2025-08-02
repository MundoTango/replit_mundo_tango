import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Image, Video, MapPin, Tag, Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlinePostComposerProps {
  placeholder?: string;
  className?: string;
  onPostCreated?: () => void;
}

export default function InlinePostComposer({
  placeholder = "Share a tango memory...",
  className,
  onPostCreated
}: InlinePostComposerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const response = await apiRequest('POST', '/api/posts', postData);
      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      setContent('');
      setTags([]);
      setLocation('');
      setIsExpanded(false);
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/posts'] });
      toast({
        title: "Memory shared!",
        description: "Your post has been published successfully.",
      });
      onPostCreated?.();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to share",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = () => {
    if (!content.trim()) {
      toast({
        title: "Empty post",
        description: "Please write something to share.",
        variant: "destructive",
      });
      return;
    }

    const postData = {
      content: content.trim(),
      emotionTags: tags,
      location: location || undefined
    };

    createPostMutation.mutate(postData);
  };

  const addTag = (tag: string) => {
    if (!tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const quickTags = ['dance', 'milonga', 'practice', 'performance', 'festival', 'lesson', 'travel'];

  return (
    <Card className={cn("glassmorphic-card overflow-hidden", className)}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Main Input Area */}
          <div className="relative">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              className={cn(
                "resize-none border-turquoise-200 focus:border-turquoise-400 transition-all",
                isExpanded ? "min-h-[120px]" : "min-h-[60px]"
              )}
              onFocus={() => setIsExpanded(true)}
            />
            
            {/* Character Count */}
            {content.length > 0 && (
              <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                {content.length}/500
              </div>
            )}
          </div>

          {/* Expanded Options */}
          {isExpanded && (
            <>
              {/* Quick Tags */}
              <div className="space-y-2">
                <div className="text-sm text-gray-600">Add tags:</div>
                <div className="flex flex-wrap gap-2">
                  {quickTags.map((tag) => (
                    <Button
                      key={tag}
                      size="sm"
                      variant={tags.includes(tag) ? "default" : "outline"}
                      className={cn(
                        "h-7 text-xs",
                        tags.includes(tag) 
                          ? "bg-turquoise-500 hover:bg-turquoise-600 text-white" 
                          : "border-turquoise-200 text-turquoise-700 hover:bg-turquoise-50"
                      )}
                      onClick={() => tags.includes(tag) ? removeTag(tag) : addTag(tag)}
                    >
                      #{tag}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Selected Tags Display */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center gap-1 px-2 py-1 bg-turquoise-100 text-turquoise-700 rounded-full text-xs"
                    >
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-turquoise-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Location Input */}
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-turquoise-600" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Add location (optional)"
                  className="flex-1 text-sm px-2 py-1 border border-turquoise-200 rounded-md focus:outline-none focus:border-turquoise-400"
                />
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-turquoise-600 hover:text-turquoise-700 hover:bg-turquoise-50"
                disabled
              >
                <Image className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-turquoise-600 hover:text-turquoise-700 hover:bg-turquoise-50"
                disabled
              >
                <Video className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-turquoise-600 hover:text-turquoise-700 hover:bg-turquoise-50"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <Tag className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {isExpanded && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsExpanded(false);
                    setContent('');
                    setTags([]);
                    setLocation('');
                  }}
                  className="h-8 text-gray-600 hover:text-gray-700"
                >
                  Cancel
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!content.trim() || createPostMutation.isPending}
                className="h-8 bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white disabled:opacity-50"
              >
                {createPostMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sharing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-3 w-3" />
                    Share
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}