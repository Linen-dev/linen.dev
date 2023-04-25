import { SlackEvent } from '@linen/types';
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

export const handleWebhook = async (body: SlackEvent) => {
  if (body.event.type === 'team_join') {
    return processTeamJoin(body);
  } else if (body.event.type === 'message') {
    return processMessageEvent(body);
  } else if (body.event.type === 'reaction_added') {
    return processMessageReactionAddedEvent(body);
  } else if (body.event.type === 'reaction_removed') {
    return processMessageReactionRemovedEvent(body);
  } else if (body.event.type === 'channel_created') {
    return processChannelCreated(body);
  } else if (body.event.type === 'channel_rename') {
    return processChannelRename(body);
  } else if (body.event.type === 'user_profile_changed') {
    return processUserProfileChanged(body);
  } else {
    console.error('Event not supported!!');
    return {
      status: 404,
      error: 'Event not supported',
    };
  }
};
