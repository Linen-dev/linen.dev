import prisma from '../client';

import {
  fetchConversations,
  joinChannel,
  saveMessages,
  saveThreadedMessages,
} from '../fetch_all_conversations';
import { createMessage, findOrCreateChannel } from '../lib/slack';

const channel = 'C030HFK836C';

beforeEach(async () => {
  await prisma.messages.deleteMany();
  // await prisma.channel.deleteMany();
});

test('joins a channel', async () => {
  const response = await joinChannel(channel);
  expect(response.status).toEqual(200);
});

test('lists all conversations', async () => {
  const response = await fetchConversations(channel);
  expect(response.status).toEqual(200);
});

const threadTs = '1644528855.570929';
const messages = [
  {
    type: 'message',
    subtype: 'channel_join',
    ts: '1644604816.208689',
    user: 'U02V7PG7P6X',
    text: '<@U02V7PG7P6X> has joined the channel',
  },
  {
    type: 'message',
    subtype: 'bot_add',
    text: 'added an integration to this channel: <https://papercupsworkspace.slack.com/services/B033EEU2FFS|Slack_sync>',
    user: 'U0174S5F9E3',
    bot_id: 'B033EEU2FFS',
    bot_link:
      '<https://papercupsworkspace.slack.com/services/B033EEU2FFS|Slack_sync>',
    ts: '1644591864.470489',
  },
  {
    client_msg_id: '5584b681-20b6-4915-8586-bbbc9d361814',
    type: 'message',
    text: 'something else',
    user: 'U0174S5F9E3',
    ts: threadTs,
    team: 'T017CSH2R70',
    blocks: [
      {
        type: 'rich_text',
        block_id: 'dtV18',
        elements: [
          {
            type: 'rich_text_section',
            elements: [
              {
                type: 'text',
                text: 'something else',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    client_msg_id: '5584b681-20b6-4915-8586-bbbc9d361814',
    type: 'message',
    text: 'something else',
    user: 'U0174S5F9E3',
    ts: '1644526855.570929',
    thread_ts: threadTs,
    team: 'T017CSH2R70',
    blocks: [
      {
        type: 'rich_text',
        block_id: 'dtV18',
        elements: [
          {
            type: 'rich_text_section',
            elements: [
              {
                type: 'text',
                text: 'something else',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    client_msg_id: '623ee6d3-a6d9-4331-bb27-24375a8371e1',
    type: 'message',
    text: 'this is a message',
    user: 'U0174S5F9E3',
    ts: '1644526520.323539',
    team: 'T017CSH2R70',
    blocks: [
      {
        type: 'rich_text',
        block_id: 'rFq',
        elements: [
          {
            type: 'rich_text_section',
            elements: [
              {
                type: 'text',
                text: 'this is a message',
              },
            ],
          },
        ],
      },
    ],
  },
];

// test('save messages with same threadTs ', async () => {
//   const channel = await prisma.channels.create({
//     data: {
//       slackChannelId: 'someChannelID' + Date.now().toString(),
//       channelName: 'someChannel',
//     },
//   });
//   const savedMessages = await saveMessages(messages, channel.id);
//   expect(savedMessages?.length).toEqual(3);
//   const sentAt = new Date(parseFloat('1644526520.323539') * 1000);
//   const body = 'this is a message';
//   const slackThread = await prisma.slackThreads.findUnique({
//     where: {
//       slackThreadTs: threadTs,
//     },
//     include: { messages: true },
//   });

//   expect(slackThread?.messages.length).toEqual(2);
// });

test('saving a new message with ', async () => {});

// describe("When saving a single new message", () )

const messageWithThread = {
  client_msg_id: 'a3184f22-caf9-44cb-ba73-e2b519179877',
  type: 'message',
  text: '```testing one two three this is markdown```',
  user: 'U0174S5F9E3',
  ts: '1645125355.730889',
  team: 'T017CSH2R70',
  blocks: [
    {
      type: 'rich_text',
      block_id: 'GSh7',
      elements: [
        {
          type: 'rich_text_preformatted',
          elements: [
            {
              type: 'text',
              text: 'testing one two three this is markdown',
            },
          ],
          border: 0,
        },
      ],
    },
  ],
  thread_ts: '1645125355.730889',
  reply_count: 1,
  reply_users_count: 1,
  latest_reply: '1645126564.548839',
  reply_users: ['U0174S5F9E3'],
  is_locked: false,
  subscribed: false,
};

test('save message with thread', async () => {
  const thread_ts = messageWithThread.ts;
  const replyThreadTs = '1645126564.548839';
  const replySentAt = new Date(parseFloat(replyThreadTs) * 1000);
  const channel = await findOrCreateChannel({
    slackChannelId: 'somechannelID',
    channelName: 'test Channel',
  });

  await saveMessages([messageWithThread], channel.id, channel.slackChannelId);

  const result = await saveThreadedMessages(replies, channel.id, replyThreadTs);
  const message = await prisma.messages.findFirst({
    where: { sentAt: replySentAt },
  });
  expect(message).toBeTruthy();
});

const replies = {
  ok: true,
  messages: [
    {
      client_msg_id: 'a3184f22-caf9-44cb-ba73-e2b519179877',
      type: 'message',
      text: '```testing one two three this is markdown```',
      user: 'U0174S5F9E3',
      ts: '1645125355.730889',
      team: 'T017CSH2R70',
      blocks: [
        {
          type: 'rich_text',
          block_id: 'GSh7',
          elements: [
            {
              type: 'rich_text_preformatted',
              elements: [
                {
                  type: 'text',
                  text: 'testing one two three this is markdown',
                },
              ],
              border: 0,
            },
          ],
        },
      ],
      thread_ts: '1645125355.730889',
      reply_count: 1,
      reply_users_count: 1,
      latest_reply: '1645126564.548839',
      reply_users: ['U0174S5F9E3'],
      is_locked: false,
      subscribed: false,
    },
    {
      client_msg_id: '3889129c-ce69-481a-b603-d8653fe100da',
      type: 'message',
      text: 'A reply in markdown',
      user: 'U0174S5F9E3',
      ts: '1645126564.548839',
      team: 'T017CSH2R70',
      blocks: [
        {
          type: 'rich_text',
          block_id: 'FCwfB',
          elements: [
            {
              type: 'rich_text_section',
              elements: [
                {
                  type: 'text',
                  text: 'A reply in markdown',
                },
              ],
            },
          ],
        },
      ],
      thread_ts: '1645125355.730889',
      parent_user_id: 'U0174S5F9E3',
    },
  ],
  has_more: false,
};
