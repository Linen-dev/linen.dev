import React from 'react';
import Modal from '@/Modal';
import Avatar from '@/Avatar';
import { SerializedUser } from '@linen/types';
import styles from './index.module.scss';

interface Props {
  open: boolean;
  close(): void;
  user: SerializedUser;
  isUserActive?: boolean;
}

export default function UserModal({ open, close, user, isUserActive }: Props) {
  return (
    <Modal open={open} close={close}>
      <div className={styles.header}>
        <Avatar
          src={user.profileImageUrl}
          text={user.displayName}
          active={isUserActive}
        />
        <div className={styles.title}>
          <div className={styles.username}>{user.displayName}</div>
          <div className={styles.role}>{user.role}</div>
        </div>
      </div>
    </Modal>
  );
}
