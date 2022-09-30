import React, { useState, useRef, useEffect } from 'react';
import autosize from 'autosize';
import Button from 'components/Button';
import styles from './index.module.css';
import toast from 'components/Toast';
import Suggestions from 'components/Suggestions';
import Tab from './Tab';
import Preview from './Preview';
import { isWhitespace } from 'utilities/string';
import { getCaretPosition, setCaretPosition } from './utilities';
import { SerializedUser } from 'serializers/user';
import { useUsersContext } from 'contexts/Users';
import { postprocess } from './utilities/message';

interface Props {
  onSend?(message: string): Promise<any>;
  onSendAndClose?(message: string): Promise<any>;
  fetchMentions?(): Promise<SerializedUser[]>;
}

function isUndefined(character: string | undefined) {
  return typeof character === 'undefined';
}

function isMentionMode(message: string, position: number) {
  const current = message[position - 1];
  const previous = message[position - 2];
  return current === '@' && (isWhitespace(previous) || isUndefined(previous));
}

function getMode(message: string, position: number) {
  return isMentionMode(message, position) ? Mode.Mention : Mode.Standard;
}

function isMentionKey(key: string) {
  return ['ArrowUp', 'ArrowDown', 'Enter'].includes(key);
}

enum Mode {
  Standard,
  Mention,
}

function MessageForm({ onSend, onSendAndClose, fetchMentions }: Props) {
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<SerializedUser[]>([]);
  const [allUsers, addUsers] = useUsersContext();
  const [position, setPosition] = useState(0);
  const ref = useRef(null);
  const mode = getMode(message, position);

  const handleSubmit = async (event: React.SyntheticEvent, callback?: any) => {
    event.preventDefault();
    event.stopPropagation();
    if (!message || loading) {
      return;
    }
    setLoading(true);
    setMessage('');

    callback?.(postprocess(message, allUsers))
      .then(() => {
        setLoading(false);
      })
      .catch(() => {
        toast.error('Something went wrong. Please try again.');
        setLoading(false);
      });
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
    let mounted = true;
    fetchMentions?.()
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
  }, []);

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
              return [
                message.slice(0, position),
                user.username,
                message.slice(position),
              ].join('');
            });
            (ref.current as any).focus();
            setTimeout(() => setPosition(getCaretPosition(ref)), 0);
          }}
        />
      )}
      <form onSubmit={handleSend}>
        <textarea
          ref={ref}
          className={styles.textarea}
          name="message"
          placeholder="Add your comment..."
          hidden={preview}
          rows={3}
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
              if (event.ctrlKey) {
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
                  autosize.update(ref.current);
                }, 0);
              } else {
                handleSend(event);
              }
            }
          }}
        />
        {preview && (
          <Preview message={postprocess(message, allUsers)} users={users} />
        )}
        <div className={styles.toolbar}>
          {onSendAndClose && (
            <Button
              onClick={(event: React.SyntheticEvent) =>
                handleSendAndClose(event)
              }
              size="xs"
              weight="normal"
              color="gray"
            >
              Post &amp; Close
            </Button>
          )}
          {onSend && (
            <Button type="submit" weight="normal" size="xs">
              Post
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

export default MessageForm;
