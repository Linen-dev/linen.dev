import React from 'react';
import Modal from '@linen/ui/Modal';
import Form from 'components/Pages/Onboarding/Form';
import Icon from '@linen/ui/Icon';
import H3 from '@linen/ui/H3';
import { FiX } from '@react-icons/all-files/fi/FiX';
import { api } from 'utilities/requests';
import styles from './index.module.scss';

interface Props {
  open: boolean;
  close(): void;
}

export default function NewCommunityModal({ open, close }: Props) {
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
