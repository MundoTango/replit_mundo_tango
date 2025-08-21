import { createRoot } from "react-dom/client";

// Minimal test app that bypasses all existing code
function TestApp() {
  return (
    <div style={{ 
      padding: '50px', 
      backgroundColor: 'lightgreen', 
      color: 'black',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ fontSize: '48px' }}>✅ React is Working!</h1>
      <p style={{ fontSize: '24px' }}>If you see this green screen, React rendering is working.</p>
      <p style={{ fontSize: '20px' }}>The issue is in the main App component or routing.</p>
      
      <div style={{ marginTop: '30px' }}>
        <h2 style={{ fontSize: '32px' }}>Debug Info:</h2>
        <ul style={{ fontSize: '18px' }}>
          <li>Current URL: {window.location.href}</li>
          <li>Pathname: {window.location.pathname}</li>
          <li>Time: {new Date().toLocaleTimeString()}</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <a href="/" style={{ fontSize: '20px', color: 'blue' }}>Go to Home</a>
      </div>
    </div>
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<TestApp />);
} else {
  document.body.innerHTML = '<h1 style="color: red;">Root element not found!</h1>';
}