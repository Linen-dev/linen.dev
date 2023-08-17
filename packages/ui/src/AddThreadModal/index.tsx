import React, { useState } from 'react';
import MessageForm from '@/MessageForm';
import Preview from '@/MessagePreview';
import { postprocess } from '@linen/ast';
import H3 from '@/H3';
import Field from '@/Field';
import NativeSelect from '@/NativeSelect';
import Modal from '@/Modal';
import Icon from '@/Icon';
import TextInput from '@/TextInput';
import styles from './index.module.scss';
import {
  MessageFormat,
  SerializedChannel,
  SerializedUser,
  UploadedFile,
} from '@linen/types';
import { FiHash } from '@react-icons/all-files/fi/FiHash';
import { FiX } from '@react-icons/all-files/fi/FiX';
import { useUsersContext } from '@linen/contexts/Users';
import { EXAMPLE } from './utilities/message';
import type { ApiClient } from '@linen/api-client';

interface Props {
  communityId: string;
  currentUser: SerializedUser | null;
  currentChannel?: SerializedChannel;
  channels?: SerializedChannel[];
  open: boolean;
  close(): void;
  onSend({
    channelId,
    title,
    message,
  }: {
    channelId: string;
    title?: string;
    message: string;
  }): Promise<any>;
  uploadFiles(files: File[]): Promise<void>;
  progress: number;
  uploading: boolean;
  uploads: UploadedFile[];
  api: ApiClient;
}

function findDefaultChannel(channels: SerializedChannel[]): SerializedChannel {
  const channel = channels.find((channel) => channel.default);
  if (channel) {
    return channel;
  }
  return channels?.[0];
}

export default function AddThreadModal({
  communityId,
  currentUser,
  currentChannel,
  channels = [],
  open,
  close,
  onSend,
  uploadFiles,
  progress,
  uploading,
  uploads,
  api,
}: Props) {
  const [message, setMessage] = useState('');
  const [allUsers] = useUsersContext();
  const [channelId, setChannelId] = useState<string>(
    currentChannel ? currentChannel.id : findDefaultChannel(channels)?.id
  );
  const [title, setTitle] = useState<string>('');
  return (
    <Modal open={open} close={close} size="xl">
      <div className={styles.grid}>
        <div className={styles.column}>
          <div className={styles.header}>
            <H3 className={styles.h3}>New Thread</H3>
          </div>
          {!currentChannel && (
            <Field>
              <NativeSelect
                id="new-thread-channel"
                label="Channel"
                options={channels.map((channel) => ({
                  label: channel.channelName,
                  value: channel.id,
                }))}
                icon={<FiHash />}
                theme="gray"
                value={channelId}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                  setChannelId(event.target.value)
                }
              />
            </Field>
          )}
          <Field>
            <TextInput
              id="new-thread-title"
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
              id="new-thread-message-form"
              currentUser={currentUser}
              onSend={(message: string) => {
                setTitle('');
                return onSend({ channelId, title, message });
              }}
              fetchMentions={(term?: string) => {
                if (!term) return Promise.resolve([]);
                return api.fetchMentions(term, communityId);
              }}
              onMessageChange={(message) => setMessage(message)}
              rows={4}
              upload={uploadFiles}
              progress={progress}
              uploading={uploading}
              uploads={uploads}
              sendOnEnter={false}
              preview={false}
              message={EXAMPLE}
              useUsersContext={useUsersContext}
            />
          </Field>
        </div>
        <div className={styles.column}>
          <div className={styles.header}>
            <H3 className={styles.h3}>Preview</H3>
            <Icon onClick={close}>
              <FiX />
            </Icon>
          </div>
          {message && (
            <Preview
              message={{
                body: postprocess(message, allUsers),
                sentAt: new Date().toISOString(),
                author: currentUser,
                usersId: currentUser?.id || '1',
                mentions: allUsers,
                attachments: [],
                reactions: [],
                id: '1',
                threadId: '1',
                externalId: null,
                messageFormat: MessageFormat.LINEN,
              }}
              currentUser={currentUser}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}
