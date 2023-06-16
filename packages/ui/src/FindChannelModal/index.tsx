import React, { useState } from 'react';
import { FiX } from '@react-icons/all-files/fi/FiX';
import {
  patterns,
  Permissions,
  SerializedUser,
  ChannelViewType,
} from '@linen/types';
import type { ApiClient } from '@linen/api-client';
import H3 from '@/H3';
import Button from '@/Button';
import Modal from '@/Modal';
import Field from '@/Field';
import TextInput from '@/TextInput';
import NativeSelect from '@/NativeSelect';
import Toast from '@/Toast';
import Toggle from '@/Toggle';
import { FiHash } from '@react-icons/all-files/fi/FiHash';
import styles from './index.module.scss';
import classNames from 'classnames';
import ShowUsers from '@/ShowUsers';
import Label from '@/Label';

interface Props {
  permissions: Permissions;
  show: boolean;
  close(): void;
  api: ApiClient;
  CustomRouterPush({ path }: { path: string }): void;
}

export default function FindChannelModal({
  permissions,
  show,
  close,
  api,
  CustomRouterPush,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [channelPrivate, setChannelPrivate] = useState(false);
  const [viewType, setViewType] = useState<ChannelViewType>('CHAT');
  const [users, setUsers] = useState<SerializedUser[]>([permissions.user]);

  async function onSubmit(e: any) {
    setLoading(true);
    try {
      e.preventDefault();
      const form = e.target;
      const channelName = form.channelName.value;

      if (channelPrivate) {
        await api.createChannel({
          accountId: permissions.accountId!,
          channelName,
          channelPrivate: true,
          viewType,
          usersId: users.map((u) => u.id),
        });
      } else {
        await api.createChannel({
          accountId: permissions.accountId!,
          channelName,
          viewType,
        });
      }

      close();
      CustomRouterPush({
        path: `/c/${channelName}`,
      });
    } catch (error) {
      Toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function onPrivateToggle(checked: boolean) {
    setChannelPrivate(checked);
  }

  function removeUser(user: SerializedUser) {
    setUsers((users) => users.filter((u) => u.id !== user.id));
  }

  return (
    <Modal open={show} close={close}>
      <form onSubmit={onSubmit}>
        <div className={styles.title}>
          <H3>Find a channel</H3>

          <div className={styles.close} onClick={close}>
            <FiX />
          </div>
        </div>
        <Field>
          <TextInput
            autoFocus
            id="channelName"
            disabled={loading}
            required
            placeholder="e.g. javascript"
            pattern={patterns.channelName.source}
            icon={<FiHash />}
            title={
              'Channels name should start with letter and could contain letters, underscore, numbers and hyphens. e.g. announcements'
            }
          />
        </Field>
      </form>
    </Modal>
  );
}
