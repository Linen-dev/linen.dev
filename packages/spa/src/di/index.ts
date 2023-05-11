import { SerializedAccount } from '@linen/types';

let openExternal: (url: string) => void;
let listenDeepLink: (callback: (...args: any) => any) => Promise<void>;
let callbackUrl: () => string;
let getHomeUrl: (community: SerializedAccount) => string;
let requestNotificationPermission: () => void;
let sendNotification: (body: string, title?: string) => Promise<void>;

const isProd = () => process.env.NODE_ENV === 'production';
const isTauri = () => !!Object.keys((window as any).__TAURI__ || {}).length;

if (isProd() && isTauri()) {
  const tauri = require('./tauri');
  openExternal = tauri.openExternal;
  listenDeepLink = tauri.listenDeepLink;
  callbackUrl = tauri.callbackUrl;
  getHomeUrl = tauri.getHomeUrl;
  requestNotificationPermission = tauri.requestNotificationPermission;
  sendNotification = tauri.sendNotification;
} else {
  const web = require('./web');
  openExternal = web.openExternal;
  listenDeepLink = web.listenDeepLink;
  callbackUrl = web.callbackUrl;
  getHomeUrl = web.getHomeUrl;
  requestNotificationPermission = web.requestNotificationPermission;
  sendNotification = web.sendNotification;
}

export {
  openExternal,
  listenDeepLink,
  callbackUrl,
  getHomeUrl,
  requestNotificationPermission,
  sendNotification,
};
