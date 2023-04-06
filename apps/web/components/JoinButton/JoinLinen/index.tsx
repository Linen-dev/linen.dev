import React from 'react';
import { useSession } from 'utilities/auth/react';
import Toast from '@linen/ui/Toast';
import { useJoinContext } from 'contexts/Join';
import Link from '../Link';

interface Props {
  fontColor: string;
  accountId: string;
}

export default function JoinLinen({ fontColor, accountId }: Props) {
  const { status } = useSession();
  const { startSignUp } = useJoinContext();

  const onClick = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (status === 'authenticated') {
      const res = await fetch('/api/invites/join-button', {
        method: 'post',
        body: JSON.stringify({
          communityId: accountId,
        }),
      });
      if (!res.ok) {
        Toast.info('Something went wrong, please try again');
      } else {
        Toast.success('Welcome aboard');
        window.location.href = window.location.href;
      }
    } else if (status === 'unauthenticated') {
      startSignUp?.({
        communityId: accountId,
      });
    }
  };

  if (status === 'loading') {
    return <div />;
  }

  return (
    <Link
      fontColor={fontColor}
      href="https://linen.dev/signup"
      onClick={onClick}
    >
      Join Linen
    </Link>
  );
}
