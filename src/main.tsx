import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';

// ✅ Your new correct OAuth client ID
const clientId = '787285367295-jrgk3pflvdkfb4423h3i4ictlbphhd3a.apps.googleusercontent.com'


const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement as HTMLElement);
  root.render(
    <React.StrictMode>
      <GoogleOAuthProvider clientId={clientId}>
        <App />
      </GoogleOAuthProvider>
    </React.StrictMode>
  );
} else {
  console.error('Root element not found');
}
