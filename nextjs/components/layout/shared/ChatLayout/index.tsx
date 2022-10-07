import React from 'react';
import classNames from 'classnames';
import styles from './index.module.css';

interface Props {
  content: React.ReactNode;
  footer: React.ReactNode;
  direction?: 'start' | 'end';
}

function ChatLayout({ content, footer, direction }: Props) {
  return (
    <div
      className={classNames(styles.table, {
        [styles.start]: direction === 'start',
        [styles.end]: direction === 'end',
      })}
    >
      <div className={styles.main}>
        <div className={styles.content}>{content}</div>
      </div>
      <div className={styles.footer}>{footer}</div>
    </div>
  );
}

ChatLayout.defaultProps = {
  direction: 'start',
};

export default ChatLayout;
