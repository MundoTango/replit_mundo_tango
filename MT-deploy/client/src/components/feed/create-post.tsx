import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useFastUpload } from "@/hooks/useFastUpload";
import { 
  Image as ImageIcon, 
  Video, 
  Calendar, 
  X,
  Clock,
  Upload
} from "lucide-react";

export default function CreatePost() {
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [processingTime, setProcessingTime] = useState<number>(0);
  const [uploadStartTime, setUploadStartTime] = useState<number>(0);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Use the fast upload hook for Facebook/Instagram-style instant posting
  const { upload, isUploading, progress, jobId, reset } = useFastUpload();

  // Track processing time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isUploading && uploadStartTime > 0) {
      interval = setInterval(() => {
        setProcessingTime(Date.now() - uploadStartTime);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isUploading, uploadStartTime]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Check for large files and warn user
      const largeFiles = files.filter(f => f.size > 50 * 1024 * 1024); // 50MB
      if (largeFiles.length > 0) {
        toast({
          title: "Large files detected",
          description: "Files will be compressed for faster upload (Facebook-style)",
          duration: 3000
        });
      }
      
      setSelectedFiles(files);
      const urls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  const removeFiles = () => {
    setSelectedFiles([]);
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
  };

  const handleSubmit = async () => {
    if (!content.trim() && selectedFiles.length === 0) {
      toast({
        title: "Empty post",
        description: "Please add some content or upload an image/video.",
        variant: "destructive",
      });
      return;
    }

    // Track upload start time for processing display
    setUploadStartTime(Date.now());
    
    const postData = {
      content,
      isPublic: true,
      location: null
    };

    try {
      // ESA LIFE CEO 61x21 - Optimized direct upload
      console.log('🚀 Starting optimized upload with', selectedFiles.length, 'files');
      
      await upload(selectedFiles, postData, {
        onSuccess: (result) => {
          const totalTime = Date.now() - uploadStartTime;
          // Post created successfully
          
          // Show success immediately
          toast({
            title: "Posted! 🎉",
            description: `Your post is live! (${(totalTime/1000).toFixed(1)}s)`,
            duration: 3000
          });
          
          // Update feed immediately
          queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
          queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
          
          // Reset form
          setContent("");
          setSelectedFiles([]);
          removeFiles();
          setIsExpanded(false);
          setProcessingTime(0);
          setUploadStartTime(0);
          reset();
        },
        onError: (error) => {
          console.error('❌ Upload failed:', error);
          toast({
            title: "Upload failed",
            description: error,
            variant: "destructive",
            duration: 5000
          });
        },
        waitForCompletion: false // Instant feedback
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload error",
        description: error.message || 'Please try again',
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="glassmorphic-card rounded-xl shadow-lg mb-6">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="w-10 h-10 ring-2 ring-turquoise-200">
            <AvatarImage src={user?.profileImage || ""} alt={user?.name} />
            <AvatarFallback className="bg-gradient-to-br from-turquoise-400 to-cyan-500 text-white">{user?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            {!isExpanded ? (
              <button
                onClick={() => setIsExpanded(true)}
                className="w-full text-left bg-gradient-to-r from-turquoise-50 to-cyan-50 rounded-full px-4 py-2 text-turquoise-600 hover:from-turquoise-100 hover:to-cyan-100 transition-all duration-300"
              >
                Share your tango experience...
              </button>
            ) : (
              <Textarea
                placeholder="Share your tango experience..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="resize-none border-none p-0 text-base placeholder:text-turquoise-400 focus-visible:ring-0 bg-transparent"
                rows={3}
              />
            )}
          </div>
        </div>

        {/* Upload Progress Bar - Facebook/Instagram style */}
        {isUploading && (
          <div className="mb-4 p-3 bg-gradient-to-r from-turquoise-50 to-cyan-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Upload className="h-4 w-4 text-turquoise-600 animate-pulse" />
                <span className="text-sm font-medium text-turquoise-700">
                  {progress < 30 ? 'Compressing...' : 
                   progress < 90 ? 'Uploading...' : 
                   progress < 100 ? 'Creating post...' : 'Complete!'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-cyan-600" />
                <span className="text-sm text-cyan-700">
                  {(processingTime / 1000).toFixed(1)}s
                </span>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="mt-1 text-xs text-turquoise-600">
              {progress}% • {selectedFiles.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024 > 5 ? 'Large file optimization' : 'Fast upload'}
            </div>
          </div>
        )}

        {previewUrls.length > 0 && (
          <div className="mb-4 relative">
            <button
              onClick={removeFiles}
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 z-10"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="grid grid-cols-2 gap-2">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative">
                  {selectedFiles[index]?.type.startsWith('image/') ? (
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full rounded-lg object-cover h-48"
                    />
                  ) : (
                    <video
                      src={url}
                      controls
                      className="w-full rounded-lg h-48"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2 text-turquoise-600 hover:text-cyan-600 cursor-pointer transition-colors">
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
              <ImageIcon className="h-5 w-5" />
              <span className="text-sm">Photo/Video</span>
            </label>
            
            <Button variant="ghost" size="sm" className="text-turquoise-600 hover:text-cyan-600 p-0 transition-colors">
              <Calendar className="h-5 w-5 mr-2" />
              <span className="text-sm">Event</span>
            </Button>
          </div>
          
          {isExpanded && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsExpanded(false);
                  setContent("");
                  removeFiles();
                  reset();
                }}
                className="border-turquoise-200 text-turquoise-600 hover:bg-turquoise-50"
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={isUploading}
                className="bg-gradient-to-r from-turquoise-500 to-cyan-500 hover:from-turquoise-600 hover:to-cyan-600 text-white transition-all duration-300"
              >
                {isUploading ? `Uploading... ${progress}%` : "Post ⚡"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
