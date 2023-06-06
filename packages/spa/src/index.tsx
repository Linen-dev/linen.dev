import '@linen/styles/colors.css';
import '@linen/styles/reset.css';
import '@linen/styles/globals.css';
import '@linen/styles/desktop.css';
import '@linen/styles/highlight.scss';
import '@/nprogress.scss';
import '@linen/ui/index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import di from '@/di';
import { handleSignIn } from '@/utils/handleSignIn';
import { handleNotificationPermission } from '@/utils/handleNotificationPermission';
const hasWindow = typeof window !== 'undefined';
const minutes30 = 1000 * 60 * 30;

di.listenDeepLink((event) => {
  if (!!event.payload || !!event.payload.url) {
    const url = new URL(event.payload.url || event.payload);
    if (hasWindow) {
      window.location.href = url.pathname + url.search + url.hash;
    }
  }
});

if (hasWindow) {
  if (window.location.search) {
    handleSignIn(window.location.search);
  }
  handleNotificationPermission();
  di.setTitleBarListeners();
  setInterval(() => di.checkForUpdate(), minutes30);
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
