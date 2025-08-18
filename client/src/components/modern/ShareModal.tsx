import React, { useState } from 'react';
import { Share2, MessageSquare, Link, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: number;
    content: string;
    user: {
      name: string;
    };
  };
}

export default function ShareModal({ isOpen, onClose, post }: ShareModalProps) {
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const handleShareToTimeline = async () => {
    setIsSharing(true);
    try {
      // Implement share to timeline logic
      toast({
        title: "Shared successfully",
        description: "Post shared to your timeline",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Failed to share post",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareWithComment = async () => {
    setIsSharing(true);
    try {
      // Implement share with comment logic
      toast({
        title: "Opening composer",
        description: "Add your thoughts when sharing",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Failed to open composer",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const postUrl = `${window.location.origin}/post/${post.id}`;
      await navigator.clipboard.writeText(postUrl);
      toast({
        title: "Link copied",
        description: "Post link copied to clipboard",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Post
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700 line-clamp-3">
              {post.content}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              by {post.user.name}
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleShareToTimeline}
              disabled={isSharing}
              className="w-full flex items-center gap-3 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              <Share2 className="w-5 h-5" />
              Share to Timeline
            </Button>

            <Button
              onClick={handleShareWithComment}
              disabled={isSharing}
              variant="outline"
              className="w-full flex items-center gap-3 h-12"
            >
              <MessageSquare className="w-5 h-5" />
              Share with Comment
            </Button>

            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="w-full flex items-center gap-3 h-12"
            >
              <Link className="w-5 h-5" />
              Copy Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}