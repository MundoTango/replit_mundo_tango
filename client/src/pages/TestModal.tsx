import React, { useState } from 'react';
import JiraStyleItemDetailModal from '@/components/admin/JiraStyleItemDetailModal';
import { Button } from '@/components/ui/button';

const TestModal: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  
  const testItem = {
    id: 'test-item-1',
    title: 'Test Modal Item',
    description: 'This is a test item to verify modal functionality',
    type: 'Feature',
    status: 'In Progress',
    priority: 'High',
    layer: 'Layer 7',
    completion: 75
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Modal Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Instructions:</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Click "Open Modal" button below</li>
            <li>Verify modal opens correctly</li>
            <li>Try closing modal using:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>X button in top right</li>
                <li>Close button in footer</li>
                <li>Clicking backdrop</li>
                <li>Pressing Escape key</li>
              </ul>
            </li>
            <li>Verify page returns to normal after closing</li>
          </ol>
        </div>
        
        <div className="flex justify-center">
          <Button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            Open Modal
          </Button>
        </div>
        
        {showModal && (
          <JiraStyleItemDetailModal
            selectedItem={testItem}
            onClose={() => {
              console.log('Modal closed');
              setShowModal(false);
            }}
            onSignOff={(area) => {
              console.log('Sign off:', area);
            }}
          />
        )}
        
        <div className="mt-8 p-4 bg-gray-100 rounded">
          <p className="text-sm text-gray-600">
            Modal state: {showModal ? 'Open' : 'Closed'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestModal;