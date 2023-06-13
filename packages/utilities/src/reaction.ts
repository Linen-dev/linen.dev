import type { SerializedThread, SerializedUser } from '@linen/types';

export function addReactionToThread(
  thread: SerializedThread,
  {
    threadId,
    messageId,
    currentUser,
    type,
    active,
  }: {
    threadId: string;
    messageId: string;
    currentUser: SerializedUser;
    type: string;
    active: boolean;
  }
) {
  if (!thread) {
    return thread;
  }
  if (thread.id === threadId) {
    return {
      ...thread,
      messages: thread.messages.map((message) => {
        if (message.id === messageId) {
          const reaction = message.reactions.find(
            (reaction) => reaction.type === type
          );

          if (!reaction) {
            return {
              ...message,
              reactions: [
                ...message.reactions
                  .map((reaction) => {
                    if (
                      (type === ':thumbsup:' &&
                        reaction.type === ':thumbsdown:') ||
                      (type === ':thumbsdown:' &&
                        reaction.type === ':thumbsup:')
                    ) {
                      const userIds = reaction.users.map(({ id }) => id);
                      if (userIds.includes(currentUser.id)) {
                        if (reaction.count === 1) {
                          return null;
                        }
                        return {
                          ...reaction,
                          count: reaction.count - 1,
                          users: reaction.users.filter(
                            ({ id }) => id !== currentUser.id
                          ),
                        };
                      }
                    }
                    return reaction;
                  })
                  .filter(Boolean),
                { type, count: 1, users: [currentUser] },
              ],
            };
          }

          if (active) {
            return {
              ...message,
              reactions: message.reactions
                .filter((reaction) => {
                  if (reaction.type === type && reaction.count - 1 === 0) {
                    return false;
                  }
                  return true;
                })
                .map((reaction) => {
                  if (reaction.type === type) {
                    const count = reaction.count - 1;
                    return {
                      type,
                      count,
                      users: reaction.users.filter(
                        ({ id }) => id !== currentUser.id
                      ),
                    };
                  }
                  return reaction;
                }),
            };
          }

          return {
            ...message,
            reactions: message.reactions
              .map((reaction) => {
                if (
                  (type === ':thumbsup:' && reaction.type === ':thumbsdown:') ||
                  (type === ':thumbsdown:' && reaction.type === ':thumbsup:')
                ) {
                  const userIds = reaction.users.map(({ id }) => id);
                  if (userIds.includes(currentUser.id)) {
                    if (reaction.count === 1) {
                      return null;
                    }
                    return {
                      ...reaction,
                      count: reaction.count - 1,
                      users: reaction.users.filter(
                        ({ id }) => id !== currentUser.id
                      ),
                    };
                  }
                }
                if (reaction.type === type) {
                  return {
                    type,
                    count: reaction.count + 1,
                    users: [...reaction.users, currentUser],
                  };
                }
                return reaction;
              })
              .filter(Boolean),
          };
        }
        return message;
      }),
    };
  }

  return thread;
}

export function addReaction(
  threads: SerializedThread[],
  {
    active,
    threadId,
    messageId,
    type,
    currentUser,
  }: {
    active: boolean;
    threadId: string;
    messageId: string;
    type: string;
    currentUser: SerializedUser;
  }
) {
  if (!currentUser) {
    return threads;
  }
  return threads.map((thread) =>
    addReactionToThread(thread, {
      threadId,
      messageId,
      type,
      active,
      currentUser,
    })
  );
}
