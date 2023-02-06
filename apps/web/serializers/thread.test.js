import serialize from './thread';
import { build } from '@linen/factory';

describe('#serialize', () => {
  it('serializes reactions with count greater than 0', () => {
    const thread = serialize(
      build('thread', {
        messages: [
          build('message', {
            reactions: [
              { name: 'yes', count: 1 },
              { name: 'no', count: 0 },
              { name: 'fake', count: null },
            ],
          }),
        ],
      })
    );
    expect(thread.messages[0].reactions).toEqual([
      { type: 'yes', count: 1, users: [] },
    ]);
  });

  it('serializers the channel', () => {
    const thread = serialize(
      build('thread', {
        channel: build('channel', { channelName: 'general' }),
      })
    );
    expect(thread.channel.channelName).toEqual('general');
  });
});
