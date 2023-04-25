import React, { useState } from 'react';
import MessageForm from 'components/MessageForm';
import Preview from 'components/MessageForm/Preview';
import { postprocess } from 'components/MessageForm/utilities/message';
import { fetchMentions } from 'components/MessageForm/api';
import H3 from 'components/H3';
import Field from 'components/Field';
import NativeSelect from '@linen/ui/NativeSelect';
import Modal from '@linen/ui/Modal';
import Icon from '@linen/ui/Icon';
import TextInput from '@linen/ui/TextInput';
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

interface Props {
  communityId: string;
  currentUser: SerializedUser;
  channels: SerializedChannel[];
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
}

function findDefaultChannel(channels: SerializedChannel[]): SerializedChannel {
  const channel = channels.find((channel) => channel.default);
  if (channel) {
    return channel;
  }
  return channels[0];
}

export default function AddThreadModal({
  communityId,
  currentUser,
  channels,
  open,
  close,
  onSend,
  uploadFiles,
  progress,
  uploading,
  uploads,
}: Props) {
  const [message, setMessage] = useState('');
  const [allUsers] = useUsersContext();
  const sortedChannels = channels.sort((a, b) => {
    return a.channelName.localeCompare(b.channelName);
  });
  const [channelId, setChannelId] = useState<string>(
    findDefaultChannel(sortedChannels).id
  );
  const [title, setTitle] = useState<string>('');
  return (
    <Modal open={open} close={close} fullscreen>
      <div className={styles.grid}>
        <div className={styles.column}>
          <div className={styles.header}>
            <H3 className={styles.h3}>New Thread</H3>
          </div>
          <Field>
            <NativeSelect
              id="new-thread-channel"
              label="Channel"
              options={sortedChannels.map((channel) => ({
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
              id="inbox-message-form"
              currentUser={currentUser}
              onSend={(message: string) => {
                setTitle('');
                return onSend({ channelId, title, message });
              }}
              fetchMentions={(term?: string) => {
                if (!term) return Promise.resolve([]);
                return fetchMentions(term, communityId);
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
