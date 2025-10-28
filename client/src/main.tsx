import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// 1. **FIXED:** Import App using the .tsx extension (or no extension)
import App from './App.tsx'; 

// 2. **FIXED:** Get the element and add a type guard for safety
const rootElement = document.getElementById('root');

if (!rootElement) {
  // Handle the case where the element is not found, which is safer
  throw new Error("Root element with ID 'root' not found in the document.");
}

// 3. Render the application
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);