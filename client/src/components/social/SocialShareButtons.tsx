import React, { useState } from 'react';
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon,
  TelegramIcon,
  EmailIcon
} from 'react-share';
import { Share2, Copy, Check, Link } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SocialShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  hashtags?: string[];
  className?: string;
  size?: number;
  showLabels?: boolean;
  compact?: boolean;
}

export default function SocialShareButtons({
  url,
  title,
  description = '',
  hashtags = [],
  className = '',
  size = 32,
  showLabels = false,
  compact = false
}: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const shareUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
  const shareTitle = `${title} | Mundo Tango`;
  const shareDescription = description || 'Check out this amazing tango moment!';
  const shareHashtags = ['MundoTango', 'Tango', 'Dance', ...hashtags];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link Copied",
        description: "The link has been copied to your clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link to clipboard",
        variant: "destructive"
      });
    }
  };

  const shareButtons = [
    {
      component: FacebookShareButton,
      icon: FacebookIcon,
      label: 'Facebook',
      props: { url: shareUrl, quote: shareTitle }
    },
    {
      component: TwitterShareButton,
      icon: TwitterIcon,
      label: 'Twitter',
      props: { url: shareUrl, title: shareTitle, hashtags: shareHashtags }
    },
    {
      component: LinkedinShareButton,
      icon: LinkedinIcon,
      label: 'LinkedIn',
      props: { url: shareUrl, title: shareTitle, summary: shareDescription }
    },
    {
      component: WhatsappShareButton,
      icon: WhatsappIcon,
      label: 'WhatsApp',
      props: { url: shareUrl, title: `${shareTitle}\n\n${shareDescription}` }
    },
    {
      component: TelegramShareButton,
      icon: TelegramIcon,
      label: 'Telegram',
      props: { url: shareUrl, title: shareTitle }
    },
    {
      component: EmailShareButton,
      icon: EmailIcon,
      label: 'Email',
      props: { 
        url: shareUrl, 
        subject: shareTitle,
        body: `${shareDescription}\n\n${shareUrl}`
      }
    }
  ];

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <Share2 className="h-4 w-4" />
          <span className="text-sm">Share</span>
        </button>
        
        {showShareMenu && (
          <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 min-w-64">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Share this post</h4>
              <button
                onClick={() => setShowShareMenu(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              {shareButtons.map(({ component: ShareButton, icon: Icon, label, props }) => (
                <ShareButton key={label} {...props} className="group">
                  <div className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <Icon size={24} round />
                    <span className="text-xs text-gray-600 group-hover:text-gray-800">{label}</span>
                  </div>
                </ShareButton>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-3">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600"
                />
                <button
                  onClick={copyToClipboard}
                  className="flex items-center space-x-1 px-3 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showLabels && (
        <span className="text-sm font-medium text-gray-700 mr-2">Share:</span>
      )}
      
      {shareButtons.map(({ component: ShareButton, icon: Icon, label, props }) => (
        <ShareButton key={label} {...props}>
          <div className="group relative">
            <Icon size={size} round className="hover:scale-110 transition-transform" />
            {showLabels && (
              <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {label}
              </span>
            )}
          </div>
        </ShareButton>
      ))}
      
      <button
        onClick={copyToClipboard}
        className="group relative p-1 text-gray-600 hover:text-gray-800 transition-colors"
        title="Copy link"
      >
        <div className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Link className="h-4 w-4" />}
        </div>
        {showLabels && (
          <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {copied ? 'Copied!' : 'Copy link'}
          </span>
        )}
      </button>
    </div>
  );
}

export function PostShareButtons({ postId, title, description, hashtags }: {
  postId: number;
  title: string;
  description?: string;
  hashtags?: string[];
}) {
  return (
    <SocialShareButtons
      url={`/moments?post=${postId}`}
      title={title}
      description={description}
      hashtags={hashtags}
      compact
      className="relative"
      size={28}
    />
  );
}