import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getAuthToken } from "@/lib/authUtils";
import { 
  Image as ImageIcon, 
  Video, 
  Calendar, 
  X 
} from "lucide-react";

export default function CreatePost() {
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to create post');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
      setContent("");
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsExpanded(false);
      toast({
        title: "Post created!",
        description: "Your post has been shared with your followers.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = () => {
    if (!content.trim() && !selectedFile) {
      toast({
        title: "Empty post",
        description: "Please add some content or upload an image/video.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('content', content);
    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    createPostMutation.mutate(formData);
  };

  return (
    <Card className="card-shadow mb-6">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.profileImage || ""} alt={user?.name} />
            <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            {!isExpanded ? (
              <button
                onClick={() => setIsExpanded(true)}
                className="w-full text-left bg-gray-100 rounded-full px-4 py-2 text-gray-500 hover:bg-gray-200 transition-colors"
              >
                Share your tango experience...
              </button>
            ) : (
              <Textarea
                placeholder="Share your tango experience..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="resize-none border-none p-0 text-base placeholder:text-gray-500 focus-visible:ring-0"
                rows={3}
              />
            )}
          </div>
        </div>

        {previewUrl && (
          <div className="mb-4 relative">
            <button
              onClick={removeFile}
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
            >
              <X className="h-4 w-4" />
            </button>
            {selectedFile?.type.startsWith('image/') ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full rounded-lg object-cover max-h-96"
              />
            ) : (
              <video
                src={previewUrl}
                controls
                className="w-full rounded-lg max-h-96"
              />
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2 text-gray-600 hover:text-tango-red cursor-pointer">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <ImageIcon className="h-5 w-5" />
              <span className="text-sm">Photo/Video</span>
            </label>
            
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-tango-red p-0">
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
                  removeFile();
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={createPostMutation.isPending}
                className="bg-tango-red hover:bg-tango-red/90"
              >
                {createPostMutation.isPending ? "Posting..." : "Post"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
