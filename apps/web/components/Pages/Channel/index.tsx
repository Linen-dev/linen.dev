/* eslint-disable react-hooks/rules-of-hooks */
import {
  useEffect,
  useState,
  useLayoutEffect as useClientLayoutEffect,
} from 'react';
import PageLayout from 'components/layout/PageLayout';
import { buildChannelSeo } from 'utilities/seo';
import { SerializedThread, ChannelProps } from '@linen/types';
import { api } from 'utilities/requests';
import ChannelView from '@linen/ui/ChannelView';
import OnChannelDrop from '@linen/ui/OnChannelDrop';
import { useUsersContext } from '@linen/contexts/Users';
import { useRouter } from 'next/router';
import { useJoinContext } from 'contexts/Join';
import usePath from 'hooks/path';
import ChannelForBots from 'components/Bots/ChannelForBots';
import { playNotificationSound } from 'utilities/playNotificationSound';
import { scrollToBottom } from '@linen/utilities/scroll';

const useLayoutEffect =
  typeof window !== 'undefined' ? useClientLayoutEffect : () => {};

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
  const { startSignUp } = useJoinContext();
  const [allUsers] = useUsersContext();
  const [currentChannel, setCurrentChannel] = useState(initialChannel);
  const [threads, setThreads] = useState<SerializedThread[]>(initialThreads);

  useEffect(() => {
    setCurrentChannel(initialChannel);
  }, [initialChannel]);

  useLayoutEffect(() => {
    setThreads(initialThreads);

    const node = document.getElementById('sidebar-layout-left');
    if (node) {
      setTimeout(() => scrollToBottom(node), 0);
    }
  }, [initialThreads]);

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
      onDrop={OnChannelDrop({
        setThreads,
        currentCommunity,
        api,
        currentChannel,
        threads,
        allUsers,
      })}
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
        threads={threads}
        queryIntegration={router.query.integration}
        api={api}
        startSignUp={startSignUp}
        playNotificationSound={playNotificationSound}
        useUsersContext={useUsersContext}
        usePath={usePath}
        routerPush={router.push}
        selectedThreadId={getSelectedThreadId(initialThreads)}
      />
    </PageLayout>
  );
}

function getSelectedThreadId(initialThreads: SerializedThread[]) {
  if (typeof window !== 'undefined' && window.location.hash) {
    const hash = window.location.hash.split('#').join('');
    if (hash && initialThreads.map(({ id }) => id).includes(hash)) {
      return hash;
    }
  }
  return;
}
