import { SerializedChannel, Settings } from '@linen/types';
import { LINEN_URL } from 'config';
import { SerializedAccount } from '@linen/types';

export function buildChannelSeo({
  settings,
  currentChannel,
  isSubDomainRouting,
  pathCursor,
  currentCommunity,
}: {
  settings: Settings;
  currentChannel: SerializedChannel;
  isSubDomainRouting: boolean;
  pathCursor: string | null;
  currentCommunity: SerializedAccount;
}) {
  const title = [settings.communityName, '#' + currentChannel.channelName]
    .filter(Boolean)
    .join(' ');

  let url = isSubDomainRouting
    ? `https://${settings.redirectDomain}/c/${currentChannel.channelName}`
    : `${LINEN_URL}/${settings.prefix}/${settings.communityName}/c/${currentChannel.channelName}`;

  if (pathCursor) {
    url += '/' + pathCursor;
  }

  const description = [
    currentCommunity.description,
    title,
    pathCursor ? 'Page ' + pathCursor : 'Latest',
  ]
    .filter(Boolean)
    .join(' ');

  return { description, title, url, image: settings.logoUrl };
}
