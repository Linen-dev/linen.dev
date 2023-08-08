import { PostHog } from 'posthog-node';
import { serialize } from 'cookie';
import { v4 } from 'uuid';
import type { GetServerSidePropsContext } from 'next/types';
import { userAgentFromString } from 'next/dist/server/web/spec-extension/user-agent';
import type { IncomingHttpHeaders } from 'http';
import { Permissions } from '@linen/types';

const POSTHOG_APIKEY = process.env.SSR_POSTHOG_API_KEY!;
const isProd = process.env.NODE_ENV === 'production';

const postHog =
  isProd && !!POSTHOG_APIKEY
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
  query,
  req,
  res,
}: Partial<GetServerSidePropsContext>) => {
  const phId = Array.isArray(query?.phId) ? query?.phId.at(0) : query?.phId;
  const cookie = req?.cookies?.['user-session'];
  if (cookie && !phId) {
    setPhCookie(res, cookie);
    return cookie;
  }
  if (cookie && phId && cookie === phId) {
    setPhCookie(res, cookie);
    return cookie;
  }
  const value = phId || random();
  setPhCookie(res, value);
  return value;
};

const identifyUrl = ({
  req,
  resolvedUrl,
}: Partial<GetServerSidePropsContext>) => {
  const host = req?.headers?.host || req?.headers?.origin || '';
  const url = `${host}${resolvedUrl || req?.url}`;
  return url.replace(`/s/${host}`, '');
};

export const trackPage = async <T>(
  context: GetServerSidePropsContext,
  data:
    | {
        redirect: {
          destination: string;
          permanent: boolean;
        };
      }
    | { notFound: true }
    | {
        props: T & {
          permissions?: Permissions;
        };
      }
) => {
  if ('notFound' in data) {
    return data;
  }

  const email =
    'props' in data ? data.props.permissions?.auth?.email : undefined;

  const phId = await trackPageView(context, email);

  if ('redirect' in data) {
    const dest = new URL(data.redirect.destination);
    dest.searchParams.append('phId', phId);
    data.redirect.destination = dest.toString();
  }

  return data;
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
  const ipInfo = getIp(headers);

  if (email) {
    postHog?.identify({
      distinctId: email,
      properties: { email },
    });
    postHog?.alias({
      distinctId: email,
      alias: distinctId,
    });
  }

  postHog?.capture({
    distinctId: email || distinctId,
    event: '$pageview',
    properties: {
      $current_url: url,
      $referrer: headers?.referer || headers?.origin,
      $referring_domain: headers?.referer || headers?.origin,
      $host: headers?.host,
      ...ipInfo,
      ...userAgentInfo,
    },
  });

  await postHog?.shutdownAsync();
  return distinctId;
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

  const email = req.session_user?.email || req.user?.email;
  if (email) {
    postHog?.identify({
      distinctId: email,
      properties: { email: email },
    });
    postHog?.alias({
      distinctId: email,
      alias: distinctId,
    });
  }

  postHog?.capture({
    distinctId: email || distinctId,
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

  return postHog?.shutdownAsync();
};

function setPhCookie(res: any, value: string) {
  const setCookieHeader: string[] = [];
  const existCookieHeader = res?.getHeader('Set-Cookie') ?? [];
  if (Array.isArray(existCookieHeader)) {
    setCookieHeader.push(...existCookieHeader);
  }
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
}

function getUserAgentInfo(headers: IncomingHttpHeaders) {
  try {
    const ua = headers['user-agent'];
    if (!ua) return;
    const info = userAgentFromString(ua);
    const userInfo = {
      $os: info?.os?.name,
      $browser: info?.browser?.name,
      $browser_version: info?.browser?.version,
      $device_type: info?.device?.type,
      $search_engine: info?.isBot && getBot(ua),
      userAgent: ua,
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

function getBot(input: string): string | undefined {
  const result =
    /Googlebot|Mediapartners-Google|AdsBot-Google|googleweblight|Storebot-Google|Google-PageRenderer|Google-InspectionTool|Bingbot|BingPreview|Slurp|DuckDuckBot|baiduspider|yandex|sogou|LinkedInBot|bitlybot|tumblr|vkShare|quora link preview|facebookexternalhit|facebookcatalog|Twitterbot|applebot|redditbot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|ia_archiver/i.exec(
      input
    );
  return result?.length ? result.at(0) : input;
}
