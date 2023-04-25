import React, { useState } from 'react';
import Dropdown from '@linen/ui/Dropdown';
import { signOut } from '@linen/auth/client';
import { SerializedUser } from '@linen/types';
import Avatar from '@linen/ui/Avatar';
import Modal from '@linen/ui/Modal';
import ProfileForm from './ProfileForm';
import { AxiosRequestConfig } from 'axios';
import { FiUser } from '@react-icons/all-files/fi/FiUser';
import { FiLogOut } from '@react-icons/all-files/fi/FiLogOut';

interface Props {
  currentUser: SerializedUser;
  onProfileChange({ displayName }: { displayName: string }): Promise<void>;
  onUpload(data: FormData, options: AxiosRequestConfig): void;
}

enum Mode {
  Menu,
  Profile,
}

export default function UserAvatar({
  currentUser,
  onProfileChange,
  onUpload,
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
            <span className="sr-only">Open user menu</span>
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
