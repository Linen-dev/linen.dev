import { cleanUpStorage } from '@linen/auth/client';

export function signOut() {
  cleanUpStorage();
  window.location.reload();
}
