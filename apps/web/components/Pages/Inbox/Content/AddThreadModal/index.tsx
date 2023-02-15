import React from 'react';
import MessageForm from 'components/MessageForm';
import H3 from 'components/H3';
import Field from 'components/Field';
import { Label, NativeSelect, Modal, TextInput } from '@linen/ui';
import styles from './index.module.scss';
import { SerializedChannel } from '@linen/types';
import { FiHash } from 'react-icons/fi';

interface Props {
  channels: SerializedChannel[];
  open: boolean;
  close(): void;
}

export default function AddThreadModal({ channels, open, close }: Props) {
  return (
    <Modal open={open} close={close} size="lg">
      <H3 className={styles.h3}>New Thread</H3>
      <Field>
        <NativeSelect
          label="Channel"
          options={channels.map((channel) => ({
            label: channel.channelName,
            value: channel.id,
          }))}
          icon={<FiHash />}
          theme="gray"
        />
      </Field>
      <Field>
        <TextInput label="Title" />
      </Field>
      <Field>
        <Label htmlFor="inbox-message-form">Message</Label>
        <MessageForm
          id="inbox-message-form"
          progress={100}
          uploads={[]}
          uploading={false}
          currentUser={null}
          onSend={() => Promise.resolve()}
          fetchMentions={() => Promise.resolve([])}
          rows={4}
        />
      </Field>
    </Modal>
  );
}
