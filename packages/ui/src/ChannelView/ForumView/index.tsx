import React, { useState } from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import Field from '@/Field';
import TextInput from '@/TextInput';
import MessageForm from '@/MessageForm';
import {
  Permissions,
  SerializedAccount,
  SerializedChannel,
  SerializedUser,
} from '@linen/types';
import type { ApiClient } from '@linen/api-client';
import { useUsersContext } from '@linen/contexts/Users';
import Header from '../Header';

interface Props {
  currentUser?: SerializedUser;
  currentCommunity: SerializedAccount;
  currentChannel: SerializedChannel;
  permissions: Permissions;
  api: ApiClient;
}

export default function ForumView({
  currentCommunity,
  currentUser,
  currentChannel,
  permissions,
  api,
}: Props) {
  const [title, setTitle] = useState('');
  return (
    <div className={styles.container}>
      <Header
        className={classNames(styles.header)}
        channel={currentChannel}
        currentUser={currentUser}
        permissions={permissions}
        // onAddClick={showAddThreadModal}
        // handleOpenIntegrations={showIntegrationsModal}
        // handleOpenMembers={showMembersModal}
        // onHideChannelClick={showHideChannelModal}
        api={api}
      />
      <div className={styles.content}>
        <h1>Add a Thread</h1>
        <Field>
          <TextInput
            id="forum-view-title"
            label="Title"
            value={title}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setTitle(event.target.value)
            }
            onKeyUp={(event: React.KeyboardEvent<HTMLInputElement>) => {
              event.stopPropagation();
              event.preventDefault();
            }}
          />
        </Field>
        <Field>
          <MessageForm
            id="forum-view-message-form"
            currentUser={currentUser}
            onSend={(message: string) => {
              setTitle('');
              // return onSend({ channelId, title, message });
              return Promise.resolve();
            }}
            fetchMentions={(term?: string) => {
              if (!term) return Promise.resolve([]);
              return api.fetchMentions(term, currentCommunity.id);
            }}
            rows={4}
            uploads={[]}
            progress={0}
            // upload={uploadFiles}
            // progress={progress}
            // uploading={uploading}
            // uploads={uploads}
            // sendOnEnter={false}
            // preview={false}
            // message={EXAMPLE}
            useUsersContext={useUsersContext}
          />
        </Field>
      </div>
    </div>
  );
}
