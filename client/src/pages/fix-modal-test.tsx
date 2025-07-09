import React from 'react';

export default function FixModalTest() {
  React.useEffect(() => {
    console.error('FixModalTest mounted!');
    
    // Force remove all modal overlays
    const modals = document.querySelectorAll('[data-modal-priority]');
    modals.forEach(modal => {
      console.log('Removing modal:', modal);
      modal.remove();
    });
    
    // Fix body overflow
    document.body.style.overflow = 'auto';
    document.body.style.position = 'static';
    
    // Remove any high z-index elements
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      const zIndex = window.getComputedStyle(el).zIndex;
      if (zIndex && parseInt(zIndex) > 1000) {
        console.log('High z-index element:', el, zIndex);
        (el as HTMLElement).style.display = 'none';
      }
    });
    
    // Set page title
    document.title = 'Modal Fix Test Working!';
  }, []);
  
  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100vh',
      backgroundColor: 'lime',
      color: 'black',
      padding: '50px',
      zIndex: 999999,
      overflow: 'auto'
    }}>
      <h1 style={{ fontSize: '48px' }}>🎉 MODAL FIX TEST WORKING! 🎉</h1>
      <p style={{ fontSize: '24px' }}>If you see this LIME GREEN page, we've bypassed the modal overlays!</p>
      <p>The issue was modal overlays with z-index 99000+ blocking all content.</p>
      <button 
        onClick={() => window.location.href = '/enhanced-timeline'}
        style={{ 
          padding: '20px 40px', 
          fontSize: '20px',
          backgroundColor: 'blue',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Go to Enhanced Timeline
      </button>
    </div>
  );
}