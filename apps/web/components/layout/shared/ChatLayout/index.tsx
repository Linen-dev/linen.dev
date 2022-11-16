import React from 'react';
import classNames from 'classnames';
import styles from './index.module.css';

interface Props {
  content: React.ReactNode;
  footer: React.ReactNode;
}

function ChatLayout({ content, footer }: Props) {
  return (
    <div className={classNames(styles.table)}>
      <div className={styles.main}>
        <div className={styles.content}>{content}</div>
      </div>
      <div className={styles.footer}>{footer}</div>
    </div>
  );
}

export default ChatLayout;
