import { listUsers as listUsersByAccountId } from 'lib/users';
import { NextApiRequest, NextApiResponse } from 'next/types';
import { listUsers, saveUsers } from '../../../fetch_all_conversations';
import { findAccountById } from '../../../lib/models';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const accountId = req.query.account_id as string;
  const account = await findAccountById(accountId);
  if (!account || !account.slackTeamId) {
    return res.status(404).json({ error: 'Account not found' });
  }
  const usersListResponse = await listUsers(
    account.slackAuthorizations[0].accessToken
  );
  const members: any[] = usersListResponse.body.members;

  //paginate and find all the users
  let userCursor: string | null =
    usersListResponse?.body?.response_metadata?.next_cursor;

  while (!!userCursor) {
    try {
      console.log({ userCursor });
      const usersListResponse = await listUsers(
        account.slackAuthorizations[0].accessToken,
        userCursor
      );
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

  const usersSlackIds = await listUsersByAccountId(account.id);
  const ids = usersSlackIds.map((u) => u.externalUserId);

  const newMembers = members.filter((m) => {
    return !ids.includes(m.id);
  });

  const users = await saveUsers(newMembers, accountId);
  res.status(200).json({ users });
}
