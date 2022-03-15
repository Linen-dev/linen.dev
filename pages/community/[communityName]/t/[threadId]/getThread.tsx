import {
  channelIndex,
  findAccountById,
  findThreadById,
  listUsers,
} from '../../../../../lib/models';
import serializeThread from '../../../../../serializers/thread';
import { links } from '../../../../../constants/examples';

// Function for getServerSideProps
// extracted here to be resused in both /[threadId]/index and /[slug]/index
// TODO: maybe we have a folder for this?
export async function getThread(threadId: string) {
  const id = parseInt(threadId);
  const thread = await findThreadById(id);

  const [channels, users, account] = await Promise.all([
    channelIndex(thread.channel.accountId),
    listUsers(thread.channel.accountId),
    findAccountById(thread.channel.accountId),
  ]);

  const defaultSettings =
    links.find(({ accountId }) => accountId === account.id) || links[0];

  const settings = {
    brandColor: account.brandColor || defaultSettings.brandColor,
    homeUrl: account.homeUrl || defaultSettings.homeUrl,
    docsUrl: account.docsUrl || defaultSettings.docsUrl,
    logoUrl: defaultSettings.logoUrl,
  };

  // "https://papercups-test.slack.com/archives/C01JSB67DTJ/p1627841694000600"
  const threadUrl =
    account.slackUrl +
    '/archives/' +
    thread.channel.slackChannelId +
    '/p' +
    (parseFloat(thread.slackThreadTs) * 1000000).toString();

  return {
    props: {
      ...serializeThread(thread),
      threadId,
      users,
      channels,
      slackUrl: account.slackUrl,
      threadUrl,
      settings,
      viewCount: thread.viewCount,
    },
  };
}
