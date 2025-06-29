import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import '@fontsource/press-start-2p';
import './index.css';
import { StarknetProvider } from './components/StarkProvider.tsx';
import { Analytics } from '@vercel/analytics/react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StarknetProvider>
      <App />
      <Analytics />
    </StarknetProvider>
  </React.StrictMode>
);
