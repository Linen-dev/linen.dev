import { notificationType } from '@linen/types';

export function scheduleDate(type: notificationType) {
  switch (type) {
    case notificationType.BANG_CHANNEL:
      return new Date(Date.now() + 1000 * 30); // 30 secs
    case notificationType.AT_CHANNEL:
    case notificationType.MENTION:
      return new Date(Date.now() + 1000 * 60 * 5); // 5m
    case notificationType.THREAD:
      return new Date(Date.now() + 1000 * 60 * 30); // 30m
    case notificationType.CHANNEL:
      return new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 1w
  }
}
