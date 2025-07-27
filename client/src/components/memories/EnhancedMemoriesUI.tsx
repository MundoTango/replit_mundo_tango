import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { 
  Smile, 
  MapPin, 
  Tag, 
  Image as ImageIcon, 
  Video, 
  Users, 
  Globe, 
  Lock, 
  Sparkles,
  Palette,
  Type,
  Hash,
  AtSign,
  Camera,
  Mic,
  Calendar,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Send,
  X,
  Check,
  ChevronDown
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Enhanced Post Creator with Life CEO 44x21s Methodology
export const EnhancedPostCreator: React.FC<{
  onPost: (data: any) => void;
  user?: any;
}> = ({ onPost, user }) => {
  const [content, setContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [mentions, setMentions] = useState<string[]>([]);
  const [media, setMedia] = useState<File[]>([]);
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [isPosting, setIsPosting] = useState(false);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [currentMentionPosition, setCurrentMentionPosition] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // MT Ocean Theme emotions
  const emotionOptions = [
    { emoji: '💃', label: 'Dancing', color: 'from-pink-400 to-rose-500' },
    { emoji: '❤️', label: 'Love', color: 'from-red-400 to-pink-500' },
    { emoji: '✨', label: 'Magical', color: 'from-purple-400 to-indigo-500' },
    { emoji: '🎉', label: 'Celebratory', color: 'from-yellow-400 to-orange-500' },
    { emoji: '🌊', label: 'Flowing', color: 'from-turquoise-400 to-cyan-500' },
    { emoji: '🔥', label: 'Passionate', color: 'from-orange-400 to-red-500' },
    { emoji: '🌙', label: 'Nostalgic', color: 'from-blue-800 to-indigo-900' },
    { emoji: '🌺', label: 'Romantic', color: 'from-pink-300 to-rose-400' }
  ];

  // Handle emoji selection
  const onEmojiClick = (emojiData: EmojiClickData) => {
    const cursor = textareaRef.current?.selectionStart || content.length;
    const newContent = content.slice(0, cursor) + emojiData.emoji + content.slice(cursor);
    setContent(newContent);
    setShowEmojiPicker(false);
    
    // Animate emoji addition
    if (textareaRef.current) {
      textareaRef.current.focus();
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = cursor + emojiData.emoji.length;
          textareaRef.current.selectionEnd = cursor + emojiData.emoji.length;
        }
      }, 0);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  // Handle mention detection
  useEffect(() => {
    const lastChar = content[content.length - 1];
    const lastAtIndex = content.lastIndexOf('@');
    
    if (lastAtIndex !== -1 && lastAtIndex === content.length - 1) {
      setShowMentionSuggestions(true);
      setCurrentMentionPosition(lastAtIndex);
    } else if (showMentionSuggestions) {
      const mentionText = content.slice(currentMentionPosition + 1);
      if (mentionText.includes(' ') || !content.includes('@')) {
        setShowMentionSuggestions(false);
      } else {
        setMentionSearch(mentionText);
      }
    }
  }, [content, showMentionSuggestions, currentMentionPosition]);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMedia(prev => [...prev, ...files]);
    
    // Show preview animation
    files.forEach(file => {
      toast({
        title: `Added ${file.type.startsWith('image/') ? '📸 Photo' : '🎥 Video'}`,
        description: file.name,
      });
    });
  };

  // Handle post submission
  const handlePost = async () => {
    if (!content.trim() && media.length === 0) {
      toast({
        title: "Add some content",
        description: "Share a memory, photo, or thought!",
        variant: "destructive"
      });
      return;
    }

    setIsPosting(true);
    
    // Simulate posting
    setTimeout(() => {
      onPost({
        content,
        emotions: selectedEmotions,
        location,
        tags,
        mentions,
        media,
        visibility,
        timestamp: new Date()
      });
      
      // Reset form
      setContent('');
      setSelectedEmotions([]);
      setLocation('');
      setTags([]);
      setMentions([]);
      setMedia([]);
      setShowAdvancedOptions(false);
      setIsPosting(false);
      
      toast({
        title: "Memory shared! ✨",
        description: "Your tango moment is now part of the community",
      });
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="glassmorphic-card p-6 border-turquoise-200/30">
        {/* User Avatar & Input Area */}
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-turquoise-400 to-cyan-500 flex items-center justify-center text-white font-semibold">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            {/* Main Input */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="✨ Share your tango moment..."
                className="w-full min-h-[100px] p-4 bg-white/80 backdrop-blur-sm border border-turquoise-200/50 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-turquoise-400/50 transition-all duration-300"
                style={{ height: 'auto' }}
              />
              
              {/* Character Count */}
              <div className="absolute bottom-2 right-2 text-sm text-gray-400">
                {content.length}/500
              </div>
            </div>

            {/* Selected Emotions */}
            {selectedEmotions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex flex-wrap gap-2"
              >
                {selectedEmotions.map((emotion) => {
                  const emotionData = emotionOptions.find(e => e.emoji === emotion);
                  return (
                    <Badge 
                      key={emotion}
                      className={cn(
                        "px-3 py-1 text-white border-0",
                        `bg-gradient-to-r ${emotionData?.color || 'from-turquoise-400 to-cyan-500'}`
                      )}
                    >
                      {emotion} {emotionData?.label}
                      <button
                        onClick={() => setSelectedEmotions(prev => prev.filter(e => e !== emotion))}
                        className="ml-2 hover:opacity-70"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  );
                })}
              </motion.div>
            )}

            {/* Media Preview */}
            {media.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-3 gap-2"
              >
                {media.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      {file.type.startsWith('image/') ? (
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setMedia(prev => prev.filter((_, i) => i !== index))}
                      className="absolute top-1 right-1 bg-black/50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Emoji Picker */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="text-gray-600 hover:text-turquoise-600 hover:bg-turquoise-50"
                  >
                    <Smile className="w-5 h-5" />
                  </Button>
                  
                  <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div
                        ref={emojiPickerRef}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute bottom-full left-0 mb-2 z-50"
                      >
                        <EmojiPicker
                          onEmojiClick={onEmojiClick}
                          theme={Theme.LIGHT}
                          searchDisabled
                          skinTonesDisabled
                          width={350}
                          height={400}
                          previewConfig={{
                            showPreview: false
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Media Upload */}
                <input
                  type="file"
                  id="media-upload"
                  className="hidden"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                />
                <label htmlFor="media-upload">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-turquoise-600 hover:bg-turquoise-50"
                    asChild
                  >
                    <span>
                      <ImageIcon className="w-5 h-5" />
                    </span>
                  </Button>
                </label>

                {/* Location */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        setLocation('📍 Current Location');
                        toast({
                          title: "Location added",
                          description: "Your current location has been tagged",
                        });
                      },
                      () => {
                        toast({
                          title: "Location access denied",
                          description: "Please enable location services",
                          variant: "destructive"
                        });
                      }
                    );
                  }}
                  className="text-gray-600 hover:text-turquoise-600 hover:bg-turquoise-50"
                >
                  <MapPin className="w-5 h-5" />
                </Button>

                {/* Tags */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="text-gray-600 hover:text-turquoise-600 hover:bg-turquoise-50"
                >
                  <Tag className="w-5 h-5" />
                </Button>

                {/* Emotions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-turquoise-600 hover:bg-turquoise-50"
                    >
                      <Heart className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 p-4">
                    <div className="grid grid-cols-4 gap-2">
                      {emotionOptions.map((emotion) => (
                        <button
                          key={emotion.emoji}
                          onClick={() => {
                            if (selectedEmotions.includes(emotion.emoji)) {
                              setSelectedEmotions(prev => prev.filter(e => e !== emotion.emoji));
                            } else {
                              setSelectedEmotions(prev => [...prev, emotion.emoji]);
                            }
                          }}
                          className={cn(
                            "p-3 rounded-lg transition-all duration-300 hover:scale-110",
                            selectedEmotions.includes(emotion.emoji)
                              ? "bg-gradient-to-br " + emotion.color + " shadow-lg"
                              : "hover:bg-gray-100"
                          )}
                        >
                          <span className="text-2xl">{emotion.emoji}</span>
                        </button>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Post Button */}
              <Button
                onClick={handlePost}
                disabled={isPosting || (!content.trim() && media.length === 0)}
                className="bg-gradient-to-r from-turquoise-400 to-cyan-500 text-white hover:from-turquoise-500 hover:to-cyan-600 shadow-lg"
              >
                {isPosting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Share Memory
                  </>
                )}
              </Button>
            </div>

            {/* Advanced Options */}
            <AnimatePresence>
              {showAdvancedOptions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 pt-4 border-t border-gray-100"
                >
                  {/* Tags Input */}
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      <Input
                        placeholder="Add tags..."
                        className="flex-1 min-w-[150px]"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = e.target as HTMLInputElement;
                            if (input.value.trim()) {
                              setTags(prev => [...prev, input.value.trim()]);
                              input.value = '';
                            }
                          }
                        }}
                      />
                      {tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-turquoise-100 text-turquoise-700">
                          #{tag}
                          <button
                            onClick={() => setTags(prev => prev.filter((_, i) => i !== index))}
                            className="ml-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Visibility */}
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Who can see this?</label>
                    <div className="flex gap-2">
                      {[
                        { value: 'public', icon: Globe, label: 'Everyone' },
                        { value: 'friends', icon: Users, label: 'Friends' },
                        { value: 'private', icon: Lock, label: 'Only Me' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setVisibility(option.value as any)}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                            visibility === option.value
                              ? "bg-turquoise-100 text-turquoise-700 border-2 border-turquoise-300"
                              : "bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100"
                          )}
                        >
                          <option.icon className="w-4 h-4" />
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// Enhanced Memory Card Component
export const EnhancedMemoryCard: React.FC<{
  memory: any;
  onInteraction: (type: string, data?: any) => void;
}> = ({ memory, onInteraction }) => {
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(memory.reactions?.love || 0);
  const [showReactions, setShowReactions] = useState(false);
  
  const reactionOptions = [
    { emoji: '❤️', label: 'Love' },
    { emoji: '💃', label: 'Dance' },
    { emoji: '🔥', label: 'Fire' },
    { emoji: '👏', label: 'Applause' },
    { emoji: '😍', label: 'Heart Eyes' },
    { emoji: '✨', label: 'Sparkles' }
  ];

  const handleReaction = (emoji: string) => {
    onInteraction('reaction', { emoji });
    setShowReactions(false);
    if (emoji === '❤️') {
      setIsLiked(true);
      setLikeCount(prev => prev + 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="w-full"
    >
      <Card className="glassmorphic-card overflow-hidden hover:shadow-xl transition-all duration-300">
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-turquoise-400 to-cyan-500 flex items-center justify-center text-white font-semibold">
              {memory.user?.profileImage ? (
                <img src={memory.user.profileImage} alt={memory.user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                memory.user?.name?.charAt(0) || 'U'
              )}
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">{memory.user?.name || 'Anonymous'}</h4>
              <p className="text-sm text-gray-500">
                {memory.location && <span className="mr-2">📍 {memory.location}</span>}
                {new Date(memory.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onInteraction('save')}>
                <Bookmark className="w-4 h-4 mr-2" />
                Save Memory
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onInteraction('share')}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <div className="px-4 pb-3">
          <p className="text-gray-800 whitespace-pre-wrap">{memory.content}</p>
          
          {/* Emotions */}
          {memory.emotionTags && memory.emotionTags.length > 0 && (
            <div className="flex gap-2 mt-3">
              {memory.emotionTags.map((emotion: string, index: number) => (
                <Badge 
                  key={index} 
                  className="bg-gradient-to-r from-turquoise-100 to-cyan-100 text-turquoise-700 border-0"
                >
                  {emotion}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Media */}
        {memory.imageUrl && (
          <div className="relative aspect-video overflow-hidden">
            <img 
              src={memory.imageUrl} 
              alt="" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {/* Interactions */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Like/Reactions */}
              <div className="relative">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleReaction('❤️')}
                  onMouseEnter={() => setShowReactions(true)}
                  onMouseLeave={() => setShowReactions(false)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all",
                    isLiked 
                      ? "bg-red-100 text-red-600" 
                      : "hover:bg-gray-100 text-gray-600"
                  )}
                >
                  <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                  <span className="text-sm font-medium">{likeCount}</span>
                </motion.button>
                
                <AnimatePresence>
                  {showReactions && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full left-0 mb-2 bg-white rounded-full shadow-lg p-2 flex gap-1"
                    >
                      {reactionOptions.map((reaction) => (
                        <motion.button
                          key={reaction.emoji}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleReaction(reaction.emoji)}
                          className="p-1.5 hover:bg-gray-100 rounded-full"
                        >
                          <span className="text-xl">{reaction.emoji}</span>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Comments */}
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{memory.comments?.length || 0}</span>
              </button>

              {/* Share */}
              <button
                onClick={() => onInteraction('share')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition-all"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Save */}
            <button
              onClick={() => onInteraction('save')}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-all"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>

          {/* Comments Section */}
          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-3"
              >
                {/* Comment Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a comment..."
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        onInteraction('comment', { text: (e.target as HTMLInputElement).value });
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                  <Button size="sm" className="bg-gradient-to-r from-turquoise-400 to-cyan-500 text-white">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                {/* Comments List */}
                {memory.comments?.map((comment: any, index: number) => (
                  <div key={index} className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold mr-2">{comment.userName}</span>
                        {comment.text}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
};

// Export all components
export default {
  EnhancedPostCreator,
  EnhancedMemoryCard
};