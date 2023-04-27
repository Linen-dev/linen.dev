import React, { useState } from 'react';
import Nav from '@/Nav';
import { Permissions, SerializedUser } from '@linen/types';
import { FiInbox } from '@react-icons/all-files/fi/FiInbox';
import { FiLayers } from '@react-icons/all-files/fi/FiLayers';
import { FiStar } from '@react-icons/all-files/fi/FiStar';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';

interface Props {
  currentUser: SerializedUser;
  currentUrl: string;
  permissions: Permissions;
  paths: { [key: string]: string };
  Link: (args: any) => JSX.Element;
}

export default function MenuGroup({
  currentUser,
  currentUrl,
  permissions,
  paths,
  Link,
}: Props) {
  const [show, toggle] = useState(true);
  return (
    <>
      {currentUser && (
        <Nav.Group onClick={() => toggle((show) => !show)}>
          Menu {show ? <FiChevronUp /> : <FiChevronDown />}
        </Nav.Group>
      )}
      {show && (
        <>
          {permissions.inbox && (
            <Link href="/inbox">
              <Nav.Item active={paths.inbox === currentUrl}>
                <FiInbox /> Inbox
              </Nav.Item>
            </Link>
          )}
          {permissions.starred && (
            <Link href="/starred">
              <Nav.Item active={paths.starred === currentUrl}>
                <FiStar /> Starred
              </Nav.Item>
            </Link>
          )}
          {currentUser && (
            <Link href="/all">
              <Nav.Item active={paths.all === currentUrl}>
                <FiLayers /> All
              </Nav.Item>
            </Link>
          )}
        </>
      )}
    </>
  );
}
