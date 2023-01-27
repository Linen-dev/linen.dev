import React, { Fragment, useState } from 'react';
import Image from 'next/image';
import classNames from 'classnames';
import { Menu, Transition } from '@headlessui/react';
import { signOut } from 'utilities/auth/react';
import { SerializedUser } from '@linen/types';
import { Avatar, Modal } from '@linen/ui';
import ProfileForm from './ProfileForm';
import { AxiosRequestConfig } from 'axios';

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
      name: 'Profile',
      onClick() {
        setMode(Mode.Profile);
      },
    },
    {
      name: 'Sign out',
      onClick() {
        signOut();
      },
    },
  ];
  const [mode, setMode] = useState(Mode.Menu);
  return (
    <>
      <div className="flex h-16 justify-between">
        <div className="flex items-center">
          <Menu as="div" className="relative">
            <div>
              <Menu.Button className="flex items-center ">
                <span className="sr-only">Open user menu</span>
                <Avatar
                  shadow="none"
                  src={currentUser.profileImageUrl}
                  text={currentUser.displayName}
                  Image={Image}
                />
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                {userNavigation.map((item) => (
                  <Menu.Item key={item.name}>
                    {({ active }) => (
                      <a
                        onClick={item.onClick}
                        className={classNames(
                          active ? 'bg-gray-100' : '',
                          'block px-4 py-2 text-sm text-gray-700 cursor-pointer'
                        )}
                      >
                        {item.name}
                      </a>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
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
