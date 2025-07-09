import React from 'react';
import { Link, useLocation } from 'wouter';

export default function NavigationTest() {
  const [location, setLocation] = useLocation();
  
  const handleNavigate = (path: string) => {
    console.error(`Navigating to: ${path}`);
    setLocation(path);
  };
  
  return (
    <div style={{ 
      padding: '50px', 
      backgroundColor: 'lightblue',
      minHeight: '100vh'
    }}>
      <h1>Navigation Test Page</h1>
      <p>Current location: {location}</p>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Test Navigation Methods:</h2>
        
        <div style={{ marginBottom: '10px' }}>
          <button 
            onClick={() => handleNavigate('/enhanced-timeline')}
            style={{ padding: '10px', marginRight: '10px' }}
          >
            Navigate to Enhanced Timeline (setLocation)
          </button>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <Link href="/enhanced-timeline">
            <a style={{ padding: '10px', backgroundColor: 'yellow', display: 'inline-block' }}>
              Navigate to Enhanced Timeline (Link)
            </a>
          </Link>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <button 
            onClick={() => window.location.href = '/enhanced-timeline'}
            style={{ padding: '10px', backgroundColor: 'orange' }}
          >
            Navigate to Enhanced Timeline (window.location)
          </button>
        </div>
        
        <div style={{ marginTop: '30px' }}>
          <h3>Other Test Routes:</h3>
          <Link href="/simple-test"><a style={{ display: 'block', margin: '5px' }}>Simple Test</a></Link>
          <Link href="/fix-modal"><a style={{ display: 'block', margin: '5px' }}>Fix Modal Test</a></Link>
          <Link href="/"><a style={{ display: 'block', margin: '5px' }}>Home</a></Link>
        </div>
      </div>
    </div>
  );
}