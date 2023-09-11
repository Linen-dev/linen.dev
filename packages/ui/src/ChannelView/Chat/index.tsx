import React, { createRef, useState } from 'react';
import classNames from 'classnames';
import MessageForm from '@/MessageForm';
import MessagePreview from '@/MessagePreview';
import TextInput from '@/TextInput';
import Field from '@/Field';
import {
  MessageFormat,
  SerializedChannel,
  SerializedUser,
  UploadedFile,
  Roles,
} from '@linen/types';
import styles from './index.module.scss';
import { postprocess } from '@linen/ast';
import { UsersTyping } from '@/Thread/UsersTyping';

interface Props {
  channel: SerializedChannel;
  currentUser?: SerializedUser | null;
  onDrop({
    source,
    target,
    from,
    to,
  }: {
    source: string;
    target: string;
    from: string;
    to: string;
  }): void;
  sendMessage({
    message,
    files,
    channelId,
    title,
  }: {
    message: string;
    files: UploadedFile[];
    channelId: string;
    title: string;
  }): Promise<void>;
  uploadFiles?(files: File[]): Promise<void>;
  progress: number;
  uploading: boolean;
  uploads: UploadedFile[];
  fetchMentions(term?: string): Promise<SerializedUser[]>;
  useUsersContext(): any;
  onKeyDown?(): void;
  onKeyUp?(): void;
  usersTyping?: string[];
}

export default function Chat({
  channel,
  currentUser,
  progress,
  uploading,
  uploads,
  onDrop,
  sendMessage,
  uploadFiles,
  fetchMentions,
  useUsersContext,
  onKeyDown,
  onKeyUp,
  usersTyping = [],
}: Props) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState<string>();
  const [focus, setFocus] = useState(false);
  const [allUsers] = useUsersContext();
  const ref = createRef<HTMLDivElement>();

  function handleDragEnter() {
    const node = ref.current as HTMLElement;
    node.classList.add(styles.hover);
  }

  function handleDragLeave() {
    const node = ref.current as HTMLElement;
    node.classList.remove(styles.hover);
  }

  const channelId = channel.id;

  return (
    <div
      className={styles.chat}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={(event: React.DragEvent) => {
        if (!uploadFiles) {
          return;
        }
        event.preventDefault();
        const node = ref.current as HTMLElement;
        node.classList.remove(styles.hover);
        const files = Array.from(event.dataTransfer.files || []);
        if (files.length > 0) {
          return uploadFiles(files);
        }
        const text = event.dataTransfer.getData('text');
        if (text) {
          try {
            const data = JSON.parse(text);
            onDrop({
              source: data.source,
              target: 'channel',
              from: data.id,
              to: channelId,
            });
          } catch (exception) {
            return false;
          }
        }
      }}
      ref={ref}
    >
      {message && (
        <MessagePreview
          currentUser={currentUser}
          title={title}
          viewType={channel.viewType}
          message={{
            body: postprocess(message, allUsers),
            sentAt: new Date().toISOString(),
            author: currentUser || null,
            usersId: currentUser?.id || '1',
            mentions: allUsers,
            attachments: [],
            reactions: [],
            id: '1',
            threadId: '1',
            messageFormat: MessageFormat.LINEN,
            externalId: null,
          }}
          badge
        />
      )}
      <Field className={classNames(styles.field, { [styles.focus]: focus })}>
        <TextInput
          id="channel-title"
          placeholder="Title..."
          value={title}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setTitle(event.target.value)
          }
          onKeyUp={(event: React.KeyboardEvent<HTMLInputElement>) => {
            event.stopPropagation();
            event.preventDefault();

            if (event.key === 'Enter') {
              const textarea = document.getElementById(
                `channel-message-form-${channelId}-textarea`
              );
              if (textarea) {
                textarea.focus();
              }
            }
          }}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
        />
        <MessageForm
          id={`channel-message-form-${channelId}`}
          currentUser={currentUser}
          onSend={(message: string, files: UploadedFile[]) => {
            setTitle('');
            return sendMessage({
              message,
              title,
              files,
              channelId: channelId,
            });
          }}
          onMessageChange={(message: string) => setMessage(message)}
          progress={progress}
          uploading={uploading}
          uploads={uploads}
          upload={uploadFiles}
          fetchMentions={(term) =>
            fetchMentions(term).then((users) => [
              ...users,
              ...(!!term &&
              'channel'.includes(term) &&
              (currentUser?.role === Roles.ADMIN ||
                currentUser?.role === Roles.OWNER)
                ? [
                    {
                      id: 'channel',
                      username: 'channel',
                      displayName: 'channel',
                    } as SerializedUser,
                  ]
                : []),
            ])
          }
          useUsersContext={useUsersContext}
          preview={false}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
        />
      </Field>
      <UsersTyping
        key={usersTyping?.join()}
        usersTyping={usersTyping}
        currentUser={currentUser}
      />
    </div>
  );
}
