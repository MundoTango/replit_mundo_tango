import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Camera, Video, MapPin, Globe, Users, Lock, X, 
  ImageIcon, Smile, AtSign, Hash, Link, 
  Bold, Italic, List, Quote, Type, Palette,
  Send, Plus, Zap
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
// React Quill import removed - causing build issues

interface EnhancedPostCreatorProps {
  onPostCreated?: () => void;
  initialContent?: string;
  replyToPostId?: number;
}

interface MediaEmbed {
  type: 'instagram' | 'twitter' | 'youtube' | 'tiktok' | 'facebook' | 'image' | 'video';
  url: string;
  id?: string;
  preview?: string;
}

interface Mention {
  id: string;
  display: string;
  type: 'user' | 'hashtag';
}

export default function EnhancedPostCreator({ 
  onPostCreated, 
  initialContent = '',
  replyToPostId 
}: EnhancedPostCreatorProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showExpandedComposer, setShowExpandedComposer] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [richContent, setRichContent] = useState(initialContent);
  const [mediaEmbeds, setMediaEmbeds] = useState<MediaEmbed[]>([]);
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [location, setLocation] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMentionPicker, setShowMentionPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Quill modules for rich text editing
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'font': [] }],
        [{ 'align': [] }],
        ['link'],
        ['clean']
      ]
    },
    clipboard: {
      matchVisual: false,
    }
  }), []);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'color', 'background',
    'align', 'script', 'code-block'
  ];

  // Handle rich text content changes
  const handleContentChange = useCallback((value: string) => {
    setRichContent(value);
    // Extract plain text for mentions and validation
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = value;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    setContent(plainText);
  }, []);

  // Social media embed detection
  const detectSocialMedia = useCallback((url: string): MediaEmbed | null => {
    const patterns = {
      instagram: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/p\/([A-Za-z0-9_-]+)/,
      twitter: /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/,
      youtube: /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/,
      tiktok: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[\w.]+\/video\/(\d+)/,
      facebook: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/\w+\/posts\/(\d+)/
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      const match = url.match(pattern);
      if (match) {
        return {
          type: type as MediaEmbed['type'],
          url,
          id: match[1],
          preview: `${type} embed`
        };
      }
    }
    return null;
  }, []);

  // Handle URL paste for social media embeds
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    const embed = detectSocialMedia(pastedText);
    
    if (embed) {
      setMediaEmbeds(prev => [...prev, embed]);
      e.preventDefault();
    }
  }, [detectSocialMedia]);

  // File upload handler
  const handleFileUpload = useCallback(async (files: FileList) => {
    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          const result = await response.json();
          const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
          setMediaEmbeds(prev => [...prev, {
            type: mediaType,
            url: result.url,
            preview: result.url
          }]);
        }
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload media files",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  }, []);

  // Mention detection
  const handleMention = useCallback((mentionText: string) => {
    if (mentionText.startsWith('@')) {
      // User mention
      const username = mentionText.substring(1);
      setMentions(prev => [...prev, {
        id: username,
        display: `@${username}`,
        type: 'user'
      }]);
    } else if (mentionText.startsWith('#')) {
      // Hashtag
      const tag = mentionText.substring(1);
      setMentions(prev => [...prev, {
        id: tag,
        display: `#${tag}`,
        type: 'hashtag'
      }]);
    }
    setShowMentionPicker(false);
  }, []);

  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: postData.content,
          richContent: postData.richContent,
          mediaEmbeds: postData.mediaEmbeds,
          mentions: postData.mentions.map((m: Mention) => m.display),
          location: postData.location,
          visibility: postData.visibility,
          replyToPostId: replyToPostId
        }),
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
    setRichContent('');
    setMediaEmbeds([]);
    setMentions([]);
    setLocation('');
    setVisibility('public');
  };

  // Convert rich content to plain text for validation
  const getPlainTextLength = () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = richContent;
    return (tempDiv.textContent || tempDiv.innerText || '').length;
  };

  const handleSubmit = () => {
    const plainTextLength = getPlainTextLength();
    
    if (plainTextLength === 0 && mediaEmbeds.length === 0) {
      toast({
        title: "Empty post",
        description: "Please add some content or media to your post.",
        variant: "destructive"
      });
      return;
    }

    if (plainTextLength > 2000) {
      toast({
        title: "Post too long",
        description: "Please keep your post under 2000 characters.",
        variant: "destructive"
      });
      return;
    }

    createPostMutation.mutate({
      content: content.trim(),
      richContent,
      mediaEmbeds,
      mentions,
      location,
      visibility
    });
  };

  const removeMediaEmbed = (index: number) => {
    setMediaEmbeds(prev => prev.filter((_, i) => i !== index));
  };

  const removeMention = (index: number) => {
    setMentions(prev => prev.filter((_, i) => i !== index));
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
          <div className="flex space-x-2">
            <button className="p-2 hover:bg-pink-100 rounded-full transition-colors duration-200 text-pink-600">
              <Camera className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-blue-100 rounded-full transition-colors duration-200 text-blue-600">
              <Video className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-green-100 rounded-full transition-colors duration-200 text-green-600">
              <MapPin className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Expanded composer modal
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            Create Post
          </h2>
          <button
            onClick={() => setShowExpandedComposer(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
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

          {/* Rich Text Editor */}
          <div className="mb-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening in your tango world?"
              className="w-full min-h-[180px] p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              rows={6}
            />
          </div>

          {/* Additional Actions */}
          <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-px h-6 bg-gray-300"></div>
            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 hover:bg-gray-200 rounded text-gray-600">
              <Smile className="w-4 h-4" />
            </button>
            <button onClick={() => setShowMentionPicker(!showMentionPicker)} className="p-2 hover:bg-gray-200 rounded text-gray-600">
              <AtSign className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-200 rounded text-gray-600">
              <Hash className="w-4 h-4" />
            </button>
          </div>

          {/* Mentions display */}
          {mentions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {mentions.map((mention, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {mention.display}
                  <button
                    onClick={() => removeMention(index)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Media embeds preview */}
          {mediaEmbeds.length > 0 && (
            <div className="mt-4 space-y-3">
              {mediaEmbeds.map((embed, index) => (
                <div key={index} className="relative p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {embed.type} embed: {embed.preview}
                    </span>
                    <button
                      onClick={() => removeMediaEmbed(index)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Location input */}
          {location && (
            <div className="mt-4">
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

          {/* Emoji picker */}
          {showEmojiPicker && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <div className="grid grid-cols-8 gap-2">
                {['😀', '😍', '🔥', '❤️', '🎉', '👏', '💃', '🕺', '🎵', '🌟', '💯', '🙌'].map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setContent(prev => prev + emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="p-2 hover:bg-gray-200 rounded text-xl"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mention picker */}
          {showMentionPicker && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <input
                type="text"
                placeholder="Type @username or #hashtag"
                className="w-full p-2 border rounded"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleMention(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
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
            >
              <Camera className="w-4 h-4" />
              <span>Photo</span>
            </button>
            <button
              onClick={() => {
                const url = prompt('Enter social media URL (Instagram, Twitter, YouTube, TikTok):');
                if (url) {
                  const embed = detectSocialMedia(url);
                  if (embed) {
                    setMediaEmbeds(prev => [...prev, embed]);
                  } else {
                    toast({
                      title: "Invalid URL",
                      description: "Please enter a valid social media URL",
                      variant: "destructive"
                    });
                  }
                }
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <Link className="w-4 h-4" />
              <span>Embed</span>
            </button>
            <button
              onClick={() => {
                const loc = prompt('Add location:');
                if (loc) setLocation(loc);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              <span>Location</span>
            </button>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={createPostMutation.isPending || (!content.trim() && mediaEmbeds.length === 0)}
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