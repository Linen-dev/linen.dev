import React from 'react';
import { Nav } from '@linen/ui';
import { Permissions, SerializedUser } from '@linen/types';
import { FiInbox } from '@react-icons/all-files/fi/FiInbox';
import { FiLayers } from '@react-icons/all-files/fi/FiLayers';
import { FiStar } from '@react-icons/all-files/fi/FiStar';
import Link from 'components/Link/InternalLink';

interface Props {
  currentUser: SerializedUser;
  currentUrl: string;
  permissions: Permissions;
  paths: { [key: string]: string };
}

export default function MenuGroup({
  currentUser,
  currentUrl,
  permissions,
  paths,
}: Props) {
  return (
    <>
      {currentUser && <Nav.Group>Menu</Nav.Group>}
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
  );
}
