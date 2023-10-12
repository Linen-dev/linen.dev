import { useEffect } from 'react';
import { useSession } from '@linen/auth-client/client';
import type { NextRouter } from 'next/router';

export default function PostHogUser() {
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

export function handlePosthogId(router: NextRouter) {
  if (router.query.phId) {
    // TODO: cross match between SSR and client metrics
    // const distinctId = (window as any)?.posthog?.get_distinct_id();
    // distinctId &&
    //   (window as any)?.posthog?.alias({
    //     distinctId,
    //     alias: router.query.phId,
    //   });
    const search = new URL(window.location.toString()).searchParams;
    search.delete('phId');
    router.replace(
      { pathname: window.location.pathname, query: search.toString() },
      undefined,
      { shallow: true }
    );
  }
}
