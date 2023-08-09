import { userAgentFromString } from 'next/dist/server/web/spec-extension/user-agent';
import { getBot } from '../../getBot';

export function getUserAgentInfo(ua?: string) {
  try {
    if (!ua) return;
    const info = userAgentFromString(ua);
    const isBot = getBot(ua);
    const userInfo = {
      $os: info?.os?.name,
      $browser: info?.browser?.name,
      $browser_version: info?.browser?.version,
      $device_type: info?.device?.type,
      $search_engine: isBot || false,
      isBot: !!isBot,
      userAgent: ua,
    };
    return userInfo;
  } catch (error) {}
}
