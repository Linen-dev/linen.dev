import { localStorage } from '@linen/utilities/storage';

export const isNotificationEnabled = (): boolean => {
  return (
    localStorage.get('notification.permission') === 'granted' &&
    window.Notification?.permission === 'granted'
  );
};

export const notify = (text: string): void => {
  if (window.Notification && isNotificationEnabled()) {
    new window.Notification('Linen Notification', {
      body: text,
    });
  }
};
