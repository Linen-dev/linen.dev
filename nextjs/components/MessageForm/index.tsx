import React, { useState, useRef, useEffect } from 'react';
import autosize from 'autosize';
import Button from 'components/Button';
import styles from './index.module.css';
import classNames from 'classnames';
import toast from 'components/Toast';
import Suggestions from 'components/Suggestions';
import Preview from './Preview';
import { isWhitespace } from 'utilities/string';
import { getCaretPosition, setCaretPosition } from './utilities';
import { SerializedUser } from 'serializers/user';
import { useUsersContext } from 'contexts/Users';

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
  const [, addUsers] = useUsersContext();
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
    callback?.(message)
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

  const activeTab =
    'cursor-pointer rounded-md border border-transparent px-3 py-1.5 text-sm text-xs text-gray-900 bg-gray-100 hover:bg-gray-200';
  const inactiveTab =
    'cursor-pointer rounded-md border border-transparent px-3 py-1.5 text-sm text-xs text-gray-500 hover:text-gray-900 bg-white hover:bg-gray-100';
  return (
    <div className={styles.container}>
      <div className={styles.actions}>
        <div
          onClick={() => setPreview(false)}
          className={classNames(preview ? inactiveTab : activeTab)}
        >
          Write
        </div>
        <div
          onClick={() => setPreview(true)}
          className={classNames('ml-2', preview ? activeTab : inactiveTab)}
        >
          Preview
        </div>
      </div>
      {mode === Mode.Mention && !preview && (
        <Suggestions
          className={styles.suggestions}
          users={users}
          onSelect={(user) => {
            setMessage((message) => {
              return [
                message.slice(0, position),
                user.id,
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
        {preview && <Preview message={message} users={users} />}
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
