import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Upload, Image, Video, File, Plus } from 'lucide-react';
import { uploadMedia } from '@/services/upload';

export interface UploadedMedia {
  id: string;
  url: string;
  path: string;
  originalName: string;
  type: string;
  size: number;
  tags?: string[];
}

export interface UploadMediaProps {
  folder?: string;
  userId: number;
  context?: string;
  visibility?: 'public' | 'private' | 'mutual';
  usedIn?: string;
  refId?: number;
  onUploadComplete?: (result: UploadedMedia) => void;
  onUploadError?: (error: string) => void;
  maxSize?: number; // in MB
  maxDimensions?: { width: number; height: number };
  multiple?: boolean;
  acceptedTypes?: string[];
  autoResize?: boolean;
  convertToJpeg?: boolean;
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  showTags?: boolean;
  showVisibility?: boolean;
  placeholder?: string;
}

export const UploadMedia: React.FC<UploadMediaProps> = ({
  folder = 'general',
  userId,
  context,
  visibility = 'public',
  usedIn,
  refId,
  onUploadComplete,
  onUploadError,
  maxSize = 5,
  maxDimensions = { width: 1200, height: 1200 },
  multiple = false,
  acceptedTypes = ['image/*', 'video/*', 'application/pdf'],
  autoResize = true,
  convertToJpeg = true,
  className = '',
  disabled = false,
  showPreview = true,
  showTags = true,
  showVisibility = false,
  placeholder = 'Drag and drop files here, or click to select'
}) => {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedMedia[]>([]);
  const [currentVisibility, setCurrentVisibility] = useState(visibility);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled || isUploading) return;

    for (const file of acceptedFiles) {
      // File size validation
      if (file.size > maxSize * 1024 * 1024) {
        onUploadError?.(`File "${file.name}" exceeds ${maxSize}MB limit`);
        continue;
      }

      // Create preview for images
      if (showPreview && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviews(prev => ({ ...prev, [file.name]: e.target?.result as string }));
        };
        reader.readAsDataURL(file);
      }

      setIsUploading(true);
      setUploadProgress(0);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);
        formData.append('visibility', currentVisibility);
        formData.append('tags', JSON.stringify(tags));
        
        if (context) formData.append('context', context);
        if (usedIn) formData.append('usedIn', usedIn);
        if (refId) formData.append('refId', refId.toString());

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 10, 90));
        }, 200);

        const result = await uploadMedia(formData);
        
        clearInterval(progressInterval);
        setUploadProgress(100);

        if (result.success && result.data) {
          const uploadedMedia: UploadedMedia = {
            id: result.data.id || '',
            url: result.data.url,
            path: result.data.path,
            originalName: file.name,
            type: file.type,
            size: file.size,
            tags: tags.length > 0 ? [...tags] : undefined
          };

          setUploadedFiles(prev => [...prev, uploadedMedia]);
          onUploadComplete?.(uploadedMedia);

          // Track upload analytics
          if (window.plausible) {
            window.plausible('Media Upload', {
              props: {
                folder,
                context: context || 'general',
                visibility: currentVisibility,
                fileType: file.type.split('/')[0],
                fileSize: Math.round(file.size / 1024) // KB
              }
            });
          }
        } else {
          throw new Error(result.error || 'Upload failed');
        }
      } catch (error) {
        console.error('Upload error:', error);
        onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  }, [
    disabled,
    isUploading,
    maxSize,
    folder,
    currentVisibility,
    tags,
    context,
    usedIn,
    refId,
    onUploadComplete,
    onUploadError,
    showPreview
  ]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    multiple,
    disabled: disabled || isUploading
  });

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type.startsWith('video/')) return <Video className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Visibility Settings */}
      {showVisibility && (
        <div className="space-y-2">
          <Label>Visibility</Label>
          <Select value={currentVisibility} onValueChange={(value) => setCurrentVisibility(value as 'public' | 'private' | 'mutual')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public - Everyone can see</SelectItem>
              <SelectItem value="mutual">Mutual - Only friends can see</SelectItem>
              <SelectItem value="private">Private - Only you can see</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Tags */}
      {showTags && (
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex gap-2 flex-wrap">
            {tags.map(tag => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-red-500" 
                  onClick={() => removeTag(tag)} 
                />
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag..."
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
              className="flex-1"
            />
            <Button type="button" size="sm" onClick={addTag} disabled={!newTag.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'}
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 mb-1">
          {isDragActive ? 'Drop files here...' : placeholder}
        </p>
        <p className="text-xs text-gray-400">
          Max {maxSize}MB • {maxDimensions.width}x{maxDimensions.height}px • {acceptedTypes.join(', ')}
        </p>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <Label>Uploaded Files</Label>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50"
              >
                {showPreview && previews[file.originalName] ? (
                  <img
                    src={previews[file.originalName]}
                    alt={file.originalName}
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  getFileIcon(file.type)
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.originalName}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadMedia;