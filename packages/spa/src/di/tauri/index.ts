import { open } from '@tauri-apps/api/shell';
import { listen } from '@tauri-apps/api/event';
import { SerializedAccount } from '@linen/types';

export const openExternal = async (url: string) => {
  await open(url);
};

export const listenDeepLink = async (callback: (...args: any) => any) => {
  await listen('scheme-request-received', callback);
};

export const callbackUrl = () => 'linenapp://signin';

export const getHomeUrl = (community: SerializedAccount) =>
  `/s/${community.slackDomain || community.discordDomain}`;
