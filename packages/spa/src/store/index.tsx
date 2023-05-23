import { create } from 'zustand';
import {
  SerializedAccount,
  SerializedChannel,
  Settings,
  Permissions,
  InboxProps,
  apiGetChannelProps,
  apiGetThreadProps,
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
  dms: SerializedChannel[];
  channelProps: apiGetChannelProps | undefined;
  setChannelProps: (props: apiGetChannelProps) => void;
  threadProps: apiGetThreadProps | undefined;
  setThreadsProps: (props: apiGetThreadProps) => void;
  inboxProps: inboxProps | undefined;
  setInboxProps: (props: InboxProps, communityName: string) => void;
  setCommunities: (props: SerializedAccount[]) => void;
  setChannels: (props: SerializedChannel[]) => void;
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
  channelProps: undefined,
  setChannelProps: (channelProps: apiGetChannelProps) => {
    const { channelName } = channelProps;
    set({ channelProps, channelName });
  },
  threadProps: undefined,
  setThreadsProps: (threadProps: apiGetThreadProps) => {
    set({
      threadProps,
      channelName: threadProps.currentChannel.channelName,
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
      channelName: undefined,
    });
  },
  setCommunities: (props) => {
    set({ communities: props });
  },
  setChannels: (props) => {
    set({ channels: props });
  },
}));
