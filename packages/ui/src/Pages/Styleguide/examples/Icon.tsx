import React from 'react';
import Example from '../Example';
import Icon from '@/Icon';
import { FiEdit3 } from '@react-icons/all-files/fi/FiEdit3';
import { FiMoreVertical } from '@react-icons/all-files/fi/FiMoreVertical';

export default function IconExample() {
  return (
    <Example header="Icon" inline>
      <Icon>
        <FiEdit3 />
      </Icon>
      <Icon>
        <FiMoreVertical />
      </Icon>
    </Example>
  );
}
