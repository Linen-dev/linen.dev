import React, { useState } from 'react';
import { FiClock } from '@react-icons/all-files/fi/FiClock';
import Button from '@/Button';
import NativeSelect from '@/NativeSelect';
import Modal from '@/Modal';
import { ReminderTypes } from '@linen/types';
import styles from './index.module.scss';

interface Props {
  open: boolean;
  close(): void;
  onConfirm(reminder: ReminderTypes): void;
}

export default function ReminderModal({ open, close, onConfirm }: Props) {
  const [reminder, setReminder] = useState<ReminderTypes>(ReminderTypes.SOON);
  return (
    <Modal open={open} close={close}>
      <h3 className={styles.header}>
        <FiClock /> Reminder
      </h3>
      <form className={styles.form}>
        <NativeSelect
          id="reminder-date"
          theme="gray"
          value={reminder}
          options={[
            { label: 'In 20 Minutes', value: ReminderTypes.SOON },
            { label: 'Tomorrow', value: ReminderTypes.TOMORROW },
            { label: 'Next Week', value: ReminderTypes.NEXT_WEEK },
          ]}
          onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
            const reminder = event.target.value as ReminderTypes;
            setReminder(reminder);
          }}
        />
      </form>
      <div className={styles.buttons}>
        <Button color="blue" onClick={() => onConfirm(reminder)}>
          Confirm
        </Button>
        <Button color="gray" onClick={close}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
