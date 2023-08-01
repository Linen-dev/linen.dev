import {
  SlackMessageReactionRemovedEvent,
  SlackMessageReactionAddedEvent,
  SlackEvent,
  Logger,
} from '@linen/types';
import { Prisma, prisma } from '@linen/database';
import { findChannelWithAccountByExternalId } from 'services/channels';

async function processMessageReactionEvent(
  event: SlackMessageReactionAddedEvent | SlackMessageReactionRemovedEvent,
  teamId: string,
  logger: Logger
) {
  const channelId = event.item.channel;
  const channel = await findChannelWithAccountByExternalId(channelId, teamId);

  if (channel === null) {
    logger.error({ 'Channel not found': channelId });
    return { status: 403, error: 'Channel not found', metadata: { channelId } };
  }
  if (channel.account === null) {
    logger.error({ 'Account not found': teamId });
    return { status: 403, error: 'Account not found', metadata: { teamId } };
  }

  const message = await prisma.messages.findUnique({
    where: {
      channelId_externalMessageId: {
        channelId: channel.id,
        externalMessageId: event.item.ts,
      },
    },
  });

  if (!message) {
    return {
      status: 404,
      error: 'Message not found',
      metadata: { channelId: channel.id, externalMessageId: event.item.ts },
    };
  }

  const whereClause =
    Prisma.validator<Prisma.messageReactionsWhereUniqueInput>()({
      messagesId_name: {
        messagesId: message.id,
        name: event.reaction,
      },
    });

  const reaction = await prisma.messageReactions.findUnique({
    where: whereClause,
  });

  // logger.log('reaction', reaction);

  return { reaction, whereClause, message };
}

export async function processMessageReactionAddedEvent(
  body: SlackEvent,
  logger: Logger
) {
  const event = body.event as SlackMessageReactionAddedEvent;
  const teamId = body.team_id;

  const { error, status, reaction, whereClause, message } =
    await processMessageReactionEvent(event, teamId, logger);

  if (error) {
    return { error, status };
  }

  const users = [event.user as Prisma.JsonValue];
  if (reaction) {
    // update
    if (reaction.users && Array.isArray(reaction.users)) {
      users.push(...(reaction.users as Prisma.JsonArray));
    }
    await prisma.messageReactions.update({
      data: {
        users,
        count: { increment: 1 },
      },
      where: whereClause,
    });
  } else {
    // create
    await prisma.messageReactions.create({
      data: {
        users,
        count: 1,
        messagesId: message?.id,
        name: event.reaction,
      },
    });
  }

  return { status: 200, message: 'Reaction added' };
}
export async function processMessageReactionRemovedEvent(
  body: SlackEvent,
  logger: Logger
) {
  const event = body.event as SlackMessageReactionRemovedEvent;
  const teamId = body.team_id;

  const { error, status, reaction, whereClause } =
    await processMessageReactionEvent(event, teamId, logger);

  if (error) {
    return { error, status };
  }

  if (reaction) {
    // update
    if (reaction.users && Array.isArray(reaction.users)) {
      const users = [...(reaction.users as Prisma.JsonArray)].filter((user) => {
        return user !== event.user;
      });
      await prisma.messageReactions.update({
        data: {
          users,
          count: { decrement: 1 },
        },
        where: whereClause,
      });
    }
  }

  return { status: 200, message: 'Reaction removed' };
}
