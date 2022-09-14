import serialize from './thread';
import { create } from '../__tests__/factory';

describe('#serialize', () => {
  it('serializes reactions with count greater than 0', () => {
    const thread = serialize(
      create('thread', {
        messages: [
          create('message', {
            reactions: [
              { name: 'yes', count: 1 },
              { name: 'no', count: 0 },
              { name: 'fake', count: null },
            ],
          }),
        ],
      })
    );
    expect(thread.messages[0].reactions).toEqual([{ type: 'yes', count: 1 }]);
  });

  it('serializers the channel', () => {
    const thread = serialize(
      create('thread', {
        channel: create('channel', { channelName: 'general' }),
      })
    );
    expect(thread.channel.channelName).toEqual('general');
  });
});
