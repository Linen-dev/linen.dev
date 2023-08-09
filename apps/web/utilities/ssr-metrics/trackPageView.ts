import type { GetServerSidePropsContext } from 'next/types';
import { getUserAgentInfo } from './helpers/getUserAgentInfo';
import { getIp } from './helpers/getIp';
import { identifyUrl } from './helpers/identifyUrl';
import { identifyUserSession } from './helpers/identifyUserSession';
import { postHog } from './postHog';

/**
 * function to track page viewed
 */

export async function trackPageView(
  context: GetServerSidePropsContext,
  email?: string
) {
  try {
    const distinctId = identifyUserSession(context);
    const url = identifyUrl(context);
    const headers = context.req.headers || {};
    const userAgentInfo = getUserAgentInfo(headers['user-agent']);
    const ip = getIp(headers);

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
        $ip: ip,
        ...userAgentInfo,
      },
    });

    await postHog?.shutdownAsync();
    return distinctId;
  } catch (error) {}
}
