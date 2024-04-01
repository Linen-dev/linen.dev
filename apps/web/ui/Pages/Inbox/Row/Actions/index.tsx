import React, { useState } from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import Tooltip from '@/Tooltip';
import ReminderModal from '@/ReminderModal';
import { BiMessageCheck } from '@react-icons/all-files/bi/BiMessageCheck';
import { FaVolumeMute } from '@react-icons/all-files/fa/FaVolumeMute';
import { FiStar } from '@react-icons/all-files/fi/FiStar';
import { FiClock } from '@react-icons/all-files/fi/FiClock';
import { ReminderTypes, SerializedThread } from '@linen/types';

interface Props {
  className?: string;
  onRead?(threadId: string): void;
  onMute?(threadId: string): void;
  onStar?(threadId: string): void;
  onRemind?(threadId: string, reminderType: ReminderTypes): void;
  thread: SerializedThread;
}

enum ModalView {
  NONE,
  REMINDER,
}

export default function Actions({
  className,
  thread,
  onRead,
  onMute,
  onStar,
  onRemind,
}: Props) {
  const [modal, setModal] = useState<ModalView>(ModalView.NONE);
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
            <Tooltip className={styles.tooltip} text="Read">
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
        {onRemind && (
          <li
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              setModal(ModalView.REMINDER);
            }}
          >
            <Tooltip className={styles.tooltip} text="Reminder">
              <FiClock />
            </Tooltip>
          </li>
        )}
        {onStar && (
          <li
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              onStar(thread.id);
            }}
          >
            <Tooltip className={styles.tooltip} text="Star">
              <FiStar />
            </Tooltip>
          </li>
        )}
      </ul>
      {onRemind && (
        <ReminderModal
          open={modal === ModalView.REMINDER}
          close={() => setModal(ModalView.NONE)}
          onConfirm={(reminder: ReminderTypes) => {
            onRemind(thread.id, reminder);
            setModal(ModalView.NONE);
          }}
        />
      )}
    </div>
  );
}
