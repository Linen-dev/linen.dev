import { updateAccountRedirectDomain } from 'services/accounts';
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
  const slackAuth = account.slackAuthorizations?.shift();

  const token = slackAuth?.accessToken || '';
  const syncFrom = slackAuth?.syncFrom || new Date(0);
  const shouldJoinChannel = slackAuth?.joinChannel !== false;

  const teamInfoResponse = await fetchTeamInfo(token);
  const communityUrl = teamInfoResponse?.body?.team?.url;

  if (!!domain && !!communityUrl) {
    await updateAccountRedirectDomain(accountId, domain, communityUrl);
  }
  return { token, syncFrom, shouldJoinChannel };
}
