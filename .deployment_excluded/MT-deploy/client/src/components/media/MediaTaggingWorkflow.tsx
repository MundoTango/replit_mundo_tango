import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag, X, Plus, Search, Image, Video, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface MediaAsset {
  id: string;
  originalFilename: string;
  url: string;
  contentType: string;
  visibility: string;
  folder: string;
  width?: number;
  height?: number;
  size: number;
  createdAt: string;
  tags?: string[];
}

interface MediaTaggingWorkflowProps {
  userId: number;
  folder?: string;
  onMediaSelect?: (media: MediaAsset) => void;
}

export function MediaTaggingWorkflow({ userId, folder, onMediaSelect }: MediaTaggingWorkflowProps) {
  const [searchTag, setSearchTag] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const queryClient = useQueryClient();

  // Fetch user's media assets with optional tag filtering
  const { data: mediaAssets, isLoading } = useQuery({
    queryKey: ['/api/media/user', userId, folder, selectedTags],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (folder) params.append('folder', folder);
      if (selectedTags.length > 0) {
        selectedTags.forEach(tag => params.append('tags', tag));
      }
      
      const response = await fetch(`/api/media/user/${userId}?${params}`);
      if (!response.ok) throw new Error('Failed to fetch media');
      const result = await response.json();
      return result.data || [];
    },
  });

  // Fetch popular tags for suggestions
  const { data: popularTags } = useQuery({
    queryKey: ['/api/media/tags/popular'],
    queryFn: async () => {
      const response = await fetch('/api/media/tags/popular');
      if (!response.ok) throw new Error('Failed to fetch tags');
      const result = await response.json();
      return result.data || [];
    },
  });

  // Add tag to media mutation
  const addTagMutation = useMutation({
    mutationFn: async ({ mediaId, tag }: { mediaId: string; tag: string }) => {
      const response = await fetch(`/api/media/${mediaId}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag }),
      });
      if (!response.ok) throw new Error('Failed to add tag');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media/user'] });
      toast({ title: 'Tag added successfully' });
    },
  });

  // Remove tag from media mutation
  const removeTagMutation = useMutation({
    mutationFn: async ({ mediaId, tag }: { mediaId: string; tag: string }) => {
      const response = await fetch(`/api/media/${mediaId}/tags/${tag}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove tag');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media/user'] });
      toast({ title: 'Tag removed successfully' });
    },
  });

  const handleAddTag = (mediaId: string, tag: string) => {
    if (!tag.trim()) return;
    addTagMutation.mutate({ mediaId, tag: tag.trim().toLowerCase() });
    setNewTag('');
  };

  const handleRemoveTag = (mediaId: string, tag: string) => {
    removeTagMutation.mutate({ mediaId, tag });
  };

  const addTagFilter = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setSearchTag('');
  };

  const removeTagFilter = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (contentType.startsWith('video/')) return <Video className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Tag Filtering Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Filter by Tags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search tags..."
              value={searchTag}
              onChange={(e) => setSearchTag(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && searchTag.trim()) {
                  addTagFilter(searchTag.trim().toLowerCase());
                }
              }}
            />
            <Button
              onClick={() => searchTag.trim() && addTagFilter(searchTag.trim().toLowerCase())}
              disabled={!searchTag.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Active Tag Filters */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeTagFilter(tag)}
                  />
                </Badge>
              ))}
            </div>
          )}

          {/* Popular Tags Suggestions */}
          {popularTags && popularTags.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Popular tags:</p>
              <div className="flex flex-wrap gap-2">
                {popularTags.slice(0, 10).map((tag: string) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => addTagFilter(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Media Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-muted rounded-t-lg" />
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))
        ) : mediaAssets && mediaAssets.length > 0 ? (
          mediaAssets.map((media: MediaAsset) => (
            <Card key={media.id} className="group hover:shadow-lg transition-shadow">
              <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
                {media.contentType.startsWith('image/') ? (
                  <img
                    src={media.url}
                    alt={media.originalFilename}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    {getFileIcon(media.contentType)}
                    <span className="ml-2 text-sm text-muted-foreground">
                      {media.contentType.split('/')[1].toUpperCase()}
                    </span>
                  </div>
                )}
                
                {onMediaSelect && (
                  <Button
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onMediaSelect(media)}
                  >
                    Select
                  </Button>
                )}
              </div>

              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-medium truncate">{media.originalFilename}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(media.size)} • {media.folder}
                  </p>
                </div>

                {/* Existing Tags */}
                {media.tags && media.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {media.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs flex items-center gap-1">
                        {tag}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-destructive"
                          onClick={() => handleRemoveTag(media.id, tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Add New Tag */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddTag(media.id, newTag);
                      }
                    }}
                    className="text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleAddTag(media.id, newTag)}
                    disabled={!newTag.trim() || addTagMutation.isPending}
                  >
                    <Tag className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No media assets found{selectedTags.length > 0 ? ' with selected tags' : ''}
          </div>
        )}
      </div>
    </div>
  );
}