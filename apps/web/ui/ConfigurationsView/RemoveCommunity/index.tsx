import Button from '@/Button';
import { SerializedAccount } from '@linen/types';
import Modal from '@/Modal';
import React, { useState } from 'react';
import H3 from '@/H3';
import Label from '@/Label';
import { FiX } from '@react-icons/all-files/fi/FiX';
import TextInput from '@/TextInput';
import Toast from '@/Toast';
import type { ApiClient } from '@linen/api-client';
import styles from './index.module.scss';

export default function RemoveCommunity({
  currentCommunity,
  api,
}: {
  currentCommunity: SerializedAccount;
  api: ApiClient;
}) {
  const [open, setOpen] = useState(false);
  const [communityName, setCommunityName] = useState<string>();

  async function onRemoveConfirm() {
    api
      .deleteAccount({ accountId: currentCommunity.id })
      .then((_) => {
        Toast.success('Your community was put on a queue to be removed');
      })
      .catch((_) => {
        Toast.error(
          'Something went wrong, please try again later or email us at help@linen.dev'
        );
      })
      .finally(() => {
        setOpen(false);
      });
  }

  return (
    <>
      <Label htmlFor="delete-community">
        Delete this community
        <Label.Description>
          Once you delete a community, there is no going back. Please be
          careful.
        </Label.Description>
      </Label>
      <>
        <Button
          onClick={() => {
            setOpen(true);
          }}
          color="danger"
        >
          Delete this community
        </Button>
      </>
      <DeleteModal
        open={open}
        setOpen={setOpen}
        communityName={communityName}
        setCommunityName={setCommunityName}
        currentCommunity={currentCommunity}
        onRemoveConfirm={onRemoveConfirm}
      />
    </>
  );
}

function DeleteModal({
  open,
  setOpen,
  communityName,
  setCommunityName,
  currentCommunity,
  onRemoveConfirm,
}: {
  open: boolean;
  setOpen(prop: boolean): void;
  communityName?: string;
  setCommunityName(prop?: string): void;
  currentCommunity: SerializedAccount;
  onRemoveConfirm: () => Promise<void>;
}) {
  return (
    <Modal open={open} close={() => setOpen(false)} size="md">
      <div className={styles.modalFlexColumnGap4}>
        <div className={styles.modalTitle}>
          <H3>Remove Community</H3>

          <div className={styles.modalCloseBtn} onClick={() => setOpen(false)}>
            <span className="sr-only">Close</span>
            <FiX />
          </div>
        </div>
        <div className={styles.modalDescription}>
          <p>
            Once you delete a community, there is no going back. Please be
            certain.
          </p>
        </div>
        <TextInput
          autoFocus
          id="communityName"
          label="Please type your community path to confirm deletion"
          value={communityName}
          required
          onChange={(e) => setCommunityName(e.target.value)}
        />
        <Button
          onClick={() => {
            onRemoveConfirm();
          }}
          disabled={communityName !== currentCommunity.slackDomain}
          color={
            communityName !== currentCommunity.slackDomain
              ? 'disabled'
              : 'danger'
          }
        >
          Delete this community
        </Button>
      </div>
    </Modal>
  );
}
