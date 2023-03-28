import React from 'react';
import classNames from 'classnames';
import { SerializedThread } from '@linen/types';
import styles from './index.module.scss';
// import { FiInfo } from '@react-icons/all-files/fi/FiInfo';
// import { Tooltip } from '@linen/ui';

interface Props {
  thread: SerializedThread;
  expanded?: boolean;
}

export default function Summary({ thread, expanded }: Props) {
  if (!thread.question || !thread.answer) {
    return null;
  }
  return (
    <div
      className={classNames(styles.summary, { [styles.expanded]: expanded })}
    >
      <div className={styles.content}>
        <p className={styles.description}>Question</p>
        <h1>{thread.question}</h1>
      </div>

      <div className={styles.answer}>
        <div className={styles.header}>
          <p className={styles.description}>Answer</p>
          {/* <Tooltip className={styles.tooltip} text="Summarized by XYZ">
            <FiInfo />
          </Tooltip> */}
        </div>
        <p>{thread.answer}</p>
      </div>
    </div>
  );
}
