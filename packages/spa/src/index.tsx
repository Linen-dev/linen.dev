import '@linen/styles/colors.css';
import '@linen/styles/reset.css';
import '@linen/styles/globals.css';
import '@linen/styles/highlight.scss';
import '@linen/ui/index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { listenDeepLink } from './di';
import { handleSignIn } from './utils/handleSignIn';
import { handleNotificationPermission } from './utils/handleNotificationPermission';

if (typeof window !== 'undefined') {
  listenDeepLink((event) => {
    handleSignIn(new URL(event.payload).search);
  });
  if (window?.location?.search) {
    handleSignIn(window.location.search);
  }
  handleNotificationPermission();
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
