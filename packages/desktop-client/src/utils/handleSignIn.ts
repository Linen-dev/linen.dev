import { setJwtToken } from '@linen/auth/client';
import { baseLinen } from '@/config';

export function handleSignIn(state: string) {
  if (!!state) {
    fetch(`${baseLinen}/api/auth/sso?state=${state}`).then(async (response) => {
      const body = await response.json();
      setJwtToken(body.token);
      window.location.href = localStorage.getItem('from') || '/';
    });
  }
}
