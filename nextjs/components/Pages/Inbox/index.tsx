import React, { useState } from 'react';
import PageLayout from 'components/layout/PageLayout';
import { channels, ThreadState } from '@prisma/client';
import { Settings } from 'serializers/account/settings';
import { Permissions } from 'types/shared';
import { create as factory } from '__tests__/factory';
import Header from './Header';
import Filters from './Filters';
import Grid from './Grid';

interface Props {
  channels: channels[];
  communityName: string;
  isSubDomainRouting: boolean;
  permissions: Permissions;
  settings: Settings;
}

const threads = [
  factory('thread', {
    title: 'Super new thread',
    messages: [factory('message', { body: 'This thread looks great' })],
    state: ThreadState.OPEN,
  }),
  factory('thread', {
    title: 'Linen is great',
    messages: [factory('message')],
    state: ThreadState.OPEN,
  }),
  factory('thread', {
    title: null,
    messages: [factory('message')],
    state: ThreadState.OPEN,
  }),
  factory('thread', {
    title: 'How can I add a new migration?',
    messages: [factory('message')],
    state: ThreadState.CLOSE,
  }),
  factory('thread', {
    title: null,
    messages: [factory('message')],
    state: ThreadState.CLOSE,
  }),
];

export default function Inbox({
  channels,
  communityName,
  isSubDomainRouting,
  permissions,
  settings,
}: Props) {
  const [state, setState] = useState<ThreadState>(ThreadState.OPEN);
  return (
    <PageLayout
      channels={channels}
      communityName={communityName}
      isSubDomainRouting={isSubDomainRouting}
      permissions={permissions}
      settings={settings}
      className="block w-full"
    >
      <Header />
      <Filters
        state={state}
        onChange={(type: string, value: ThreadState) => {
          switch (type) {
            case 'state':
              setState(value);
          }
        }}
      />
      <Grid state={state} threads={threads} />
    </PageLayout>
  );
}
