import React from 'react';
import classNames from 'classnames';
import Message from '@linen/ui/Message';
import { SerializedUser } from '@linen/types';
import { MessageFormat } from '@linen/types';
import styles from './index.module.scss';

interface Props {
  message: string;
  users: SerializedUser[];
}

export default function Preview({ message, users }: Props) {
  if (message) {
    return (
      <div className={styles.preview}>
        <Message text={message} mentions={users} format={MessageFormat.LINEN} />
      </div>
    );
  }
  return (
    <div className={classNames(styles.preview, styles.empty)}>
      Preview content will render here.
    </div>
  );
}
