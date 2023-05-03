import React, { useState } from 'react';
import MessageForm from '@/MessageForm';
import Preview from '@/MessagePreview';
import { postprocess } from '@linen/ast';
import { fetchMentions } from './api';
import H3 from '@/H3';
import Field from '@/Field';
import Modal from '@/Modal';
import Icon from '@/Icon';
import styles from './index.module.scss';
import {
  MessageFormat,
  SerializedMessage,
  SerializedUser,
  UploadedFile,
} from '@linen/types';
import { FiX } from '@react-icons/all-files/fi/FiX';
import { useUsersContext } from '@linen/contexts/Users';

interface Props {
  communityId: string;
  currentUser: SerializedUser;
  currentMessage: SerializedMessage;
  open: boolean;
  close(): void;
  onSend({ message }: { message: string }): Promise<any>;
  uploadFiles(files: File[]): Promise<void>;
  progress: number;
  uploading: boolean;
  uploads: UploadedFile[];
}

export default function EditMessageModal({
  communityId,
  currentUser,
  currentMessage,
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
  return (
    <Modal open={open} close={close} fullscreen>
      <div className={styles.grid}>
        <div className={styles.column}>
          <div className={styles.header}>
            <H3 className={styles.h3}>Edit Message</H3>
          </div>
          <Field>
            <MessageForm
              id="inbox-message-form"
              currentUser={currentUser}
              draft={false}
              onSend={(message: string) => {
                return onSend({ message });
              }}
              fetchMentions={(term?: string) => {
                if (!term) return Promise.resolve([]);
                return fetchMentions(term, communityId);
              }}
              onMessageChange={(message) => setMessage(message)}
              rows={4}
              progress={progress}
              uploading={uploading}
              uploads={uploads}
              sendOnEnter={false}
              preview={false}
              message={currentMessage.body}
              {...{ useUsersContext }}
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
