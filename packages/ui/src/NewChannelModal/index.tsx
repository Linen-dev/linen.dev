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

export default function NewChannelModal({
  permissions,
  show,
  close,
  api,
  CustomRouterPush,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [channelPrivate, setChannelPrivate] = useState(false);
  const [viewType, setViewType] = useState<ChannelViewType>(
    ChannelViewType.CHAT
  );
  const [users, setUsers] = useState<SerializedUser[]>(
    permissions.user ? [permissions.user] : []
  );

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
        <div>
          <div className={styles.titleWrapper}>
            <H3>Create a channel</H3>

            <div className={styles.closeBtn} onClick={close}>
              <span className={styles.srOnly}>Close</span>
              <FiX />
            </div>
          </div>
          <div className={styles.descriptionWrapper}>
            <p className={styles.description}>
              Channels are where your community communicates. They&apos;re best
              when organized around a topic. e.g. javascript.
            </p>
          </div>
          <Field>
            <Label htmlFor="channelName">
              Channel name
              <Label.Description>
                Be sure to choose a url friendly name.
              </Label.Description>
            </Label>
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
              onChange={(event) => {
                event.target.value = event.target.value.toLowerCase();
                event.target.value = event.target.value.replace(/\s/g, '-');
              }}
            />
          </Field>
          <Field>
            <Label htmlFor="viewType">
              Channel view
              <Label.Description>
                Choose how the channel is going to be displayed.
              </Label.Description>
            </Label>
            <NativeSelect
              id="viewType"
              options={[
                { label: 'Chat', value: ChannelViewType.CHAT },
                { label: 'Forum', value: ChannelViewType.FORUM },
                { label: 'Topic', value: ChannelViewType.TOPIC },
              ]}
              defaultValue={viewType}
              onChange={(event) =>
                setViewType(event.target.value as ChannelViewType)
              }
            />
          </Field>
          <div className={classNames(styles.toggle, styles.py4)}>
            <label className={classNames(styles.label, styles.enabled)}>
              <Toggle
                checked={channelPrivate}
                onChange={(checked: boolean) => onPrivateToggle(checked)}
              />
              Private
            </label>
            <input
              type="hidden"
              name={'channelPrivate'}
              value={channelPrivate ? 'true' : 'false'}
            />
          </div>
          <ShowUsers
            communityId={permissions.accountId!}
            users={users}
            setUsers={setUsers}
            removeUser={removeUser}
            currentUser={permissions.user}
            api={api}
          />
        </div>
        <div className={styles.btnWrapper}>
          <Button color="blue" type="submit" disabled={loading}>
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
}
