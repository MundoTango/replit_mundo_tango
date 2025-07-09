import React from 'react';

// Ultra-simple test component that doesn't use any hooks or context
export default function SimpleTest() {
  return (
    <div style={{ padding: '50px', backgroundColor: 'yellow', color: 'black' }}>
      <h1>Simple Test Page</h1>
      <p>If you see this yellow page, React and routing are working!</p>
      <p>Path: {window.location.pathname}</p>
      <a href="/" style={{ color: 'blue' }}>Go Home</a>
    </div>
  );
}