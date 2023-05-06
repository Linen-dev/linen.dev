import { PostHog } from 'posthog-node';
import { serialize } from 'cookie';
import * as Sentry from '@sentry/node';

const POSTHOG_APIKEY = process.env.NEXT_PUBLIC_POSTHOG_API_KEY!;
const SENTRY_DSN = process.env.SENTRY_DSN!;

Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [new Sentry.Integrations.Http({ tracing: true })],
  tracesSampleRate: Number(process.env.SENTRY_SAMPLE_RATE || 0.5),
  debug: process.env.SENTRY_DEBUG === 'true',
  enabled: process.env.SENTRY_ENABLED === 'true',
  shutdownTimeout: Number(process.env.SENTRY_TIMEOUT || 1000),
});

export { Sentry };

const postHog = !!POSTHOG_APIKEY
  ? new PostHog(POSTHOG_APIKEY, {
      flushAt: 1,
      flushInterval: 0,
      enable: process.env.POSTHOG_SERVER_ENABLE === 'true',
      requestTimeout: Number(process.env.POSTHOG_TIMEOUT || 1000),
    })
  : undefined;

const random = () => (Math.random() + 1).toString(36).substring(2);

export const identifyUserSession = ({ req, res }: any) => {
  const cookies = req.cookies;
  const cookie = cookies['user-session'];
  if (cookie) {
    return cookie;
  } else {
    let setCookieHeader = res.getHeader('Set-Cookie') ?? [];
    if (!Array.isArray(setCookieHeader)) {
      setCookieHeader = [setCookieHeader];
    }
    const value = random();
    setCookieHeader.push(
      serialize('user-session', value, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60,
      })
    );
    res.setHeader('Set-Cookie', setCookieHeader);
    return value;
  }
};

const identifyUrl = ({ req, resolvedUrl }: any) => {
  const url = `${req.headers?.host || req.headers?.origin || ''}${
    resolvedUrl || req.url
  }`;
  return url;
};

/**
 * function to track page viewed plus duration of response time
 * it sends data to postHog and sentry
 */
export const trackPageView = (context: any) => {
  const distinctId = identifyUserSession(context);
  const url = identifyUrl(context);

  const transaction = Sentry.startTransaction({ name: url });
  Sentry.setUser({ id: distinctId });

  postHog?.capture({
    distinctId,
    event: '$pageview',
    properties: {
      $current_url: url,
    },
  });

  return {
    knownUser: (userId: string) => {
      postHog?.alias({
        distinctId,
        alias: userId,
      });
    },
    flush: async () => {
      transaction?.finish();
      await postHog?.shutdownAsync();
      await Sentry.flush();
      Sentry.setUser(null);
    },
  };
};

export enum ApiEvent {
  'user_send_message' = 'user_send_message',
  'sign_in' = 'sign_in',
  'sign_up' = 'sign_up',
  'sign_out' = 'sign_out',
  'user_create_community' = 'user_create_community',
}
/**
 * function to track events
 * it sends data to postHog
 * p.d.: we don't need to track duration since we use a middleware for it
 */
export const trackApiEvent = (
  { req, res }: any,
  event: ApiEvent,
  metadata?: any
) => {
  const distinctId = identifyUserSession({ req, res });
  const url = identifyUrl({ req });

  postHog?.capture({
    distinctId,
    event,
    properties: {
      $current_url: url,
      ...metadata,
    },
  });

  const userId = req.session_user?.id || req.user?.id;

  if (userId) {
    postHog?.alias({
      distinctId,
      alias: userId,
    });
  }
  return postHog?.shutdownAsync();
};
