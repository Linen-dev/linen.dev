import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import Tooltip from '../../../../Tooltip';
import { BiMessageCheck } from 'react-icons/bi';
import { SerializedThread } from '@linen/types';

interface Props {
  className?: string;
  onRead?(threadId: string): void;
  thread: SerializedThread;
}

export default function Actions({ className, thread, onRead }: Props) {
  return (
    <div className={classNames(styles.actions, className)}>
      <ul>
        <li>
          {onRead && (
            <li
              onClick={(event) => {
                event.stopPropagation();
                event.preventDefault();
                onRead(thread.id);
              }}
            >
              <Tooltip className={styles.tooltip} text="Done">
                <BiMessageCheck />
              </Tooltip>
            </li>
          )}
        </li>
      </ul>
    </div>
  );
}
