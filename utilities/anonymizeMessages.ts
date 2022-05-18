import {
  channels,
  messages,
  slackMentions,
  slackThreads,
  users,
} from '@prisma/client';

type ThreadWithMessages =
  | (slackThreads & {
      messages: (messages & {
        author: users | null;
        mentions: (slackMentions & {
          users: users | null;
        })[];
      })[];
      channel?: channels;
    })
  | null;

export function anonymizeMessages(thread: ThreadWithMessages) {
  if (thread) {
    thread.messages = thread.messages.map((message) => {
      if (message.author) {
        message.author = {
          ...message.author,
          displayName: message.author?.anonymousAlias as string,
          profileImageUrl: null,
        };
      }
      if (message.mentions) {
        message.mentions = message.mentions.map((mention) => {
          mention.users &&
            (mention.users = {
              ...mention.users,
              displayName: mention.users.anonymousAlias,
              profileImageUrl: null,
            });
          return mention;
        });
      }
      return message;
    });
  }
  return thread;
}
