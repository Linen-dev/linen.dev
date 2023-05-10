import { setJwtToken } from '@linen/auth/client';
import { baseLinen } from '../config';

export function handleSignIn(urlSearch: string) {
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
