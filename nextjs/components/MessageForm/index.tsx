import React, { useState, useRef, useEffect } from 'react';
import autosize from 'autosize';
import Button from 'components/Button';
import styles from './index.module.css';
import toast from 'components/Toast';
import Suggestions from 'components/Suggestions';
import Tab from './Tab';
import Preview from './Preview';
import FileInput from './FileInput';
import FilesCount from './FilesCount';
import { isWhitespace } from 'utilities/string';
import { getCaretPosition, setCaretPosition } from './utilities';
import { SerializedUser } from 'serializers/user';
import { useUsersContext } from 'contexts/Users';
import { postprocess } from './utilities/message';
import axios from 'axios';

interface Props {
  id?: string;
  autoFocus?: boolean;
  onSend?(message: string, files: UploadedFile[]): Promise<any>;
  onSendAndClose?(message: string, files: UploadedFile[]): Promise<any>;
  fetchMentions?(term?: string): Promise<SerializedUser[]>;
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
  onSend,
  onSendAndClose,
  fetchMentions,
}: Props) {
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [users, setUsers] = useState<SerializedUser[]>([]);
  const [allUsers, addUsers] = useUsersContext();
  const [position, setPosition] = useState(0);
  const ref = useRef(null);
  const mode = getMode(message, position);
  const mention = getMention(message, position);

  const handleSubmit = async (event: React.SyntheticEvent, callback?: any) => {
    event.preventDefault();
    event.stopPropagation();
    if (!message || loading) {
      return;
    }
    setLoading(true);

    callback?.(postprocess(message, allUsers), uploads)
      .then(() => {
        setLoading(false);
      })
      .catch(() => {
        toast.error('Something went wrong. Please try again.');
        setLoading(false);
      });

    setMessage('');
    setFiles([]);
    setUploads([]);
  };
  const handleSend = async (event: React.SyntheticEvent) =>
    handleSubmit(event, onSend);
  const handleSendAndClose = (event: React.SyntheticEvent) =>
    handleSubmit(event, onSendAndClose);

  useEffect(() => {
    autosize(ref.current);
    return () => {
      autosize.destroy(ref.current);
    };
  }, []);

  useEffect(() => {
    autosize.update(ref.current);
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

  const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploads([]);
    setFiles(files);
    if (files.length > 0) {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`file-${index}`, file, file.name);
      });
      setUploading(true);
      axios
        .post('/api/upload', formData, {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`upload process: ${percentCompleted}%`);
          },
        })
        .then((response) => {
          const { files } = response.data;
          setUploads(files);
          setUploading(false);
        })
        .catch(() => {
          setUploading(false);
        });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.actions}>
        <Tab onClick={() => setPreview(false)} active={!preview}>
          Write
        </Tab>
        <Tab onClick={() => setPreview(true)} active={preview}>
          Preview
        </Tab>
      </div>
      {mode === Mode.Mention && !preview && (
        <Suggestions
          className={styles.suggestions}
          users={users}
          onSelect={(user) => {
            // we currently assume that users are unique
            // we should track which users were selected
            // to map to the correct user

            // other, ideal solution would be that users just have a unique
            // username in the db
            // in that case we don't need to do any postprocessing

            setMessage((message) => {
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
      <form className={styles.form} onSubmit={handleSend}>
        <textarea
          ref={ref}
          autoFocus={autoFocus}
          className={styles.textarea}
          name="message"
          placeholder="Add your comment..."
          hidden={preview}
          rows={2}
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
              if (event.ctrlKey || event.shiftKey) {
                const position = getCaretPosition(ref);
                setMessage((message) => {
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
          }}
        />
        {preview && (
          <Preview message={postprocess(message, allUsers)} users={allUsers} />
        )}
        <div className={styles.toolbar}>
          <FileInput
            id={`${id}-files`}
            disabled={uploading}
            onChange={onFileInputChange}
          />
          <FilesCount uploading={uploading} count={files.length} />
        </div>
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

export default MessageForm;
