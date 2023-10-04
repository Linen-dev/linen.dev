import React, { useState } from 'react';
import { SerializedThread, SerializedTopic } from '@linen/types';
import { groupByThread } from './utilities/topics';
import styles from './index.module.scss';

interface Props {
  threads: SerializedThread[];
  topics: SerializedTopic[];
  onTopicClick?(topic: SerializedTopic): void;
}

function getTitle(thread: SerializedThread) {
  const title = thread.title || thread.messages[0].body;
  if (title.length > 20) {
    return title.substring(0, 20).trim() + '...';
  }
  return title;
}

export default function RecentTopics({ threads, topics, onTopicClick }: Props) {
  const [query, setQuery] = useState('');
  if (threads.length === 0 || topics.length === 0) {
    return null;
  }
  return (
    <>
      <input
        className={styles.input}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search"
      />
      <ul className={styles.threads}>
        {groupByThread(
          topics.sort((a, b) => {
            return new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime();
          })
        )
          //dedupe threads
          .filter(
            (group, index, self) =>
              index ===
              self.findIndex((t) => t[0].threadId === group[0].threadId)
          )
          .slice(0, 10)
          .map((group) => {
            const topic = group[0];
            const threadId = topic.threadId;
            const thread = threads.find(({ id }) => id === threadId);
            if (!thread) {
              return null;
            }
            const title = getTitle(thread);
            if (!query || title.toLowerCase().startsWith(query.toLowerCase())) {
              return <li onClick={() => onTopicClick?.(topic)}>{title}</li>;
            }
            return null;
          })
          .filter(Boolean)}
      </ul>
    </>
  );
}
