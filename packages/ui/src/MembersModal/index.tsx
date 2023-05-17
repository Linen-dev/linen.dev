import React, { useContext, useEffect, useState } from 'react';
import { Permissions, SerializedUser } from '@linen/types';
import { ChannelContext } from '@linen/contexts/channel';
import type { ApiClient } from '@linen/api-client';
import H3 from '@/H3';
import Button from '@/Button';
import Modal from '@/Modal';
import ConfirmationModal from '@/ConfirmationModal';
import Toast from '@/Toast';
import ShowUsers from '@/ShowUsers';
import styles from './index.module.scss';

interface MembersModalProps {
  permissions: Permissions;
  open: boolean;
  close(): void;
  api: ApiClient;
}

export default function MembersModal({
  permissions,
  open,
  close,
  api,
}: MembersModalProps) {
  const channel = useContext(ChannelContext);
  const [users, setUsers] = useState<SerializedUser[]>([]);
  const [modal, setModal] = useState(false);
  const [user, setUser] = useState<SerializedUser>();

  useEffect(() => {
    if (open && channel && permissions?.accountId) {
      api
        .getChannelMembers({
          accountId: permissions.accountId,
          channelId: channel.id,
        })
        .then(setUsers);
    }
  }, [open, permissions, channel]);

  if (!channel || !permissions.accountId) {
    return <></>;
  }

  function removeUser() {
    if (user) {
      setUsers((users) => users.filter((u) => u.id !== user.id));
      setUser(undefined);
    }
  }

  function showModal(user: SerializedUser) {
    setUser(user);
    setModal(true);
  }

  function onUpdateClick() {
    if (channel && permissions?.accountId) {
      api
        .updateChannelMembers({
          accountId: permissions.accountId,
          channelId: channel.id,
          usersId: users.map((u) => u.id),
        })
        .then(() => {
          close();
        })
        .catch((e) => {
          Toast.info('Something went wrong');
        });
    }
  }

  return (
    <Modal open={open} close={close} size="md">
      <H3 className={styles.pb4}>Members</H3>
      <ShowUsers
        communityId={permissions.accountId}
        channelPrivate={true}
        users={users}
        setUsers={setUsers}
        removeUser={showModal}
        currentUser={permissions.user}
        api={api}
      />
      <div className={styles.btnWrapper}>
        <Button color="blue" type="submit" onClick={() => onUpdateClick()}>
          Update
        </Button>
      </div>
      {user && (
        <ConfirmationModal
          title={`Remove ${user.displayName}`}
          description="This member will no longer have access to the channel and can only rejoin by invitation."
          confirm="Confirm"
          open={modal}
          close={() => setModal(false)}
          onConfirm={() => {
            removeUser();
          }}
        />
      )}
    </Modal>
  );
}
