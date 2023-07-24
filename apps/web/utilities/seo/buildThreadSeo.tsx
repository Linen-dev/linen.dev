import { normalize } from '@linen/utilities/string';
import { SerializedThread, Settings } from '@linen/types';
import { buildUrl } from './utils/buildThreadUrl';
import { replaceMentions } from './utils/replaceMentions';

export function buildThreadSeo({
  isSubDomainRouting,
  channelName,
  settings,
  thread,
}: {
  isSubDomainRouting: boolean;
  channelName: string;
  settings: Settings;
  thread: SerializedThread;
}) {
  const firstMessage = thread.messages.find(Boolean);
  const cleanBody = normalize(
    replaceMentions({
      body: firstMessage?.body || thread.slug,
      mentions: firstMessage?.mentions || [],
    })
  );
  const title = [
    thread.title || cleanBody.slice(0, 60),
    settings.communityName,
    '#' + channelName,
  ]
    .filter(Boolean)
    .join(' ');

  const url = buildUrl(isSubDomainRouting, settings, thread);

  return {
    title,
    description: cleanBody.slice(0, 200),
    image: settings.logoUrl,
    url,
    robotsMetaTag: thread.robotsMetaTag,
  };
}
