import { prisma, users, Prisma } from '@linen/database';
import { stripProtocol } from '@linen/utilities/url';
import { generateRandomWordSlug } from '@linen/utilities/randomWordSlugs';
import { getAccountById } from 'lib/models';
import { AccountType, ChatType, Roles } from '@linen/types';
import { v4 } from 'uuid';
import { createAccountEvent } from './customerIo/trackEvents';
import { createInvitation } from './invites';
import { getCurrentUrl } from '@linen/utilities/domain';
import unique from 'lodash.uniq';
import { replaceS3byCDN } from 'utilities/replaceS3byCDN';
import { createRemoveCommunityJob } from 'queue/jobs';
import { sendNotification } from 'services/slack';

export default class AccountsService {
  static async create({
    email,
    name,
    slackDomain,
    channels = [],
    members = [],
  }: {
    email: string;
    name?: string;
    slackDomain?: string;
    channels?: string[];
    members?: string[];
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
          slackDomain: slackDomain?.toLowerCase(),
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
                channelName: c.toLowerCase(),
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
            emails: members,
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
      exception instanceof Prisma.PrismaClientKnownRequestError &&
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
      faviconUrl?: string;
      redirectDomain?: string;
      brandColor?: string;
      googleAnalyticsId?: string;
      anonymizeUsers?: boolean;
      communityInviteUrl?: string;
      type?: AccountType;
      chat?: ChatType;
      newChannelsConfig?: string;
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
      redirectDomain,
      brandColor,
      googleAnalyticsId,
      anonymizeUsers,
      communityInviteUrl,
      type,
      chat,
      newChannelsConfig,
    } = params;

    let { logoUrl, logoSquareUrl, faviconUrl } = params;
    logoSquareUrl = replaceS3byCDN(logoSquareUrl);
    logoUrl = replaceS3byCDN(logoUrl);
    faviconUrl = replaceS3byCDN(faviconUrl);

    const freeAccount = {
      homeUrl,
      docsUrl,
      anonymizeUsers,
      communityInviteUrl,
      chat,
      newChannelsConfig,
    };
    const data = account.premium
      ? {
          ...freeAccount,
          brandColor,
          description,
          googleAnalyticsId,
          logoUrl,
          logoSquareUrl,
          faviconUrl,
          type,
          ...(redirectDomain && {
            redirectDomain: stripProtocol(redirectDomain).toLowerCase(),
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

  static async remove({ accountId }: { accountId: string }) {
    await createRemoveCommunityJob(accountId);
    const account = await AccountsService.getMoreInfo(accountId);
    const moreInfo = JSON.stringify(account);
    await sendNotification(
      `Account ${accountId} was scheduled to be removed: ${moreInfo}`
    );
  }

  static async getMoreInfo(accountId: string) {
    return await prisma.accounts.findUnique({
      where: { id: accountId },
      select: {
        id: true,
        name: true,
        redirectDomain: true,
        slackDomain: true,
        integration: true,
      },
    });
  }

  static async showcase(showFreeTier: boolean = false) {
    const premium = await prisma.accounts
      .findMany({
        select: { redirectDomain: true },
        where: {
          premium: true,
          redirectDomain: { not: null },
          type: 'PUBLIC',
          channels: { some: { hidden: false } },
        },
      })
      .then((rows) => rows.map((row) => 'https://' + row.redirectDomain));

    const premiumWithoutDomain = await prisma.accounts
      .findMany({
        select: { slackDomain: true, discordDomain: true },
        where: {
          premium: true,
          redirectDomain: null,
          OR: [
            { slackDomain: { not: null } },
            { discordDomain: { not: null } },
          ],
          type: 'PUBLIC',
          channels: { some: { hidden: false } },
        },
      })
      .then((rows) =>
        rows.map(
          (row) =>
            'https://www.linen.dev' +
            (!!row.slackDomain
              ? `/s/${row.slackDomain}`
              : `/d/${row.discordDomain}`)
        )
      );

    const freeTier = showFreeTier
      ? await prisma.accounts
          .findMany({
            select: { slackDomain: true, discordDomain: true },
            where: {
              premium: false,
              OR: [
                { slackDomain: { not: null } },
                { discordDomain: { not: null } },
              ],
              type: 'PUBLIC',
              channels: { some: { pages: { gt: 250 }, hidden: false } },
            },
          })
          .then((rows) =>
            rows.map(
              (row) =>
                'https://www.linen.dev' +
                (!!row.slackDomain
                  ? `/s/${row.slackDomain}`
                  : `/d/${row.discordDomain}`)
            )
          )
      : [];

    return [...premium, ...premiumWithoutDomain, ...freeTier];
  }
}
