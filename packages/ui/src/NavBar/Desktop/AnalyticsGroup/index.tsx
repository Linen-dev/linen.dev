import React, { useState } from 'react';
import Nav from '@/Nav';
import { Permissions, SerializedUser } from '@linen/types';
import { FiBarChart } from '@react-icons/all-files/fi/FiBarChart';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';

interface Props {
  currentUser: SerializedUser;
  currentUrl: string;
  permissions: Permissions;
  paths: { [key: string]: string };
  Link: (args: any) => JSX.Element;
}

export default function AnalyticsGroup({
  currentUser,
  currentUrl,
  permissions,
  paths,
  Link,
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
