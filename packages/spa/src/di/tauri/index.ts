import { open } from '@tauri-apps/api/shell';
import { listen } from '@tauri-apps/api/event';
import {
  isPermissionGranted,
  requestPermission,
  sendNotification as tauriSendNotification,
} from '@tauri-apps/api/notification';
import { SerializedAccount } from '@linen/types';
import { playNotificationSound } from '../../utils/playNotificationSound';

export const openExternal = async (url: string) => {
  await open(url);
};

export const listenDeepLink = async (callback: (...args: any) => any) => {
  await listen('scheme-request-received', callback);
};

export const callbackUrl = () => 'linenapp://signin';

export const getHomeUrl = (community: SerializedAccount) =>
  `/s/${community.slackDomain || community.discordDomain}`;

export const requestNotificationPermission = async () => {
  let permissionGranted = await isPermissionGranted();
  if (!permissionGranted) {
    const permission = await requestPermission();
    permissionGranted = permission === 'granted';
    localStorage.setItem(
      'linen.tauri.permissionRequested',
      String(permissionGranted)
    );
  }
};

export const sendNotification = async (
  body: string,
  title: string = 'Linen.dev'
) => {
  let permissionGranted = await isPermissionGranted();
  if (permissionGranted) {
    tauriSendNotification({ title, body });
    playNotificationSound(0.2);
  }
};
