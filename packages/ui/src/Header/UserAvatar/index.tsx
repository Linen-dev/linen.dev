import React, { useState } from 'react';
import Dropdown from '@/Dropdown';
import { SerializedUser } from '@linen/types';
import Avatar from '@/Avatar';
import Modal from '@/Modal';
import ProfileForm from '@/ProfileForm';
import { FiUser } from '@react-icons/all-files/fi/FiUser';
import { FiLogOut } from '@react-icons/all-files/fi/FiLogOut';
import styles from './index.module.scss';
import type { ApiClient } from '@linen/api-client';

interface Props {
  currentUser: SerializedUser;
  signOut: () => void;
  api: ApiClient;
}

enum Mode {
  Menu,
  Profile,
}

export default function UserAvatar({ currentUser, signOut, api }: Props) {
  const userNavigation = [
    {
      label: 'Profile',
      icon: <FiUser />,
      onClick() {
        setMode(Mode.Profile);
      },
    },
    {
      label: 'Sign out',
      icon: <FiLogOut />,
      onClick() {
        signOut();
      },
    },
  ];
  const [mode, setMode] = useState(Mode.Menu);
  return (
    <>
      <Dropdown
        button={
          <>
            <span className={styles.srOnly}>Open user menu</span>
            <Avatar
              shadow="none"
              src={currentUser.profileImageUrl}
              text={currentUser.displayName}
            />
          </>
        }
        items={userNavigation}
      />
      <Modal open={mode === Mode.Profile} close={() => setMode(Mode.Menu)}>
        <ProfileForm
          currentUser={currentUser}
          api={api}
          onSubmit={async ({ displayName }) => {
            await api.updateProfile({ displayName }).then(() => {
              // Potential improvement:
              // We could improve the behavior here
              // by updating the user information live.
              // It is a bit time consuming because
              // we would need to make currentUser dynamic
              // and update user information in all threads we have.
              // We would need to have a centralized store for users
              // which we could manipulate.
              window.location.reload();
            });
            setMode(Mode.Menu);
          }}
          onUpload={async (data: FormData, options: any) => {
            return api.uploadAvatar(data, options).then(() => {
              // same as in the comment above, we could make this dynamic by updating the user in the all user's list
              window.location.reload();
            });
          }}
        />
      </Modal>
    </>
  );
}
