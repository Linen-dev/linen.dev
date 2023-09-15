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
  avatar: boolean;
  hash: string;
};

export function toRows(topics: SerializedTopic[][]): TopicRow[] {
  return topics.reduce((result, group) => {
    let forcePadding = false;
    const hash = group.map((current) => current.messageId).join('-');
    const rows = group.map((current, index) => {
      const first = group[0];
      const previous = group[index - 1];
      if (current.usersId && current.usersId !== first.usersId) {
        forcePadding = true;
      }
      return {
        ...current,
        first: index === 0,
        last: index === group.length - 1,
        padded:
          forcePadding ||
          (index > 0 &&
            (!current.usersId || first.usersId !== current.usersId)),
        avatar:
          index === 0 ||
          !current.usersId ||
          (previous && previous.usersId !== current.usersId),
        hash,
      };
    });

    return [...result, ...rows];
  }, []) as TopicRow[];
}
