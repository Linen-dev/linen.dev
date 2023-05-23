import { api } from '@/fetcher';
import { Permissions, StartSignUpProps } from '@linen/types';

export default function startSignUp({
  permissions,
  reload,
}: {
  permissions: Permissions;
  reload(): void;
}): (props: StartSignUpProps) => Promise<void> {
  return async ({ communityId, onSignIn }) => {
    // join community
    await api.joinCommunity({ communityId });
    // callback message send function
    await onSignIn?.run({
      ...onSignIn?.init,
      currentUser: permissions.auth,
      startSignUp: () => {},
    })?.(onSignIn?.params);
    reload();
  };
}
