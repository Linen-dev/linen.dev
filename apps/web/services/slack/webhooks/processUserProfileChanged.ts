import { SlackEvent, UserProfileUpdateEvent } from '@linen/types';
import { findAccountIdByExternalId } from 'services/accounts';
import { createUser, findUser, updateUser } from 'services/users';
import { buildUserFromInfo } from '../serializers/buildUserFromInfo';

export async function processUserProfileChanged(body: SlackEvent) {
  const teamId = body.team_id;
  const event = body.event as UserProfileUpdateEvent;
  const account = await findAccountIdByExternalId(teamId);
  if (!account)
    return { status: 404, error: 'account not found', metadata: { teamId } };
  const user = await findUser(event.user.id, account.id);
  const newUser = buildUserFromInfo(event.user, account.id);
  if (!user) {
    await createUser(newUser);
  } else {
    await updateUser(newUser);
  }
  return { status: 200, message: 'user profile updated' };
}
