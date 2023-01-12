import React from 'react';
import Grid from './Content/Grid';
import { ChannelProps } from '.';
import PageLayout from 'components/layout/PageLayout';
import { buildChannelSeo } from 'utilities/seo';
import { SerializedChannel } from '@linen/types';

export default function ChannelForBots({
  threads,
  settings,
  isSubDomainRouting,
  currentChannel,
  channelName,
  pathCursor,
  channels,
  isBot,
  permissions,
}: ChannelProps) {
  return (
    <PageLayout
      currentChannel={currentChannel}
      seo={{
        ...buildChannelSeo({
          settings,
          channelName,
          isSubDomainRouting,
          pathCursor,
          threads,
        }),
      }}
      channels={channels as SerializedChannel[]}
      communities={[]}
      settings={settings}
      isSubDomainRouting={isSubDomainRouting}
      permissions={permissions}
      onDrop={() => {}}
    >
      <ul className="divide-y w-full">
        <Grid
          threads={threads}
          permissions={permissions}
          isSubDomainRouting={isSubDomainRouting}
          settings={settings}
          isBot={isBot}
          mode={undefined}
          currentUser={null}
          onClick={() => {}}
          onPin={() => {}}
          onReaction={() => {}}
          onDrop={() => {}}
        />
      </ul>
    </PageLayout>
  );
}
