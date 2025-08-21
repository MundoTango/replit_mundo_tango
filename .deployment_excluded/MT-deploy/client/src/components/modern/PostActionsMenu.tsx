import React, { useState } from 'react';
import { MoreHorizontal, Edit3, Flag, Share2, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PostActionsMenuProps {
  postId: number;
  onEdit?: (postId: number) => void;
  onReport?: (postId: number) => void;
  onDelete?: (postId: number) => void;
}

export default function PostActionsMenu({ 
  postId, 
  onEdit, 
  onReport, 
  onDelete 
}: PostActionsMenuProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleEdit = () => {
    onEdit?.(postId);
    setShowDropdown(false);
  };

  const handleReport = () => {
    onReport?.(postId);
    setShowDropdown(false);
  };

  const handleDelete = () => {
    onDelete?.(postId);
    setShowDropdown(false);
  };

  return (
    <DropdownMenu open={showDropdown} onOpenChange={setShowDropdown}>
      <DropdownMenuTrigger asChild>
        <button className="p-3 rounded-2xl text-blue-400 hover:text-blue-600 hover:bg-blue-50 
                         transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110">
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleEdit} className="flex items-center gap-2">
          <Edit3 className="w-4 h-4" />
          Edit post
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleReport} className="flex items-center gap-2">
          <Flag className="w-4 h-4" />
          Report post
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleDelete} 
          className="flex items-center gap-2 text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
          Delete post
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}