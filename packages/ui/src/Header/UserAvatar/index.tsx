import React, { useState } from 'react';
import Dropdown from '@/Dropdown';
import { SerializedUser } from '@linen/types';
import Avatar from '@/Avatar';
import Modal from '@/Modal';
import ProfileForm from '@/ProfileForm';
import { FiUser } from '@react-icons/all-files/fi/FiUser';
import { FiLogOut } from '@react-icons/all-files/fi/FiLogOut';
import styles from './index.module.scss';

interface Props {
  currentUser: SerializedUser;
  onProfileChange({ displayName }: { displayName: string }): Promise<void>;
  onUpload(data: FormData, options: any): void;
  signOut: () => void;
}

enum Mode {
  Menu,
  Profile,
}

export default function UserAvatar({
  currentUser,
  onProfileChange,
  onUpload,
  signOut,
}: Props) {
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
          onSubmit={async ({ displayName }) => {
            await onProfileChange({ displayName });
            setMode(Mode.Menu);
          }}
          onUpload={onUpload}
        />
      </Modal>
    </>
  );
}
