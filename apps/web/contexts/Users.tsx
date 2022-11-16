import React, { createContext, useContext, useState } from 'react';
import { SerializedUser } from 'serializers/user';
import unionBy from 'lodash.unionby';

const Context = createContext<[SerializedUser[], any]>([[], () => {}]);

interface Props {
  children: React.ReactNode;
}

export const UsersContext = ({ children }: Props) => {
  const [allUsers, setUsers] = useState<SerializedUser[]>([]);

  function addUsers(users: SerializedUser[]) {
    setUsers((allUsers) => {
      return unionBy(allUsers, users, 'id');
    });
  }

  return (
    <Context.Provider value={[allUsers, addUsers]}>{children}</Context.Provider>
  );
};

export const useUsersContext = () => useContext(Context);
