import React, { useState, useRef, useEffect } from 'react';
import autosize from 'autosize';
import Button from 'components/Button';
import Message from 'components/Message';
import styles from './index.module.css';
import { messageParams } from 'services/messages/messages';

function MessageForm({
  channelId,
  threadId,
}: {
  channelId: string;
  threadId: string | null;
}) {
  const [value, setValue] = useState('');
  const [preview, setPreview] = useState(false);
  const onSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const message: messageParams = {
      body: value,
      channelId,
      threadId,
    };

    const response = await fetch('/api/messages', {
      method: 'POST',
      body: JSON.stringify(message),
    });
    if (response.ok) {
      console.log('saved successfully');
    } else {
      console.log('failed to save');
    }
  };
  const ref = useRef(null);

  useEffect(() => {
    autosize(ref.current);
    return () => {
      autosize.destroy(ref.current);
    };
  }, []);
  return (
    <form onSubmit={onSubmit}>
      <textarea
        ref={ref}
        className={styles.textarea}
        name="message"
        placeholder="Type something..."
        hidden={preview}
        rows={1}
        onChange={(event) => setValue(event.target.value)}
      />
      {preview && <Message text={value} />}
      <div className={styles.toolbar}>
        {value && (
          <a
            onClick={() => setPreview((preview) => !preview)}
            className="text-blue-600 hover:text-blue-800 visited:text-purple-600 text-sm cursor-pointer px-4"
          >
            {preview ? 'Write' : 'Preview'}
          </a>
        )}
        <Button disabled={!value} type="submit">
          Send
        </Button>
      </div>
    </form>
  );
}

export default MessageForm;
