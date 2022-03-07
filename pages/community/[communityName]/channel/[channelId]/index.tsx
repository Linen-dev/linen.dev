import { links } from '../../../../../constants/examples';
import {
  channelIndex,
  findAccountById,
  findAccountByPath,
  findChannel,
  listUsers,
  threadIndex,
} from '../../../../../lib/slack';
import Channel from '../../../[communityName]/index';
import serializeThread from '../../../../../serializers/thread';

type Params = {
  params: {
    channelId: string;
    communityName: string;
  };
};

//Remove getServerSideProp duplicate code
export async function getServerSideProps({
  params: { channelId, communityName },
}: Params) {
  const [channel, threads] = await Promise.all([
    findChannel(channelId),
    threadIndex(channelId, 50),
  ]);
  const [channels, users, account] = await Promise.all([
    channelIndex(channel.accountId),
    listUsers(channel.accountId),
    findAccountById(channel.accountId),
  ]);

  const defaultSettings =
    links.find(({ accountId }) => accountId === account.id) || links[0];

  const settings = {
    brandColor: account.brandColor || defaultSettings.brandColor,
    homeUrl: account.homeUrl || defaultSettings.homeUrl,
    docsUrl: account.docsUrl || defaultSettings.docsUrl,
    logoUrl: defaultSettings.logoUrl,
  };

  return {
    props: {
      channelId,
      users,
      threads: threads.map(serializeThread),
      channels,
      communityName,
      slackUrl: account.slackUrl,
      settings,
    },
  };
}
export default Channel;
