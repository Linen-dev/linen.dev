import { usePostHog } from 'posthog-js/react';
import { useEffect } from 'react';
import { useSession } from '@linen/auth/client';

function PostHogUser() {
  const posthog = usePostHog();
  const session = useSession();

  useEffect(() => {
    if (
      session.status === 'authenticated' &&
      session.data.user?.email &&
      posthog.__loaded
    ) {
      posthog?.identify(posthog.get_distinct_id(), {
        email: session.data.user.email,
      });
    }
  }, [posthog, session]);

  return null;
}

export default PostHogUser;
