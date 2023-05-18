/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from 'react';
import PageLayout from 'components/layout/PageLayout';
import { buildChannelSeo } from 'utilities/seo';
import { SerializedThread, SerializedUser, ChannelProps } from '@linen/types';
import { api } from 'utilities/requests';
import ChannelView from '@linen/ui/ChannelView';
import { createThreadImitation } from '@linen/serializers/thread';
import { useUsersContext } from '@linen/contexts/Users';
import { useRouter } from 'next/router';
import Pagination from 'components/Pagination';
import { useJoinContext } from 'contexts/Join';
import usePath from 'hooks/path';
import ChannelForBots from 'components/Bots/ChannelForBots';
import { playNotificationSound } from 'utilities/playNotificationSound';

export default function Channel(props: ChannelProps) {
  if (props.isBot) {
    return <ChannelForBots {...props} />;
  }
  const {
    threads: initialThreads,
    channels,
    communities,
    currentChannel: initialChannel,
    currentCommunity,
    settings,
    isSubDomainRouting,
    pathCursor,
    permissions,
    dms,
  } = props;

  const router = useRouter();

  const [allUsers] = useUsersContext();
  const [currentChannel, setCurrentChannel] = useState(initialChannel);
  const [threads, setThreads] = useState<SerializedThread[]>(initialThreads);

  useEffect(() => {
    setCurrentChannel(initialChannel);
  }, [initialChannel]);

  function onChannelDrop({
    source,
    target,
    from,
    to,
  }: {
    source: string;
    target: string;
    from: string;
    to: string;
  }) {
    if (source === 'thread' && target === 'channel') {
      return moveThreadToChannel({ threadId: from, channelId: to });
    } else if (source === 'message' && target === 'channel') {
      return moveMessageToChannel({ messageId: from, channelId: to });
    }
  }

  const moveThreadToChannel = ({
    threadId,
    channelId,
  }: {
    threadId: string;
    channelId: string;
  }) => {
    setThreads((threads) => {
      return threads.filter((thread) => {
        if (thread.id === threadId && thread.channelId !== channelId) {
          return false;
        }
        return true;
      });
    });

    return api.moveThreadToChannelRequest({
      threadId,
      channelId,
      communityId: currentCommunity.id,
    });
  };

  const moveMessageToChannel = ({
    messageId,
    channelId,
  }: {
    messageId: string;
    channelId: string;
  }) => {
    const messages = [...threads.map((thread) => thread.messages)].flat();
    const message = messages.find(({ id }) => id === messageId);
    if (!message) {
      return;
    }
    const imitation =
      currentChannel.id === channelId &&
      createThreadImitation({
        message: message.body,
        files: message.attachments.map((attachment) => {
          return {
            id: attachment.name,
            url: attachment.url,
          };
        }),
        author: message.author as SerializedUser,
        mentions: allUsers,
        channel: currentChannel,
      });

    setThreads((threads) => {
      const result = threads.map((thread) => {
        const ids = thread.messages.map(({ id }) => id);
        if (ids.includes(messageId)) {
          return {
            ...thread,
            messages: thread.messages.filter(({ id }) => id !== messageId),
          };
        }

        return thread;
      });

      if (imitation) {
        return [...result, imitation];
      }

      return result;
    });

    return api
      .moveMessageToChannelRequest({
        messageId,
        channelId,
        communityId: currentCommunity.id,
      })
      .then((thread: SerializedThread) => {
        setThreads((threads) => {
          if (imitation) {
            return threads.map((current) => {
              if (current.id === imitation.id) {
                return thread;
              }
              return current;
            });
          }
          return threads;
        });
      });
  };

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
      channels={channels}
      dms={dms}
      communities={communities}
      currentCommunity={currentCommunity}
      settings={settings}
      isSubDomainRouting={isSubDomainRouting}
      permissions={permissions}
      onDrop={onChannelDrop}
    >
      <ChannelView
        channelName={props.channelName}
        currentChannel={props.currentChannel}
        currentCommunity={props.currentCommunity}
        isBot={props.isBot}
        isSubDomainRouting={props.isSubDomainRouting}
        nextCursor={props.nextCursor}
        pathCursor={props.pathCursor}
        permissions={props.permissions}
        pinnedThreads={props.pinnedThreads}
        settings={props.settings}
        threads={props.threads}
        queryIntegration={router.query.integration}
        api={api}
        Pagination={Pagination}
        useJoinContext={useJoinContext}
        playNotificationSound={playNotificationSound}
        useUsersContext={useUsersContext}
        usePath={usePath}
        routerPush={router.push}
      />
    </PageLayout>
  );
}
