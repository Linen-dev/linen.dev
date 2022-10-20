import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { signOut } from 'next-auth/react';
import Avatar from 'components/Avatar';

const userNavigation = [
  {
    name: 'Sign out',
    href: '#',
    onClick: (e: any) => {
      e.preventDefault();
      signOut();
    },
  },
];

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ');
}

type UserAvatarProps = {
  user: {
    displayName: string;
    profileImageUrl?: string;
  };
};

export default function UserAvatar({ user }: UserAvatarProps) {
  return (
    <>
      <div className="flex h-16 justify-between">
        <div className="flex items-center">
          <Menu as="div" className="relative">
            <div>
              <Menu.Button className="flex items-center ">
                <span className="sr-only">Open user menu</span>
                <Avatar
                  size="md"
                  shadow="none"
                  alt={user?.displayName || 'avatar'}
                  src={user?.profileImageUrl}
                  text={(user?.displayName || 'u').slice(0, 1).toLowerCase()}
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
                        href={item.href}
                        onClick={item.onClick}
                        className={classNames(
                          active ? 'bg-gray-100' : '',
                          'block px-4 py-2 text-sm text-gray-700'
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
    </>
  );
}
