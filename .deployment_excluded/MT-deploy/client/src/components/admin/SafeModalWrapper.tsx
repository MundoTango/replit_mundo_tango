import React, { useState, useEffect } from 'react';
import JiraStyleItemDetailModal from './JiraStyleItemDetailModal';
import { ProjectItem } from '../../../../COMPREHENSIVE_PROJECT_DATA';

interface SafeModalWrapperProps {
  selectedItem: ProjectItem | null;
  onClose: () => void;
  onSignOff: (reviewArea: string) => void;
}

// Isolated modal wrapper to prevent parent component corruption
const SafeModalWrapper: React.FC<SafeModalWrapperProps> = ({ selectedItem, onClose, onSignOff }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [localItem, setLocalItem] = useState<ProjectItem | null>(selectedItem);

  useEffect(() => {
    setLocalItem(selectedItem);
  }, [selectedItem]);

  const handleSafeClose = () => {
    console.log('[SafeModalWrapper] Starting safe close sequence');
    setIsClosing(true);
    
    // Delay the actual close to ensure clean state transition
    requestAnimationFrame(() => {
      setLocalItem(null);
      setTimeout(() => {
        onClose();
      }, 50);
    });
  };

  // Don't render if no item or if closing
  if (!localItem || isClosing) {
    return null;
  }

  return (
    <JiraStyleItemDetailModal 
      selectedItem={localItem}
      onClose={handleSafeClose}
      onSignOff={onSignOff}
    />
  );
};

export default SafeModalWrapper;