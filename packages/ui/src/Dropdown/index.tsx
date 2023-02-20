import React from 'react';
import classNames from 'classnames';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import styles from './index.module.scss';

export interface DropdownItem {
  label: string;
  icon: React.ReactNode;
  onClick(): void;
}

interface Props {
  button: React.ReactNode;
  items: DropdownItem[];
}

export default function Example({ button, items }: Props) {
  return (
    <Menu as="div" className={styles.menu}>
      <Menu.Button>{button}</Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {items.map((item, index) => {
            return (
              <Menu.Item>
                {({ active }) => (
                  <div
                    className={classNames(styles.action, {
                      [styles.active]: active,
                    })}
                    onClick={item.onClick}
                    key={`menu-item-${item.label}-${index}`}
                  >
                    {item.icon}
                    {item.label}
                  </div>
                )}
              </Menu.Item>
            );
          })}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
