import { updateAccountRedirectDomain } from 'lib/models';
import { AccountWithSlackAuthAndChannels } from '@linen/types';

export async function fetchToken({
  account,
  domain,
  accountId,
  fetchTeamInfo,
}: {
  account: AccountWithSlackAuthAndChannels;
  domain?: string;
  accountId: string;
  fetchTeamInfo: Function;
}) {
  const token = account.slackAuthorizations?.shift()?.accessToken || '';

  const teamInfoResponse = await fetchTeamInfo(token);
  const communityUrl = teamInfoResponse?.body?.team?.url;

  if (!!domain && !!communityUrl) {
    await updateAccountRedirectDomain(accountId, domain, communityUrl);
  }
  return token;
}
