import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../client';
import { listUsers, saveUsers } from '../../fetch_all_conversations';
import { findAccountById, findOrCreateUser } from '../../lib/slack';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const accountId = req.query.account_id as string;
  const account = await findAccountById(accountId);
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
      console.log('fetching user failed', e.message);
      userCursor = null;
    }
  }

  const usersSlackIds = await prisma.users.findMany({
    where: { accountsId: account.id },
    select: {
      slackUserId: true,
    },
  });
  const ids = usersSlackIds.map((u) => u.slackUserId);

  const newMembers = members.filter((m) => {
    return !ids.includes(m.id);
  });

  const users = await saveUsers(newMembers, accountId);
  res.status(200).json({ users });
}

export const saveUsersSyncronous = async (users: any[], accountId: string) => {
  const params = users.map((user) => {
    const profile = user.profile;
    const name =
      profile.display_name ||
      profile.display_name_normalized ||
      profile.real_name ||
      profile.real_name_normalized;
    const profileImageUrl = profile.image_original;
    return {
      displayName: name,
      slackUserId: user.id,
      profileImageUrl,
      accountsId: accountId,
      isBot: user.is_bot,
      isAdmin: user.is_admin || false,
    };
  });

  const createdUsers = [];
  for (let i = 0; i < params.length; i++) {
    const param = params[i];
    try {
      const user = await findOrCreateUser(param);
      createdUsers.push(user);
    } catch (e) {
      console.error('failed to create user:', e.message);
    }
  }

  return createdUsers;
};
