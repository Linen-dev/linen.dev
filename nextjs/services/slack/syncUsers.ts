import { listUsers } from '../../fetch_all_conversations';
import {
  AccountWithSlackAuthAndChannels,
  UserMap,
} from '../../types/partialTypes';
import { createOrUpdateUser, findUsersByAccountId } from '../../lib/users';
import { UserInfo } from '../../types/slackResponses/slackUserInfoInterface';
import { captureExceptionAndFlush } from 'utilities/sentry';

export async function syncUsers({
  accountId,
  token,
  account,
}: {
  accountId: string;
  token: string;
  account: AccountWithSlackAuthAndChannels;
}) {
  console.log('Syncing users for account: ', accountId);
  const usersListResponse = await listUsers(token);
  const members: UserInfo[] = usersListResponse.body.members;

  let userCursor: string | null =
    usersListResponse?.body?.response_metadata?.next_cursor;

  while (!!userCursor) {
    try {
      console.log({ userCursor });
      const usersListResponse = await listUsers(token, userCursor);
      const additionalMembers = usersListResponse?.body?.members;
      if (!!additionalMembers) {
        members.push(...additionalMembers);
      }
      userCursor = usersListResponse?.body?.response_metadata?.next_cursor;
    } catch (e) {
      await captureExceptionAndFlush(e);
      console.log('fetching user failed', (e as Error).message);
      userCursor = null;
    }
  }

  //Only save new users
  console.log('Saving users');
  await Promise.all(
    members.map(async (user) => createOrUpdateUser(user, accountId))
  );
  const usersInDb = await findUsersByAccountId(account.id);
  return usersInDb as UserMap[];
}
