import React from 'react';

export default function TimelineDebug() {
  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'lightblue',
      color: 'black',
      padding: '50px',
      zIndex: 9999,
      overflow: 'auto'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>Debug Page Working!</h1>
      <p style={{ fontSize: '24px' }}>Current path: {window.location.pathname}</p>
      <p style={{ fontSize: '20px' }}>If you see this blue screen, routing is working.</p>
      <p style={{ fontSize: '20px' }}>The blank page issue is likely CSS-related.</p>
      
      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: 'white', borderRadius: '10px' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '10px' }}>Available Routes:</h2>
        <ul style={{ fontSize: '20px', lineHeight: '1.8' }}>
          <li><a href="/" style={{ color: 'blue' }}>/ - Home</a></li>
          <li><a href="/moments" style={{ color: 'blue' }}>/moments - Moments</a></li>
          <li><a href="/enhanced-timeline" style={{ color: 'blue' }}>/enhanced-timeline - Enhanced Timeline V2</a></li>
          <li><a href="/timeline-v2" style={{ color: 'blue' }}>/timeline-v2 - Test Route</a></li>
        </ul>
      </div>
    </div>
  );
}