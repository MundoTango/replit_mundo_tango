import React from 'react';
import { X } from 'lucide-react';

interface MinimalTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

const MinimalTestModal: React.FC<MinimalTestModalProps> = ({ isOpen, onClose, title = "Test Modal" }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[100]" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[101] pointer-events-none">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4 pointer-events-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <p>This is a minimal test modal to verify modal functionality.</p>
            <p>If you can see this, the modal system is working.</p>
            
            <button
              onClick={onClose}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close Modal
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MinimalTestModal;