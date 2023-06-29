import { Bridge, Logger } from 'matrix-appservice-bridge';
import { IConfig } from './IConfig';
import { ILinenMatrixPayload } from './ILinenMatrixPayload';

const log = new Logger('linen-bridge:webhook');

export async function handleLinenEvent({
  bridge,
  config,
  body,
}: {
  bridge: Bridge;
  config: IConfig;
  body: ILinenMatrixPayload;
}) {
  try {
    const intent = bridge.getIntent(
      `@linen_${body.user}:${config.matrix.domain}`
    );

    if (body.threadId) {
      // it means is a reply
      const { event_id } = await intent.sendMessage(body.channelId, {
        body: body.body,
        msgtype: 'm.text',
        ['m.relates_to']: {
          event_id: body.threadId,
          rel_type: 'm.thread',
        },
      });
      return { status: 200, ok: true, event_id };
    } else {
      // otherwise is a new message
      const { event_id } = await intent.sendText(body.channelId, body.body);
      return { status: 200, ok: true, event_id };
    }
  } catch (error) {
    log.error(error);
    return { status: 500, ok: false };
  }
}
