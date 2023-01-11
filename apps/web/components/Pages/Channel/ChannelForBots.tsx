import React from 'react';
import Grid from './Content/Grid';
import { ChannelProps } from '.';
import PageLayout from 'components/layout/PageLayout';
import { buildChannelSeo } from 'utilities/seo';
import { SerializedChannel, Settings } from '@linen/types';
import ButtonPagination from 'components/ButtonPagination';
import CustomLinkHelper from 'components/Link/CustomLinkHelper';

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
        <PaginationForBots
          {...{ currentChannel, isSubDomainRouting, settings }}
        />
      </ul>
    </PageLayout>
  );
}

function PaginationForBots({
  currentChannel,
  isSubDomainRouting,
  settings,
}: {
  currentChannel: SerializedChannel;
  isSubDomainRouting: boolean;
  settings: Settings;
}) {
  return (
    <>
      {currentChannel && currentChannel.pages ? (
        <div className="text-center p-4">
          {Array.from(Array(currentChannel.pages).keys()).map((page) => {
            return (
              <ButtonPagination
                key={page + 1}
                href={CustomLinkHelper({
                  isSubDomainRouting,
                  communityName: settings.communityName,
                  communityType: settings.communityType,
                  path: `/c/${currentChannel.channelName}/${
                    currentChannel.pages! - page
                  }`,
                })}
                label={String(currentChannel.pages! - page)}
              />
            );
          })}
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
