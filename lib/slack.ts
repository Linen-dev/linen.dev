import prisma from "../client";

export const createSlackMessage = async (event: any, channelId: string) => {
  const body = event.event.text;
  const timestamp = event.event.ts;
  const sentAt = new Date(parseFloat(timestamp) * 1000);

  return await prisma.message.create({
    data: {
      body: body,
      sentAt: sentAt,
      channelId: channelId,
    },
  });
};

export type MessageParam = {
  body: string;
  sentAt: Date;
  channelId: string;
  slackThreadTs?: string;
};

export const createMessage = async (message: MessageParam) => {
  let slackThreadTs = message.slackThreadTs;
  let slackThreadId: string | null = null;
  if (!!slackThreadTs) {
    // find or create Slack thread
    let thread = await findOrCreateThread({
      slackThreadTs: slackThreadTs,
      channelId: message.channelId,
    });
    slackThreadId = thread.id;
  }
  return await prisma.message.create({
    data: {
      body: message.body,
      slackThreadId: slackThreadId,
      channelId: message.channelId,
      sentAt: message.sentAt,
    },
  });
};

export const findOrCreateChannel = async (
  slackChannelId: string,
  channelName: string
) => {
  return prisma.channel.create({
    data: {
      slackChannelId: slackChannelId,
      channelName: channelName,
    },
  });
};

export type Thread = {
  slackThreadTs: string;
  channelId: string;
};

export const findOrCreateThread = async (thread: Thread) => {
  return await prisma.slackThread.upsert({
    where: {
      slackThreadTs: thread.slackThreadTs,
    },
    update: {},
    create: thread,
  });
};
