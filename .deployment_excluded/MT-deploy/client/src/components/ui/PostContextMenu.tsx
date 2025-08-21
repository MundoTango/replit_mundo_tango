/**
 * Post Context Menu with Creator/Non-Creator Actions
 * 11L Layer 4: Component Implementation
 */

import React, { useState } from 'react';
import { MoreVertical, Edit, Trash2, Flag, Share2, Copy, ExternalLink } from 'lucide-react';

interface PostContextMenuProps {
  postId: number;
  isOwner: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
  onShare?: () => void;
  className?: string;
}

export const PostContextMenu: React.FC<PostContextMenuProps> = ({
  postId,
  isOwner,
  onEdit,
  onDelete,
  onReport,
  onShare,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleMenuClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const creatorActions = [
    {
      label: 'Edit Post',
      icon: <Edit className="h-4 w-4" />,
      action: onEdit,
      className: 'text-blue-600 hover:bg-blue-50'
    },
    {
      label: 'Delete Post',
      icon: <Trash2 className="h-4 w-4" />,
      action: onDelete,
      className: 'text-red-600 hover:bg-red-50'
    }
  ];

  const nonCreatorActions = [
    {
      label: 'Report Post',
      icon: <Flag className="h-4 w-4" />,
      action: onReport,
      className: 'text-red-600 hover:bg-red-50'
    },
    {
      label: 'Copy Link',
      icon: <Copy className="h-4 w-4" />,
      action: () => {
        navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
      },
      className: 'text-gray-600 hover:bg-gray-50'
    }
  ];

  const actions = isOwner ? creatorActions : nonCreatorActions;

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        aria-label="Post options"
      >
        <MoreVertical className="h-5 w-5 text-gray-400" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => action.action && handleMenuClick(action.action)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2 text-left transition-colors
                  ${action.className}
                `}
                disabled={!action.action}
              >
                {action.icon}
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};