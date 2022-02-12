import prisma from "../client";
import { prismaMock } from "./../singleton";

import {
  fetchConversations,
  joinChannel,
  saveMessages,
} from "../fetch_all_conversations";

beforeEach(async () => {
  await prisma.message.deleteMany();
  await prisma.channel.deleteMany();
});

test("joins a channel", async () => {
  const channel = "C030HFK836C";
  const response = await joinChannel(channel);
  expect(response.status).toEqual(200);
});

test("lists all conversations", async () => {
  const channel = "C030HFK836C";
  const response = await fetchConversations(channel);
  expect(response.status).toEqual(200);
});

const messages = [
  {
    type: "message",
    subtype: "channel_join",
    ts: "1644604816.208689",
    user: "U02V7PG7P6X",
    text: "<@U02V7PG7P6X> has joined the channel",
  },
  {
    type: "message",
    subtype: "bot_add",
    text: "added an integration to this channel: <https://papercupsworkspace.slack.com/services/B033EEU2FFS|Slack_sync>",
    user: "U0174S5F9E3",
    bot_id: "B033EEU2FFS",
    bot_link:
      "<https://papercupsworkspace.slack.com/services/B033EEU2FFS|Slack_sync>",
    ts: "1644591864.470489",
  },
  {
    client_msg_id: "5584b681-20b6-4915-8586-bbbc9d361814",
    type: "message",
    text: "something else",
    user: "U0174S5F9E3",
    ts: "1644526855.570929",
    team: "T017CSH2R70",
    blocks: [
      {
        type: "rich_text",
        block_id: "dtV18",
        elements: [
          {
            type: "rich_text_section",
            elements: [
              {
                type: "text",
                text: "something else",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    client_msg_id: "623ee6d3-a6d9-4331-bb27-24375a8371e1",
    type: "message",
    text: "this is a message",
    user: "U0174S5F9E3",
    ts: "1644526520.323539",
    team: "T017CSH2R70",
    blocks: [
      {
        type: "rich_text",
        block_id: "rFq",
        elements: [
          {
            type: "rich_text_section",
            elements: [
              {
                type: "text",
                text: "this is a message",
              },
            ],
          },
        ],
      },
    ],
  },
];

test("save messages that are not ", async () => {
  const channel = await prisma.channel.create({
    data: {
      slackChannelId: "someChannelID",
      channelName: "someChannel",
    },
  });
  const savedMessages = await saveMessages(messages, channel.id);
  expect(savedMessages?.count).toEqual(2);
  const sentAt = new Date(parseFloat("1644526520.323539") * 1000);
  const body = "this is a message";
});

test("save duplicate conversations", async () => {});
