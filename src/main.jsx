/**
 * NeuralSign Entry Point
 * React application initialization
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Import global styles
import '@/styles/globals.css';

// Initialize app
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
