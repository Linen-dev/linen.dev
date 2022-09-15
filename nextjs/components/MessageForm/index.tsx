import React, { useState, useRef, useEffect } from 'react';
import autosize from 'autosize';
import Button from 'components/Button';
import Message from 'components/Message';
import styles from './index.module.css';
import classNames from 'classnames';

interface Props {
  onSubmit(message: string): Promise<any>;
}

function MessageForm({ onSubmit }: Props) {
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!message || loading) {
      return;
    }
    setLoading(true);
    onSubmit(message)
      .then(() => {
        setMessage('');
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };
  const ref = useRef(null);

  useEffect(() => {
    autosize(ref.current);
    return () => {
      autosize.destroy(ref.current);
    };
  }, []);

  const activeTab =
    'cursor-pointer rounded-md border border-transparent px-3 py-1.5 text-sm font-medium text-gray-900 bg-gray-100 hover:bg-gray-200';
  const inactiveTab =
    'cursor-pointer rounded-md border border-transparent px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 bg-white hover:bg-gray-100';
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
      <form className={styles.messageForm} onSubmit={handleSubmit}>
        <textarea
          ref={ref}
          className={styles.textarea}
          name="message"
          placeholder="Add your comment..."
          hidden={preview}
          rows={4}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
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
          <Button type="submit" weight="normal">
            Post
          </Button>
        </div>
      </form>
    </>
  );
}

export default MessageForm;
