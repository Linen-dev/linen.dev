import { fetchTeamInfo } from '../../fetch_all_conversations';
import { updateAccountRedirectDomain } from '../../lib/models';
import { AccountWithSlackAuthAndChannels } from '../../types/partialTypes';

export async function fetchToken({
  account,
  domain,
  accountId,
}: {
  account: AccountWithSlackAuthAndChannels;
  domain?: string;
  accountId: string;
}) {
  const token = account.slackAuthorizations[0].accessToken;

  const teamInfoResponse = await fetchTeamInfo(token);
  const communityUrl = teamInfoResponse.body.team.url;

  if (!!domain && !!communityUrl) {
    await updateAccountRedirectDomain(accountId, domain, communityUrl);
  }
  return token;
}
