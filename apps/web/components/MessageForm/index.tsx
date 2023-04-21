import React, { useState, useRef, useEffect } from 'react';
import autosize from 'autosize';
import Button from '@linen/ui/Button';
import Suggestions from '@linen/ui/Suggestions';
import Toast from '@linen/ui/Toast';
import styles from './index.module.scss';
import Preview from './Preview';
import FileInput from './FileInput';
import FilesSummary from './FilesSummary';
import { isWhitespace } from '@linen/utilities/string';
import { getCaretPosition, setCaretPosition } from './utilities';
import { MessageFormat, SerializedUser } from '@linen/types';
import { useUsersContext } from '@linen/contexts/Users';
import { postprocess, previewable } from './utilities/message';
import {
  FILE_SIZE_LIMIT_IN_BYTES,
  getFileSizeErrorMessage,
} from '@linen/utilities/files';
import { sessionStorage } from '@linen/utilities/storage';

interface Props {
  id?: string;
  autoFocus?: boolean;
  currentUser?: SerializedUser | null;
  progress: number;
  uploading?: boolean;
  uploads: UploadedFile[];
  rows?: number;
  preview?: boolean;
  sendOnEnter?: boolean;
  message?: string;
  onSend?(message: string, files: UploadedFile[]): Promise<any>;
  onSendAndClose?(message: string, files: UploadedFile[]): Promise<any>;
  onMessageChange?(message: string): void;
  fetchMentions?(term?: string): Promise<SerializedUser[]>;
  upload?(files: File[]): Promise<any>;
}

function isUndefined(character: string | undefined) {
  return typeof character === 'undefined';
}

function isUsernameCharacter(character: string) {
  return !!character && /[a-zA-Z0-9\.]/.test(character);
}

function isMentionCharacter(character: string) {
  return character === '@' || character === '!';
}

function getMentionIndex(text: string) {
  const index1 = text.lastIndexOf('!');
  const index2 = text.lastIndexOf('@');
  const indexes = [index1, index2];
  return Math.max.apply(Math, indexes) + 1;
}

function isMentionMode(message: string, position: number) {
  const current = message[position - 1];
  const previous = message[position - 2];
  if (
    isMentionCharacter(current) &&
    (isWhitespace(previous) || isUndefined(previous))
  ) {
    return true;
  }

  if (isUsernameCharacter(current)) {
    let index = 2;
    let character = message[position - index];
    while (isUsernameCharacter(character)) {
      index++;
      character = message[position - index];
    }
    const current = character;
    index++;
    const previous = message[position - index];
    if (
      isMentionCharacter(current) &&
      (isWhitespace(previous) || isUndefined(previous))
    ) {
      return true;
    }
  }
  return false;
}

function getMode(message: string, position: number) {
  return isMentionMode(message, position) ? Mode.Mention : Mode.Standard;
}

function getMention(message: string, position: number) {
  if (isMentionMode(message, position)) {
    const current = message[position - 1];
    let mention = current;
    if (isUsernameCharacter(current)) {
      let index = 2;
      let character = message[position - index];
      while (isUsernameCharacter(character)) {
        index++;
        mention += character;
        character = message[position - index];
      }
      const current = character;
      index++;
      const previous = message[position - index];
      if (
        isMentionCharacter(current) &&
        (isWhitespace(previous) || isUndefined(previous))
      ) {
        return mention.split('').reverse().join('');
      }
    } else {
      return '';
    }
  }
  return '';
}

function isMentionKey(key: string) {
  return ['ArrowUp', 'ArrowDown', 'Enter'].includes(key);
}

enum Mode {
  Standard,
  Mention,
}

interface UploadedFile {
  id: string;
  url: string;
}

