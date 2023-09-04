import { localStorage } from '@linen/utilities/storage';

export const isNotificationEnabled = (): boolean => {
  return (
    localStorage.get('notification.permission') === 'granted' &&
    window.Notification?.permission === 'granted'
  );
};

const defaultCallback = (callbackUrl: string) => {
  window.open(callbackUrl, '_self');
};

export const notify = (
  text: string,
  callbackUrl: string,
  callbackFn: (callbackUrl: string) => void = defaultCallback
): void => {
  console.log({ text, callbackUrl });
  if (window.Notification && isNotificationEnabled()) {
    const notification = new window.Notification('Linen Notification', {
      body: text,
    });
    if (!!callbackUrl) {
      notification.onclick = (event) => {
        event.preventDefault();
        callbackFn(callbackUrl);
      };
    }
  }
};
