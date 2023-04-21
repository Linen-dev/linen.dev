import { createOrUpdateUser, findUsersByAccountId } from 'lib/users';
import {
  AccountWithSlackAuthAndChannels,
  UserMap,
  UserInfo,
} from '@linen/types';

export async function syncUsers({
  accountId,
  token,
  account,
  skipUsers,
  listUsers,
}: {
  accountId: string;
  token: string;
  account: AccountWithSlackAuthAndChannels;
  skipUsers?: boolean;
  listUsers: Function;
}) {
  if (!skipUsers) {
    console.log('Syncing users for account: ', accountId);
    const usersListResponse = await listUsers(token);
    const members: UserInfo[] = usersListResponse.body.members;
    console.log('members total:', members.length);

    let count = members.length;
    for (const user of members) {
      await createOrUpdateUser(user, accountId);
      count--;
      if (count % 50 === 0) {
        console.log('members left:', count);
      }
    }

    let userCursor: string | null =
      usersListResponse?.body?.response_metadata?.next_cursor;

    while (!!userCursor) {
      try {
        console.log({ userCursor });
        const usersListResponse = await listUsers(token, userCursor);
        const additionalMembers: UserInfo[] = usersListResponse?.body?.members;
        if (!!additionalMembers) {
          for (const user of additionalMembers) {
            await createOrUpdateUser(user, accountId);
          }
        }
        userCursor = usersListResponse?.body?.response_metadata?.next_cursor;
      } catch (e) {
        console.error('fetching user failed', (e as Error).message);
        userCursor = null;
      }
    }
  }

  const usersInDb = await findUsersByAccountId(account.id);
  return usersInDb as UserMap[];
}
