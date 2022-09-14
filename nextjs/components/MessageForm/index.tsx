import React, { useState, useRef, useEffect } from 'react';
import autosize from 'autosize';
import Button from 'components/Button';
import Message from 'components/Message';
import styles from './index.module.css';

interface Props {
  onSubmit(message: string): void;
}

function MessageForm({ onSubmit }: Props) {
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(false);
  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onSubmit(message);
  };
  const ref = useRef(null);

  useEffect(() => {
    autosize(ref.current);
    return () => {
      autosize.destroy(ref.current);
    };
  }, []);
  return (
    <form className={styles.messageForm} onSubmit={handleSubmit}>
      <textarea
        ref={ref}
        className={styles.textarea}
        name="message"
        placeholder="Type something..."
        hidden={preview}
        rows={1}
        onChange={(event) => setMessage(event.target.value)}
      />
      {preview && <Message text={message} />}

      <div className={styles.toolbar}>
        {message && (
          <a
            onClick={() => setPreview((preview) => !preview)}
            className="text-blue-600 hover:text-blue-800 visited:text-purple-600 text-sm cursor-pointer px-4"
          >
            {preview ? 'Write' : 'Preview'}
          </a>
        )}
        <Button disabled={!message} type="submit">
          Send
        </Button>
      </div>
    </form>
  );
}

export default MessageForm;
