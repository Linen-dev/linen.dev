import {
  AppServiceRegistration,
  Bridge,
  Logger,
  WeakEvent,
} from 'matrix-appservice-bridge';
import LinenSdk from '@linen/sdk';
import { createThread } from './createThread';
import { createMessage } from './createMessage';

const log = new Logger('linen-bridge:matrix');

export async function handleMatrixEvent({
  event,
  bridge,
  linenSdk,
  registration,
  accountId,
}: {
  event: WeakEvent;
  bridge: Bridge;
  linenSdk: LinenSdk;
  registration: AppServiceRegistration;
  accountId: string;
}) {
  log.info(event, event.content);

  const intent = bridge.getIntentFromLocalpart(
    registration.getSenderLocalpart() || 'linen'
  );

  try {
    await intent.join(event.room_id);
  } catch (error) {
    log.error(error);
  }

  // log.info(context);
  if (event.type !== 'm.room.message') {
    log.warn('not supported yet');
    return;
  }
  if (event.content.msgtype !== 'm.text') {
    log.warn('not supported yet');
    return;
  }

  try {
    await intent.botSdkIntent.ensureRegisteredAndJoined(event.room_id);

    const channelName =
      await intent.botSdkIntent.underlyingClient.getPublishedAlias(
        event.room_id
      );

    if (
      event.content?.['m.relates_to'] &&
      (event.content['m.relates_to'] as any).event_id
    ) {
      // is a reply (message for linen)
      await createMessage({
        accountId,
        channelName: (channelName || event.room_id).replace(/#/, '!'),
        externalChannelId: event.room_id,
        userDisplayName: event.sender,
        externalUserId: event.sender,
        body: event.content.body as string,
        externalThreadId: (event.content['m.relates_to'] as any).event_id,
        externalMessageId: event.event_id,
        linenSdk,
      });
    } else {
      // its a thread
      await createThread({
        accountId,
        channelName: (channelName || event.room_id).replace(/#/, '!'),
        externalChannelId: event.room_id,
        userDisplayName: event.sender,
        externalUserId: event.sender,
        body: event.content.body as string,
        externalThreadId: event.event_id,
        linenSdk,
      });
    }
  } catch (error) {
    log.error(error);
  }
}
