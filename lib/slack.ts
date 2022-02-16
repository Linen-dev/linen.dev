import { Prisma } from '@prisma/client';
import prisma from '../client';

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
  slackThreadTs: string;
};

export const createMessage = async (message: MessageParam) => {
  let slackThreadTs = message.slackThreadTs;

  let thread = await findOrCreateThread({
    slackThreadTs: slackThreadTs,
    channelId: message.channelId,
  });

  return await prisma.message.create({
    data: {
      body: message.body,
      slackThreadId: thread.id,
      channelId: message.channelId,
      sentAt: message.sentAt,
    },
  });
};

export const findAccount = async (account: Prisma.AccountFindUniqueArgs) => {
  return await prisma.account.findUnique(account);
};

export const channelIndex = async (accountId: string) => {
  return await prisma.channel.findMany({
    where: {
      accountId,
    },
  });
};

export const findOrCreateChannel = async (
  channel: Prisma.ChannelUncheckedCreateInput
) => {
  return await prisma.channel.upsert({
    where: {
      slackChannelId: channel.slackChannelId,
    },
    update: {},
    create: {
      accountId: channel.accountId,
      channelName: channel.channelName,
      slackChannelId: channel.slackChannelId,
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

export const findOrCreateAccount = async (
  account: Prisma.AccountCreateInput
) => {
  return await prisma.account.upsert({
    where: {
      slackTeamId: account.slackTeamId,
    },
    update: {},
    create: account,
  });
};
