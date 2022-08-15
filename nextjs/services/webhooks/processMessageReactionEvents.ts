import prisma from '../../client';
import {
  SlackMessageReactionRemovedEvent,
  SlackMessageReactionAddedEvent,
  SlackEvent,
} from '../../types/slackResponses/slackMessageEventInterface';
import { Prisma } from '@prisma/client';
import { getChannel } from '.';

async function processMessageReactionEvent(
  event: SlackMessageReactionAddedEvent | SlackMessageReactionRemovedEvent
) {
  const channelId = event.item.channel;
  const channel = await getChannel(channelId);

  if (channel === null || channel.account === null) {
    console.error('Channel does not exist in db ');
    return { status: 403, error: 'Channel not found', metadata: { channelId } };
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

  // console.log('reaction', reaction);

  return { reaction, whereClause, message };
}

export async function processMessageReactionAddedEvent(body: SlackEvent) {
  const event = body.event as SlackMessageReactionAddedEvent;
  const { error, status, reaction, whereClause, message } =
    await processMessageReactionEvent(event);

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
export async function processMessageReactionRemovedEvent(body: SlackEvent) {
  const event = body.event as SlackMessageReactionRemovedEvent;
  const { error, status, reaction, whereClause } =
    await processMessageReactionEvent(event);

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
