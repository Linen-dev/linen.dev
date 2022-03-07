import { links } from '../../../../../constants/examples';
import {
  findAccountByPath,
  listUsers,
  threadIndex,
} from '../../../../../lib/slack';
import Channel from '../../../[communityName]/index';
import serializeThread from '../../../../../serializers/thread';
type Params = {
  params: {
    communityName: string;
  };
};

//TODO: Remove getServerSideProp duplicate code
export async function getServerSideProps({
  params: { communityName },
}: Params) {
  const account = await findAccountByPath(communityName);
  const channels = account.channels;
  const channel = channels[0];

  const channelId = channel.id;

  const threadsPromise = threadIndex(channelId, 50);
  const usersPromise = listUsers(channel.accountId);
  const [threads, users] = await Promise.all([threadsPromise, usersPromise]);

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
