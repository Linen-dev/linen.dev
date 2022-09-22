import { AccountWithSlackAuthAndChannels, UserMap } from 'types/partialTypes';
import { createOrUpdateUser, findUsersByAccountId } from 'lib/users';
import { UserInfo } from 'types/slackResponses/slackUserInfoInterface';
import { captureException, flush } from '@sentry/nextjs';

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
        captureException(e);
        await flush(2000);
        console.log('fetching user failed', (e as Error).message);
        userCursor = null;
      }
    }
  }

  const usersInDb = await findUsersByAccountId(account.id);
  return usersInDb as UserMap[];
}
