import { addReaction } from './reaction';
import { build } from '@linen/factory';

describe('#addReaction', () => {
  it('adds a reaction to a message', () => {
    const user = build('user');
    const message = build('message', { reactions: [] });
    const thread1 = build('thread', { id: 'a1', messages: [message] });
    const thread2 = build('thread', { id: 'b1', messages: [] });
    const threads = addReaction([thread1, thread2], {
      threadId: thread1.id,
      messageId: message.id,
      type: '+1',
      active: false,
      currentUser: user,
    });
    expect(threads[0].messages[0].reactions).toEqual([
      { type: '+1', count: 1, users: [user] },
    ]);
  });

  describe('when reactions already exists', () => {
    it('updates the count', () => {
      const user1 = build('user');
      const user2 = build('user');
      const message = build('message', {
        reactions: [{ type: '+1', count: 1, users: [user1] }],
      });
      const thread1 = build('thread', { id: 'a1', messages: [message] });
      const thread2 = build('thread', { id: 'b1', messages: [] });
      const threads = addReaction([thread1, thread2], {
        threadId: thread1.id,
        messageId: message.id,
        type: '+1',
        active: false,
        currentUser: user2,
      });
      expect(threads[0].messages[0].reactions).toEqual([
        { type: '+1', count: 2, users: [user1, user2] },
      ]);
    });

    describe('when removing the reaction', () => {
      it('removes the reaction', () => {
        const user = build('user');
        const message = build('message', {
          reactions: [{ type: '+1', count: 1, users: [user] }],
        });
        const thread1 = build('thread', { id: 'a1', messages: [message] });
        const thread2 = build('thread', { id: 'b1', messages: [] });
        const threads = addReaction([thread1, thread2], {
          threadId: thread1.id,
          messageId: message.id,
          type: '+1',
          active: true,
          currentUser: user,
        });
        expect(threads[0].messages[0].reactions).toEqual([]);
      });
    });
  });
});
