import { links } from '../../../../../constants/examples';
import {
  channelIndex,
  findAccountById,
  findAccountByPath,
  findChannel,
  listUsers,
  threadIndex,
} from '../../../../../lib/models';
import Channel from '../../index';
import serializeThread from '../../../../../serializers/thread';
import { index as fetchThreads } from '../../../../../services/threads';

type Params = {
  params: {
    communityName: string;
    channelName: string;
  };
  query: {
    page?: string;
  };
};
//Remove getServerSideProp duplicate code
export async function getServerSideProps(context: Params) {
  const { params, query } = context;
  const { channelName, communityName } = params;

  const account = await findAccountByPath(communityName);

  const channels = account.channels;
  const channel = account.channels.find((c) => {
    return c.channelName === channelName;
  });

  const page = Number(query.page) || 1;
  const { data, pagination } = await fetchThreads({
    channelId: channel.id,
    page: 1,
  });
  const { threads } = data;

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
      channelId: channel.id,
      users,
      threads: threads.map(serializeThread),
      channels,
      communityName,
      slackUrl: account.slackUrl,
      settings,
      pagination,
      page,
    },
  };
}
export default Channel;
