import prisma from '../../client';
import { SlackEvent } from '../../types/slackResponses/slackMessageEventInterface';
import { processMessageEvent } from './processMessageEvents';
import {
  processMessageReactionAddedEvent,
  processMessageReactionRemovedEvent,
} from './processMessageReactionEvents';
import {
  processChannelCreated,
  processChannelRename,
} from './processChannelEvents';
import { processUserProfileChanged } from './processUserProfileChanged';
import { processTeamJoin } from './processTeamJoin';
import { tryCatch } from 'utilities/sentry';

const processTeamJoinTryCatch = tryCatch(processTeamJoin);
const processMessageEventTryCatch = tryCatch(processMessageEvent);
const processMessageReactionAddedEventTryCatch = tryCatch(
  processMessageReactionAddedEvent
);
const processMessageReactionRemovedEventTryCatch = tryCatch(
  processMessageReactionRemovedEvent
);
const processChannelCreatedTryCatch = tryCatch(processChannelCreated);
const processChannelRenameTryCatch = tryCatch(processChannelRename);
const processUserProfileChangedTryCatch = tryCatch(processUserProfileChanged);

export const handleWebhook = async (
  body: SlackEvent
): Promise<{ status: number; error?: string; message?: any }> => {
  if (body.event.type === 'team_join') {
    return processTeamJoinTryCatch(body);
  } else if (body.event.type === 'message') {
    return processMessageEventTryCatch(body);
  } else if (body.event.type === 'reaction_added') {
    return processMessageReactionAddedEventTryCatch(body);
  } else if (body.event.type === 'reaction_removed') {
    return processMessageReactionRemovedEventTryCatch(body);
  } else if (body.event.type === 'channel_created') {
    return processChannelCreatedTryCatch(body);
  } else if (body.event.type === 'channel_rename') {
    return processChannelRenameTryCatch(body);
  } else if (body.event.type === 'user_profile_changed') {
    return processUserProfileChangedTryCatch(body);
  } else {
    console.error('Event not supported!!');
    return {
      status: 404,
      error: 'Event not supported',
    };
  }
};

export async function getChannel(channelId: string) {
  return await prisma.channels.findUnique({
    where: {
      externalChannelId: channelId,
    },
    include: {
      account: {
        include: {
          slackAuthorizations: true,
        },
      },
    },
  });
}
