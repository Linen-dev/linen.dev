import React, { useState } from 'react';
import MessageForm from '@/MessageForm';
import Preview from '@/MessagePreview';
import { preprocess, postprocess } from '@linen/ast';
import H3 from '@/H3';
import Field from '@/Field';
import Modal from '@/Modal';
import Icon from '@/Icon';
import TextInput from '@/TextInput';
import styles from './index.module.scss';
import {
  MessageFormat,
  SerializedThread,
  SerializedUser,
  UploadedFile,
} from '@linen/types';
import { FiX } from '@react-icons/all-files/fi/FiX';
import { useUsersContext } from '@linen/contexts/Users';
import type { ApiClient } from '@linen/api-client';

interface Props {
  communityId: string;
  currentUser: SerializedUser;
  currentThread: SerializedThread;
  open: boolean;
  close(): void;
  onSend({ title, message }: { title?: string; message: string }): Promise<any>;
  uploadFiles(files: File[]): Promise<void>;
  progress: number;
  uploading: boolean;
  uploads: UploadedFile[];
  api: ApiClient;
}

export default function EditThreadModal({
  communityId,
  currentUser,
  currentThread,
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
  const [users] = useUsersContext();
  const currentMessage = currentThread.messages[0];
  const allUsers = [...users, ...currentMessage.mentions];
  const [title, setTitle] = useState<string>(currentThread.title || '');
  return (
    <Modal open={open} close={close} size="xl">
      <div className={styles.grid}>
        <div className={styles.column}>
          <div className={styles.header}>
            <H3 className={styles.h3}>Edit Thread</H3>
          </div>
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
              draft={false}
              onSend={(message: string) => {
                return onSend({ title, message });
              }}
              fetchMentions={(term?: string) => {
                if (!term) return Promise.resolve([]);
                return api.fetchMentions(term, communityId);
              }}
              onMessageChange={(message) => setMessage(message)}
              rows={4}
              progress={progress}
              uploading={uploading}
              uploads={uploads}
              sendOnEnter={false}
              preview={false}
              message={preprocess(currentMessage.body, allUsers)}
              useUsersContext={useUsersContext}
              mentions={currentMessage.mentions}
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
