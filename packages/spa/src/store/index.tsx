import { create } from 'zustand';
import {
  SerializedAccount,
  SerializedChannel,
  Settings,
  Permissions,
  InboxProps,
  apiGetChannelProps,
  apiGetThreadProps,
  SerializedThread,
} from '@linen/types';
export { shallow } from 'zustand/shallow';

type inboxProps = InboxProps;

interface LinenState {
  currentCommunity: SerializedAccount | undefined;
  communities: SerializedAccount[];
  communityName: string | undefined;
  channelName: string | undefined;
  permissions: Permissions | undefined;
  settings: Settings | undefined;
  channels: SerializedChannel[];
  setChannels: (props: SerializedChannel[]) => void;
  dms: SerializedChannel[];
  channelProps:
    | Omit<apiGetChannelProps, 'channelName' | 'currentChannel' | 'threads'>
    | undefined;
  currentChannel: SerializedChannel | undefined;
  setChannelProps: (props: apiGetChannelProps) => void;
  threadProps: apiGetThreadProps | undefined;
  setThreadsProps: (props: apiGetThreadProps) => void;
  inboxProps: inboxProps | undefined;
  setInboxProps: (props: InboxProps, communityName: string) => void;
  setCommunities: (props: SerializedAccount[]) => void;
  setCurrentCommunity: (props: SerializedAccount) => void;
  threads: SerializedThread[];
  setThreads: (props: SerializedThread[]) => void;
}

export const useLinenStore = create<LinenState>()((set, get) => ({
  currentCommunity: undefined,
  communities: [],
  communityName: undefined,
  channelName: undefined,
  permissions: undefined,
  settings: undefined,
  channels: [],
  dms: [],
  threads: [],
  channelProps: undefined,
  currentChannel: undefined,
  setChannelProps: (channelProps) => {
    const { channelName, currentChannel, threads } = channelProps;
    set({ channelProps, channelName, currentChannel, threads });
  },
  threadProps: undefined,
  setThreadsProps: (threadProps) => {
    set({
      threadProps,
      channelName: threadProps.currentChannel.channelName,
    });
  },
  inboxProps: undefined,
  setInboxProps: (props, communityName) => {
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
      channelName: undefined,
    });
  },
  setCommunities: (props) => {
    set({ communities: props });
  },
  setCurrentCommunity: (props) => {
    set({ currentCommunity: props });
  },
  setChannels: (props) => {
    set({ channels: props });
  },
  setThreads: (props) => {
    set({ threads: props });
  },
}));
