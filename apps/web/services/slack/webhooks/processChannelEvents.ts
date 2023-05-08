import {
  SlackEvent,
  SlackChannelCreatedEvent,
  SlackChannelRenameEvent,
} from '@linen/types';
import {
  createChannel,
  findChannelByExternalId,
  renameChannel,
} from 'services/channels';
import { findAccountIdByExternalId, findSlackToken } from 'services/accounts';
import { joinChannel } from 'services/slack';

export async function processChannelCreated(body: SlackEvent) {
  const teamId = body.team_id;
  const event = body.event as SlackChannelCreatedEvent;
  const account = await findAccountIdByExternalId(teamId);
  if (!account)
    return { status: 404, error: 'account not found', metadata: { teamId } };
  const oauth = await findSlackToken(account.id);
  if (oauth?.accessToken && oauth?.joinChannel) {
    await createChannel({
      accountId: account.id,
      name: event.channel.name,
      externalChannelId: event.channel.id,
      hidden: account.newChannelsConfig === 'HIDDEN',
    });
    await joinChannel(event.channel.id, oauth.accessToken);
  }
  return { status: 200, message: 'channel created' };
}

export async function processChannelRename(body: SlackEvent) {
  const teamId = body.team_id;
  const event = body.event as SlackChannelRenameEvent;
  const account = await findAccountIdByExternalId(teamId);
  if (!account)
    return { status: 404, error: 'account not found', metadata: { teamId } };
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
