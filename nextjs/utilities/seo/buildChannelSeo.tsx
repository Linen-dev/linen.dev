import { capitalize, cleanUpStringForSeo } from 'utilities/string';
import { Settings } from 'services/accountSettings';
import { SerializedThread } from 'serializers/thread';

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
  const title = [
    capitalize(settings.communityName),
    capitalize(channelName),
    pathCursor,
  ]
    .filter(Boolean)
    .join(' | ');

  let url = isSubDomainRouting
    ? `https://${settings.redirectDomain}/c/${channelName}`
    : `https://linen.dev/${settings.prefix}/${settings.communityName}/c/${channelName}`;

  if (pathCursor) {
    url += '/' + pathCursor;
  }

  // we may use keywords-frequency instead
  const description =
    threads
      ?.map((t) =>
        cleanUpStringForSeo(t.messages?.[0]?.body || t.slug).substring(0, 40)
      )
      .join(' ... ') || title;

  return { description, title, url, image: settings.logoUrl };
}
