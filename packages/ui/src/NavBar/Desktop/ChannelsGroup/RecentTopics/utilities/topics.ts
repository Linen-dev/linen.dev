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
