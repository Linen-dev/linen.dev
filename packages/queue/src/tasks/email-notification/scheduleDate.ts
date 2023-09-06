import { notificationType } from '@linen/types';

export function scheduleDate(type: notificationType) {
  switch (type) {
    // case notificationType.SIGNAL:
    //   return new Date(Date.now() + 1000 * 30); // 30 secs
    case notificationType.MENTION:
      return new Date(Date.now() + 1000 * 60 * 15); // 15m
    case notificationType.THREAD:
      return new Date(Date.now() + 1000 * 60 * 30); // 30m
    case notificationType.CHANNEL:
      return new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 1w
  }
}
