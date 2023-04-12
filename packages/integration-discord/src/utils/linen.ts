import LinenSdk from '@linen/sdk';
import env from './config';
import { appendProtocol } from '@linen/utilities/url';
import { getIntegrationUrl } from '@linen/utilities/domain';
import { prisma } from '@linen/database';

export type LinenUser = {
  displayName: string;
  externalUserId: string;
  profileImageUrl: string | undefined;
};

export type LinenChannel = {
  externalChannelId: string;
  channelName: string;
};

export type LinenThread = {
  externalThreadId: string;
  title: string | null;
};

export type LinenMessage = {
  body: string;
  externalMessageId: string;
};

export const linenSdk = new LinenSdk(
  env.INTERNAL_API_KEY,
  appendProtocol(getIntegrationUrl())
);

export async function findAccount(externalId: string) {
  return await prisma.accounts.findFirst({
    where: { discordServerId: externalId },
  });
}

export async function checkIntegrations(externalId: string[], botId: number) {
  return await prisma.accounts
    .findMany({
      select: { discordAuthorizations: true, discordServerId: true },
      where: { discordServerId: { in: externalId } },
    })
    .then((accounts) => {
      return accounts.filter((account) => {
        const sortByAsc = account.discordAuthorizations.sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
        );
        const lastAuth = sortByAsc.pop();
        if (lastAuth) {
          if (lastAuth.scope === `linen-bot-${botId}`) {
            return true;
          } else if (botId === 1 && !lastAuth.customBot) {
            return true;
          }
        }
      });
    });
}

export async function findChannelById(id: string) {
  return await prisma.channels.findUnique({ where: { id } });
}

export async function findAccountById(id: string) {
  return await prisma.accounts.findUnique({ where: { id } });
}

export async function findIntegrationByAccountId(accountId: string) {
  return await prisma.discordAuthorizations.findFirst({
    where: { accountsId: accountId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findThreadWithMessage(threadId: string) {
  return await prisma.threads.findUnique({
    where: { id: threadId },
    include: {
      messages: {
        include: { author: true, attachments: true },
      },
    },
  });
}

export async function setThreadExternalId(id: string, externalId: string) {
  await prisma.threads.update({
    where: { id },
    data: { externalThreadId: externalId },
  });
}

export async function setMessageExternalId(id: string, externalId: string) {
  await prisma.messages.update({
    where: { id },
    data: { externalMessageId: externalId },
  });
}
