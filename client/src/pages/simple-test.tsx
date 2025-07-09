import React from 'react';

// Ultra-simple test component that doesn't use any hooks or context
export default function SimpleTest() {
  // Log to console immediately on component load
  console.error('SimpleTest component rendering!');
  console.log('Window location:', window.location);
  console.log('React version:', React.version);
  
  // Try to directly manipulate DOM as a test
  React.useEffect(() => {
    console.error('SimpleTest useEffect running!');
    document.body.style.backgroundColor = 'red';
    document.title = 'Simple Test Running';
  }, []);
  
  return (
    <div style={{ 
      padding: '50px', 
      backgroundColor: 'yellow', 
      color: 'black',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100vh',
      zIndex: 99999 
    }}>
      <h1>Simple Test Page</h1>
      <p>If you see this yellow page, React and routing are working!</p>
      <p>Path: {window.location.pathname}</p>
      <a href="/" style={{ color: 'blue' }}>Go Home</a>
    </div>
  );
}