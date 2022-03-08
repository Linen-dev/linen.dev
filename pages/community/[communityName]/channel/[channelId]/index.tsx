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
  const [channels, account] = await Promise.all([
    channelIndex(channel.accountId),
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

  const users = threads
    .map((t) => t.messages.map((m) => m.author))
    .flat()
    .filter((u) => u);

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
