import type {
  channels,
  messages,
  mentions,
  threads,
  users,
} from '@linen/database';
import type { SerializedMessage } from '@linen/types';

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
        message.author = anonymizeUser(message.author);
      }

      return anonymizeMentions(message);
    });
  }
  return thread;
}

function anonymizeMentions(message: Messages): any {
  if (message.mentions) {
    message.mentions = message.mentions.map((mention) => {
      mention.users && (mention.users = anonymizeUser(mention.users));
      return mention;
    });
  }
  return message;
}

export function anonymizeUser(users: users): users {
  return {
    ...users,
    displayName: users.anonymousAlias || 'anonymous',
    profileImageUrl: null,
  };
}

export function anonymizeMessagesMentions(messages: Messages[]) {
  return messages.map((message) => {
    return anonymizeMentions(message);
  });
}

export function anonymizeSerializedMessages(
  messages: SerializedMessage[]
): SerializedMessage[] {
  return messages.map((message) => {
    if (message.author) {
      message.author = {
        ...message.author,
        displayName: message.author.anonymousAlias || 'anonymous',
        username: message.author.anonymousAlias || 'anonymous',
        profileImageUrl: null,
      };
    }
    if (message.mentions && message.mentions.length) {
      message.mentions = message.mentions.map((mention) => {
        return {
          ...mention,
          displayName: mention.anonymousAlias || 'anonymous',
          username: mention.anonymousAlias || 'anonymous',
          profileImageUrl: null,
        };
      });
    }
    return message;
  });
}
