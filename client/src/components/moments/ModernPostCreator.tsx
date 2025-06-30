import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { 
  Camera, Video, MapPin, Globe, Users, Lock, X, 
  ImageIcon, Smile, Send, Plus, Zap, Upload, Link2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import ReactQuill from 'react-quill';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { MentionsInput, Mention } from 'react-mentions';
import 'react-quill/dist/quill.snow.css';

interface ModernPostCreatorProps {
  onPostCreated?: () => void;
  initialContent?: string;
  replyToPostId?: number;
}

interface MediaFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

interface SocialEmbed {
  type: 'instagram' | 'twitter' | 'youtube' | 'tiktok' | 'facebook';
  url: string;
  preview?: string;
}

interface UserSuggestion {
  id: string;
  display: string;
  avatar?: string;
}

export default function ModernPostCreator({ 
  onPostCreated, 
  initialContent = '',
  replyToPostId 
}: ModernPostCreatorProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const quillRef = useRef<ReactQuill>(null);
  
  const [showExpandedComposer, setShowExpandedComposer] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [socialEmbeds, setSocialEmbeds] = useState<SocialEmbed[]>([]);
  const [location, setLocation] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch users for mentions
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users/search'],
    queryFn: async () => {
      const response = await fetch('/api/users/search?limit=50');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      return data.data || [];
    }
  });

  // Convert users to mention format
  const mentionUsers = useMemo(() => 
    users.map((user: any) => ({
      id: user.id.toString(),
      display: user.username || user.name,
      avatar: user.profileImage
    }))
  , [users]);

  // Enhanced Quill modules with better toolbar
  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'header': [1, 2, 3, false] }],
        [{ 'color': [] }, { 'background': [] }],
        ['link'],
        ['clean']
      ]
    },
    clipboard: {
      matchVisual: false,
    }
  }), []);

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'link', 'color', 'background', 'code-block'
  ];

  // Mention styles for react-mentions
  const mentionStyle = {
    control: {
      backgroundColor: '#fff',
      fontSize: 16,
      fontWeight: 'normal',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '16px',
      minHeight: '120px',
      fontFamily: 'inherit'
    },
    '&multiLine': {
      control: {
        fontFamily: 'inherit',
        minHeight: 120,
      },
      highlighter: {
        padding: 16,
        border: '1px solid transparent',
        borderRadius: '12px',
      },
      input: {
        padding: 16,
        border: '1px solid transparent',
        borderRadius: '12px',
        outline: 0,
        fontSize: 16,
        resize: 'none' as const
      },
    },
    suggestions: {
      list: {
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        fontSize: 16,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        maxHeight: '200px',
        overflow: 'auto'
      },
      item: {
        padding: '12px 16px',
        borderBottom: '1px solid #f3f4f6',
        display: 'flex',
        alignItems: 'center',
        '&focused': {
          backgroundColor: '#fef7ff',
        },
      },
    },
  };

  // Handle content changes with mention and hashtag detection
  const handleContentChange = useCallback((value: string) => {
    setContent(value);
  }, []);

  // Handle emoji selection for MentionsInput
  const handleEmojiClick = useCallback((emojiData: EmojiClickData) => {
    setContent(prev => prev + emojiData.emoji);
    // Don't close picker immediately to allow multiple emoji selection
  }, []);

  // Handle file uploads with drag and drop
  const handleFileUpload = useCallback(async (files: FileList) => {
    setIsUploading(true);
    const newFiles: MediaFile[] = [];

    try {
      for (const file of Array.from(files)) {
        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
          const preview = URL.createObjectURL(file);
          newFiles.push({
            file,
            preview,
            type: file.type.startsWith('image/') ? 'image' : 'video'
          });
        }
      }
      setMediaFiles(prev => [...prev, ...newFiles]);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to process uploaded files",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  }, []);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  // Social media URL detection
  const detectSocialMedia = useCallback((url: string): SocialEmbed | null => {
    const patterns = {
      instagram: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/,
      twitter: /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/,
      youtube: /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/,
      tiktok: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[\w.]+\/video\/(\d+)/,
      facebook: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/.*\/(?:posts|videos)\/(\d+)/
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(url)) {
        return {
          type: type as SocialEmbed['type'],
          url,
          preview: url
        };
      }
    }
    return null;
  }, []);

  // Handle social media embedding
  const handleSocialEmbed = useCallback(() => {
    const url = prompt('Enter social media URL (Instagram, Twitter, YouTube, TikTok, Facebook):');
    if (url) {
      const embed = detectSocialMedia(url);
      if (embed) {
        setSocialEmbeds(prev => [...prev, embed]);
      } else {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid social media URL",
          variant: "destructive"
        });
      }
    }
  }, [detectSocialMedia]);

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const formData = new FormData();
      
      // Add text content
      formData.append('content', postData.content);
      formData.append('richContent', postData.richContent);
      formData.append('visibility', postData.visibility);
      formData.append('location', postData.location);
      
      // Add media files
      postData.mediaFiles.forEach((mediaFile: MediaFile, index: number) => {
        formData.append(`media_${index}`, mediaFile.file);
      });
      
      // Add social embeds
      formData.append('socialEmbeds', JSON.stringify(postData.socialEmbeds));
      
      if (postData.replyToPostId) {
        formData.append('replyToPostId', postData.replyToPostId.toString());
      }

      const response = await fetch('/api/posts/enhanced', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to create post');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      resetForm();
      setShowExpandedComposer(false);
      onPostCreated?.();
      toast({
        title: "Post created!",
        description: "Your post has been shared successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create post",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setContent('');
    setMediaFiles([]);
    setSocialEmbeds([]);
    setLocation('');
    setVisibility('public');
    setShowEmojiPicker(false);
  };

  const handleSubmit = () => {
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    
    if (!plainText && mediaFiles.length === 0 && socialEmbeds.length === 0) {
      toast({
        title: "Empty post",
        description: "Please add some content, media, or embeds to your post.",
        variant: "destructive"
      });
      return;
    }

    if (plainText.length > 2000) {
      toast({
        title: "Post too long",
        description: "Please keep your post under 2000 characters.",
        variant: "destructive"
      });
      return;
    }

    createPostMutation.mutate({
      content: plainText,
      richContent: content,
      mediaFiles,
      socialEmbeds,
      location,
      visibility,
      replyToPostId
    });
  };

  const removeMediaFile = (index: number) => {
    setMediaFiles(prev => {
      const updated = prev.filter((_, i) => i !== index);
      // Clean up object URLs
      if (prev[index]) {
        URL.revokeObjectURL(prev[index].preview);
      }
      return updated;
    });
  };

  const removeSocialEmbed = (index: number) => {
    setSocialEmbeds(prev => prev.filter((_, i) => i !== index));
  };

  // Compact composer button
  if (!showExpandedComposer) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <button
            onClick={() => setShowExpandedComposer(true)}
            className="flex-1 text-left px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-pink-50 hover:to-blue-50 rounded-full text-gray-600 hover:text-gray-800 transition-all duration-200 border border-gray-200"
          >
            Share your tango moment...
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Create Post</h3>
          <button
            onClick={() => setShowExpandedComposer(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div 
          className={`p-6 max-h-[calc(90vh-140px)] overflow-y-auto ${isDragging ? 'bg-pink-50 border-2 border-dashed border-pink-300' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* User info */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.name || 'User'}</p>
              <div className="flex items-center space-x-2">
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as any)}
                  className="text-sm text-gray-600 border border-gray-200 rounded-md px-2 py-1"
                >
                  <option value="public">🌍 Public</option>
                  <option value="friends">👥 Friends</option>
                  <option value="private">🔒 Private</option>
                </select>
              </div>
            </div>
          </div>

          {/* Rich Text Editor with Mentions */}
          <div className="mb-4">
            <MentionsInput
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              style={mentionStyle}
              placeholder="What's happening in your tango world? Use @mentions and #hashtags..."

              suggestionsPortalHost={document.body}
            >
              <Mention
                trigger="@"
                data={mentionUsers}
                style={{
                  backgroundColor: '#dbeafe',
                  color: '#1d4ed8',
                  fontWeight: 'bold',
                  borderRadius: '4px',
                  padding: '2px 4px'
                }}
                renderSuggestion={(suggestion: any) => (
                  <div className="flex items-center space-x-2">
                    {suggestion.avatar ? (
                      <img 
                        src={suggestion.avatar} 
                        alt={suggestion.display}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {suggestion.display.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span>@{suggestion.display}</span>
                  </div>
                )}
              />
            </MentionsInput>
          </div>

          {/* Media Files Preview */}
          {mediaFiles.length > 0 && (
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-3">
                {mediaFiles.map((media, index) => (
                  <div key={index} className="relative rounded-lg overflow-hidden bg-gray-100">
                    {media.type === 'image' ? (
                      <img
                        src={media.preview}
                        alt="Upload preview"
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <video
                        src={media.preview}
                        className="w-full h-32 object-cover"
                        controls
                      />
                    )}
                    <button
                      onClick={() => removeMediaFile(index)}
                      className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Embeds Preview */}
          {socialEmbeds.length > 0 && (
            <div className="mb-4 space-y-3">
              {socialEmbeds.map((embed, index) => (
                <div key={index} className="relative p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600 capitalize">
                        {embed.type}
                      </span>
                      <span className="text-sm text-gray-500 truncate">
                        {embed.preview}
                      </span>
                    </div>
                    <button
                      onClick={() => removeSocialEmbed(index)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Location Display */}
          {location && (
            <div className="mb-4">
              <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-800">{location}</span>
                <button
                  onClick={() => setLocation('')}
                  className="ml-auto text-green-600 hover:text-green-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="mb-4">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                width="100%"
                height={350}
                searchDisabled={false}
                skinTonesDisabled={false}
                previewConfig={{
                  showPreview: true
                }}
              />
            </div>
          )}

          {isDragging && (
            <div className="text-center py-8 text-pink-600">
              <Upload className="w-12 h-12 mx-auto mb-2" />
              <p className="text-lg font-medium">Drop files here to upload</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center space-x-3">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center space-x-2 px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors disabled:opacity-50"
              title="Upload photos or videos"
            >
              <Camera className="w-4 h-4" />
              <span>Media</span>
            </button>

            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
              title="Add emoji"
            >
              <Smile className="w-4 h-4" />
              <span>Emoji</span>
            </button>

            <button
              onClick={handleSocialEmbed}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              title="Embed social media"
            >
              <Link2 className="w-4 h-4" />
              <span>Embed</span>
            </button>
            
            <button
              onClick={() => {
                const loc = prompt('Add location:');
                if (loc) setLocation(loc);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              title="Add location"
            >
              <MapPin className="w-4 h-4" />
              <span>Location</span>
            </button>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={createPostMutation.isPending}
            className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-pink-600 to-blue-600 text-white rounded-lg hover:from-pink-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createPostMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{createPostMutation.isPending ? 'Posting...' : 'Post'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}