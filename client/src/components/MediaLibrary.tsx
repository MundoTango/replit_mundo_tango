import React, { useState, useEffect } from 'react';
import { X, Plus, Image, Video, FileText, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

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

interface MediaLibraryProps {
  memoryId?: number;
  onClose: () => void;
  onMediaSelected: (media: MediaAsset[]) => void;
  selectOnly?: boolean; // When true, just selects media without attaching to memory
}

export default function MediaLibrary({ memoryId, onClose, onMediaSelected, selectOnly = false }: MediaLibraryProps) {
  const [selectedMedia, setSelectedMedia] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
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
      onMediaSelected(filteredMedia.filter(m => selectedMedia.has(m.id)));
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
    } else {
      newSelection.add(mediaId);
    }
    setSelectedMedia(newSelection);
  };

  const handleAttachSelected = () => {
    if (selectedMedia.size === 0) {
      toast({
        title: "No media selected",
        description: "Please select at least one media file",
        variant: "destructive",
      });
      return;
    }
    
    if (selectOnly) {
      // Selection-only mode: return selected media without attaching to memory
      const selectedMediaAssets = filteredMedia.filter((m: any) => selectedMedia.has(m.id));
      onMediaSelected(selectedMediaAssets);
      onClose();
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMedia.map((media: MediaAsset) => (
                <div
                  key={media.id}
                  onClick={() => toggleMediaSelection(media.id)}
                  className={`relative cursor-pointer rounded-lg border-2 transition-all hover:shadow-md ${
                    selectedMedia.has(media.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  }`}
                >
                  {/* Media Preview */}
                  <div className="aspect-square rounded-t-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                    {media.contentType.startsWith('image/') ? (
                      <img
                        src={media.url}
                        alt={media.originalFilename}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {getMediaIcon(media.contentType)}
                      </div>
                    )}
                  </div>

                  {/* Media Info */}
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

                  {/* Selection Indicator */}
                  {selectedMedia.has(media.id) && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Plus className="w-4 h-4 text-white rotate-45" />
                    </div>
                  )}
                </div>
              ))}
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