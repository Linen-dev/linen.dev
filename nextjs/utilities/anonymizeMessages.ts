import { channels, messages, mentions, threads, users } from '@prisma/client';
type Messages =
  | (messages & {
      author: users | null;
      threads: threads | null;
      mentions: (mentions & {
        users: users | null;
      })[];
    })
  | (messages & {
      mentions: (mentions & {
        users: users | null;
      })[];
    });

type ThreadWithMessages = threads & {
  messages: (messages & {
    author: users | null;
    mentions: (mentions & {
      users: users | null;
    })[];
  })[];
  channel?: channels;
};

export function anonymizeMessages(thread: ThreadWithMessages) {
  if (thread) {
    thread.messages = thread.messages.map((message) => {
      if (message.author) {
        message.author = {
          ...message.author,
          displayName:
            (message.author?.anonymousAlias as string) || 'anonymous',
          profileImageUrl: null,
        };
      }

      return anonymizeMentions(message);
    });
  }
  return thread;
}

function anonymizeMentions(message: Messages): any {
  if (message.mentions) {
    message.mentions = message.mentions.map((mention) => {
      mention.users &&
        (mention.users = {
          ...mention.users,
          displayName: mention.users.anonymousAlias || 'anonymous',
          profileImageUrl: null,
        });
      return mention;
    });
  }
  return message;
}

export function anonymizeMessagesMentions(messages: Messages[]) {
  return messages.map((message) => {
    return anonymizeMentions(message);
  });
}
