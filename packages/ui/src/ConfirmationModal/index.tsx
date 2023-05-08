import React from 'react';
import Button from '../Button';
import Modal from '../Modal';
import styles from './index.module.scss';

interface Props {
  open: boolean;
  close(): void;
  onConfirm(): void;
  title?: string;
  description?: string;
  confirm?: string;
  cancel?: string;
}

export default function ConfirmationModal({
  open,
  close,
  onConfirm,
  title,
  description,
  confirm,
  cancel,
}: Props) {
  return (
    <Modal open={open} close={close}>
      <h3 className={styles.header}>{title || 'Confirmation'}</h3>
      <p className={styles.description}>{description || 'Are you sure?'}</p>
      <div className={styles.buttons}>
        <Button
          color="blue"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onConfirm();
          }}
          type="button"
        >
          {confirm || 'Confirm'}
        </Button>
        <Button color="gray" onClick={close} type="button">
          {cancel || 'Cancel'}
        </Button>
      </div>
    </Modal>
  );
}
