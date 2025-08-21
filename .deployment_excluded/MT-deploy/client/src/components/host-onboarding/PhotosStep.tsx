import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Camera, X, Star, Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from '@/hooks/use-toast';

interface PhotosStepProps {
  data: any;
  updateData: (data: any) => void;
}

export default function PhotosStep({ data, updateData }: PhotosStepProps) {
  const [photos, setPhotos] = useState<any[]>(data.photos || []);

  const onDrop = (acceptedFiles: File[]) => {
    const newPhotos = acceptedFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }));

    const updatedPhotos = [...photos, ...newPhotos];
    setPhotos(updatedPhotos);
    updateData({ photos: updatedPhotos.map(p => p.file) });

    if (acceptedFiles.length < acceptedFiles.length) {
      toast({
        title: 'Some files were rejected',
        description: 'Please make sure all files are images under 10MB.',
        variant: 'destructive',
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
  });

  const removePhoto = (id: string) => {
    const updatedPhotos = photos.filter((photo) => photo.id !== id);
    setPhotos(updatedPhotos);
    updateData({ photos: updatedPhotos.map(p => p.file) });
  };

  const setCoverPhoto = (id: string) => {
    const reorderedPhotos = [
      photos.find((p) => p.id === id),
      ...photos.filter((p) => p.id !== id),
    ].filter(Boolean);
    setPhotos(reorderedPhotos);
    updateData({ photos: reorderedPhotos.map(p => p.file) });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Add some photos of your place</h2>
        <p className="text-gray-600">
          Great photos are key to attracting guests. Upload at least 5 photos to get started.
        </p>
      </div>

      {/* Photo tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Photo tips for success</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use natural lighting when possible</li>
          <li>• Show accurate representations of your space</li>
          <li>• Include photos of all rooms guests can access</li>
          <li>• Highlight unique features and amenities</li>
          <li>• Keep photos current and seasonal</li>
        </ul>
      </div>

      {/* Upload area */}
      <div>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-pink-500 bg-pink-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-1">
            {isDragActive ? 'Drop your photos here' : 'Drag and drop photos here'}
          </p>
          <p className="text-sm text-gray-500 mb-4">or</p>
          <Button type="button" variant="outline">
            Browse files
          </Button>
          <p className="text-xs text-gray-500 mt-4">
            Support: JPG, JPEG, PNG, WEBP (max 10MB each)
          </p>
        </div>
      </div>

      {/* Photo grid */}
      {photos.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <Label className="text-lg font-medium">Your photos ({photos.length})</Label>
            {photos.length < 5 && (
              <p className="text-sm text-orange-600">
                Add at least {5 - photos.length} more photos
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo, index) => (
              <div key={photo.id} className="relative group">
                <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={photo.url}
                    alt={`Property photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Cover photo badge */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Cover photo
                  </div>
                )}
                
                {/* Action buttons */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  {index !== 0 && (
                    <button
                      type="button"
                      onClick={() => setCoverPhoto(photo.id)}
                      className="bg-white p-1.5 rounded-full shadow-lg hover:bg-gray-100"
                      title="Set as cover photo"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    className="bg-white p-1.5 rounded-full shadow-lg hover:bg-gray-100"
                    title="Remove photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Minimum photos warning */}
      {photos.length > 0 && photos.length < 5 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-800">
            <strong>Almost there!</strong> Properties with at least 5 photos get 
            more views and bookings. Add {5 - photos.length} more to complete your listing.
          </p>
        </div>
      )}
    </div>
  );
}