import { cleanUpStorage } from '@linen/auth-client/client';

export function signOut() {
  cleanUpStorage();
  window.location.reload();
}
