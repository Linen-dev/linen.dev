import React, { useState } from 'react';
import MessageForm from 'components/MessageForm';
import { fetchMentions } from 'components/MessageForm/api';
import H3 from 'components/H3';
import Field from 'components/Field';
import NativeSelect from '@linen/ui/NativeSelect';
import Modal from '@linen/ui/Modal';
import TextInput from '@linen/ui/TextInput';
import styles from './index.module.scss';
import { SerializedChannel, SerializedUser, UploadedFile } from '@linen/types';
import { FiHash } from '@react-icons/all-files/fi/FiHash';

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
  const sortedChannels = channels.sort((a, b) => {
    return a.channelName.localeCompare(b.channelName);
  });
  const [channelId, setChannelId] = useState<string>(
    findDefaultChannel(sortedChannels).id
  );
  const [title, setTitle] = useState<string>('');
  return (
    <Modal open={open} close={close} size="lg">
      <H3 className={styles.h3}>New Thread</H3>
      <Field>
        <NativeSelect
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
          rows={4}
          upload={uploadFiles}
          progress={progress}
          uploading={uploading}
          uploads={uploads}
          sendOnEnter={false}
        />
      </Field>
    </Modal>
  );
}
