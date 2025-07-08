import React from 'react';

const SimpleEnhancedTimeline = () => {
  console.log("🚀 SimpleEnhancedTimeline is rendering!");
  
  return (
    <div className="p-8 bg-green-100 min-h-screen">
      <h1 className="text-4xl font-bold text-green-800">Enhanced Timeline - Test Page</h1>
      <p className="mt-4 text-lg">If you can see this, the route is working!</p>
      <div className="mt-8 p-4 bg-white rounded shadow">
        <p>Debug Info:</p>
        <p>Path: {window.location.pathname}</p>
        <p>Time: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

export default SimpleEnhancedTimeline;