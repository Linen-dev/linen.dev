import request from 'superagent';

export async function getSlackAccessToken(
  code: string,
  clientId: string,
  clientSecret: string
) {
  const url = 'https://slack.com/api/oauth.v2.access';

  const response = await request.get(
    url +
      '?code=' +
      code +
      '&client_id=' +
      clientId +
      '&client_secret=' +
      clientSecret
  );

  return response;
}
