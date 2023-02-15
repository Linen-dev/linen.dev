import React, { useState } from 'react';
import MessageForm from 'components/MessageForm';
import { fetchMentions } from 'components/MessageForm/api';
import H3 from 'components/H3';
import Field from 'components/Field';
import { NativeSelect, Modal, TextInput } from '@linen/ui';
import styles from './index.module.scss';
import { SerializedChannel, SerializedUser } from '@linen/types';
import { FiHash } from 'react-icons/fi';

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
        />
      </Field>
      <Field>
        <MessageForm
          id="inbox-message-form"
          progress={100}
          uploads={[]}
          uploading={false}
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
        />
      </Field>
    </Modal>
  );
}
