import React from 'react';
import { InternalUploader } from '../upload/InternalUploader';
import { Card } from '@/components/ui/card';

// Test component for the new media uploader
export function MediaUploadTest() {
  const handleUploadComplete = (urls: Array<{ url: string; thumbnailUrl?: string; type: string }>) => {
    console.log('Upload complete!', urls);
    alert(`Successfully uploaded ${urls.length} files!`);
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Media Upload Test</h2>
      <p className="text-gray-600 mb-6">
        Test the new 30-file batch upload system with 500MB support and auto-compression.
      </p>
      
      <InternalUploader
        onUploadComplete={handleUploadComplete}
        maxFiles={30}
        maxFileSize={500 * 1024 * 1024}
        className="w-full"
      />
    </Card>
  );
}