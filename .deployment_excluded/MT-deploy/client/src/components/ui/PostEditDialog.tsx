/**
 * ESA LIFE CEO 61x21 - Post Edit Dialog
 * Comprehensive post editing functionality
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, MapPin, Hash, Eye, Users, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface PostEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: {
    id: number;
    content: string;
    location?: string;
    visibility?: 'public' | 'friends' | 'private';
    hashtags?: string[];
  };
}

export function PostEditDialog({ open, onOpenChange, post }: PostEditDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [content, setContent] = useState(post.content || '');
  const [location, setLocation] = useState(post.location || '');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>(post.visibility || 'public');
  const [hashtags, setHashtags] = useState<string[]>(post.hashtags || []);
  const [newHashtag, setNewHashtag] = useState('');

  // Reset form when post changes
  useEffect(() => {
    setContent(post.content || '');
    setLocation(post.location || '');
    setVisibility(post.visibility || 'public');
    setHashtags(post.hashtags || []);
  }, [post]);

  // Update post mutation
  const updateMutation = useMutation({
    mutationFn: async (updateData: any) => {
      return apiRequest(`/api/posts/${post.id}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData)
      });
    },
    onSuccess: () => {
      toast({
        title: "Post updated",
        description: "Your post has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddHashtag = () => {
    const tag = newHashtag.trim().replace('#', '');
    if (tag && !hashtags.includes(tag)) {
      setHashtags([...hashtags, tag]);
      setNewHashtag('');
    }
  };

  const handleRemoveHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddHashtag();
    }
  };

  const handleSave = () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Post content cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    updateMutation.mutate({
      content: content.trim(),
      location: location.trim() || undefined,
      visibility,
      hashtags: hashtags.length > 0 ? hashtags : undefined,
    });
  };

  const getVisibilityIcon = (vis: string) => {
    switch (vis) {
      case 'public': return <Eye className="h-4 w-4" />;
      case 'friends': return <Users className="h-4 w-4" />;
      case 'private': return <Lock className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getVisibilityDescription = (vis: string) => {
    switch (vis) {
      case 'public': return 'Anyone can see this post';
      case 'friends': return 'Only your friends can see this post';
      case 'private': return 'Only you can see this post';
      default: return 'Anyone can see this post';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
          <DialogDescription>
            Make changes to your post. Changes will be reflected immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Post Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={2000}
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>Use @username to mention people</span>
              <span>{content.length}/2000</span>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location (optional)
            </Label>
            <input
              id="location"
              type="text"
              placeholder="Where are you?"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
            />
          </div>

          {/* Hashtags */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Tags
            </Label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a tag..."
                value={newHashtag}
                onChange={(e) => setNewHashtag(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
              />
              <Button onClick={handleAddHashtag} disabled={!newHashtag.trim()}>
                Add
              </Button>
            </div>
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {hashtags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    #{tag}
                    <button
                      onClick={() => handleRemoveHashtag(tag)}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <Label>Who can see this post?</Label>
            <Select value={visibility} onValueChange={(value: 'public' | 'friends' | 'private') => setVisibility(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>Public</span>
                  </div>
                </SelectItem>
                <SelectItem value="friends">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Friends only</span>
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    <span>Only me</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              {getVisibilityIcon(visibility)}
              {getVisibilityDescription(visibility)}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending || !content.trim()}
            className="bg-turquoise-600 hover:bg-turquoise-700 text-white"
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}