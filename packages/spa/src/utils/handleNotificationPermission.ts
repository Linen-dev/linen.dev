import { requestNotificationPermission } from '@/di';

export function handleNotificationPermission() {
  const isNotifyRequested = !!localStorage.getItem(
    'linen.tauri.permissionRequested'
  );
  if (!isNotifyRequested) {
    requestNotificationPermission();
  }
}
