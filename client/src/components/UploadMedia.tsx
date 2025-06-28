import React, { useState, useRef } from 'react';
import { uploadFile, UploadResponse } from '../services/upload';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { X, Upload, Image, Video, FileText } from 'lucide-react';

interface UploadMediaProps {
  onUploadComplete?: (result: UploadResponse) => void;
  onUploadStart?: () => void;
  folder?: string;
  userId?: number;
  acceptedTypes?: string;
  maxSize?: number; // in MB
  multiple?: boolean;
  className?: string;
}

interface FileWithPreview {
  file: File;
  preview?: string;
  id: string;
}

export const UploadMedia: React.FC<UploadMediaProps> = ({
  onUploadComplete,
  onUploadStart,
  folder = 'general',
  userId,
  acceptedTypes = 'image/*,video/*,.pdf,.doc,.docx,.txt',
  maxSize = 10,
  multiple = false,
  className = ''
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: FileWithPreview[] = [];
    
    Array.from(selectedFiles).forEach((file) => {
      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File ${file.name} is too large. Maximum size is ${maxSize}MB.`);
        return;
      }

      // Create preview for images
      const fileWithPreview: FileWithPreview = {
        file,
        id: `${Date.now()}_${Math.random().toString(36).substring(7)}`
      };

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          fileWithPreview.preview = e.target?.result as string;
          setFiles(prev => [...prev.filter(f => f.id !== fileWithPreview.id), fileWithPreview]);
        };
        reader.readAsDataURL(file);
      }

      newFiles.push(fileWithPreview);
    });

    if (multiple) {
      setFiles(prev => [...prev, ...newFiles]);
    } else {
      setFiles(newFiles);
    }
    
    setError('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    setError('');
    onUploadStart?.();

    try {
      const uploadPromises = files.map(async (fileWithPreview, index) => {
        const result = await uploadFile(fileWithPreview.file, folder, userId);
        
        // Update progress
        setUploadProgress(((index + 1) / files.length) * 100);
        
        return result;
      });

      const results = await Promise.all(uploadPromises);
      
      // Check for errors
      const errors = results.filter(r => !r.success);
      if (errors.length > 0) {
        setError(`Upload failed: ${errors.map(e => e.error).join(', ')}`);
      } else {
        // All successful
        results.forEach(result => onUploadComplete?.(result));
        setFiles([]);
        setUploadProgress(100);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-6 h-6" />;
    if (file.type.startsWith('video/')) return <Video className="w-6 h-6" />;
    return <FileText className="w-6 h-6" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Drop files here or click to browse
        </p>
        <p className="text-sm text-gray-500">
          Maximum file size: {maxSize}MB
        </p>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={acceptedTypes}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((fileWithPreview) => (
            <div key={fileWithPreview.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              {/* File Icon/Preview */}
              <div className="flex-shrink-0">
                {fileWithPreview.preview ? (
                  <img
                    src={fileWithPreview.preview}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                    {getFileIcon(fileWithPreview.file)}
                  </div>
                )}
              </div>
              
              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {fileWithPreview.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(fileWithPreview.file.size)}
                </p>
              </div>
              
              {/* Remove Button */}
              {!uploading && (
                <button
                  onClick={() => removeFile(fileWithPreview.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Uploading...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <div className="mt-4">
          <Button
            onClick={uploadFiles}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? 'Uploading...' : `Upload ${files.length} file${files.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default UploadMedia;