import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, Camera, Video, X, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadedFile {
  id: string;
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
}

interface InternalUploaderProps {
  onUploadComplete: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  accept?: string;
  multiple?: boolean;
  className?: string;
}

export function InternalUploader({
  onUploadComplete,
  maxFiles = 30,
  maxFileSize = 500,
  accept = "image/*,video/*",
  multiple = true,
  className = ""
}: InternalUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate file count
    if (files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive"
      });
      return;
    }

    // Validate file sizes
    const oversizedFiles = files.filter(file => file.size > maxFileSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: "Files too large",
        description: `Maximum file size is ${maxFileSize}MB`,
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      console.log(`[Internal Upload] Starting upload of ${files.length} files`);

      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
          console.log(`[Internal Upload] Progress: ${progress}%`);
        }
      });

      // Handle upload completion
      const uploadPromise = new Promise<UploadedFile[]>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              if (response.success) {
                console.log('[Internal Upload] ✅ Upload successful:', response);
                resolve(response.files);
              } else {
                reject(new Error(response.error || 'Upload failed'));
              }
            } catch (e) {
              reject(new Error('Invalid response format'));
            }
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error('Network error during upload'));
        };

        xhr.ontimeout = () => {
          reject(new Error('Upload timeout'));
        };
      });

      xhr.open('POST', '/api/upload');
      xhr.timeout = 0; // No timeout for large files
      xhr.send(formData);

      const newFiles = await uploadPromise;
      
      setUploadedFiles(prev => [...prev, ...newFiles]);
      onUploadComplete(newFiles);
      
      setUploadProgress(100);
      
      toast({
        title: "Upload successful",
        description: `${newFiles.length} files uploaded successfully`,
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Reset progress after delay
      setTimeout(() => {
        setUploadProgress(0);
      }, 2000);

    } catch (error) {
      console.error('[Internal Upload] Error:', error);
      setUploadProgress(0);
      
      toast({
        title: "Upload failed", 
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => {
        setIsUploading(false);
      }, 2000);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Button */}
      <div className="flex flex-col space-y-3">
        <Button
          onClick={handleFileSelect}
          disabled={isUploading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          {isUploading ? (
            <>
              <Upload className="h-5 w-5 animate-pulse" />
              <span>Uploading... {uploadProgress}%</span>
            </>
          ) : (
            <>
              <Camera className="h-5 w-5" />
              <span>Upload Media Files</span>
              <Video className="h-5 w-5" />
            </>
          )}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />

        <p className="text-sm text-gray-600 text-center">
          Support images and videos • Max {maxFiles} files • Up to {maxFileSize}MB each
        </p>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Uploading files...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Uploaded Files Preview */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700">
            Uploaded Files ({uploadedFiles.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                  {file.mimetype.startsWith('image/') ? (
                    <img
                      src={file.thumbnailUrl || file.url}
                      alt={file.originalname}
                      className="w-full h-full object-cover"
                    />
                  ) : file.mimetype.startsWith('video/') ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      <Video className="h-8 w-8 text-white" />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Upload className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Remove button */}
                  <button
                    onClick={() => removeFile(file.id)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  
                  {/* Success indicator */}
                  <div className="absolute bottom-1 right-1 p-1 bg-green-500 text-white rounded-full">
                    <CheckCircle className="h-3 w-3" />
                  </div>
                </div>
                
                <p className="text-xs text-gray-600 mt-1 truncate" title={file.originalname}>
                  {file.originalname}
                </p>
                <p className="text-xs text-gray-400">
                  {formatFileSize(file.size)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}