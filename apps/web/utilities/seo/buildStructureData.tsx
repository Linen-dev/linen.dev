import QAPageJsonLd, { Question } from 'utilities/seo/QAPageJsonLd';
import { SerializedThread } from '@linen/types';
import { SerializedMessage } from '@linen/types';
import { normalize } from '@linen/utilities/string';

function buildNameText(messages: SerializedMessage[]): Question {
  const first = messages[0];
  const cleanBody = normalize(first.body);
  return {
    name: cleanBody.substring(0, 60),
    text: cleanBody,
    author: {
      name: first.author?.displayName || 'user',
    },
    dateCreated: first.sentAt.toString(),
    answerCount: messages.length - 1,
    suggestedAnswer: messages.slice(1).map((message) => {
      return {
        text: normalize(message.body),
        author: {
          name: message.author?.displayName || 'user',
        },
        dateCreated: message.sentAt.toString(),
      };
    }),
  };
}

function filterThreadsWithMessages(thread: SerializedThread) {
  return !!thread.messages.length;
}

export function buildStructureData(threads?: SerializedThread[]) {
  return (
    !!threads &&
    threads.filter(filterThreadsWithMessages).map((thread) => (
      <QAPageJsonLd
        keyOverride={thread.incrementId}
        mainEntity={{
          ...buildNameText(thread.messages),
        }}
        key={thread.incrementId}
      />
    ))
  );
}
