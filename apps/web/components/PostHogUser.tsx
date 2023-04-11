import { usePostHog } from 'posthog-js/react';
import { useEffect } from 'react';
import { useSession } from 'utilities/auth/react';

function PostHogUser() {
  const posthog = usePostHog();
  const session = useSession();

  useEffect(() => {
    if (session.status === 'authenticated' && session.data.user?.id) {
      posthog?.identify(session.data.user.id);
    }
  }, [posthog, session]);

  return null;
}

export default PostHogUser;
