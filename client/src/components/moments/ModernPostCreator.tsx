import { useState, useCallback, useRef, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Image, 
  Video, 
  MapPin, 
  Globe, 
  Users, 
  Lock, 
  X,
  Smile,
  Link,
  Send,
  Bold,
  Italic,
  List
} from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import GoogleMapsAutocomplete from '../maps/GoogleMapsAutocomplete';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { MentionsInput, Mention } from 'react-mentions';
import { useAuth } from '@/hooks/useAuth';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface User {
  id: number;
  username: string;
  name: string;
  profileImage?: string;
}

interface ModernPostCreatorProps {
  onPostCreated?: () => void;
}

export default function ModernPostCreator({ onPostCreated }: ModernPostCreatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [richContent, setRichContent] = useState('');
  const [location, setLocation] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showEmbedInput, setShowEmbedInput] = useState(false);
  const [embedUrl, setEmbedUrl] = useState('');
  const [useRichEditor, setUseRichEditor] = useState(false);
  
  const quillRef = useRef<ReactQuill>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users for mention autocomplete
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users/search'],
    queryFn: async (): Promise<User[]> => {
      const response = await fetch('/api/users/search');
      if (!response.ok) throw new Error('Failed to fetch users');
      const result = await response.json();
      return result.data || [];
    }
  });

  // Configure ReactQuill toolbar
  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link'],
        ['clean']
      ]
    }
  }), []);

  // Configure mention style for MentionsInput
  const mentionStyle = {
    control: {
      backgroundColor: 'transparent',
      fontSize: 16,
      fontWeight: 'normal',
      border: 'none',
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

  // Handle content change for both editors
  const handleContentChange = useCallback((value: string) => {
    setContent(value);
  }, []);

  const handleRichContentChange = useCallback((value: string) => {
    setRichContent(value);
    // Extract plain text for search and processing
    const div = document.createElement('div');
    div.innerHTML = value;
    setContent(div.textContent || div.innerText || '');
  }, []);

  // Handle emoji selection for appropriate editor
  const handleEmojiClick = useCallback((emojiData: EmojiClickData) => {
    if (useRichEditor && quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      if (range) {
        quill.insertText(range.index, emojiData.emoji);
        quill.setSelection(range.index + emojiData.emoji.length);
      }
    } else {
      setContent(prev => prev + emojiData.emoji);
    }
  }, [useRichEditor]);

  // Handle file uploads with drag and drop
  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return;
    
    const validFiles = Array.from(files).filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: "Please upload images or videos only.",
          variant: "destructive"
        });
        return false;
      }
      
      if (!isValidSize) {
        toast({
          title: "File too large",
          description: "Please upload files smaller than 10MB.",
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);
  }, [toast]);

  // Remove uploaded file
  const removeFile = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Extract mentions and hashtags from content
  const extractMentionsAndHashtags = useCallback((text: string) => {
    const mentions = (text.match(/@(\w+)/g) || []).map(m => m.substring(1));
    const hashtags = (text.match(/#(\w+)/g) || []).map(h => h.substring(1));
    return { mentions, hashtags };
  }, []);

  // Detect social media embeds
  const detectSocialEmbeds = useCallback((text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlRegex) || [];
    
    return urls.filter(url => {
      return url.includes('twitter.com') || 
             url.includes('instagram.com') || 
             url.includes('youtube.com') ||
             url.includes('tiktok.com');
    });
  }, []);

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const formData = new FormData();
      
      // Add text content
      formData.append('content', postData.content);
      formData.append('richContent', JSON.stringify(postData.richContent));
      formData.append('plainText', postData.plainText);
      formData.append('location', postData.location || '');
      formData.append('visibility', postData.visibility);
      formData.append('mentions', JSON.stringify(postData.mentions));
      formData.append('hashtags', JSON.stringify(postData.hashtags));
      formData.append('mediaEmbeds', JSON.stringify(postData.mediaEmbeds));

      // Add uploaded files
      uploadedFiles.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });

      const response = await fetch('/api/posts/enhanced', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create post');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Post created successfully!",
        description: "Your tango moment has been shared with the community.",
      });
      
      // Reset form
      setContent('');
      setRichContent('');
      setLocation('');
      setVisibility('public');
      setUploadedFiles([]);
      setEmbedUrl('');
      setIsExpanded(false);
      setUseRichEditor(false);
      
      // Invalidate posts cache
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      onPostCreated?.();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create post",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Handle post submission
  const handleSubmit = useCallback(() => {
    const finalContent = useRichEditor ? content : content;
    const finalRichContent = useRichEditor ? richContent : null;
    
    if (!finalContent.trim()) {
      toast({
        title: "Content required",
        description: "Please write something before posting.",
        variant: "destructive"
      });
      return;
    }

    const { mentions, hashtags } = extractMentionsAndHashtags(finalContent);
    const mediaEmbeds = detectSocialEmbeds(finalContent);

    createPostMutation.mutate({
      content: finalContent,
      richContent: finalRichContent,
      plainText: finalContent,
      location,
      visibility,
      mentions,
      hashtags,
      mediaEmbeds
    });
  }, [content, richContent, location, visibility, useRichEditor, extractMentionsAndHashtags, detectSocialEmbeds, createPostMutation, toast]);

  // Prepare mention data for MentionsInput
  const mentionUsers = useMemo(() => 
    users.map(user => ({
      id: user.username,
      display: `@${user.username}`,
      name: user.name
    }))
  , [users]);

  if (!isExpanded) {
    return (
      <Card className="mb-6 bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-xl overflow-hidden">
        <div className="p-6">
          <div 
            className="flex items-center space-x-4 cursor-pointer"
            onClick={() => setIsExpanded(true)}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 bg-gray-50 hover:bg-gray-100 transition-colors rounded-full px-6 py-3 text-gray-500">
              Share your tango moment...
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mb-6 bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-xl overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">@{user?.username}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Editor Type Toggle */}
        <div className="flex items-center space-x-2 mb-4">
          <Button
            variant={!useRichEditor ? "default" : "outline"}
            size="sm"
            onClick={() => setUseRichEditor(false)}
          >
            Simple
          </Button>
          <Button
            variant={useRichEditor ? "default" : "outline"}
            size="sm"
            onClick={() => setUseRichEditor(true)}
          >
            Rich Text
          </Button>
        </div>

        {/* Content Input */}
        <div className="mb-4">
          {useRichEditor ? (
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={richContent}
              onChange={handleRichContentChange}
              modules={quillModules}
              placeholder="What's happening in your tango world? Use @mentions and #hashtags..."
              style={{ minHeight: '120px' }}
            />
          ) : (
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
                  backgroundColor: '#ddd6fe',
                  color: '#6d28d9',
                  fontWeight: '600',
                  padding: '2px 4px',
                  borderRadius: '4px'
                }}
                renderSuggestion={(suggestion: any) => (
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                      {suggestion.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="font-medium">{suggestion.name}</div>
                      <div className="text-sm text-gray-500">{suggestion.display}</div>
                    </div>
                  </div>
                )}
              />
            </MentionsInput>
          )}
        </div>

        {/* Location Input with Google Maps */}
        <div className="mb-4">
          <GoogleMapsAutocomplete
            value={location}
            placeholder="Add location..."
            onLocationSelect={(locationData) => {
              setLocation(locationData.formattedAddress);
            }}
            onClear={() => setLocation('')}
            className="w-full"
          />
        </div>

        {/* Media Previews */}
        {uploadedFiles.length > 0 && (
          <div className="mb-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {file.type.startsWith('image/') ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={URL.createObjectURL(file)}
                        className="w-full h-full object-cover"
                        controls
                      />
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Embed Input */}
        {showEmbedInput && (
          <div className="mb-4">
            <input
              type="url"
              placeholder="Paste social media URL (Twitter, Instagram, YouTube, TikTok)..."
              value={embedUrl}
              onChange={(e) => setEmbedUrl(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="mb-4">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              width="100%"
              height={400}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Media Upload */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-pink-600 hover:text-pink-700 hover:bg-pink-50"
            >
              <Image className="h-5 w-5" />
            </Button>
            
            {/* Video Upload */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Video className="h-5 w-5" />
            </Button>

            {/* Location */}
            <Button
              variant="ghost"
              size="sm"
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <MapPin className="h-5 w-5" />
            </Button>

            {/* Emoji */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
            >
              <Smile className="h-5 w-5" />
            </Button>

            {/* Embed */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmbedInput(!showEmbedInput)}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            >
              <Link className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            {/* Visibility Selector */}
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="public">🌍 Public</option>
              <option value="friends">👥 Friends</option>
              <option value="private">🔒 Private</option>
            </select>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={createPostMutation.isPending || (!content.trim() && !richContent.trim())}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6"
            >
              {createPostMutation.isPending ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Posting...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Send className="h-4 w-4" />
                  <span>Post</span>
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />
      </div>
    </Card>
  );
}