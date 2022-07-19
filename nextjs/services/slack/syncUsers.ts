import { listUsers, saveUsers } from '../../fetch_all_conversations';
import {
  AccountWithSlackAuthAndChannels,
  UserMap,
} from '../../types/partialTypes';
import { findUsersByAccountId } from '../../lib/users';

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
  const members: any[] = usersListResponse.body.members;

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
      console.log('fetching user failed', (e as Error).message);
      userCursor = null;
    }
  }

  //Only save new users
  console.log('Saving users');
  const usersSlackIds = await findUsersByAccountId(account.id);

  const ids = usersSlackIds.map((u) => u.externalUserId);

  const newMembers = members.filter((m) => {
    return !ids.includes(m.id);
  });

  await saveUsers(newMembers, accountId);

  const usersInDb = await findUsersByAccountId(account.id);
  return usersInDb as UserMap[];
}
