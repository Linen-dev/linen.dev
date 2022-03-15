import { accounts } from '@prisma/client';
import prisma from '../../client';
import { SlackMessageEvent } from '../../interfaces/slackMessageEventInterface';
import { tsToSentAt } from '../../lib/util';

import { handleWebhook } from '../../pages/api/webhook';

beforeEach(async () => {
  await prisma.messages.deleteMany();
  await prisma.users.deleteMany();
  await prisma.slackThreads.deleteMany();
  await prisma.channels.deleteMany();
  await prisma.accounts.deleteMany();
});

const messageNoThread: SlackMessageEvent = {
  token: 'vDJW8zxjB280BnHi84Z19YfU',
  team_id: 'T018254HCUV',
  api_app_id: 'A0306BRR6AD',
  event: {
    client_msg_id: '90136a58-01b8-4fb7-b573-9df24a972e65',
    type: 'message',
    text: 'This is the first message',
    user: 'U0189GKN3PD',
    ts: '1647271062.477219',
    team: 'T018254HCUV',
    blocks: [
      {
        type: 'rich_text',
        block_id: 'Esn5',
        elements: [
          {
            type: 'rich_text_section',
            elements: [{ type: 'text', text: 'This is the first message' }],
          },
        ],
      },
    ],
    channel: 'C03337M2UAV',
    event_ts: '1647271062.477219',
    channel_type: 'channel',
  },
  type: 'event_callback',
  event_id: 'Ev036HQV5SHM',
  event_time: 1647271062,
  authorizations: [
    {
      enterprise_id: null,
      team_id: 'T018254HCUV',
      user_id: 'U0189GKN3PD',
      is_bot: false,
      is_enterprise_install: false,
    },
  ],
  is_ext_shared_channel: false,
  event_context:
    '4-eyJldCI6Im1lc3NhZ2UiLCJ0aWQiOiJUMDE4MjU0SENVViIsImFpZCI6IkEwMzA2QlJSNkFEIiwiY2lkIjoiQzAzMzM3TTJVQVYifQ',
};

const firstReply = {
  token: 'vDJW8zxjB280BnHi84Z19YfU',
  team_id: 'T018254HCUV',
  api_app_id: 'A0306BRR6AD',
  event: {
    client_msg_id: '06013bbe-391d-46ae-a1be-200a053370ff',
    type: 'message',
    text: 'This is the first reply to a thread',
    user: 'U0189GKN3PD',
    ts: '1647271163.064869',
    team: 'T018254HCUV',
    blocks: [
      {
        type: 'rich_text',
        block_id: 'PQ+Ma',
        elements: [
          {
            type: 'rich_text_section',
            elements: [
              { type: 'text', text: 'This is the first reply to a thread' },
            ],
          },
        ],
      },
    ],
    thread_ts: '1647271062.477219',
    parent_user_id: 'U0189GKN3PD',
    channel: 'C03337M2UAV',
    event_ts: '1647271163.064869',
    channel_type: 'channel',
  },
  type: 'event_callback',
  event_id: 'Ev036YDB05EF',
  event_time: 1647271163,
  authorizations: [
    {
      enterprise_id: null,
      team_id: 'T018254HCUV',
      user_id: 'U0189GKN3PD',
      is_bot: false,
      is_enterprise_install: false,
    },
  ],
  is_ext_shared_channel: false,
  event_context:
    '4-eyJldCI6Im1lc3NhZ2UiLCJ0aWQiOiJUMDE4MjU0SENVViIsImFpZCI6IkEwMzA2QlJSNkFEIiwiY2lkIjoiQzAzMzM3TTJVQVYifQ',
};

