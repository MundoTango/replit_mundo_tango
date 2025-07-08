import React from 'react';
import { Link, useRoute, useLocation } from 'wouter';

export default function RouteTest() {
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute('/enhanced-timeline');
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Route Testing Page</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <p className="font-semibold">Current Location:</p>
          <p className="font-mono">{location}</p>
        </div>
        
        <div className="p-4 bg-gray-100 rounded">
          <p className="font-semibold">Enhanced Timeline Route Match:</p>
          <p className="font-mono">{match ? 'YES' : 'NO'}</p>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Navigation Tests:</h2>
          
          <Link href="/enhanced-timeline">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Test 1: Link Component
            </button>
          </Link>
          
          <button 
            onClick={() => setLocation('/enhanced-timeline')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ml-2"
          >
            Test 2: setLocation Hook
          </button>
          
          <button 
            onClick={() => window.location.href = '/enhanced-timeline'}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 ml-2"
          >
            Test 3: window.location
          </button>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">All Routes Test:</h2>
          <div className="space-x-2">
            <Link href="/moments">
              <button className="px-3 py-1 bg-gray-600 text-white rounded text-sm">
                Moments
              </button>
            </Link>
            <Link href="/enhanced-timeline">
              <button className="px-3 py-1 bg-purple-600 text-white rounded text-sm">
                Enhanced Timeline
              </button>
            </Link>
            <Link href="/admin">
              <button className="px-3 py-1 bg-gray-600 text-white rounded text-sm">
                Admin
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}