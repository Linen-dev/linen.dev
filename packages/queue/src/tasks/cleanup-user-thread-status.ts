import UserThreadStatusService from '@linen/web/services/user-thread-status';

export async function cleanupUserThreadStatusTask() {
  await UserThreadStatusService.cleanup();
}
