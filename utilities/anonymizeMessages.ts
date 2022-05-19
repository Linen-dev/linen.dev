import {
  channels,
  messages,
  slackMentions,
  slackThreads,
  users,
} from '@prisma/client';
import superagent from 'superagent';

type Messages =
  | (messages & {
      author: users | null;
      slackThreads: slackThreads | null;
      mentions: (slackMentions & {
        users: users | null;
      })[];
    })
  | (messages & {
      mentions: (slackMentions & {
        users: users | null;
      })[];
    });

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

export function dispatchAnonymizeRequest(accountId: string) {
  // run anonymize users script asynchronously
  superagent
    .get(
      process.env.SYNC_URL +
        '/api/scripts/anonymizeUsers?account_id=' +
        accountId
    )
    .then(() => {
      console.log('Anonymize done!');
    })
    .catch((err) => {
      console.error('Anonymize failed: ', err);
    });
}
