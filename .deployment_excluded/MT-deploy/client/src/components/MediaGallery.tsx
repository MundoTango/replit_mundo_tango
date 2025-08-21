import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image, Video, File, Search, Filter, Eye, EyeOff, Users, X } from 'lucide-react';
import { getUserMedia, deleteMedia } from '@/services/upload';
import UploadMedia, { UploadedMedia } from './UploadMedia';

interface MediaAsset {
  id: string;
  originalFilename: string;
  url: string;
  contentType: string;
  visibility: 'public' | 'private' | 'mutual';
  folder: string;
  size: number;
  width?: number;
  height?: number;
  createdAt: string;
  tags?: string[];
}

interface MediaGalleryProps {
  userId: number;
  folder?: string;
  showUpload?: boolean;
  showVisibilityFilter?: boolean;
  className?: string;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  userId,
  folder,
  showUpload = true,
  showVisibilityFilter = true,
  className = ''
}) => {
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all');
  const [folderFilter, setFolderFilter] = useState<string>(folder || 'all');

  useEffect(() => {
    loadMediaAssets();
  }, [userId, folderFilter]);

  useEffect(() => {
    filterAssets();
  }, [mediaAssets, searchTerm, visibilityFilter]);

  const loadMediaAssets = async () => {
    setLoading(true);
    try {
      const result = await getUserMedia(
        userId, 
        folderFilter === 'all' ? undefined : folderFilter,
        50
      );
      
      if (result.success && result.data) {
        setMediaAssets(result.data);
      }
    } catch (error) {
      console.error('Error loading media assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAssets = () => {
    let filtered = [...mediaAssets];

    if (searchTerm) {
      filtered = filtered.filter(asset => 
        asset.originalFilename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (visibilityFilter !== 'all') {
      filtered = filtered.filter(asset => asset.visibility === visibilityFilter);
    }

    setFilteredAssets(filtered);
  };

  const handleUploadComplete = (uploadedMedia: UploadedMedia) => {
    // Add to the beginning of the list
    const newAsset: MediaAsset = {
      id: uploadedMedia.id,
      originalFilename: uploadedMedia.originalName,
      url: uploadedMedia.url,
      contentType: uploadedMedia.type,
      visibility: 'public', // Default, would be updated based on actual upload
      folder: folderFilter === 'all' ? 'general' : folderFilter,
      size: uploadedMedia.size,
      createdAt: new Date().toISOString(),
      tags: uploadedMedia.tags
    };
    
    setMediaAssets(prev => [newAsset, ...prev]);
  };

  const handleDelete = async (assetId: string) => {
    try {
      const result = await deleteMedia(assetId);
      if (result.success) {
        setMediaAssets(prev => prev.filter(asset => asset.id !== assetId));
      }
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (contentType.startsWith('video/')) return <Video className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Eye className="w-4 h-4 text-green-500" />;
      case 'private': return <EyeOff className="w-4 h-4 text-red-500" />;
      case 'mutual': return <Users className="w-4 h-4 text-blue-500" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const uniqueFolders = [...new Set(mediaAssets.map(asset => asset.folder))];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Section */}
      {showUpload && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Media</CardTitle>
          </CardHeader>
          <CardContent>
            <UploadMedia
              userId={userId}
              folder={folderFilter === 'all' ? 'general' : folderFilter}
              onUploadComplete={handleUploadComplete}
              showTags={true}
              showVisibility={showVisibilityFilter}
              multiple={true}
              placeholder="Upload your media files..."
            />
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search media..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={folderFilter} onValueChange={setFolderFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Folders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Folders</SelectItem>
                {uniqueFolders.map(folder => (
                  <SelectItem key={folder} value={folder}>
                    {folder.charAt(0).toUpperCase() + folder.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {showVisibilityFilter && (
              <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Visibility</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="mutual">Friends Only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Filter className="w-4 h-4" />
              {filteredAssets.length} of {mediaAssets.length} files
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))
        ) : filteredAssets.length > 0 ? (
          filteredAssets.map((asset) => (
            <Card key={asset.id} className="group hover:shadow-lg transition-shadow">
              {asset.contentType.startsWith('image/') ? (
                <div className="aspect-square overflow-hidden rounded-t-lg">
                  <img
                    src={asset.url}
                    alt={asset.originalFilename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
              ) : (
                <div className="aspect-square bg-gray-100 rounded-t-lg flex items-center justify-center">
                  {getFileIcon(asset.contentType)}
                  <span className="ml-2 text-sm text-gray-600">
                    {asset.contentType.split('/')[0].toUpperCase()}
                  </span>
                </div>
              )}
              
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate" title={asset.originalFilename}>
                      {asset.originalFilename}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {getVisibilityIcon(asset.visibility)}
                      <span className="text-xs text-gray-500 capitalize">
                        {asset.visibility}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(asset.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>{(asset.size / 1024).toFixed(1)} KB</span>
                  {asset.width && asset.height && (
                    <span>{asset.width}×{asset.height}</span>
                  )}
                </div>

                {asset.tags && asset.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {asset.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {asset.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{asset.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            <Image className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No media found</h3>
            <p className="text-sm">
              {searchTerm || visibilityFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Upload your first media file to get started'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaGallery;