import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  SerializedAccount,
  SerializedChannel,
  Settings,
  Permissions,
  ChannelProps,
  ThreadProps,
  InboxProps,
} from '@linen/types';
export { shallow } from 'zustand/shallow';

type threadProps = Pick<
  ThreadProps,
  'currentChannel' | 'isBot' | 'isSubDomainRouting' | 'thread' | 'threadUrl'
>;

type channelProps = Pick<
  ChannelProps,
  | 'currentChannel'
  | 'isBot'
  | 'isSubDomainRouting'
  | 'nextCursor'
  | 'pathCursor'
  | 'pinnedThreads'
  | 'threads'
>;

type inboxProps = InboxProps;

interface LinenState {
  currentCommunity: SerializedAccount | undefined;
  communities: SerializedAccount[];
  communityName: string | undefined;
  channelName: string | undefined;
  permissions: Permissions | undefined;
  settings: Settings | undefined;
  channels: SerializedChannel[];
  dms: SerializedChannel[];
  channelProps: channelProps | undefined;
  setChannelProps: (props: ChannelProps, communityName: string) => void;
  threadProps: threadProps | undefined;
  setThreadsProps: (props: ThreadProps, communityName: string) => void;
  inboxProps: inboxProps | undefined;
  setInboxProps: (props: InboxProps, communityName: string) => void;
}

export const useLinenStore = create<LinenState>()(
  persist(
    (set, get) => ({
      currentCommunity: undefined,
      communities: [],
      communityName: undefined,
      channelName: undefined,
      permissions: undefined,
      settings: undefined,
      channels: [],
      dms: [],
      channelProps: undefined,
      setChannelProps: (props: ChannelProps, communityName: string) => {
        const {
          channels,
          channelName,
          permissions,
          currentCommunity,
          settings,
          communities,
          dms,
          ...channelProps
        } = props;
        set({
          channelProps,
          channelName,
          communityName,
          permissions,
          channels,
          currentCommunity,
          settings,
          dms,
          communities,
        });
      },
      threadProps: undefined,
      setThreadsProps: (props: ThreadProps, communityName: string) => {
        const {
          channels,
          permissions,
          currentCommunity,
          settings,
          communities,
          dms,
          ...threadProps
        } = props;
        set({
          threadProps,
          channels,
          permissions,
          currentCommunity,
          settings,
          communities,
          dms,
          channelName: props.currentChannel.channelName,
          communityName,
        });
      },
      inboxProps: undefined,
      setInboxProps: (props: InboxProps, communityName: string) => {
        const {
          channels,
          permissions,
          currentCommunity,
          settings,
          communities,
          dms,
        } = props;
        set({
          channels,
          permissions,
          currentCommunity,
          settings,
          communities,
          dms,
          communityName,
          inboxProps: props,
        });
      },
    }),
    {
      name: 'linen-store',
    }
  )
);
