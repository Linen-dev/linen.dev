import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

interface Props {
  className?: string;
  content: React.ReactNode;
  footer: React.ReactNode;
  onDrop?(event: React.DragEvent): void;
}

function ChatLayout({ className, content, footer, onDrop }: Props) {
  return (
    <div className={classNames(styles.layout, className)} onDrop={onDrop}>
      {content}
      <div id="chat-layout-footer" className={styles.footer}>
        {footer}
      </div>
    </div>
  );
}

export default ChatLayout;
