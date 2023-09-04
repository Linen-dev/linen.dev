import React, { useRef, useState } from 'react';
import { FiX } from '@react-icons/all-files/fi/FiX';
import { SerializedUser } from '@linen/types';
import type { ApiClient } from '@linen/api-client';
import H3 from '@/H3';
import Modal from '@/Modal';
import TextInput from '@/TextInput';
import Toast from '@/Toast';
import Button from '@/Button';
import Suggestions from '@/Suggestions';
import styles from './index.module.scss';

export default function NewDmModal({
  communityId,
  show,
  close,
  api,
  onWriteMessage,
}: {
  communityId: string;
  show: boolean;
  close(): void;
  api: ApiClient;
  onWriteMessage(user: SerializedUser): void;
}) {
  const ref = useRef(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<SerializedUser[]>([]);
  const [user, setUser] = useState<SerializedUser | null>();
  const [val, setVal] = useState<string>();

  async function onSubmit(e: any) {
    setLoading(true);
    try {
      e.preventDefault();
      if (!user?.id) return;
      onWriteMessage(user);
      close();
    } catch (error) {
      Toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={show} close={close}>
      <form onSubmit={onSubmit}>
        <div>
          <div className={styles.titleWrapper}>
            <H3>Direct Messages</H3>

            <div className={styles.closeBtn} onClick={close}>
              <span className={styles.srOnly}>Close</span>
              <FiX />
            </div>
          </div>

          <div className={styles.descriptionWrapper}>
            <p className={styles.description}>
              Direct messages (DMs) are smaller conversations that happen
              outside of channels. DMs work well for one-off conversations that
              don&apos;t require an entire channel of people to weigh in, like
              if you wanted to ask a coworker to reschedule a meeting. DMs
              won&apos;t be google-searchable.
            </p>
          </div>

          <TextInput
            inputRef={ref}
            autoFocus
            id="userId"
            name="userId"
            label="User"
            disabled={loading}
            value={val}
            required
            onInput={(e: any) => {
              setVal(e.target.value);
              setUser(null);
              api.fetchMentions(e.target.value, communityId).then(setUsers);
            }}
          />

          <Suggestions
            className={styles.suggestions}
            users={users}
            onSelect={(user: SerializedUser | null) => {
              if (user) {
                setUser(user);
                setVal(user.displayName || user.username || user.id);
                (ref.current as any).focus();
                setUsers([]);
              }
            }}
          />

          <span className={styles.textXs}>Type for search users</span>
        </div>
        <div className={styles.btnWrapper}>
          <Button color="blue" type="submit" disabled={!user}>
            Open
          </Button>
        </div>
      </form>
    </Modal>
  );
}
