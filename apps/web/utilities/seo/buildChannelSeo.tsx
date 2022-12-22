import { capitalize, normalize } from '@linen/utilities/string';
import { Settings } from '@linen/types';
import { SerializedThread } from '@linen/types';
import { LINEN_URL } from 'secrets';

export function buildChannelSeo({
  settings,
  channelName,
  isSubDomainRouting,
  pathCursor,
  threads,
}: {
  settings: Settings;
  channelName: string;
  isSubDomainRouting: boolean;
  pathCursor: string | null;
  threads?: SerializedThread[];
}) {
  const title = [capitalize(settings.communityName), capitalize(channelName)]
    .filter(Boolean)
    .join(' | ');

  let url = isSubDomainRouting
    ? `https://${settings.redirectDomain}/c/${channelName}`
    : `${LINEN_URL}/${settings.prefix}/${settings.communityName}/c/${channelName}`;

  if (pathCursor) {
    url += '/' + pathCursor;
  }

  // we may use keywords-frequency instead
  const description =
    threads
      ?.map((t) => normalize(t.messages?.[0]?.body || t.slug).substring(0, 43))
      .join('… ') || title;

  return { description, title, url, image: settings.logoUrl };
}
