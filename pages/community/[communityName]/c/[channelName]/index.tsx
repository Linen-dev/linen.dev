import { links } from '../../../../../constants/examples';
import { findAccountByPath } from '../../../../../lib/models';
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
  res: any;
};
//Remove getServerSideProp duplicate code
export async function getServerSideProps(context: Params) {
  const { params, query, res } = context;
  const { channelName, communityName } = params;

  const account = await findAccountByPath(communityName);
  if (!account) {
    res.statusCode = 404;
    return {
      props: {
        communityName,
      },
    };
  }

  const channels = account.channels;
  const channel = account.channels.find((c) => {
    return c.channelName === channelName;
  });

  const defaultSettings =
    links.find(({ accountId }) => accountId === account.id) || links[0];

  const settings = {
    brandColor: account.brandColor || defaultSettings.brandColor,
    homeUrl: account.homeUrl || defaultSettings.homeUrl,
    docsUrl: account.docsUrl || defaultSettings.docsUrl,
    logoUrl: defaultSettings.logoUrl,
  };

  if (!channel) {
    res.statusCode = 404;
    return {
      props: {
        channels,
        settings,
        communityName,
        slackUrl: account.slackUrl,
      },
    };
  }

  const page = Number(query.page) || 1;
  const { data, pagination } = await fetchThreads({
    channelId: channel.id,
    page: 1,
  });
  let { threads } = data;
  threads = threads.filter((t) => t.messages.length > 0);

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
      currentChannel: channel,
      communityName,
      slackUrl: account.slackUrl,
      settings,
      pagination,
      page,
    },
  };
}
export default Channel;
