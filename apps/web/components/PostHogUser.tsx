import { useEffect } from 'react';
import { useSession } from '@linen/auth/client';

function PostHogUser() {
  const session = useSession();

  useEffect(() => {
    if (
      session.status === 'authenticated' &&
      session.data.user?.email &&
      (window as any).posthog?.__loaded
    ) {
      (window as any).posthog?.identify(session.data.user.email, {
        email: session.data.user.email,
      });
    }
  }, [session]);

  return null;
}

export default PostHogUser;
