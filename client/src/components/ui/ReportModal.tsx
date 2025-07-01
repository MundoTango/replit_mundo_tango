/**
 * Report Modal with TrangoTech-Style Categories
 * 11L Layer 5: Component Implementation
 */

import React, { useState } from 'react';
import { X, Flag, AlertCircle, Shield, User, Zap, Heart, MessageSquare } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  postId: number;
  onClose: () => void;
  onSubmit: (reason: string, description: string) => void;
}

const REPORT_CATEGORIES = [
  {
    id: 'spam',
    label: 'Spam or Scam',
    description: 'Unwanted commercial content or fraudulent activity',
    icon: <Zap className="h-5 w-5" />,
    color: 'text-orange-600'
  },
  {
    id: 'inappropriate',
    label: 'Inappropriate Content',
    description: 'Sexual, violent, or disturbing content',
    icon: <AlertCircle className="h-5 w-5" />,
    color: 'text-red-600'
  },
  {
    id: 'harassment',
    label: 'Harassment or Bullying',
    description: 'Targeting someone with harmful content',
    icon: <Shield className="h-5 w-5" />,
    color: 'text-purple-600'
  },
  {
    id: 'fake_profile',
    label: 'Fake Profile',
    description: 'Impersonation or false identity',
    icon: <User className="h-5 w-5" />,
    color: 'text-blue-600'
  },
  {
    id: 'false_information',
    label: 'False Information',
    description: 'Misleading or factually incorrect content',
    icon: <MessageSquare className="h-5 w-5" />,
    color: 'text-yellow-600'
  },
  {
    id: 'hate_speech',
    label: 'Hate Speech',
    description: 'Content that attacks people based on identity',
    icon: <Heart className="h-5 w-5" />,
    color: 'text-red-700'
  },
  {
    id: 'copyright',
    label: 'Copyright Violation',
    description: 'Unauthorized use of copyrighted material',
    icon: <Shield className="h-5 w-5" />,
    color: 'text-indigo-600'
  },
  {
    id: 'other',
    label: 'Other',
    description: 'Something else that violates community guidelines',
    icon: <Flag className="h-5 w-5" />,
    color: 'text-gray-600'
  }
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  postId,
  onClose,
  onSubmit
}) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(selectedReason, description);
      setSelectedReason('');
      setDescription('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Flag className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Report Post</h2>
              <p className="text-sm text-gray-600">Help us understand what's wrong</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Report Categories */}
          <div className="space-y-3 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">What's wrong with this post?</h3>
            {REPORT_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedReason(category.id)}
                className={`
                  w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left
                  ${selectedReason === category.id
                    ? 'border-red-200 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className={category.color}>
                  {category.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{category.label}</div>
                  <div className="text-sm text-gray-600">{category.description}</div>
                </div>
                <div className={`
                  w-5 h-5 rounded-full border-2 transition-all
                  ${selectedReason === category.id
                    ? 'border-red-500 bg-red-500'
                    : 'border-gray-300'
                  }
                `}>
                  {selectedReason === category.id && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Additional Description */}
          {selectedReason && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Additional details (optional)</h4>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide additional context to help us understand the issue..."
                className="w-full p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                rows={4}
                maxLength={500}
              />
              <div className="text-right text-sm text-gray-500">
                {description.length}/500 characters
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Reports are reviewed by our moderation team
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedReason || isSubmitting}
              className={`
                px-6 py-2 rounded-xl font-medium transition-all
                ${selectedReason && !isSubmitting
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};