import { prisma, Prisma, AccountIntegration } from '@linen/database';
import { stripProtocol } from '@linen/utilities/url';
import { generateRandomWordSlug } from '@linen/utilities/randomWordSlugs';
import {
  AccountType,
  AccountWithSlackAuthAndChannels,
  ChatType,
  Roles,
} from '@linen/types';
import { v4 } from 'uuid';
import { createAccountEvent } from 'services/customerIo/trackEvents';
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
      const ownerUser = users?.shift();

      await createAccountEvent(email, id);

      return { status: 200, id, ownerUser };
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

export async function findAccountsPremium() {
  return await prisma.accounts.findMany({
    select: {
      type: true,
      redirectDomain: true,
      name: true,
    },
    where: {
      redirectDomain: { not: null },
      type: AccountType.PUBLIC,
    },
    orderBy: { redirectDomain: 'asc' },
  });
}

export function findAccountIdByExternalId(externalId: string) {
  return prisma.accounts.findFirst({
    select: { id: true, newChannelsConfig: true },
    where: { slackTeamId: externalId },
  });
}

export async function findSlackToken(accountId: string) {
  return await prisma.slackAuthorizations.findFirst({
    where: {
      accountsId: accountId,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export const createSlackAuthorization = async (
  data: Prisma.slackAuthorizationsCreateManyInput
) => {
  const exist = await prisma.slackAuthorizations.findFirst({
    where: { accountsId: data.accountsId },
    orderBy: { createdAt: 'desc' },
  });
  if (exist) {
    return await prisma.slackAuthorizations.update({
      where: { id: exist.id },
      data,
    });
  } else {
    return await prisma.slackAuthorizations.create({ data });
  }
};

export const updateAccount = async (
  accountId: string,
  account: Prisma.accountsUpdateInput
) => {
  return await prisma.accounts.update({
    where: {
      id: accountId,
    },
    data: account,
  });
};

export const getAccountById = async (accountId: string) => {
  return await prisma.accounts.findUnique({
    where: {
      id: accountId,
    },
  });
};

export const updateAccountSyncStatus = async (
  accountId: string,
  status: string
) => {
  return await prisma.accounts.update({
    where: { id: accountId },
    data: { syncStatus: status },
  });
};

export const findAccountByPath = async (domain: string) => {
  const path = domain.toLowerCase();
  return await prisma.accounts.findFirst({
    where: {
      OR: [
        {
          redirectDomain: path,
        },
        {
          slackDomain: path,
        },
        {
          discordDomain: path,
        },
        {
          discordServerId: path,
        },
      ],
    },
  });
};

export const findAccountById = async (
  accountId: string
): Promise<AccountWithSlackAuthAndChannels | null> => {
  return await prisma.accounts.findUnique({
    where: {
      id: accountId,
    },
    include: {
      slackAuthorizations: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      channels: true,
    },
  });
};

export const updateAccountRedirectDomain = async (
  accountId: string,
  domain: string,
  communityUrl: string
) => {
  return await prisma.accounts.update({
    where: { id: accountId },
    data: { redirectDomain: stripProtocol(domain).toLowerCase(), communityUrl },
  });
};

export const findAccountBySlackTeamId = async (slackTeamId: string) => {
  return await prisma.accounts.findFirst({
    where: {
      slackTeamId,
    },
    select: {
      id: true,
    },
  });
};

export async function communitiesWithLogo() {
  return await prisma.accounts.findMany({
    where: {
      NOT: [
        {
          logoUrl: null,
        },
      ],
      syncStatus: 'DONE',
    },
    select: {
      logoUrl: true,
      name: true,
      premium: true,
      brandColor: true,
      redirectDomain: true,
      slackDomain: true,
      discordServerId: true,
      discordDomain: true,
    },
  });
}

export async function communitiesWithDescription({ take }: { take?: number }) {
  return await prisma.accounts.findMany({
    where: {
      type: AccountType.PUBLIC,
      NOT: {
        name: null,
        description: null,
      },
    },
    orderBy: {
      name: 'asc',
    },
    take,
  });
}

export async function findAccountsFromAuth(email: string) {
  return await prisma.auths.findUnique({
    where: { email },
    include: {
      users: {
        include: {
          account: true,
        },
      },
    },
  });
}

export async function getCommunitiesWithName() {
  return await prisma.accounts.findMany({
    where: {
      type: AccountType.PUBLIC,
      NOT: {
        name: null,
      },
      OR: [{ syncStatus: 'DONE' }, { integration: AccountIntegration.NONE }],
    },
    orderBy: {
      name: 'asc',
    },
  });
}
