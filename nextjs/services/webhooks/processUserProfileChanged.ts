import {
  SlackEvent,
  UserProfileUpdateEvent,
} from '../../types/slackResponses/slackMessageEventInterface';
import { findAccountIdByExternalId } from '../../lib/account';
import {
  createUserFromUserInfo,
  findUser,
  updateUserFromUserInfo,
} from '../../lib/users';

export async function processUserProfileChanged(body: SlackEvent) {
  const teamId = body.team_id;
  const event = body.event as UserProfileUpdateEvent;
  const account = await findAccountIdByExternalId(teamId);
  if (!account) return { status: 404, error: 'account not found' };
  const user = await findUser(event.user.id, account.id);
  if (!user) {
    await createUserFromUserInfo(event.user, account.id);
  } else {
    await updateUserFromUserInfo(user, event.user, account.id);
  }
  return { status: 200, message: 'user profile updated' };
}
