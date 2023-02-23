import React from 'react';
import Grid from '../Content/Grid';
import { ChannelProps } from '..';
import PageLayout from 'components/layout/PageLayout';
import { buildChannelSeo } from 'utilities/seo';
import { SerializedChannel } from '@linen/types';
import { PaginationForBots } from './PaginationForBots';

export default function ChannelForBots({
  threads,
  settings,
  isSubDomainRouting,
  currentChannel,
  currentCommunity,
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
          currentChannel,
          isSubDomainRouting,
          pathCursor,
          currentCommunity,
        }),
      }}
      channels={channels as SerializedChannel[]}
      communities={[]}
      settings={settings}
      isSubDomainRouting={isSubDomainRouting}
      currentCommunity={currentCommunity}
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
          onDelete={() => {}}
          onClick={() => {}}
          onPin={() => {}}
          onReaction={() => {}}
          onDrop={() => {}}
        />
        <PaginationForBots
          {...{
            currentChannel,
            isSubDomainRouting,
            settings,
            page: pathCursor ? Number(pathCursor) : null,
          }}
        />
      </ul>
    </PageLayout>
  );
}
