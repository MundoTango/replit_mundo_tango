import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

export default function TestBuenosAiresGroup() {
  const [groupData, setGroupData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Test the Buenos Aires group API
    fetch('/api/groups/tango-buenos-aires-argentina', {
      credentials: 'include'
    })
      .then(response => {
        console.log('Response status:', response.status);
        return response.json();
      })
      .then(data => {
        console.log('API Response:', data);
        setGroupData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching group:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Buenos Aires Group API Test</h1>
        
        {loading && <div>Loading...</div>}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {error}
          </div>
        )}
        
        {groupData && (
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="font-bold mb-2">API Response:</h2>
            <pre className="whitespace-pre-wrap overflow-auto">
              {JSON.stringify(groupData, null, 2)}
            </pre>
            
            {groupData.data && (
              <div className="mt-4">
                <h3 className="font-bold">Group Details:</h3>
                <p>ID: {groupData.data.id}</p>
                <p>Name: {groupData.data.name}</p>
                <p>Slug: {groupData.data.slug}</p>
                <p>Type: {groupData.data.type}</p>
                <p>City: {groupData.data.city}</p>
                <p>Members: {groupData.data.members?.length || 0}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}