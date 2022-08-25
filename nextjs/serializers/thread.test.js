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
            ],
          }),
        ],
      })
    );
    expect(thread.messages[0].reactions).toEqual([{ type: 'yes', count: 1 }]);
  });
});
