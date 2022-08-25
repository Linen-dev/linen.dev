import React from 'react';

export interface Person {
  name: string;
}
export interface Answer {
  text: string;
  dateCreated?: string;
  upvoteCount?: number;
  url?: string;
  author?: Person;
}

export interface Question {
  name: string;
  answerCount: number;
  acceptedAnswer?: Answer;
  suggestedAnswer?: Answer[];
  text?: string;
  author?: Person;
  upvoteCount?: number;
  dateCreated?: string;
}

import { setAuthor } from './utils/setAuthor';

import { JsonLd, JsonLdProps } from './utils/jsonld';

export interface QAPageJsonLdProps extends JsonLdProps {
  mainEntity: Question;
}

function QAPageJsonLd({
  type = 'QAPage',
  keyOverride,
  mainEntity,
  ...rest
}: QAPageJsonLdProps) {
  const data = {
    ...rest,
    mainEntity: {
      ...mainEntity,
      '@type': 'Question',
      author: setAuthor(mainEntity.author?.name),
      ...(mainEntity.acceptedAnswer && {
        acceptedAnswer: {
          ...mainEntity.acceptedAnswer,
          '@type': 'Answer',
          author: setAuthor(mainEntity.acceptedAnswer?.author?.name),
        },
      }),
      ...(mainEntity.suggestedAnswer && {
        suggestedAnswer: mainEntity.suggestedAnswer.map(
          ({ upvoteCount, ...rest }) => ({
            ...rest,
            '@type': 'Answer',
            upvoteCount: upvoteCount || 0,
            author: setAuthor(rest.author?.name),
          })
        ),
      }),
    },
  };

  return (
    <JsonLd
      type={type}
      keyOverride={keyOverride}
      {...data}
      scriptKey="QAPage"
    />
  );
}

export default QAPageJsonLd;
