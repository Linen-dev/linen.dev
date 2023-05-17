import React from 'react';
import Example from '../Example';
import Nav from '@/Nav';
import { FiInbox } from '@react-icons/all-files/fi/FiInbox';
import { FiHash } from '@react-icons/all-files/fi/FiHash';
import { FiBarChart } from '@react-icons/all-files/fi/FiBarChart';
import { FiPlus } from '@react-icons/all-files/fi/FiPlus';
import { FiMenu } from '@react-icons/all-files/fi/FiMenu';

export default function NavExample() {
  return (
    <Example header="Nav">
      <Nav>
        <Nav.Item>
          <FiInbox /> Inbox
        </Nav.Item>
        <Nav.Item>
          <FiBarChart />
          Metrics
        </Nav.Item>
        <Nav.Label>
          Channels <FiPlus />
        </Nav.Label>
        <Nav.Item active>
          <FiHash /> general
        </Nav.Item>
        <Nav.Item highlighted>
          <FiHash /> ideas
        </Nav.Item>
        <Nav.Label>
          Settings <FiMenu />
        </Nav.Label>
      </Nav>
    </Example>
  );
}
