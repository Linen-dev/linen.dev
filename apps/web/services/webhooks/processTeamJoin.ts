import { findAccountBySlackTeamId } from 'services/accounts';
import { SlackEvent, SlackTeamJoinEvent } from '@linen/types';
import { createUser } from 'services/users';
import { buildUserFromInfo } from '../slack/serializers/buildUserFromInfo';

export async function processTeamJoin(body: SlackEvent) {
  const event = body.event as SlackTeamJoinEvent;
  const team_id = event.user.team_id;
  // find account by slack team id
  const account = await findAccountBySlackTeamId(team_id);
  if (!account?.id) {
    return {
      status: 404,
      error: 'Account not found',
      metadata: { team_id },
    };
  }
  const param = buildUserFromInfo(event.user, account.id);
  await createUser(param);
  return {
    status: 201,
    message: 'User created',
  };
}
