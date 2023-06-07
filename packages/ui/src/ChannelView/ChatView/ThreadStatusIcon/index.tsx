import React from 'react';
import { ThreadStatus } from '@linen/types';
import { FaVolumeMute } from '@react-icons/all-files/fa/FaVolumeMute';
import { BiMessageCheck } from '@react-icons/all-files/bi/BiMessageCheck';
import { FiInbox } from '@react-icons/all-files/fi/FiInbox';
import { FiClock } from '@react-icons/all-files/fi/FiClock';

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
    case ThreadStatus.REMINDER:
      return <FiClock />;
  }
}
