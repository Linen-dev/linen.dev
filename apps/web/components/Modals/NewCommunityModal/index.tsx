import React from 'react';
import Modal from '@linen/ui/Modal';
import Icon from '@linen/ui/Icon';
import H3 from '@linen/ui/H3';
import { FiX } from '@react-icons/all-files/fi/FiX';
import styles from './index.module.scss';
import Form from 'components/Pages/Onboarding/Form';
import type { ApiClient } from '@linen/api-client';

interface Props {
  open: boolean;
  close(): void;
  api: ApiClient;
}

export default function NewCommunityModal({ open, close, api }: Props) {
  return (
    <Modal open={open} close={close} size="md">
      <div className={styles.header}>
        <H3>Create New Community</H3>
        <Icon onClick={close}>
          <FiX />
        </Icon>
      </div>
      <Form createAccount={api.createAccount} />
    </Modal>
  );
}
