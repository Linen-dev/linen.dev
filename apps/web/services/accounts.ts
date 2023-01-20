import prisma from 'client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { stripProtocol } from 'utilities/url';
import { generateRandomWordSlug } from 'utilities/randomWordSlugs';
import { getAccountById } from 'lib/models';
import { AccountType, ChatType, Roles } from '@linen/types';
import { eventNewIntegration } from './events/eventNewIntegration';
import { encrypt } from 'utilities/crypto';
import { v4 } from 'uuid';
import { createAccountEvent } from './customerIo/trackEvents';
import { createInvitation } from './invites';
import { getCurrentUrl } from 'utilities/domain';
import { users } from '@prisma/client';
import { unique } from 'utilities/util';

export default class AccountsService {
  static async create({
    email,
    name,
    slackDomain,
    channels = [],
    emails = [],
  }: {
    email: string;
    name?: string;
    slackDomain?: string;
    channels?: string[];
    emails?: string[];
  }) {
    if (!email) {
      return { status: 401 };
    }

    try {
      const channelsToInsert = unique(['default', ...(channels || [])]);

      const displayName = email.split('@').shift() || email;
      const { id, users } = await prisma.accounts.create({
        select: { id: true, users: true },
        data: {
          name,
          slackDomain,
          auths: {
            connect: {
              email,
            },
          },
          users: {
            create: {
              isAdmin: true,
              isBot: false,
              anonymousAlias: generateRandomWordSlug(),
              auth: {
                connect: {
                  email,
                },
              },
              displayName,
              externalUserId: null,
              profileImageUrl: null,
              role: Roles.OWNER,
            },
          },
          channels: {
            createMany: {
              data: channelsToInsert.map((c) => ({
                ...(c === 'default' && { default: true }),
                channelName: c,
                externalChannelId: v4(),
              })),
            },
          },
        },
      });

      try {
        const ownerUser = users?.shift();
        if (ownerUser) {
          await AccountsService.inviteNewMembers({
            emails,
            ownerUser,
            accountId: id,
          });
        }
      } catch (error) {}

      await createAccountEvent(email, id);

      return { status: 200, id };
    } catch (error: any) {
      if (
        error.code === 'P2002' &&
        error.meta.target.length &&
        error.meta.target[0] === 'slackDomain'
      ) {
        return {
          status: 400,
          message:
            'Path domain must be unique, please try again with another path domain',
        };
      }
      console.error(error, { email });
      return { status: 500 };
    }
  }

  private static async inviteNewMembers({
    emails = [],
    ownerUser,
    accountId,
  }: {
    emails: string[];
    ownerUser: users;
    accountId: string;
  }) {
    if (emails.length) {
      for (const email of unique(emails)) {
        await createInvitation({
          createdByUserId: ownerUser.id,
          email,
          accountId,
          host: getCurrentUrl(),
          role: Roles.MEMBER,
        });
      }
    }
  }

  private static isRedirectDomainNotUniqueError(exception: unknown) {
    return (
      exception instanceof PrismaClientKnownRequestError &&
      exception.code === 'P2002' &&
      exception.meta &&
      Array.isArray(exception.meta.target) &&
      exception.meta.target.includes('redirectDomain')
    );
  }

  static async update({
    params,
    accountId,
  }: {
    params: {
      description?: string;
      homeUrl?: string;
      docsUrl?: string;
      logoUrl?: string;
      logoSquareUrl?: string;
      redirectDomain?: string;
      brandColor?: string;
      googleAnalyticsId?: string;
      anonymizeUsers?: boolean;
      communityInviteUrl?: string;
      type?: AccountType;
      chat?: ChatType;
    };
    accountId: string;
  }) {
    const account = await getAccountById(accountId);
    if (!account) {
      return { status: 404 };
    }

    const {
      description,
      homeUrl,
      docsUrl,
      logoUrl,
      logoSquareUrl,
      redirectDomain,
      brandColor,
      googleAnalyticsId,
      anonymizeUsers,
      communityInviteUrl,
      type,
      chat,
    } = params;
    const freeAccount = {
      homeUrl,
      docsUrl,
      anonymizeUsers,
      communityInviteUrl,
      chat,
    };
    const data = account.premium
      ? {
          ...freeAccount,
          brandColor,
          description,
          googleAnalyticsId,
          logoUrl,
          logoSquareUrl,
          type,
          ...(redirectDomain && {
            redirectDomain: stripProtocol(redirectDomain),
          }),
        }
      : freeAccount;

    try {
      const record = await prisma.accounts.update({
        where: { id: account.id },
        data,
      });

      return { status: 200, record };
    } catch (exception: unknown) {
      if (this.isRedirectDomainNotUniqueError(exception)) {
        return {
          status: 400,
          error: 'Redirect domain is already in use',
        };
      }
    }
    return { status: 500 };
  }

  static async getAllByAuth({ authId }: { authId: string }) {
    return await prisma.users.findMany({
      select: { role: true, accountsId: true },
      where: { authsId: authId },
    });
  }

  static async setCustomBotDiscord({
    accountId,
    discordServerId,
    botToken,
  }: {
    accountId: string;
    discordServerId: string;
    botToken: string;
  }) {
    if (!accountId) {
      throw new Error('missing accountId');
    }
    if (!discordServerId) {
      throw new Error('missing discordServerId');
    }
    if (!botToken) {
      throw new Error('missing botToken');
    }

    await prisma.accounts.update({
      where: { id: accountId },
      data: {
        discordServerId,
      },
    });

    await prisma.discordAuthorizations.create({
      data: {
        accessToken: encrypt(botToken),
        scope: 'bot',
        accountsId: accountId,
        customBot: true,
      },
    });

    // dispatch sync job
    await eventNewIntegration({ accountId });

    return { ok: true };
  }
}