function MessageForm({
  id,
  autoFocus,
  currentUser,
  progress,
  uploading,
  uploads,
  rows,
  sendOnEnter,
  preview,
  message: initialMessage,
  onSend,
  onSendAndClose,
  onMessageChange,
  fetchMentions,
  upload,
}: Props) {
  const STORAGE_KEY = `message.draft.${id}`;
  const [message, setMessage] = useState<string>(
    sessionStorage.get(STORAGE_KEY) || initialMessage || ''
  );

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<SerializedUser[]>([]);
  const [allUsers, addUsers] = useUsersContext();
  const [position, setPosition] = useState(0);
  const ref = useRef(null);
  const mode = getMode(message, position);
  const mention = getMention(message, position);

  useEffect(() => {
    onMessageChange?.(message);
    sessionStorage.set(STORAGE_KEY, message);
    return () => {
      sessionStorage.set(STORAGE_KEY, message);
    };
  }, [message]);

  const handleSubmit = async (event: React.SyntheticEvent, callback?: any) => {
    event.preventDefault();
    event.stopPropagation();
    if (!message || loading) {
      return;
    }
    setLoading(true);

    callback?.(
      postprocess(message, allUsers),
      uploads.filter((upload) => !message.includes(upload.url))
    )
      .then(() => {
        setLoading(false);
      })
      .catch(() => {
        Toast.error('Something went wrong. Please try again.');
        setLoading(false);
      });
    setMessage('');
  };
  const handleSend = async (event: React.SyntheticEvent) =>
    handleSubmit(event, onSend);
  const handleSendAndClose = (event: React.SyntheticEvent) =>
    handleSubmit(event, onSendAndClose);

  useEffect(() => {
    ref.current && autosize(ref.current);
    return () => {
      ref.current && autosize.destroy(ref.current);
    };
  }, []);

  useEffect(() => {
    ref.current && autosize.update(ref.current);
  }, [message]);

  useEffect(() => {
    let mounted = true;
    fetchMentions?.(mention)
      .then((users: SerializedUser[]) => {
        if (mounted) {
          setUsers(users);
          addUsers(users);
        }
      })
      .catch(() => {
        if (mounted) {
          // notify the backend
        }
      });

    return () => {
      mounted = false;
    };
  }, [mention]);

  const clearFileInput = () => {
    const node = document.getElementById(`${id}-files`) as HTMLInputElement;
    if (node) {
      node.value = '';
    }
  };
  const uploadFiles = (files: File[]) => {
    if (!upload) {
      return;
    }
    if (files.length > 0) {
      for (let index = 0, length = files.length; index < length; index += 1) {
        const file = files[index];
        if (file.size > FILE_SIZE_LIMIT_IN_BYTES) {
          clearFileInput();
          Toast.error(getFileSizeErrorMessage(file.name));
          return Promise.reject();
        }
      }
      return upload(files).finally(() => {
        clearFileInput();
      });
    }
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    uploadFiles(files);
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const files = Array.from(event.dataTransfer.files || []);
    if (files.length > 0) {
      uploadFiles(files);
    }
  };

  return (
    <div className={styles.container} onDrop={onDrop}>
      {mode === Mode.Mention && (
        <Suggestions
          className={styles.suggestions}
          users={users}
          onSelect={(user: SerializedUser | null) => {
            // we currently assume that users are unique
            // we should track which users were selected
            // to map to the correct user

            // other, ideal solution would be that users just have a unique
            // username in the db
            // in that case we don't need to do any postprocessing
            setMessage((message: string) => {
              if (!user) {
                return message;
              }
              const start = message.slice(0, position);
              const index = getMentionIndex(start);
              const difference = position - index;
              return [
                message.slice(0, index),
                user.username,
                ' ',
                message.slice(difference + index),
              ].join('');
            });
            (ref.current as any).focus();
            setTimeout(() => setPosition(getCaretPosition(ref)), 0);
          }}
        />
      )}
      {message && preview && previewable(message) && (
        <Preview
          currentUser={currentUser}
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
        />
      )}
      <form id={id} className={styles.form} onSubmit={handleSend}>
        <textarea
          id={`${id}-textarea`}
          ref={ref}
          autoFocus={autoFocus}
          className={styles.textarea}
          name="message"
          placeholder="Add your comment..."
          rows={rows || 2}
          value={message}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
            const message = event.target.value;
            setMessage(message);
            setTimeout(() => setPosition(getCaretPosition(ref)), 0);
          }}
          onKeyDown={(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (mode === Mode.Mention && isMentionKey(event.key)) {
              return event.preventDefault();
            }
            if (event.key === 'Enter') {
              if (event.metaKey) {
                handleSend(event);
              } else if (event.ctrlKey || event.shiftKey || !sendOnEnter) {
                event.preventDefault();
                const position = getCaretPosition(ref);
                setMessage((message: string) => {
                  return [
                    message.slice(0, position),
                    '\n',
                    message.slice(position),
                  ].join('');
                });
                setTimeout(() => {
                  setCaretPosition(ref, position + 1);
                  setPosition(position + 1);
                }, 0);
              } else {
                handleSend(event);
              }
            }

            if (event.key === 'Escape' && ref.current) {
              const node = ref.current as HTMLTextAreaElement;
              node.blur();
            }
          }}
        />
        {upload && (
          <div className={styles.toolbar}>
            <FileInput
              id={`${id}-files`}
              disabled={uploading}
              onChange={onFileChange}
            />
            <FilesSummary
              uploading={uploading}
              progress={progress}
              uploads={uploads}
            />
          </div>
        )}
        <div className={styles.buttons}>
          {onSendAndClose && (
            <Button
              onClick={(event: React.SyntheticEvent) =>
                handleSendAndClose(event)
              }
              size="xs"
              weight="normal"
              color="gray"
              disabled={!message || uploading}
            >
              Post &amp; Close
            </Button>
          )}
          {onSend && (
            <Button
              type="submit"
              weight="normal"
              size="xs"
              disabled={!message || uploading}
            >
              Post
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

MessageForm.defaultProps = {
  sendOnEnter: true,
  preview: true,
};

export default MessageForm;
