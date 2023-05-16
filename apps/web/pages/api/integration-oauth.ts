import { NextApiRequest, NextApiResponse } from 'next/types';
import { getCurrentConfig } from 'config/discord';
import { z } from 'zod';
import { cors, preflight } from 'utilities/cors';
import { prisma } from '@linen/database';
import PermissionsService from 'services/permissions';

const REDIRECT_URI_SLACK =
  process.env.NEXT_PUBLIC_REDIRECT_URI || 'https://linen.dev/api/oauth';
const SLACK_CLIENT_ID =
  process.env.NEXT_PUBLIC_SLACK_CLIENT_ID || '1250901093238.3006399856353';

function integrationAuthorizer(
  community: 'discord' | 'slack',
  accountId: string
) {
  switch (community) {
    case 'discord':
      const discord = getCurrentConfig();
      return (
        `https://discord.com/api/oauth2/authorize` +
        `?client_id=${discord.PUBLIC_CLIENT_ID}` +
        `&permissions=${discord.permissions}` +
        `&redirect_uri=${discord.PUBLIC_REDIRECT_URI}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(discord.scope.join(' '))}` +
        `&state=${accountId}`
      );
    case 'slack':
      const scope = [
        'channels:history',
        'channels:join',
        'channels:read',
        'incoming-webhook',
        'reactions:read',
        'users:read',
        'team:read',
        'files:read',
        'chat:write',
        'chat:write.customize',
      ];
      const user_scope = [
        'channels:history',
        'search:read',
        'users:read',
        'reactions:read',
      ];
      return (
        'https://slack.com/oauth/v2/authorize' +
        `?client_id=${SLACK_CLIENT_ID}` +
        `&scope=${scope.join()}` +
        `&user_scope=${user_scope.join()}` +
        `&state=${accountId}` +
        `&redirect_uri=${REDIRECT_URI_SLACK}`
      );
    default:
      throw new Error('not implemented');
  }
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'OPTIONS') {
    return preflight(request, response, ['GET']);
  }
  cors(request, response);

  const schema = z.object({
    community: z.enum(['discord', 'slack']),
    accountId: z.string().uuid(),
    syncOpt: z.enum(['since-all', 'since-date']).optional(),
    dateFrom: z.string().optional(),
  });

  const body = schema.parse(request.query);

  const permissions = await PermissionsService.get({
    request,
    response,
    params: {
      communityId: body.accountId,
    },
  });
  if (!permissions.manage) {
    throw new Error('Unauthorized');
  }

  if (body.syncOpt === 'since-date' && body.dateFrom) {
    const syncFrom = new Date(body.dateFrom);

    if (body.community === 'slack') {
      await handleSlack({ accountId: body.accountId, syncFrom });
    }
    if (body.community === 'discord') {
      await handleDiscord({ accountId: body.accountId, syncFrom });
    }
  }

  return response.json({
    url: integrationAuthorizer(body.community, body.accountId),
  });
}

async function handleSlack({
  accountId,
  syncFrom,
}: {
  accountId: string;
  syncFrom: Date;
}) {
  const auths = await prisma.slackAuthorizations.findFirst({
    where: { accountsId: accountId },
    orderBy: { createdAt: 'desc' },
  });
  if (auths) {
    await prisma.slackAuthorizations.update({
      data: {
        syncFrom,
      },
      where: { id: auths.id },
    });
  } else {
    await prisma.slackAuthorizations.create({
      data: {
        accessToken: 'pending',
        scope: 'pending',
        botUserId: 'pending',
        accountsId: accountId,
        syncFrom,
      },
    });
  }
}

async function handleDiscord({
  accountId,
  syncFrom,
}: {
  accountId: string;
  syncFrom: Date;
}) {
  const auths = await prisma.discordAuthorizations.findFirst({
    where: { accountsId: accountId },
    orderBy: { createdAt: 'desc' },
  });
  if (auths) {
    await prisma.discordAuthorizations.update({
      data: {
        syncFrom,
      },
      where: { id: auths.id },
    });
  } else {
    await prisma.discordAuthorizations.create({
      data: {
        accountsId: accountId,
        accessToken: 'pending',
        scope: 'pending',
        syncFrom,
      },
    });
  }
}
