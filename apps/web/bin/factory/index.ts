import prisma from '../../client';
import { truncateTables } from './truncate';
import { ChatType, MessageFormat, Roles } from '@linen/types';
import { generateHash } from '../../utilities/password';

async function createLinenCommunity() {
  const community = await prisma.accounts.create({
    data: {
      name: 'Linen',
      homeUrl: `https://linen.dev`,
      docsUrl: `https://linen.dev/docs`,
      brandColor: '#000000',
      slackDomain: 'linen',
      logoUrl: 'https://linen-assets.s3.amazonaws.com/linen-white-logo.svg',
      chat: ChatType.MEMBERS,
      syncStatus: 'DONE',
      premium: true,
    },
  });
  const auth1 = await prisma.auths.create({
    data: {
      email: 'emil@linen.dev',
      password: generateHash('password1!', 'salt'),
      salt: 'salt',
      accountId: community.id,
    },
  });
  const user1 = await prisma.users.create({
    data: {
      displayName: 'Emil',
      accountsId: community.id,
      authsId: auth1.id,
      isAdmin: true,
      isBot: false,
      role: Roles.ADMIN,
    },
  });
  const auth2 = await prisma.auths.create({
    data: {
      email: 'jarek@linen.dev',
      password: generateHash('password1!', 'salt'),
      salt: 'salt',
      accountId: community.id,
    },
  });
  const user2 = await prisma.users.create({
    data: {
      displayName: 'Jarek',
      accountsId: community.id,
      authsId: auth2.id,
      isAdmin: true,
      isBot: false,
      role: Roles.ADMIN,
    },
  });
  const auth3 = await prisma.auths.create({
    data: {
      email: 'kam@linen.dev',
      password: generateHash('password1!', 'salt'),
      salt: 'salt',
      accountId: community.id,
    },
  });
  const user3 = await prisma.users.create({
    data: {
      displayName: 'Kam',
      accountsId: community.id,
      authsId: auth3.id,
      isAdmin: true,
      isBot: false,
      role: Roles.OWNER,
    },
  });
  const auth4 = await prisma.auths.create({
    data: {
      email: 'sandro@linen.dev',
      password: generateHash('password1!', 'salt'),
      salt: 'salt',
      accountId: community.id,
    },
  });
  const user4 = await prisma.users.create({
    data: {
      displayName: 'Sandro',
      accountsId: community.id,
      authsId: auth4.id,
      isAdmin: true,
      isBot: false,
      role: Roles.ADMIN,
    },
  });

  const channel1 = await prisma.channels.create({
    data: {
      accountId: community.id,
      channelName: 'general',
    },
  });
  // 1. Thread with a reaction
  await prisma.threads.create({
    data: {
      channelId: channel1.id,
      sentAt: new Date().getTime(),
      messages: {
        create: [
          {
            channelId: channel1.id,
            body: 'I’m setting up a docker compose file for integration tests so it doesn’t mess with your current db',
            usersId: user3.id,
            sentAt: '2021-12-09T08:01:00.000Z',
            messageFormat: MessageFormat.LINEN,
            reactions: {
              create: [
                {
                  name: 'white_heavy_check_mark',
                  count: 1,
                },
              ],
            },
          },
        ],
      },
    },
  });
  // 2. Thread with inline code blocks
  await prisma.threads.create({
    data: {
      channelId: channel1.id,
      sentAt: new Date().getTime(),
      messages: {
        create: [
          {
            channelId: channel1.id,
            body: "I had a look at optimizing pages and they're being slown down heavily by avatars right now. `Next.js` offers `next/image` which supports lazy loading, so we could fix that, but I would need to spend some time refactoring avatars. Does that make sense?",
            usersId: user1.id,
            sentAt: '2021-12-09T09:01:00.000Z',
            messageFormat: MessageFormat.LINEN,
          },
          {
            channelId: channel1.id,
            body: "Yeah that sounds good i'm only working on backend now",
            usersId: user3.id,
            sentAt: '2021-12-09T09:02:00.000Z',
            messageFormat: MessageFormat.LINEN,
          },
          {
            channelId: channel1.id,
            body: 'Ok, thanks',
            usersId: user1.id,
            sentAt: '2021-12-09T09:03:00.000Z',
            messageFormat: MessageFormat.LINEN,
          },
        ],
      },
    },
  });
  // 3. Thread with a link
  await prisma.threads.create({
    data: {
      channelId: channel1.id,
      sentAt: new Date().getTime(),
      messages: {
        create: [
          {
            channelId: channel1.id,
            body: "btw https://www.linen.dev/sitemap.xml doesn't seem to work",
            usersId: user3.id,
            sentAt: '2021-12-09T10:01:00.000Z',
            messageFormat: MessageFormat.LINEN,
          },
          {
            channelId: channel1.id,
            body: "thanks, I'll have a look tomorrow - focused on the lazy loading of avatars today",
            usersId: user1.id,
            sentAt: '2021-12-09T10:02:00.000Z',
            messageFormat: MessageFormat.LINEN,
          },
          {
            channelId: channel1.id,
            body: 'https://github.com/Linen-dev/linen.dev/pull/21/files',
            usersId: user1.id,
            sentAt: '2021-12-09T10:03:00.000Z',
            messageFormat: MessageFormat.LINEN,
          },
          {
            channelId: channel1.id,
            body: "let's see if this helps",
            usersId: user1.id,
            sentAt: '2021-12-09T10:04:00.000Z',
            messageFormat: MessageFormat.LINEN,
          },
        ],
      },
    },
  });
  // 4. Thread with mention
  await prisma.threads.create({
    data: {
      channelId: channel1.id,
      sentAt: new Date().getTime(),
      messages: {
        create: [
          {
            channelId: channel1.id,
            body: `@${user1.id} do you know any other contractors that you enjoy working with? I need some more help and man power right now`,
            usersId: user3.id,
            sentAt: '2021-12-11T09:01:00.000Z',
            messageFormat: MessageFormat.LINEN,
            mentions: {
              create: [{ usersId: user1.id }],
            },
          },
          {
            channelId: channel1.id,
            body: "I'll ask around",
            usersId: user1.id,
            sentAt: '2021-12-11T09:02:00.000Z',
            messageFormat: MessageFormat.LINEN,
          },
          {
            channelId: channel1.id,
            body: "ok, asked, I'll let you know when someone responds :)",
            usersId: user1.id,
            sentAt: '2021-12-11T09:17:00.000Z',
            messageFormat: MessageFormat.LINEN,
          },
        ],
      },
    },
  });
  // 5. Thread with code block
  await prisma.threads.create({
    data: {
      channelId: channel1.id,
      sentAt: new Date().getTime(),
      messages: {
        create: [
          {
            channelId: channel1.id,
            body: "hey, I'm getting errors from the package with tests, do you have same issues? ```\n● Test suite failed to run\n\n    Cannot find module '@linen/hooks/mode' from 'components/NavBar/Desktop/index.tsx'\n\n    Require stack:\n        components/NavBar/Desktop/index.tsx\n        components/NavBar/index.tsx\n        components/NavBar/index.spec.tsx```",
            usersId: user4.id,
            sentAt: '2021-12-12T09:01:00.000Z',
            messageFormat: MessageFormat.LINEN,
          },
          {
            channelId: channel1.id,
            body: "ugh yes, sorry for that. Can you `skip` all failing tests for now please? I'll try to bring them back soon",
            usersId: user1.id,
            sentAt: '2021-12-12T09:02:00.000Z',
            messageFormat: MessageFormat.LINEN,
          },
        ],
      },
    },
  });
  // 6. Thread with multiple reactions
  await prisma.threads.create({
    data: {
      channelId: channel1.id,
      sentAt: new Date().getTime(),
      messages: {
        create: [
          {
            channelId: channel1.id,
            body: "we've reached 1k stars on github",
            usersId: user4.id,
            sentAt: '2021-12-13T09:01:00.000Z',
            messageFormat: MessageFormat.LINEN,
            reactions: {
              create: [
                {
                  name: 'thumbsup',
                  count: 2,
                },
              ],
            },
          },
        ],
      },
    },
  });
  // 7. Thread with an attachment
  await prisma.threads.create({
    data: {
      channelId: channel1.id,
      sentAt: new Date().getTime(),
      messages: {
        create: [
          {
            channelId: channel1.id,
            body: 'need to fix the feed',
            usersId: user3.id,
            sentAt: '2021-12-14T09:01:00.000Z',
            messageFormat: MessageFormat.LINEN,
            attachments: {
              create: [
                {
                  name: 'linen-example-feed.png',
                  sourceUrl: 'http://localhost:3000/linen-example-feed.png',
                  internalUrl: 'http://localhost:3000/linen-example-feed.png',
                  externalId: '1234',
                },
                {
                  name: 'linen-example-test.png',
                  sourceUrl: 'http://localhost:3000/linen-example-test.png',
                  internalUrl: 'http://localhost:3000/linen-example-test.png',
                  externalId: '5678',
                },
              ],
            },
          },
        ],
      },
    },
  });
  // 8. Thread with a big image
  await prisma.threads.create({
    data: {
      channelId: channel1.id,
      sentAt: new Date().getTime(),
      messages: {
        create: [
          {
            channelId: channel1.id,
            body: 'we need to fix the channel view too http://localhost:3000/linen-example-page.png',
            usersId: user4.id,
            sentAt: '2021-12-14T09:01:00.000Z',
            messageFormat: MessageFormat.LINEN,
          },
        ],
      },
    },
  });
  // 9. Thread with a small image
  await prisma.threads.create({
    data: {
      channelId: channel1.id,
      sentAt: new Date().getTime(),
      messages: {
        create: [
          {
            channelId: channel1.id,
            body: 'New avatars http://localhost:3000/linen-example-avatar.png',
            usersId: user1.id,
            sentAt: '2021-12-14T09:01:00.000Z',
            messageFormat: MessageFormat.LINEN,
          },
        ],
      },
    },
  });

  // 10. Thread with many messages
  await prisma.threads.create({
    data: {
      channelId: channel1.id,
      sentAt: new Date().getTime(),
      messages: {
        create: [
          {
            channelId: channel1.id,
            body: 'Notifications are ready!',
            usersId: user1.id,
            sentAt: '2021-12-14T09:01:00.000Z',
            messageFormat: MessageFormat.LINEN,
          },
          {
            channelId: channel1.id,
            body: 'You can set them in the profile page.',
            usersId: user1.id,
            sentAt: '2021-12-14T09:02:00.000Z',
            messageFormat: MessageFormat.LINEN,
          },
          {
            channelId: channel1.id,
            body: 'Preferences are kept inside of local storage.',
            usersId: user1.id,
            sentAt: '2021-12-14T09:03:00.000Z',
            messageFormat: MessageFormat.LINEN,
          },
          {
            channelId: channel1.id,
            body: 'Cool!',
            usersId: user2.id,
            sentAt: '2021-12-14T09:04:00.000Z',
            messageFormat: MessageFormat.LINEN,
          },
          {
            channelId: channel1.id,
            body: 'Great!',
            usersId: user3.id,
            sentAt: '2021-12-14T09:05:00.000Z',
            messageFormat: MessageFormat.LINEN,
          },
          {
            channelId: channel1.id,
            body: 'Awesome!',
            usersId: user4.id,
            sentAt: '2021-12-14T09:06:00.000Z',
            messageFormat: MessageFormat.LINEN,
          },
          {
            channelId: channel1.id,
            body: 'We are going to release it soon.',
            usersId: user3.id,
            sentAt: '2021-12-14T09:07:00.000Z',
            messageFormat: MessageFormat.LINEN,
          },
          {
            channelId: channel1.id,
            body: 'We\'ll try to track it.',
            usersId: user1.id,
            sentAt: '2021-12-14T09:08:00.000Z',
            messageFormat: MessageFormat.LINEN,
          },
        ],
      },
    },
  });

  const channel2 = await prisma.channels.create({
    data: {
      accountId: community.id,
      channelName: 'ideas',
    },
  });

  await prisma.threads.create({
    data: {
      channelId: channel2.id,
      sentAt: new Date().getTime(),
      messages: {
        create: [
          {
            channelId: channel1.id,
            body: "We could create an api",
            usersId: user4.id,
            sentAt: '2021-12-13T09:01:00.000Z',
            messageFormat: MessageFormat.LINEN,
            reactions: {
              create: [
                {
                  name: 'thumbsup',
                  count: 2,
                },
              ],
            },
          },
        ],
      },
    },
  });
}

export const seed = async () => {
  await truncateTables();

  await createLinenCommunity();
};
