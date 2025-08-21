import React from 'react';
import { MediaUploadTest } from '@/components/media/MediaUploadTest';

export default function MediaUploadTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Media Upload Test</h1>
        <MediaUploadTest />
      </div>
    </div>
  );
}