import React from 'react';
import Toast from '@linen/ui/Toast';
import { useJoinContext } from 'contexts/Join';
import Link from '../Link';
import { FiLogIn } from '@react-icons/all-files/fi/FiLogIn';

interface Props {
  brandColor?: string;
  fontColor: string;
  accountId: string;
  status: 'authenticated' | 'loading' | 'unauthenticated';
}

export default function JoinLinen({
  brandColor,
  fontColor,
  accountId,
  status,
}: Props) {
  const { startSignUp } = useJoinContext();

  const showModal = async (
    event: React.MouseEvent<HTMLAnchorElement>,
    flow: 'signin' | 'signup'
  ) => {
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
        flow,
        communityId: accountId,
      });
    }
  };

  if (status === 'loading') {
    return <div />;
  }

  return (
    <>
      <Link
        lighter
        brandColor={brandColor}
        fontColor={fontColor}
        onClick={(event) => showModal(event, 'signin')}
      >
        Log in
      </Link>
      <Link
        brandColor={brandColor}
        fontColor={fontColor}
        onClick={(event) => showModal(event, 'signup')}
      >
        Sign up
      </Link>
    </>
  );
}
