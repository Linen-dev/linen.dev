import React, { useState } from 'react';
import { Nav } from '@linen/ui';
import { Permissions, SerializedUser } from '@linen/types';
import Link from 'components/Link/InternalLink';
import { FiBarChart } from '@react-icons/all-files/fi/FiBarChart';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';

interface Props {
  currentUser: SerializedUser;
  currentUrl: string;
  permissions: Permissions;
  paths: { [key: string]: string };
}

export default function AnalyticsGroup({
  currentUser,
  currentUrl,
  permissions,
  paths,
}: Props) {
  const [show, toggle] = useState(false);
  if (!currentUser || !permissions.manage) {
    return null;
  }
  return (
    <>
      <Nav.Group onClick={() => toggle((show) => !show)}>
        Analytics {show ? <FiChevronUp /> : <FiChevronDown />}
      </Nav.Group>
      {show && (
        <Link href="/metrics">
          <Nav.Item active={paths.metrics === currentUrl}>
            <FiBarChart /> Metrics
          </Nav.Item>
        </Link>
      )}
    </>
  );
}
