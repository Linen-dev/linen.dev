import prisma from 'client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { stripProtocol } from 'utilities/url';
import { generateRandomWordSlug } from 'utilities/randomWordSlugs';
import { getAccountById } from 'lib/models';
import { AccountType, Roles } from '@linen/types';
import { eventNewIntegration } from './events/eventNewIntegration';
import { encrypt } from 'utilities/crypto';

export default class AccountsService {
  static async create({ email }: { email: string }) {
    if (!email) {
      return { status: 401 };
    }

    try {
      const displayName = email.split('@').shift() || email;
      const { id } = await prisma.accounts.create({
        data: {
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
        },
      });
      return { status: 200, id };
    } catch (exception) {
      console.error(exception, { email });
      return { status: 500 };
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
      homeUrl?: string;
      docsUrl?: string;
      logoUrl?: string;
      redirectDomain?: string;
      brandColor?: string;
      googleAnalyticsId?: string;
      anonymizeUsers?: boolean;
      communityInviteUrl?: string;
      type?: AccountType;
    };
    accountId: string;
  }) {
    const account = await getAccountById(accountId);
    if (!account) {
      return { status: 404 };
    }

    const {
      homeUrl,
      docsUrl,
      logoUrl,
      redirectDomain,
      brandColor,
      googleAnalyticsId,
      anonymizeUsers,
      communityInviteUrl,
      type,
    } = params;
    const freeAccount = {
      homeUrl,
      docsUrl,
      anonymizeUsers,
      communityInviteUrl,
    };
    const data = account.premium
      ? {
          ...freeAccount,
          brandColor,
          googleAnalyticsId,
          logoUrl,
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
