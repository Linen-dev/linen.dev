import '@linen/styles/colors.css';
import '@linen/styles/reset.css';
import '@linen/styles/globals.css';
import '@linen/styles/desktop.css';
import '@linen/styles/highlight.scss';
import '@linen/styles/nprogress.scss';
import '@linen/ui/index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import di from '@/di';
import { handleSignIn } from '@/utils/handleSignIn';
import { handleNotificationPermission } from '@/utils/handleNotificationPermission';
const hasWindow = typeof window !== 'undefined';

di.listenDeepLink((event) => {
  if (!!event.payload) {
    const url = new URL(event.payload);
    if (hasWindow) {
      window.location.href = url.pathname + url.search;
    }
  }
});

if (hasWindow) {
  if (window.location.search) {
    handleSignIn(window.location.search);
  }
  handleNotificationPermission();
  di.setTitleBarListeners();
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
