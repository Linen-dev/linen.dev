import { Permissions } from 'types/shared';

export default function createPermissions(
  options?: Partial<Permissions>
): Permissions {
  return {
    inbox: false,
    ...options,
  };
}
