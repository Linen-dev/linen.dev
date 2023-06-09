import React from 'react';
import PageLayout from 'components/layout/PageLayout';
import { buildChannelSeo } from 'utilities/seo';
import { SerializedChannel, ChannelProps } from '@linen/types';
import Grid from '@linen/ui/GridContent';
import { RowForBots } from './RowForBots';
import Row from '@linen/ui/Row';
import PaginationNumbers from '@linen/ui/PaginationNumbers';

export default function ChannelForBots({
  threads,
  settings,
  isSubDomainRouting,
  currentChannel,
  currentCommunity,
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
      dms={[]}
    >
      <ul className="divide-y w-full">
        <Grid
          currentChannel={currentChannel}
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
          onStar={() => {}}
          onReaction={() => {}}
          onDrop={() => {}}
          Row={RowForBots({ Row })}
        />
        <PaginationNumbers
          currentChannel={currentChannel}
          isSubDomainRouting={isSubDomainRouting}
          settings={settings}
          page={pathCursor ? Number(pathCursor) : null}
        />
      </ul>
    </PageLayout>
  );
}
