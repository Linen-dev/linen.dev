import React from 'react';
import Modal from '@/Modal';
import Button from '@/Button';
import Progress from '@/Progress';
import styles from './index.module.scss';

interface Props {
  open: boolean;
  close(): void;
  progress: number;
  header?: string;
  description?: string;
}

export default function ProgressModal({
  open,
  close,
  progress,
  header,
  description,
}: Props) {
  return (
    <Modal open={open} close={close}>
      {header && <h2 className={styles.header}>{header}</h2>}
      {description && <p className={styles.description}>{description}</p>}
      <Progress max={100} value={progress}>
        {progress}%
      </Progress>
      <div className={styles.buttons}>
        <Button color="gray" onClick={close}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
