import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TestAdminPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Admin Page</h1>
      
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Modal Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">This is a test page to verify basic functionality.</p>
          <p className="mb-4">Click count: {clickCount}</p>
          
          <div className="space-x-4">
            <Button 
              onClick={() => setClickCount(prev => prev + 1)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Increment Count
            </Button>
            
            <Button 
              onClick={() => setShowModal(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              Open Test Modal
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Simple inline modal */}
      {showModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-50" 
            onClick={() => setShowModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-[51] pointer-events-none">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 pointer-events-auto">
              <h2 className="text-xl font-bold mb-4">Test Modal</h2>
              <p className="mb-4">This is a basic test modal.</p>
              <Button 
                onClick={() => setShowModal(false)}
                className="w-full"
              >
                Close Modal
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TestAdminPage;