const secondReply = {
  token: 'vDJW8zxjB280BnHi84Z19YfU',
  team_id: 'T018254HCUV',
  api_app_id: 'A0306BRR6AD',
  event: {
    client_msg_id: '5c5e3a1d-bc46-4da0-ad3b-3f0ca682a449',
    type: 'message',
    text: 'This is the second reply to a thread',
    user: 'U0189GKN3PD',
    ts: '1647271202.299049',
    team: 'T018254HCUV',
    blocks: [
      {
        type: 'rich_text',
        block_id: 'H2Kdu',
        elements: [
          {
            type: 'rich_text_section',
            elements: [
              { type: 'text', text: 'This is the second reply to a thread' },
            ],
          },
        ],
      },
    ],
    thread_ts: '1647271062.477219',
    parent_user_id: 'U0189GKN3PD',
    channel: 'C03337M2UAV',
    event_ts: '1647271202.299049',
    channel_type: 'channel',
  },
  type: 'event_callback',
  event_id: 'Ev036RPZLY7Q',
  event_time: 1647271202,
  authorizations: [
    {
      enterprise_id: null,
      team_id: 'T018254HCUV',
      user_id: 'U0189GKN3PD',
      is_bot: false,
      is_enterprise_install: false,
    },
  ],
  is_ext_shared_channel: false,
  event_context:
    '4-eyJldCI6Im1lc3NhZ2UiLCJ0aWQiOiJUMDE4MjU0SENVViIsImFpZCI6IkEwMzA2QlJSNkFEIiwiY2lkIjoiQzAzMzM3TTJVQVYifQ',
};

describe('when there is no existing thread ', () => {
  const account: accounts = {
    id: '9677cb41-033e-4c1a-9ae5-ef178606cad3',
    slackDomain: 'papercups-io',
    redirectDomain: 'linen.papercups.io',
    slackTeamId: 'SomeSlackId',
    createdAt: new Date(),
    name: 'papercups',
    slackUrl: 'papercups-io',
    brandColor: 'red',
    docsUrl: 'docs.papercups.io',
    homeUrl: 'papercups.io',
  };

  describe('when there is no existing user', () => {
    it('only creates a message', async () => {
      const account = await prisma.accounts.create({
        data: {
          slackTeamId: messageNoThread.team_id,
        },
      });

      await prisma.slackAuthorizations.create({
        data: {
          accessToken: process.env.SLACK_TOKEN,
          scope:
            'channels:history,channels:join,channels:read,incoming-webhook,reactions:read,users:read,team:read',
          botUserId: 'U0SOMEBOTUSERID',
          accountsId: account.id,
        },
      });

      await prisma.channels.create({
        data: {
          slackChannelId: messageNoThread.event.channel,
          channelName: 'someChannel',
          accountId: account.id,
        },
      });

      await handleWebhook(messageNoThread);
      const message = await findMessage(messageNoThread);

      expect(message?.body).toEqual(messageNoThread.event.text);
      expect(message?.slackMessageId).toEqual(messageNoThread.event.ts);
      expect(message?.slackThreads.messageCount).toEqual(1);
      expect(message?.author?.slackUserId).toEqual(messageNoThread.event.user);
      expect(message.slackThreads.slug).toEqual('This-is-the-first-message');

      await handleWebhook(firstReply);
      const savedFirstReply = await findMessage(firstReply);

      expect(savedFirstReply?.body).toEqual(firstReply.event.text);
      expect(savedFirstReply?.slackThreads).not.toBeNull();
      expect(savedFirstReply?.slackThreads.messageCount).toEqual(2);
      expect(savedFirstReply.slackThreads.slug).toEqual(
        'This-is-the-first-message'
      );
      expect(savedFirstReply?.author?.slackUserId).toEqual(
        firstReply.event.user
      );

      const originalMessage = await findMessage(messageNoThread);
      expect(originalMessage?.slackThreads.messageCount).toEqual(2);

      await handleWebhook(secondReply);
      const savedSecondReply = await findMessage(secondReply);
      expect(savedSecondReply?.body).toEqual(secondReply.event.text);
      expect(savedSecondReply?.slackThreads).not.toBeNull();
      expect(savedSecondReply?.slackThreads.messageCount).toEqual(3);
      expect(savedSecondReply?.author?.slackUserId).toEqual(
        secondReply.event.user
      );
    });
  });
});

async function findMessage(message) {
  return await prisma.messages.findUnique({
    where: {
      body_sentAt: {
        body: message.event.text,
        sentAt: tsToSentAt(message.event.ts),
      },
    },
    include: {
      author: true,
      slackThreads: true,
    },
  });
}
// describe('when there is an existing mesage thread', async () => {});

// test('Creates a message when Slack sends a slack event', async () => {
//   const channel = await prisma.channels.create({
//     data: {
//       slackChannelId: slackNewMessageEvent.event.channel,
//       channelName: 'someChannel',
//     },
//   });

//   const res = await handleWebhook(slackNewMessageEvent);
//   expect(res.status).toEqual(200);
// });
