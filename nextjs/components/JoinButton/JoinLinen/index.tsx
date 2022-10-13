import LinenIcon from 'components/icons/LinenIcon';
import classNames from 'classnames';
import styles from './index.module.css';
import { useSession } from 'next-auth/react';
import { toast } from 'components/Toast';
import { useJoinContext } from 'contexts/Join';
import { Permissions } from 'types/shared';

import { signOut } from 'next-auth/react';

export default function JoinLinen({
  accountId,
  permissions,
}: {
  accountId?: string;
  permissions?: Permissions;
}) {
  const { data, status } = useSession();
  const { startSignUp } = useJoinContext();

  const onClick = async () => {
    if (status === 'authenticated') {
      const res = await fetch('/api/invites/join-button', {
        method: 'post',
        body: JSON.stringify({
          communityId: accountId,
        }),
      });
      if (!res.ok) {
        toast.info('Something went wrong, please try again');
      } else {
        toast.success('Welcome aboard');
        window.location.href = window.location.href;
      }
    } else if (status === 'unauthenticated') {
      accountId &&
        startSignUp?.({
          communityId: accountId,
        });
    }
  };

  if (status === 'loading') {
    return <div />;
  }

  // if (permissions?.is_member) {
  //   return (
  //     <a
  //       className={classNames(
  //         styles.button,
  //         'shadow-md text-sm font-medium rounded-md text-blue-500',
  //         'cursor-pointer'
  //       )}
  //       onClick={() => signOut()}
  //     >
  //       <LinenIcon className={styles.icon} />
  //       <span>Sign out</span>
  //     </a>
  //   );
  // }

  return (
    <a
      className={classNames(
        styles.button,
        'shadow-md text-sm font-medium rounded-md text-blue-500',
        'cursor-pointer'
      )}
      onClick={onClick}
    >
      <LinenIcon className={styles.icon} />
      <span className="hidden sm:inline">Join the conversation</span>
      <span className="sm:hidden inline">Join Linen</span>
    </a>
  );
}
