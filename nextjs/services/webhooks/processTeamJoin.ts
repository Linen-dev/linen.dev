import { findAccountBySlackTeamId } from '../../lib/models';
import {
  SlackEvent,
  SlackTeamJoinEvent,
} from '../../types/slackResponses/slackMessageEventInterface';
import { createUserFromUserInfo } from '../../lib/users';

export async function processTeamJoin(body: SlackEvent) {
  const event = body.event as SlackTeamJoinEvent;
  const team_id = event.user.team_id;
  // find account by slack team id
  const account = await findAccountBySlackTeamId(team_id);
  if (!account?.id) {
    return {
      status: 404,
      message: 'Account not found',
    };
  }
  await createUserFromUserInfo(event.user, account.id);
  return {
    status: 201,
    message: 'User created',
  };
}
