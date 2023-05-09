import '@linen/styles/colors.css';
import '@linen/styles/reset.css';
import '@linen/styles/globals.css';
import '@linen/styles/highlight.scss';
import '@linen/ui/index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { listenDeepLink } from './di';
import { setJwtToken } from '@linen/auth/client';
import { baseLinen } from './config';

if (typeof window !== 'undefined') {
  listenDeepLink((event) => {
    handleSignIn(new URL(event.payload).search);
  });
  handleSignIn(window.location.search);
}

function handleSignIn(urlSearch: string) {
  const params = new URLSearchParams(urlSearch);
  const state = params.get('state');
  if (!!state) {
    fetch(`${baseLinen}/api/auth/sso?state=${state}`).then(async (response) => {
      const body = await response.json();
      setJwtToken(body.token);
      window.location.href = localStorage.getItem('from') || '/';
    });
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
