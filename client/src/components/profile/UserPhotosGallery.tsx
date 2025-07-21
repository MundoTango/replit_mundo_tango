import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Camera, Plus, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface UserPhotosGalleryProps {
  userId: number;
  isOwnProfile: boolean;
}

export function UserPhotosGallery({ userId, isOwnProfile }: UserPhotosGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const { data: photos = [], isLoading, error } = useQuery({
    queryKey: ['/api/user/photos', userId],
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="glassmorphic-card aspect-square">
            <CardContent className="p-0">
              <div className="animate-pulse bg-gray-200 w-full h-full rounded-lg"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="glassmorphic-card">
        <CardContent className="p-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load photos</h3>
          <p className="text-gray-600">Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {isOwnProfile && (
          <div className="flex justify-end">
            <Button
              onClick={() => setShowUploadDialog(true)}
              className="bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Upload Photo
            </Button>
          </div>
        )}

        {photos.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {photos.map((photo: any) => (
              <Card
                key={photo.id}
                className="glassmorphic-card cursor-pointer hover:shadow-lg transform transition-all hover:-translate-y-1"
                onClick={() => setSelectedPhoto(photo)}
              >
                <CardContent className="p-0">
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Photo'}
                    className="w-full h-full object-cover rounded-lg aspect-square"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glassmorphic-card">
            <CardContent className="p-12 text-center">
              <Camera className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No photos yet</h3>
              <p className="text-gray-600">
                {isOwnProfile
                  ? 'Start sharing your tango moments by uploading your first photo.'
                  : 'No photos to display.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Photo Viewer Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedPhoto?.caption || 'Photo'}</DialogTitle>
            <DialogDescription>
              {selectedPhoto?.createdAt && new Date(selectedPhoto.createdAt).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <img
              src={selectedPhoto?.url}
              alt={selectedPhoto?.caption || 'Photo'}
              className="w-full h-auto rounded-lg"
            />
            <Button
              onClick={() => setSelectedPhoto(null)}
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-white/20 backdrop-blur-md hover:bg-white/30"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Photo</DialogTitle>
            <DialogDescription>
              Choose a photo from your device to upload to your gallery.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Photo upload functionality coming soon.</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}