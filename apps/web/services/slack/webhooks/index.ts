import { Logger, SlackEvent } from '@linen/types';
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

export const handleWebhook = async (body: SlackEvent, logger: Logger) => {
  if (!body.event.type) {
    logger.error({ error: 'Event not supported!!', body });
    return;
  }

  switch (body.event.type) {
    case 'team_join':
      return processTeamJoin(body);
    case 'message':
      return processMessageEvent(body, logger);
    case 'reaction_added':
      return processMessageReactionAddedEvent(body, logger);
    case 'reaction_removed':
      return processMessageReactionRemovedEvent(body, logger);
    case 'channel_created':
      return processChannelCreated(body);
    case 'channel_rename':
      return processChannelRename(body);
    case 'user_profile_changed':
      return processUserProfileChanged(body);
    default:
      logger.error({ error: 'Event not supported!!', body });
      return;
  }
};
