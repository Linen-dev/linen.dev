import { createUser, findUsersByAccountId } from 'services/users';
import { AccountWithSlackAuthAndChannels, Logger, UserMap } from '@linen/types';
import { buildUserFromInfo } from '../serializers/buildUserFromInfo';
import { ListUsersFnType } from '../types';

export async function syncUsers({
  accountId,
  token,
  account,
  fullSync,
  listUsers,
  logger,
}: {
  accountId: string;
  token: string;
  account: AccountWithSlackAuthAndChannels;
  fullSync?: boolean;
  listUsers: ListUsersFnType;
  logger: Logger;
}) {
  if (fullSync) {
    logger.log({ 'Syncing users for account': accountId });
    const usersListResponse = await listUsers(token);
    if (!usersListResponse.body?.members) {
      return [];
    }
    const members = usersListResponse.body.members;
    logger.log({ 'members total': members.length });

    let count = members.length;
    for (const user of members) {
      await createUser(buildUserFromInfo(user, accountId));
      count--;
      if (count % 50 === 0) {
        logger.log({ 'members left': count });
      }
    }

    let userCursor = usersListResponse?.body?.response_metadata?.next_cursor;

    while (!!userCursor) {
      try {
        logger.log({ userCursor });
        const usersListResponse = await listUsers(token, userCursor);
        const additionalMembers = usersListResponse?.body?.members;
        if (!!additionalMembers) {
          for (const user of additionalMembers) {
            await createUser(buildUserFromInfo(user, accountId));
          }
        }
        userCursor = usersListResponse?.body?.response_metadata?.next_cursor;
      } catch (e) {
        logger.error({ 'fetching user failed': (e as Error).message || e });
        userCursor = undefined;
      }
    }
  }

  const usersInDb = await findUsersByAccountId(account.id);
  return usersInDb as UserMap[];
}
