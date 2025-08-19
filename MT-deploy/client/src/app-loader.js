// App loader that doesn't use ES modules to bypass browser extension issues
(function() {
  console.log('App loader starting...');
  
  // Wait for React to be available
  function waitForReact() {
    if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
      console.log('React libraries loaded, initializing app...');
      initializeApp();
    } else {
      setTimeout(waitForReact, 100);
    }
  }
  
  function initializeApp() {
    // This will be replaced by the actual app code
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      console.error('No root element found!');
      return;
    }
    
    // Show loading message
    rootElement.innerHTML = '<div style="text-align: center; padding: 50px;"><h1>Loading Application...</h1><p>If this message persists, there may be a browser extension blocking the app.</p></div>';
    
    // Try to load the app through a different method
    const script = document.createElement('script');
    script.type = 'module';
    script.textContent = `
      import('/src/main.tsx').then(() => {
        console.log('App loaded via dynamic import');
      }).catch(err => {
        console.error('Failed to load app:', err);
        document.getElementById('root').innerHTML = '<div style="text-align: center; padding: 50px; color: red;"><h1>Error Loading App</h1><p>' + err.message + '</p><p>Try disabling browser extensions that block JavaScript.</p></div>';
      });
    `;
    document.body.appendChild(script);
  }
  
  waitForReact();
})();