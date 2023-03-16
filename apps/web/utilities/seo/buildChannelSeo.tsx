import { SerializedChannel, Settings } from '@linen/types';
import { LINEN_URL } from 'secrets';
import { SerializedAccount } from '@linen/types';

export function buildChannelSeo({
  settings,
  currentChannel,
  isSubDomainRouting,
  page,
  currentCommunity,
}: {
  settings: Settings;
  currentChannel: SerializedChannel;
  isSubDomainRouting: boolean;
  page: number | null;
  currentCommunity: SerializedAccount;
}) {
  const title = [
    settings.communityName,
    '#' + currentChannel.channelName,
    page ? 'Page ' + page : '',
  ]
    .filter(Boolean)
    .join(' ');

  let url = isSubDomainRouting
    ? `https://${settings.redirectDomain}/c/${currentChannel.channelName}`
    : `${LINEN_URL}/${settings.prefix}/${settings.communityName}/c/${currentChannel.channelName}`;

  if (page) {
    url += '/' + page;
  }

  const description = [currentCommunity.description, title]
    .filter(Boolean)
    .join(' ');

  return { description, title, url, image: settings.logoUrl };
}
