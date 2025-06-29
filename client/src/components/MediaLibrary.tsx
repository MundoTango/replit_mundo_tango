import React, { useState, useEffect } from 'react';
import { X, Plus, Image, Video, FileText, Search, Tag, Calendar } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import tagMedia from '../utils/tagMedia';

interface MediaAsset {
  id: string;
  userId: number;
  originalFilename: string;
  path: string;
  url: string;
  visibility: string;
  contentType: string;
  width?: number;
  height?: number;
  size: number;
  folder: string;
  createdAt: string;
  updatedAt: string;
}

interface MediaMetadata {
  id: string;
  caption: string;
  tags: string[];
  sortOrder: number;
}

interface MediaLibraryProps {
  memoryId?: number;
  onClose: () => void;
  onMediaSelected: (media: MediaAsset[]) => void;
  selectOnly?: boolean; // When true, just selects media without attaching to memory
}

export default function MediaLibrary({ memoryId, onClose, onMediaSelected, selectOnly = false }: MediaLibraryProps) {
  const [selectedMedia, setSelectedMedia] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [mediaMetadata, setMediaMetadata] = useState<Map<string, MediaMetadata>>(new Map());
  const [newTagInput, setNewTagInput] = useState<Map<string, string>>(new Map());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's media library
  const { data: mediaLibrary = [], isLoading } = useQuery({
    queryKey: ['/api/media/library'],
    queryFn: async () => {
      const response = await fetch('/api/media/library?limit=100');
      if (!response.ok) throw new Error('Failed to fetch media library');
      const result = await response.json();
      return result.data || [];
    }
  });

  // Attach media to memory mutation
  const attachMediaMutation = useMutation({
    mutationFn: async (mediaIds: string[]) => {
      const attachPromises = mediaIds.map(mediaId =>
        fetch(`/api/memory/${memoryId}/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mediaId })
        }).then(res => {
          if (!res.ok) throw new Error(`Failed to attach media ${mediaId}`);
          return res.json();
        })
      );
      return Promise.all(attachPromises);
    },
    onSuccess: () => {
      toast({
        title: "Media attached successfully",
        description: `${selectedMedia.size} file(s) attached to memory`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/memory/${memoryId}/media`] });
      onMediaSelected(filteredMedia.filter((m: MediaAsset) => selectedMedia.has(m.id)));
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to attach media",
        description: "Please try again",
        variant: "destructive",
      });
      console.error('Error attaching media:', error);
    }
  });

  const filteredMedia = mediaLibrary.filter((media: MediaAsset) =>
    media.originalFilename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (media.folder && media.folder.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleMediaSelection = (mediaId: string) => {
    const newSelection = new Set(selectedMedia);
    if (newSelection.has(mediaId)) {
      newSelection.delete(mediaId);
      // Remove metadata when deselecting
      const newMetadata = new Map(mediaMetadata);
      newMetadata.delete(mediaId);
      setMediaMetadata(newMetadata);
    } else {
      newSelection.add(mediaId);
      // Initialize metadata when selecting
      const newMetadata = new Map(mediaMetadata);
      newMetadata.set(mediaId, {
        id: mediaId,
        caption: '',
        tags: [],
        sortOrder: newSelection.size
      });
      setMediaMetadata(newMetadata);
    }
    setSelectedMedia(newSelection);
  };

  const updateMediaMetadata = (mediaId: string, updates: Partial<MediaMetadata>) => {
    const newMetadata = new Map(mediaMetadata);
    const current = newMetadata.get(mediaId) || { id: mediaId, caption: '', tags: [], sortOrder: 0 };
    newMetadata.set(mediaId, { ...current, ...updates });
    setMediaMetadata(newMetadata);
  };

  const addTagToMedia = (mediaId: string, tag: string) => {
    if (!tag.trim()) return;
    const current = mediaMetadata.get(mediaId);
    if (current && !current.tags.includes(tag.trim().toLowerCase())) {
      updateMediaMetadata(mediaId, {
        tags: [...current.tags, tag.trim().toLowerCase()]
      });
    }
    // Clear the input
    const newInput = new Map(newTagInput);
    newInput.set(mediaId, '');
    setNewTagInput(newInput);
  };

  const removeTagFromMedia = (mediaId: string, tagToRemove: string) => {
    const current = mediaMetadata.get(mediaId);
    if (current) {
      updateMediaMetadata(mediaId, {
        tags: current.tags.filter(tag => tag !== tagToRemove)
      });
    }
  };

  const handleAttachSelected = async () => {
    if (selectedMedia.size === 0) {
      toast({
        title: "No media selected",
        description: "Please select at least one media file",
        variant: "destructive",
      });
      return;
    }
    
    if (selectOnly) {
      // Selection-only mode: return selected media with enriched metadata
      const selectedMediaAssets = filteredMedia.filter((m: MediaAsset) => selectedMedia.has(m.id));
      
      // Enrich media assets with custom metadata
      const enrichedMediaAssets = selectedMediaAssets.map((media: MediaAsset) => {
        const metadata = mediaMetadata.get(media.id);
        return {
          ...media,
          customCaption: metadata?.caption || '',
          customTags: metadata?.tags || [],
          sortOrder: metadata?.sortOrder || 0
        };
      });

      // Apply tags to each media asset using the tagMedia utility
      try {
        for (const media of enrichedMediaAssets) {
          if (media.customTags.length > 0) {
            await tagMedia(media.id, media.customTags);
          }
        }
        
        console.log(`Tagged ${enrichedMediaAssets.length} media assets for reuse`);
        onMediaSelected(enrichedMediaAssets);
        onClose();
      } catch (error) {
        console.error('Error applying tags:', error);
        toast({
          title: "Warning",
          description: "Media selected but tags may not have been saved",
          variant: "destructive",
        });
        onMediaSelected(enrichedMediaAssets);
        onClose();
      }
    } else {
      // Attach to memory mode
      attachMediaMutation.mutate(Array.from(selectedMedia));
    }
  };

  const getMediaIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (contentType.startsWith('video/')) return <Video className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Media Library
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Select existing media to attach to this memory
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by filename or folder..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Media Grid */}
        <div className="p-6 overflow-y-auto max-h-96">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Loading media library...</p>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="text-center py-8">
              <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? 'No media found matching your search' : 'No media files in your library'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMedia.map((media: MediaAsset) => {
                const isSelected = selectedMedia.has(media.id);
                const metadata = mediaMetadata.get(media.id);
                const tagInput = newTagInput.get(media.id) || '';
                
                return (
                  <div
                    key={media.id}
                    className={`relative rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    {/* Media Preview */}
                    <div 
                      onClick={() => toggleMediaSelection(media.id)}
                      className="cursor-pointer aspect-video rounded-t-xl overflow-hidden bg-gray-100 dark:bg-gray-700 relative group"
                    >
                      {media.contentType.startsWith('image/') ? (
                        <img
                          src={media.url}
                          alt={media.originalFilename}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {getMediaIcon(media.contentType)}
                        </div>
                      )}
                      
                      {/* Hover overlay with metadata preview */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="text-white text-center p-4">
                          <p className="text-sm font-medium mb-1">{media.originalFilename}</p>
                          <div className="flex items-center justify-center gap-2 text-xs">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(media.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs mt-1">{formatFileSize(media.size)} • {media.folder}</p>
                        </div>
                      </div>

                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                          <Plus className="w-5 h-5 text-white rotate-45" />
                        </div>
                      )}
                    </div>

                    {/* Enhanced Metadata Section - Only show for selected items */}
                    {isSelected && (
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-b-xl border-t border-gray-100 dark:border-gray-700">
                        {/* Caption Input */}
                        <div className="mb-3">
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Custom Caption
                          </label>
                          <input
                            type="text"
                            placeholder="Add a caption for this reuse..."
                            value={metadata?.caption || ''}
                            onChange={(e) => updateMediaMetadata(media.id, { caption: e.target.value })}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        {/* Tags Section */}
                        <div className="mb-3">
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tags
                          </label>
                          
                          {/* Existing Tags */}
                          {metadata?.tags && metadata.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {metadata.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                                >
                                  <Tag className="w-3 h-3" />
                                  {tag}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeTagFromMedia(media.id, tag);
                                    }}
                                    className="ml-1 hover:text-red-500"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Add New Tag */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Add tag..."
                              value={tagInput}
                              onChange={(e) => {
                                const newInput = new Map(newTagInput);
                                newInput.set(media.id, e.target.value);
                                setNewTagInput(newInput);
                              }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addTagToMedia(media.id, tagInput);
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addTagToMedia(media.id, tagInput);
                              }}
                              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                              Add
                            </button>
                          </div>
                        </div>

                        {/* Sort Order */}
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            Sort Order:
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={metadata?.sortOrder || 0}
                            onChange={(e) => updateMediaMetadata(media.id, { sortOrder: parseInt(e.target.value) || 0 })}
                            onClick={(e) => e.stopPropagation()}
                            className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    )}

                    {/* Basic Info for non-selected items */}
                    {!isSelected && (
                      <div className="p-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {media.originalFilename}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(media.size)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {media.folder}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedMedia.size} file(s) selected
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAttachSelected}
              disabled={selectedMedia.size === 0 || attachMediaMutation.isPending}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {attachMediaMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Attaching...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Attach Selected
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}