import { prisma, Prisma, AccountIntegration } from '@linen/database';
import { stripProtocol } from '@linen/utilities/url';
import { generateRandomWordSlug } from '@linen/utilities/randomWordSlugs';
import {
  AccountType,
  AccountWithSlackAuthAndChannels,
  AnonymizeType,
  ChatType,
  Roles,
} from '@linen/types';
import { v4 } from 'uuid';
import { eventNewCommunity } from 'services/events/eventNewCommunity';
import unique from 'lodash.uniq';
import { replaceS3byCDN } from 'utilities/replaceS3byCDN';
import { createRemoveCommunityJob } from 'queue/jobs';
import { sendNotification } from 'services/slack';
import { config } from 'config';
import { eventCommunityUpdate } from 'services/events/eventCommunityUpdate';

export default class AccountsService {
  static async create({
    email,
    name,
    slackDomain,
    description,
    channels = [],
  }: {
    email: string;
    name?: string;
    description?: string;
    slackDomain?: string;
    channels?: string[];
  }) {
    if (!email) {
      return { status: 401 };
    }

    try {
      const channelsToInsert = unique([
        config.channel.defaultName,
        ...(channels || []),
      ]);

      const displayName = email.split('@').shift() || email;
      const newAccount = await prisma.accounts.create({
        select: { id: true, users: true, channels: true },
        data: {
          name,
          description: description?.substring(0, 500),
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
              data: channelsToInsert.map((c, i) => ({
                default: true,
                channelName: c.toLowerCase(),
                externalChannelId: v4(),
                displayOrder: i,
              })),
            },
          },
        },
      });

      const ownerUser = newAccount.users?.shift();

      if (newAccount.channels.length && ownerUser?.id)
        await prisma.memberships.createMany({
          data: newAccount.channels.map((c) => ({
            channelsId: c.id,
            usersId: ownerUser.id,
          })),
        });

      await eventNewCommunity({ email, id: newAccount.id, slackDomain });

      return { status: 200, id: newAccount.id, ownerUser };
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
    tags,
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
      anonymize?: AnonymizeType;
      communityInviteUrl?: string;
      type?: AccountType;
      chat?: ChatType;
      newChannelsConfig?: string;
    };
    accountId: string;
    tags?: string[];
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
      anonymize,
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
      anonymize,
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
      await eventCommunityUpdate({
        id: account.id,
        isTypeChanged: 'type' in data && account.type !== data.type,
      });

      if (tags && tags.length) {
        await prisma.accountTag.deleteMany({
          where: { accountId: account.id },
        });
        await prisma.accountTag.createMany({
          data: tags.map((tag) => ({ accountId: account.id, tag })),
          skipDuplicates: true,
        });
      }

      return { status: 200, record };
    } catch (exception: unknown) {
      if (this.isRedirectDomainNotUniqueError(exception)) {
        return {
          status: 400,
          message: 'Custom domain is already in use',
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
    const accounts = await prisma.$queryRaw<
      {
        redirectDomain?: string;
        slackDomain: string;
        redirectDomainPropagate?: boolean;
      }[]
    >`
    select a."redirectDomain" , a."slackDomain", a."redirectDomainPropagate" 
    from accounts a 
    join channels c on a.id = c."accountId" 
    where c."default" is true
    and (a."redirectDomain" is not null or a."slackDomain" is not null)
    and c.pages is not null
    and c."type" = 'PUBLIC'
    and c.hidden is false
    and a."type" = 'PUBLIC'
    and (a.premium is true or c.pages >= 250)
    group by a.id`;

    return accounts.map((row) =>
      row.redirectDomainPropagate
        ? `https://${row.redirectDomain}`
        : `https://www.linen.dev/s/${row.slackDomain}`
    );
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

export const updateAccount = async (
  accountId: string,
  account: Prisma.accountsUpdateInput
) => {
  const oldAccount = await prisma.accounts.findUnique({
    where: {
      id: accountId,
    },
    rejectOnNotFound: true,
  });
  const updatedAccount = await prisma.accounts.update({
    where: {
      id: accountId,
    },
    data: account,
  });
  await eventCommunityUpdate({
    id: accountId,
    isTypeChanged: oldAccount.type !== account.type,
  });
  return updatedAccount;
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
      type: AccountType.PUBLIC,
      logoUrl: { contains: '.svg' },
      NOT: [
        {
          name: null,
          brandColor: null,
        },
      ],
    },
  });
}

export async function getCommunitiesWithDescription() {
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
