const REDIRECT_URI_SLACK =
  process.env.NEXT_PUBLIC_REDIRECT_URI || 'https://linen.dev/api/oauth';
const SLACK_CLIENT_ID =
  process.env.NEXT_PUBLIC_SLACK_CLIENT_ID || '1250901093238.3006399856353';

const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID as string;
const REDIRECT_URI_DISCORD = encodeURI(
  process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI as string
);

export function integrationAuthorizer(community: string, accountId: string) {
  switch (community) {
    case 'discord':
      window.location.href =
        `https://discord.com/api/oauth2/authorize` +
        `?client_id=${DISCORD_CLIENT_ID}` +
        `&permissions=17179878400` +
        `&redirect_uri=${REDIRECT_URI_DISCORD}` +
        `&response_type=code` +
        `&scope=guilds.members.read%20guilds%20bot` +
        `&state=${accountId}`;
      break;
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
      window.location.href =
        'https://slack.com/oauth/v2/authorize' +
        `?client_id=${SLACK_CLIENT_ID}` +
        `&scope=${scope.join()}` +
        `&user_scope=${user_scope.join()}` +
        `&state=${accountId}` +
        `&redirect_uri=${REDIRECT_URI_SLACK}`;
      break;
    default:
      break;
  }
}
