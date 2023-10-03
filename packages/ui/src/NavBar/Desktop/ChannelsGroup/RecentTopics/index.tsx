import React from 'react';
import { FiMinus } from '@react-icons/all-files/fi/FiMinus';
import { SerializedThread, SerializedTopic } from '@linen/types';
import { groupByThread } from './utilities/topics';
import styles from './index.module.scss';

interface Props {
  threads: SerializedThread[];
  topics: SerializedTopic[];
}

export default function RecentTopics({ threads, topics }: Props) {
  if (threads.length === 0 || topics.length === 0) {
    return null;
  }
  return (
    <ul className={styles.threads}>
      {groupByThread(
        topics.sort((a, b) => {
          return new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime();
        })
      )
        .slice(0, 10)
        .map((group) => {
          const threadId = group[0].threadId;
          const thread = threads.find(({ id }) => id === threadId)!;
          return (
            <li>
              <FiMinus />{' '}
              {thread.title ||
                thread.messages[0].body.substring(0, 20).trim() + '...'}
            </li>
          );
        })}
    </ul>
  );
}
