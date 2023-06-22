import request from 'superagent';
import { getCurrentConfig } from 'config/discord';

export async function getDiscordAccessToken(code: string) {
  const redirectUri = getCurrentConfig().PUBLIC_REDIRECT_URI;
  const clientId = getCurrentConfig().PUBLIC_CLIENT_ID;
  const clientSecret = getCurrentConfig().PRIVATE_CLIENT_SECRET;
  const url = 'https://discord.com/api/oauth2/token';
  return await request
    .post(url)
    .type('form')
    .send({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: encodeURI(redirectUri),
    });
}
