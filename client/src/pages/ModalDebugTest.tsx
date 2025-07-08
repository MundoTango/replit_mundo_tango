import React, { useState } from 'react';
import { comprehensiveProjectData, ProjectItem } from '../../../COMPREHENSIVE_PROJECT_DATA';
import JiraStyleItemDetailModal from '@/components/admin/JiraStyleItemDetailModal';
import { Button } from '@/components/ui/button';

const ModalDebugTest: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<ProjectItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [renderCount, setRenderCount] = useState(0);
  const [lastAction, setLastAction] = useState<string>('Initial');

  console.log('[ModalDebugTest] Render:', { 
    renderCount, 
    selectedItem: selectedItem?.title, 
    isModalOpen,
    lastAction 
  });

  // Get a sample item from the project data
  const sampleItem = comprehensiveProjectData[0]?.children?.[0]?.children?.[0] || comprehensiveProjectData[0];

  const handleOpenModal = () => {
    console.log('[ModalDebugTest] Opening modal');
    setLastAction('Opening Modal');
    setSelectedItem(sampleItem);
    setIsModalOpen(true);
    setRenderCount(prev => prev + 1);
  };

  const handleCloseModal = () => {
    console.log('[ModalDebugTest] Closing modal');
    setLastAction('Closing Modal');
    setSelectedItem(null);
    setIsModalOpen(false);
    setRenderCount(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">Modal Debug Test Page</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Debug Info</h2>
        <div className="space-y-2 text-sm">
          <p>Render Count: <span className="font-mono">{renderCount}</span></p>
          <p>Last Action: <span className="font-mono">{lastAction}</span></p>
          <p>Selected Item: <span className="font-mono">{selectedItem?.title || 'None'}</span></p>
          <p>Is Modal Open: <span className="font-mono">{isModalOpen ? 'Yes' : 'No'}</span></p>
          <p>Component Still Rendering: <span className="font-mono text-green-600">Yes</span></p>
        </div>
      </div>

      <div className="space-y-4">
        <Button 
          onClick={handleOpenModal}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Open Test Modal
        </Button>

        <div className="text-sm text-gray-600">
          <p>Instructions:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Click "Open Test Modal" button</li>
            <li>Try closing the modal using different methods</li>
            <li>Check if this debug info section is still visible after closing</li>
            <li>Watch the console for debug logs</li>
          </ol>
        </div>
      </div>

      {/* Render modal conditionally */}
      {selectedItem && isModalOpen && (
        <JiraStyleItemDetailModal 
          selectedItem={selectedItem} 
          onClose={handleCloseModal}
          onSignOff={(reviewArea) => {
            console.log('[ModalDebugTest] Sign off:', reviewArea);
            setLastAction(`Sign off: ${reviewArea}`);
          }} 
        />
      )}
    </div>
  );
};

export default ModalDebugTest;