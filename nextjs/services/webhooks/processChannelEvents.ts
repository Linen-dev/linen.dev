import {
  SlackEvent,
  SlackChannelCreatedEvent,
  SlackChannelRenameEvent,
} from '../../types/slackResponses/slackMessageEventInterface';
import {
  createChannel,
  findChannelByExternalId,
  renameChannel,
} from '../../lib/channel';
import { findAccountIdByExternalId } from '../../lib/account';

export async function processChannelCreated(body: SlackEvent) {
  const teamId = body.team_id;
  const event = body.event as SlackChannelCreatedEvent;
  const account = await findAccountIdByExternalId(teamId);
  if (!account) return { status: 404, error: 'account not found' };
  await createChannel({
    accountId: account.id,
    name: event.channel.name,
    externalChannelId: event.channel.id,
    hidden: false,
  });
  return { status: 200, message: 'channel created' };
}
export async function processChannelRename(body: SlackEvent) {
  const teamId = body.team_id;
  const event = body.event as SlackChannelRenameEvent;
  const account = await findAccountIdByExternalId(teamId);
  if (!account) return { status: 404, error: 'account not found' };
  const channel = await findChannelByExternalId({
    accountId: account.id,
    externalId: event.channel.id,
  });
  if (!channel) {
    return processChannelCreated(body);
  }
  await renameChannel({ name: event.channel.name, id: channel.id });
  return { status: 200, message: 'channel renamed' };
}
