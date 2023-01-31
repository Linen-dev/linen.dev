import React from 'react';
import { ThreadStatus } from '@linen/types';
import { FaVolumeMute } from 'react-icons/fa';
import { BiMessageCheck } from 'react-icons/bi';
import { FiInbox } from 'react-icons/fi';

interface Props {
  status: ThreadStatus;
}

export default function ThreadStatusIcon({ status }: Props) {
  switch (status) {
    case ThreadStatus.UNREAD:
      return <FiInbox />;
    case ThreadStatus.READ:
      return <BiMessageCheck />;
    case ThreadStatus.MUTED:
      return <FaVolumeMute />;
  }
}
