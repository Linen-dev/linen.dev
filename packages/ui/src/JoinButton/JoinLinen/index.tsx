import React from 'react';
import Toast from '@/Toast';
import Link from '../Link';
import type { ApiClient } from '@linen/api-client';

interface Props {
  brandColor?: string;
  fontColor: string;
  accountId: string;
  status: 'authenticated' | 'loading' | 'unauthenticated';
  startSignUp?: (props: any) => Promise<void>;
  reload(): void;
  api: ApiClient;
}

export default function JoinLinen({
  brandColor,
  fontColor,
  accountId,
  status,
  startSignUp,
  reload,
  api,
}: Props) {
  const showModal = async (
    event: React.MouseEvent<HTMLAnchorElement>,
    flow: 'signin' | 'signup'
  ) => {
    event.preventDefault();
    event.stopPropagation();
    startSignUp?.({
      flow,
      communityId: accountId,
    });
  };

  async function joinCommunity(
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) {
    event.preventDefault();
    event.stopPropagation();
    try {
      await api.joinCommunity({ communityId: accountId });
      Toast.success('Welcome aboard');
      reload();
    } catch (error) {
      Toast.info('Something went wrong, please try again');
    }
  }

  if (status === 'loading') {
    return <div />;
  }

  if (status === 'authenticated') {
    return (
      <Link
        lighter
        brandColor={brandColor}
        fontColor={fontColor}
        onClick={joinCommunity}
      >
        Join Community
      </Link>
    );
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
