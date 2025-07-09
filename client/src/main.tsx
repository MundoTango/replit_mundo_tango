import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.error('🔴 main.tsx executing...');

const rootElement = document.getElementById("root");
console.error('🔴 Root element:', rootElement);

if (!rootElement) {
  console.error('🔴 CRITICAL: No root element found!');
  document.body.innerHTML = '<h1 style="color: red;">No root element found!</h1>';
} else {
  try {
    console.error('🔴 Creating React root...');
    const root = createRoot(rootElement);
    console.error('🔴 Rendering App...');
    root.render(<App />);
    console.error('🔴 React render called successfully');
  } catch (error) {
    console.error('🔴 React render error:', error);
    document.body.innerHTML = `<h1 style="color: red;">React Error: ${error}</h1>`;
  }
}
