import QAPageJsonLd, { Question } from 'utilities/seo/QAPageJsonLd';
import { SerializedThread, Settings } from '@linen/types';
import { SerializedMessage } from '@linen/types';
import { normalize } from '@linen/utilities/string';
import { buildUrl } from './buildUrl';

function parseDate(data: any) {
  try {
    return new Date(data).toISOString();
  } catch (error) {
    return data;
  }
}

function buildNameText(thread: SerializedThread, url: string): Question {
  const first = thread.messages[0];
  const cleanBody = normalize(first.body);
  return {
    name: thread.title || cleanBody.substring(0, 60),
    text: cleanBody,
    author: {
      name: first.author?.displayName || 'user',
    },
    upvoteCount: thread.viewCount,
    dateCreated: parseDate(first.sentAt),
    answerCount: thread.messages.length - 1,
    suggestedAnswer: thread.messages.slice(1).map((message) => {
      return {
        url: `${url}#${message.id}`,
        text: normalize(message.body),
        author: {
          name: message.author?.displayName || 'user',
        },
        dateCreated: parseDate(message.sentAt),
      };
    }),
  };
}

export function buildStructureData({
  thread,
  isSubDomainRouting,
  settings,
}: {
  thread?: SerializedThread;
  isSubDomainRouting: boolean;
  settings: Settings;
}) {
  if (!thread) return <></>;

  const url = buildUrl(isSubDomainRouting, settings, thread);

  return (
    <QAPageJsonLd
      keyOverride={thread.incrementId}
      mainEntity={{
        ...buildNameText(thread, url),
      }}
      key={thread.incrementId}
    />
  );
}
