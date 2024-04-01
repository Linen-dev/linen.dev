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
  setUsers,
  users,
  removeUser,
  currentUser,
  api,
  focus = true,
}: {
  communityId: string;
  users: SerializedUser[];
  setUsers: React.Dispatch<React.SetStateAction<SerializedUser[]>>;
  removeUser(user: SerializedUser): void;
  currentUser: SerializedUser | null;
  api: ApiClient;
  focus?: boolean | true;
}) {
  const ref = useRef(null);
  const [query, setQuery] = useState<SerializedUser[]>([]);
  const [val, setVal] = useState<string>();

  return (
    <>
      <Label htmlFor="userId">Add member</Label>
      <TextInput
        autoFocus={focus}
        inputRef={ref}
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
      <span className={styles.textXs}>Type for search users</span>

      {users.length > 0 && (
        <>
          <Label htmlFor="members" className={styles.pt4}>
            Members
          </Label>
          <div className={styles.usersWrapper}>
            {users.map((user) => {
              const props =
                currentUser?.id !== user.id
                  ? { onClick: () => removeUser(user) }
                  : {};
              return (
                <div className={styles.badgeWrapper} key={user.id}>
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
