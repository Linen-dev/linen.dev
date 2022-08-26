import { capitalize, cleanUpStringForSeo } from 'utilities/string';
import type { Settings } from 'services/accountSettings';
import type { SerializedMessage, SerializedThread } from 'serializers/thread';
import QAPageJsonLd, { Question } from 'utilities/seo/QAPageJsonLd';

function buildNameText(messages: SerializedMessage[]): Question {
  const first = messages[0];
  const cleanBody = cleanUpStringForSeo(first.body);
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
        text: cleanUpStringForSeo(message.body),
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

export function buildChannelSeo({
  settings,
  channelName,
  isSubDomainRouting,
  pathCursor,
  threads,
}: {
  settings: Settings;
  channelName: string;
  isSubDomainRouting: boolean;
  pathCursor: string | null;
  threads?: SerializedThread[];
}) {
  const title = [
    capitalize(settings.communityName),
    capitalize(channelName),
    pathCursor,
  ]
    .filter(Boolean)
    .join(' | ');

  let url = isSubDomainRouting
    ? `https://${settings.redirectDomain}/c/${channelName}`
    : `https://linen.dev/${settings.prefix}/${settings.communityName}/c/${channelName}`;

  if (pathCursor) {
    url += '/' + pathCursor;
  }

  // we may use keywords-frequency instead
  const description =
    threads
      ?.map((t) =>
        cleanUpStringForSeo(t.messages?.[0]?.body || t.slug).substring(0, 40)
      )
      .join(' ... ') || title;

  return { description, title, url, image: settings.logoUrl };
}

export function buildThreadSeo({
  isSubDomainRouting,
  channelName,
  messages,
  settings,
  threadId,
  slug,
}: {
  isSubDomainRouting: boolean;
  channelName: string;
  messages: SerializedMessage[];
  settings: Settings;
  threadId: string;
  slug: string;
}) {
  const cleanBody = cleanUpStringForSeo(messages?.[0]?.body || slug);
  const title = [
    cleanBody.slice(0, 60),
    capitalize(channelName),
    capitalize(settings.communityName),
  ]
    .filter(Boolean)
    .join(' | ');

  let url = isSubDomainRouting
    ? `https://${settings.redirectDomain}/t/${threadId}`
    : `https://linen.dev/${settings.prefix}/${settings.communityName}/t/${threadId}`;

  if (slug) {
    url += '/' + slug.toLowerCase();
  }

  return {
    title,
    description: cleanBody.slice(0, 200),
    image: settings.logoUrl,
    url,
  };
}
