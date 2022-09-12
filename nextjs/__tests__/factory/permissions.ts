import { Permissions } from 'types/shared';

export default function createPermissions(
  options?: Partial<Permissions>
): Permissions {
  return {
    access: false,
    feed: false,
    ...options,
  };
}
