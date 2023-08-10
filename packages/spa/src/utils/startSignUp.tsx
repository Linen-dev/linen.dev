import { api } from '@/fetcher';
import { Permissions, StartSignUpProps } from '@linen/types';

export default function startSignUp({
  permissions,
  reload,
}: {
  permissions: Permissions;
  reload(): void;
}): (props: StartSignUpProps) => Promise<void> {
  return async ({ communityId }) => {
    await api.joinCommunity({ communityId });
    reload();
  };
}
