import React, { useRef, useState } from 'react';
import { SerializedUser } from '@linen/types';
import type { ApiClient } from '@linen/api-client';
import Label from '@/Label';
import Badge from '@/Badge';
import TextInput from '@/TextInput';
import Suggestions from '@/Suggestions';
import styles from './index.module.scss';
import unique from 'lodash.uniq';

export default function ShowUsers({
  communityId,
  channelPrivate,
  setUsers,
  users,
  removeUser,
  currentUser,
  api,
}: {
  communityId: string;
  channelPrivate: boolean;
  users: SerializedUser[];
  setUsers: React.Dispatch<React.SetStateAction<SerializedUser[]>>;
  removeUser(user: SerializedUser): void;
  currentUser: SerializedUser;
  api: ApiClient;
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
