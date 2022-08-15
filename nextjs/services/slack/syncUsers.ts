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
  skipUsers,
}: {
  accountId: string;
  token: string;
  account: AccountWithSlackAuthAndChannels;
  skipUsers?: boolean;
}) {
  if (!skipUsers) {
    console.log('Syncing users for account: ', accountId);
    const usersListResponse = await listUsers(token);
    const members: UserInfo[] = usersListResponse.body.members;

    await Promise.all(
      members?.map((user) => user && createOrUpdateUser(user, accountId))
    );

    let userCursor: string | null =
      usersListResponse?.body?.response_metadata?.next_cursor;

    while (!!userCursor) {
      try {
        console.log({ userCursor });
        const usersListResponse = await listUsers(token, userCursor);
        const additionalMembers: UserInfo[] = usersListResponse?.body?.members;
        if (!!additionalMembers) {
          await Promise.all(
            additionalMembers?.map(
              (user) => user && createOrUpdateUser(user, accountId)
            )
          );
        }
        userCursor = usersListResponse?.body?.response_metadata?.next_cursor;
      } catch (e) {
        await captureExceptionAndFlush(e);
        console.log('fetching user failed', (e as Error).message);
        userCursor = null;
      }
    }
  }

  const usersInDb = await findUsersByAccountId(account.id);
  return usersInDb as UserMap[];
}
