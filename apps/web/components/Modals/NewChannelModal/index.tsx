import { useRef, useState } from 'react';
import H3 from '@linen/ui/H3';
import { FiX } from '@react-icons/all-files/fi/FiX';
import Button from '@linen/ui/Button';
import Modal from '@linen/ui/Modal';
import Label from '@linen/ui/Label';
import Badge from '@linen/ui/Badge';
import TextInput from '@linen/ui/TextInput';
import Toast from '@linen/ui/Toast';
import Toggle from '@linen/ui/Toggle';
import Suggestions from '@linen/ui/Suggestions';
import { useLinkContext } from '@linen/contexts/Link';
import CustomRouterPush from 'components/Link/CustomRouterPush';
import { patterns } from '@linen/types';
import unique from 'lodash.uniq';
import { api } from 'utilities/requests';
import styles from './index.module.scss';
import classNames from 'classnames';
import { Permissions, SerializedUser } from '@linen/types';

interface Props {
  permissions: Permissions;
  show: boolean;
  close(): void;
}

export default function NewChannelModal({ permissions, show, close }: Props) {
  const [loading, setLoading] = useState(false);
  const [channelPrivate, setChannelPrivate] = useState(false);
  const { isSubDomainRouting, communityName, communityType } = useLinkContext();
  const [users, setUsers] = useState<SerializedUser[]>([permissions.user]);

  async function onSubmit(e: any) {
    setLoading(true);
    try {
      e.preventDefault();
      const form = e.target;
      const channelName = form.channelName.value;

      if (channelPrivate) {
        await api.createChannel({
          accountId: permissions.accountId!,
          channelName,
          channelPrivate: true,
          usersId: users.map((u) => u.id),
        });
      } else {
        await api.createChannel({
          accountId: permissions.accountId!,
          channelName,
        });
      }

      close();
      CustomRouterPush({
        isSubDomainRouting,
        communityName,
        communityType,
        path: `/c/${channelName}`,
      });
    } catch (error) {
      Toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function onPrivateToggle(checked: boolean) {
    setChannelPrivate(checked);
  }

  function removeUser(user: SerializedUser) {
    setUsers((users) => users.filter((u) => u.id !== user.id));
  }

  return (
    <Modal open={show} close={close}>
      <form onSubmit={onSubmit}>
        <div>
          <div className="flex items-center justify-between">
            <H3>Create a channel</H3>

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
              Channels are where your community communicates. They&apos;re best
              when organized around a topic. e.g. javascript.
            </p>
          </div>
          <TextInput
            autoFocus
            id="channelName"
            label="Channel name"
            disabled={loading}
            required
            placeholder="e.g. javascript"
            pattern={patterns.channelName.source}
            title={
              'Channels name should start with letter and could contain letters, underscore, numbers and hyphens. e.g. announcements'
            }
          />
          <span className="text-xs text-gray-500">
            Be sure to choose a url friendly name.
          </span>
          <div className={classNames(styles.toggle, 'py-4')}>
            <label className={classNames(styles.label, styles.enabled)}>
              <Toggle
                checked={channelPrivate}
                onChange={(checked: boolean) => onPrivateToggle(checked)}
              />
              Private
            </label>
            <input
              type="hidden"
              name={'channelPrivate'}
              value={channelPrivate ? 'true' : 'false'}
            />
          </div>
          <ShowUsers
            communityId={permissions.accountId!}
            channelPrivate={channelPrivate}
            users={users}
            setUsers={setUsers}
            removeUser={removeUser}
            currentUser={permissions.user}
          />
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <Button color="blue" type="submit" disabled={loading}>
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function ShowUsers({
  communityId,
  channelPrivate,
  setUsers,
  users,
  removeUser,
  currentUser,
}: {
  communityId: string;
  channelPrivate: boolean;
  users: SerializedUser[];
  setUsers: React.Dispatch<React.SetStateAction<SerializedUser[]>>;
  removeUser(user: SerializedUser): void;
  currentUser: SerializedUser;
}) {
  const ref = useRef(null);
  const [query, setQuery] = useState<SerializedUser[]>([]);
  const [val, setVal] = useState<string>();

  if (!channelPrivate) {
    return <></>;
  }

  return (
    <>
      <Label htmlFor="userId">Add member</Label>
      <TextInput
        inputRef={ref}
        autoFocus
        id="userId"
        name="userId"
        value={val}
        autoComplete="off"
        onInput={(e: any) => {
          setVal(e.target.value);
          api.fetchMentions(e.target.value, communityId).then(setQuery);
        }}
      />
      <Suggestions
        className={styles.suggestions}
        users={query}
        onSelect={(user: SerializedUser | null) => {
          if (user) {
            setUsers(unique([...users, user]));
            setVal('');
            (ref.current as any).focus();
            setQuery([]);
          }
        }}
      />
      <span className="text-xs text-gray-500">Type for search users</span>

      {users.length > 0 && (
        <>
          <Label htmlFor="members" className="pt-4">
            Members
          </Label>
          <div className="flex flex-wrap pb-2">
            {users.map((user) => {
              const props =
                currentUser.id !== user.id
                  ? { onClose: () => removeUser(user) }
                  : {};
              return (
                <div className="pr-1 pb-1" key={user.id}>
                  <Badge {...props}>{user.displayName}</Badge>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
