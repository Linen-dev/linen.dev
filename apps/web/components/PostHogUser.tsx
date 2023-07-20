import { useEffect } from 'react';
import { useSession } from '@linen/auth/client';

function PostHogUser() {
  const session = useSession();

  useEffect(() => {
    if (
      session.status === 'authenticated' &&
      session.data.user?.email &&
      (window as any).posthog.__loaded
    ) {
      (window as any).posthog?.identify(
        (window as any).posthog.get_distinct_id(),
        {
          email: session.data.user.email,
        }
      );
    }
  }, [session]);

  return null;
}

export default PostHogUser;
