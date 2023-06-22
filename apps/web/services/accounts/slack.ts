import * as api from 'services/slack/api';
import * as integrationEvents from 'services/events/eventNewIntegration';
import { AccountIntegration, SerializedAccount } from '@linen/types';
import { getHomeUrl } from '@linen/utilities/home';
import { serializeAccount } from '@linen/serializers/account';
import { prisma } from '@linen/database';

export async function newSlackIntegration({
  query,
  getSlackAccessToken = api.getSlackAccessToken,
  fetchTeamInfo = api.fetchTeamInfo,
  eventNewIntegration = integrationEvents.eventNewIntegration,
}: {
  query: any;
  getSlackAccessToken?: (
    code: string,
    clientId: string,
    clientSecret: string
  ) => Promise<any>;
  fetchTeamInfo?(token: string): Promise<any>;
  eventNewIntegration?(event: integrationEvents.NewMessageEvent): Promise<void>;
}) {
  const accountId = query.state;

  const account = await prisma.accounts.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    return 'https://www.linen.dev/500?error=account-not-found';
  }

  const url = getHomeUrl(serializeAccount(account) as SerializedAccount);

  try {
    if (query.error) {
      throw query.error;
    }

    const code = query.code;
    const accountId = query.state as string;
    const clientId = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID;
    const clientSecret = process.env.SLACK_CLIENT_SECRET;

    const resp = await getSlackAccessToken(
      code as string,
      clientId as string,
      clientSecret as string
    );

    const body: SlackAuthorizationResponse = resp.body;
    if (!body.ok) {
      throw body;
    }

    const teamInfoResponse = await fetchTeamInfo(body.access_token);
    const communityUrl = teamInfoResponse?.body?.team?.url;

    const account = await prisma.accounts.update({
      where: {
        id: accountId,
      },
      data: {
        slackTeamId: body.team.id,
        communityUrl,
        integration: AccountIntegration.SLACK,
      },
    });

    const user = body.authed_user;

    const data = {
      accessToken: body.access_token,
      botUserId: body.bot_user_id,
      scope: body.scope,
      accountsId: account.id,
      userAccessToken: user.access_token,
      userScope: user.scope,
      authedUserId: user.id,
    };

    const exist = await prisma.slackAuthorizations.findFirst({
      where: { accountsId: data.accountsId },
      orderBy: { createdAt: 'desc' },
    });
    if (exist) {
      await prisma.slackAuthorizations.deleteMany({
        where: {
          accountsId: data.accountsId,
          id: { not: exist.id },
        },
      });
      await prisma.slackAuthorizations.update({
        where: { id: exist.id },
        data,
      });
    } else {
      await prisma.slackAuthorizations.create({ data });
    }

    await eventNewIntegration({ accountId });

    return `${url}/configurations`;
  } catch (error) {
    console.error(error);
    return `${url}/configurations?error=1`;
  }
}

interface SlackAuthorizationResponse {
  ok: boolean;
  app_id: string;
  authed_user: {
    id: string;
    scope: string;
    access_token: string;
    token_type: string;
  };
  scope: string;
  token_type: string;
  access_token: string;
  bot_user_id: string;
  team: {
    id: string;
    name: string;
  };
  enterprise?: null;
  is_enterprise_install: boolean;
  incoming_webhook: {
    channel: string;
    channel_id: string;
    configuration_url: string;
    url: string;
  };
}
