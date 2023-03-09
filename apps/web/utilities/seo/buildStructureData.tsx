import QAPageJsonLd, { Question } from 'utilities/seo/QAPageJsonLd';
import { SerializedThread, Settings } from '@linen/types';
import { normalize } from '@linen/utilities/string';
import { buildUrl } from './utils/buildThreadUrl';
import { replaceMentions } from './utils/replaceMentions';
import { parseDate } from './utils/parseDate';

function buildNameText(thread: SerializedThread, url: string): Question {
  const first = thread.messages[0];
  const cleanBody = normalize(
    replaceMentions({ body: first.body, mentions: first.mentions })
  ).trim();

  const suggestedAnswers = thread.messages
    .slice(1)
    .map((message) => {
      return {
        url: `${url}#${message.id}`,
        text: normalize(
          replaceMentions({ body: message.body, mentions: message.mentions })
        ).trim(),
        author: {
          name: message.author?.displayName || 'user',
        },
        dateCreated: parseDate(message.sentAt),
      };
    })
    .filter((m) => !!m.text);

  return {
    name: thread.title || cleanBody.substring(0, 60),
    text: cleanBody,
    author: {
      name: first.author?.displayName || 'user',
    },
    upvoteCount: thread.viewCount,
    dateCreated: parseDate(first.sentAt),
    answerCount: suggestedAnswers.length,
    suggestedAnswer: suggestedAnswers,
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
  const data = buildNameText(thread, url);

  if (!data.name) return <></>;

  return (
    <QAPageJsonLd
      keyOverride={thread.incrementId}
      mainEntity={{
        ...data,
      }}
      key={thread.incrementId}
    />
  );
}
