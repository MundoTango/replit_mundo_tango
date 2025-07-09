import React from 'react';

export default function TestApp() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Test App - Application is Working!</h1>
      <p>If you can see this, the React application is loading correctly.</p>
      <div style={{ marginTop: '20px' }}>
        <a href="/moments" style={{ margin: '10px', padding: '10px 20px', background: '#4F46E5', color: 'white', textDecoration: 'none', borderRadius: '5px', display: 'inline-block' }}>
          Go to Moments
        </a>
        <a href="/friends" style={{ margin: '10px', padding: '10px 20px', background: '#4F46E5', color: 'white', textDecoration: 'none', borderRadius: '5px', display: 'inline-block' }}>
          Go to Friends
        </a>
        <a href="/housing-marketplace" style={{ margin: '10px', padding: '10px 20px', background: '#4F46E5', color: 'white', textDecoration: 'none', borderRadius: '5px', display: 'inline-block' }}>
          Go to Housing
        </a>
        <a href="/global-statistics" style={{ margin: '10px', padding: '10px 20px', background: '#4F46E5', color: 'white', textDecoration: 'none', borderRadius: '5px', display: 'inline-block' }}>
          Go to Statistics
        </a>
      </div>
    </div>
  );
}