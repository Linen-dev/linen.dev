import React, { useState, useRef, useEffect } from 'react';
import autosize from 'autosize';
import Button from 'components/Button';
import Message from 'components/Message';
import styles from './index.module.css';
import classNames from 'classnames';
import toast from 'components/Toast';

interface Props {
  onSend?(message: string): Promise<any>;
  onSendAndClose?(message: string): Promise<any>;
}

function MessageForm({ onSend, onSendAndClose }: Props) {
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (event: React.SyntheticEvent, callback?: any) => {
    event.preventDefault();
    event.stopPropagation();
    if (!message || loading) {
      return;
    }
    setLoading(true);
    callback?.(message)
      .then(() => {
        setMessage('');
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

  const ref = useRef(null);

  useEffect(() => {
    autosize(ref.current);
    return () => {
      autosize.destroy(ref.current);
    };
  }, []);

  const activeTab =
    'cursor-pointer rounded-md border border-transparent px-3 py-1.5 text-sm text-xs text-gray-900 bg-gray-100 hover:bg-gray-200';
  const inactiveTab =
    'cursor-pointer rounded-md border border-transparent px-3 py-1.5 text-sm text-xs text-gray-500 hover:text-gray-900 bg-white hover:bg-gray-100';
  return (
    <>
      <div className="flex items-center mb-2">
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
      <form className={styles.messageForm} onSubmit={handleSend}>
        <textarea
          ref={ref}
          className={styles.textarea}
          name="message"
          placeholder="Add your comment..."
          hidden={preview}
          rows={4}
          value={message}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
            const message = event.target.value;
            setMessage(message);
          }}
          onKeyDown={(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (event.key === 'Enter') {
              if (event.ctrlKey) {
                setMessage((message) => `${message}\n`);
              } else {
                handleSend(event);
              }
            }
          }}
        />
        {preview &&
          (message ? (
            <>
              <div className="mx-px mt-px px-3 pt-2 pb-12">
                <Message text={message} />
              </div>
              <hr className="pb-2 w-full" />
            </>
          ) : (
            <>
              <div className="mx-px mt-px px-3 pt-2 pb-12 text-sm leading-5 text-gray-800">
                Preview content will render here.
              </div>
              <hr className="pb-2 w-full" />
            </>
          ))}

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
    </>
  );
}

export default MessageForm;
