import { SerializedTopic } from '@linen/types';

export function groupByThread(topics: SerializedTopic[]): SerializedTopic[][] {
  let needle: string;
  const groups: SerializedTopic[][] = [];
  topics.forEach((topic) => {
    if (needle === topic.threadId) {
      groups[groups.length - 1].push(topic);
    } else {
      needle = topic.threadId;
      groups.push([topic]);
    }
  });
  return groups;
}

export type TopicRow = SerializedTopic & {
  first: boolean;
  last: boolean;
  padded: boolean;
};

export function toRows(topics: SerializedTopic[][]): TopicRow[] {
  return topics.reduce((result, current) => {
    return [
      ...result,
      ...current.map((topic, index) => {
        return {
          ...topic,
          first: index === 0,
          last: index === current.length - 1,
          padded: index > 0,
        };
      }),
    ];
  }, []) as TopicRow[];
}
