import type {
  channels,
  messages,
  mentions,
  threads,
  users,
} from '@linen/database';
import { SerializedMessage, Roles, AnonymizeType } from '@linen/types';

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

export function anonymizeMessages(
  thread: ThreadWithMessages,
  anonymize: AnonymizeType
) {
  if (thread) {
    thread.messages = thread.messages.map((message) => {
      if (message.author) {
        message.author = anonymizeUser(message.author, anonymize);
      }

      return anonymizeMentions(message, anonymize);
    });
  }
  return thread;
}

function anonymizeMentions(message: Messages, anonymize: AnonymizeType): any {
  if (message.mentions) {
    message.mentions = message.mentions.map((mention) => {
      if (mention.users) {
        return {
          ...mention,
          users: anonymizeUser(mention.users, anonymize),
        };
      }
      return mention;
    });
  }
  return message;
}

function anonymizeUser(user: users, anonymize: AnonymizeType): users {
  const isAdminOrOwner = user.role === Roles.ADMIN || user.role === Roles.OWNER;
  console.log(user, anonymize);
  if (isAdminOrOwner && anonymize === AnonymizeType.MEMBERS) {
    return user;
  }
  return {
    ...user,
    displayName: user.anonymousAlias || 'anonymous',
    profileImageUrl: null,
  };
}

export function anonymizeMessagesMentions(
  messages: Messages[],
  anonymize: AnonymizeType
) {
  return messages.map((message) => {
    return anonymizeMentions(message, anonymize);
  });
}

export function anonymizeSerializedMessages(
  messages: SerializedMessage[],
  anonymize: AnonymizeType
): SerializedMessage[] {
  return messages.map((message) => {
    if (message.author) {
      const isAdminOrOwner =
        message.author.role === Roles.ADMIN ||
        message.author.role === Roles.OWNER;
      if (isAdminOrOwner && anonymize === AnonymizeType.MEMBERS) {
        // noop
      } else {
        message.author = {
          ...message.author,
          displayName: message.author.anonymousAlias || 'anonymous',
          username: message.author.anonymousAlias || 'anonymous',
          profileImageUrl: null,
        };
      }
    }
    if (message.mentions && message.mentions.length) {
      message.mentions = message.mentions.map((mention: any) => {
        const isAdminOrOwner =
          mention.role === Roles.ADMIN || mention.role === Roles.OWNER;
        if (isAdminOrOwner && anonymize === AnonymizeType.MEMBERS) {
          return mention;
        }
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
