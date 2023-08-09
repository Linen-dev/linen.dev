import { getUserAgentInfo } from './helpers/getUserAgentInfo';
import { getIp } from './helpers/getIp';
import { identifyUrl } from './helpers/identifyUrl';
import { identifyUserSession } from './helpers/identifyUserSession';
import { postHog } from './postHog';

export enum ApiEvent {
  'user_send_message' = 'user_send_message',
  'sign_in' = 'sign_in',
  'sign_up' = 'sign_up',
  'sign_out' = 'sign_out',
  'user_create_community' = 'user_create_community',
  'sign_up_new_thread' = 'sign_up_new_thread',
  'sign_up_new_message' = 'sign_up_new_message',
  'magic_link_new_thread' = 'magic_link_new_thread',
  'magic_link_new_message' = 'magic_link_new_message',
}

/**
 * function to track specific events
 */
export async function trackApiEvent(
  { req, res }: any,
  event: ApiEvent,
  metadata?: any
) {
  try {
    const distinctId = identifyUserSession({ req, res });
    const url = identifyUrl({ req });
    const headers = req.headers || {};
    const userAgentInfo = getUserAgentInfo(headers['user-agent']);
    const ip = getIp(headers);

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
        $ip: ip,
        ...userAgentInfo,
        ...metadata,
      },
    });

    return postHog?.shutdownAsync();
  } catch (error) {}
}
