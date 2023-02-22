import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import Tooltip from '../../../../Tooltip';
import { BiMessageCheck } from '@react-icons/all-files/bi/BiMessageCheck';
import { FaVolumeMute } from '@react-icons/all-files/fa/FaVolumeMute';
import { SerializedThread } from '@linen/types';

interface Props {
  className?: string;
  onRead?(threadId: string): void;
  onMute?(threadId: string): void;
  thread: SerializedThread;
}

export default function Actions({ className, thread, onRead, onMute }: Props) {
  return (
    <div className={classNames(styles.actions, className)}>
      <ul>
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
        {onMute && (
          <li
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              onMute(thread.id);
            }}
          >
            <Tooltip className={styles.tooltip} text="Mute">
              <FaVolumeMute />
            </Tooltip>
          </li>
        )}
      </ul>
    </div>
  );
}
