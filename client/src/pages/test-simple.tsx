import React from 'react';

export default function TestSimple() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Simple Page</h1>
      <p>If you can see this, React is working!</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
}