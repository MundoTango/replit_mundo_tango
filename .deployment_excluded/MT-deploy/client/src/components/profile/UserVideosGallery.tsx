import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Video, Plus, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface UserVideosGalleryProps {
  userId: number;
  isOwnProfile: boolean;
}

export function UserVideosGallery({ userId, isOwnProfile }: UserVideosGalleryProps) {
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const { data: videos = [], isLoading, error } = useQuery({
    queryKey: ['/api/user/videos', userId],
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="glassmorphic-card aspect-video">
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load videos</h3>
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
              Upload Video
            </Button>
          </div>
        )}

        {videos.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {videos.map((video: any) => (
              <Card
                key={video.id}
                className="glassmorphic-card cursor-pointer hover:shadow-lg transform transition-all hover:-translate-y-1 relative group"
                onClick={() => setSelectedVideo(video)}
              >
                <CardContent className="p-0">
                  <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.caption || 'Video thumbnail'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <Play className="h-12 w-12 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glassmorphic-card">
            <CardContent className="p-12 text-center">
              <Video className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No videos yet</h3>
              <p className="text-gray-600">
                {isOwnProfile
                  ? 'Start sharing your tango performances by uploading your first video.'
                  : 'No videos to display.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Video Player Dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedVideo?.caption || 'Video'}</DialogTitle>
            <DialogDescription>
              {selectedVideo?.createdAt && new Date(selectedVideo.createdAt).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          <div className="relative aspect-video bg-black rounded-lg">
            {selectedVideo?.url && (
              <video
                src={selectedVideo.url}
                controls
                className="w-full h-full rounded-lg"
                autoPlay
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Video</DialogTitle>
            <DialogDescription>
              Choose a video from your device to upload to your gallery.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Video upload functionality coming soon.</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}