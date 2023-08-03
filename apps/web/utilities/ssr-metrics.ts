import { PostHog } from 'posthog-node';
import { serialize } from 'cookie';
import { v4 } from 'uuid';
import type { GetServerSidePropsContext } from 'next/types';
import { userAgentFromString } from 'next/dist/server/web/spec-extension/user-agent';
import type { IncomingHttpHeaders } from 'http';

const POSTHOG_APIKEY = process.env.SSR_POSTHOG_API_KEY!;

const postHog =
  process.env.NODE_ENV === 'production' && !!POSTHOG_APIKEY
    ? new PostHog(POSTHOG_APIKEY, {
        flushAt: 1,
        flushInterval: 0,
        enable: process.env.POSTHOG_SERVER_ENABLE === 'true',
        requestTimeout: Number(process.env.POSTHOG_TIMEOUT || 1000),
        disableGeoip: false,
      })
    : undefined;

const random = () => v4();

const identifyUserSession = ({
  req,
  res,
}: Partial<GetServerSidePropsContext>) => {
  const cookies = req?.cookies;
  const cookie = cookies?.['user-session'];
  if (cookie) {
    return cookie;
  } else {
    const setCookieHeader: string[] = [];
    const existCookieHeader = res?.getHeader('Set-Cookie') ?? [];
    if (Array.isArray(existCookieHeader)) {
      setCookieHeader.push(...existCookieHeader);
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
    res?.setHeader('Set-Cookie', setCookieHeader);
    return value;
  }
};

const identifyUrl = ({
  req,
  resolvedUrl,
}: Partial<GetServerSidePropsContext>) => {
  const url = `${req?.headers?.host || req?.headers?.origin || ''}${
    resolvedUrl || req?.url
  }`;
  return url;
};

/**
 * function to track page viewed plus duration of response time
 * it sends data to postHog and sentry
 */
export const trackPageView = async (
  context: GetServerSidePropsContext,
  email?: string
) => {
  const distinctId = identifyUserSession(context);
  const url = identifyUrl(context);
  const headers = context.req.headers;
  const userAgentInfo = getUserAgentInfo(headers);

  postHog?.capture({
    distinctId,
    event: '$pageview',
    properties: {
      $current_url: url,
      $referrer: headers?.referer || headers?.origin,
      $referring_domain: headers?.referer || headers?.origin,
      $host: headers?.host,
      $ip: getIp(headers),
      ...userAgentInfo,
    },
  });

  if (email)
    postHog?.identify({
      distinctId,
      properties: { email },
    });

  return postHog?.shutdownAsync();
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
  const headers = req.headers;
  const userAgentInfo = getUserAgentInfo(headers);
  const ipInfo = getIp(headers);

  postHog?.capture({
    distinctId,
    event,
    properties: {
      $current_url: url,
      $referrer: headers?.referer || headers?.origin,
      $referring_domain: headers?.referer || headers?.origin,
      $host: headers?.host,
      ...ipInfo,
      ...userAgentInfo,
      ...metadata,
    },
  });

  if (req.session_user?.email || req.user?.email)
    postHog?.identify({
      distinctId,
      properties: { email: req.session_user?.email || req.user?.email },
    });

  return postHog?.shutdownAsync();
};

function getUserAgentInfo(headers: IncomingHttpHeaders) {
  try {
    const info = userAgentFromString(headers['user-agent']);
    const userInfo = {
      $os: info?.os?.name,
      $browser: info?.browser?.name,
      $browser_version: info?.browser?.version,
      $device_type: info?.device?.type,
      $search_engine: info?.isBot,
    };
    return userInfo;
  } catch (error) {}
}

function getIp(headers: IncomingHttpHeaders) {
  try {
    let ip = headers['x-real-ip'];
    if (!ip) {
      const forwardedFor = headers['x-forwarded-for'];
      if (Array.isArray(forwardedFor)) {
        ip = forwardedFor.at(0);
      } else {
        ip = forwardedFor?.split(',').at(0) ?? undefined;
      }
    }
    return {
      $ip: ip,
    };
  } catch (error) {}
}
