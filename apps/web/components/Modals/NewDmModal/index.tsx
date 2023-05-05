import { useRef, useState } from 'react';
import H3 from '@linen/ui/H3';
import { FiX } from '@react-icons/all-files/fi/FiX';
import { useLinkContext } from '@linen/contexts/Link';
import CustomRouterPush from 'components/Link/CustomRouterPush';
import { api } from 'utilities/requests';
import Modal from '@linen/ui/Modal';
import TextInput from '@linen/ui/TextInput';
import Toast from '@linen/ui/Toast';
import Button from '@linen/ui/Button';
import Suggestions from '@linen/ui/Suggestions';
import { SerializedChannel, SerializedUser } from '@linen/types';
import styles from './index.module.scss';

export default function NewDmModal({
  communityId,
  setDms,
  show,
  close,
}: {
  communityId: string;
  setDms: React.Dispatch<React.SetStateAction<SerializedChannel[]>>;
  show: boolean;
  close(): void;
}) {
  const ref = useRef(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<SerializedUser[]>([]);
  const [user, setUser] = useState<SerializedUser | null>();
  const [val, setVal] = useState<string>();

  const { isSubDomainRouting, communityName, communityType } = useLinkContext();

  async function onSubmit(e: any) {
    setLoading(true);
    try {
      e.preventDefault();

      if (!user?.id) return;

      const result = await api.createDm({
        accountId: communityId,
        userId: user.id,
      });
      setDms((dms) => {
        dms.unshift({ ...result, channelName: user.displayName! });
        return dms;
      });
      close();
      CustomRouterPush({
        isSubDomainRouting,
        communityName,
        communityType,
        path: `/c/${result.id}`,
      });
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
          <div className="flex items-center justify-between">
            <H3>Direct Messages</H3>

            <div
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 cursor-pointer"
              onClick={close}
            >
              <span className="sr-only">Close</span>
              <FiX />
            </div>
          </div>

          <div className="mt-2 mb-8">
            <p className="text-sm text-gray-500">
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

          <span className="text-xs text-gray-500">Type for search users</span>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <Button color="blue" type="submit" disabled={!user}>
            Open
          </Button>
        </div>
      </form>
    </Modal>
  );
}
