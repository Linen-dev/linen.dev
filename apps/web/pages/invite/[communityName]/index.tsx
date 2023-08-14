import React from 'react';
import BlankLayout from '@linen/ui/BlankLayout';
import type { GetServerSideProps } from 'next/types';
import { prisma } from '@linen/database';
import styles from './index.module.scss';
import CommunityService from 'services/community';
import PermissionsService from 'services/permissions';
import Button from '@linen/ui/Button';
import Card from '@linen/ui/Card';
import Toast from '@linen/ui/Toast';
import CommunityCard from '@linen/ui/CommunityCard';
import { FiUsers } from '@react-icons/all-files/fi/FiUsers';
import { serializeAccount } from '@linen/serializers/account';
import { Permissions, SerializedAccount } from '@linen/types';
import { format as formatNumber } from '@linen/utilities/number';
import { api } from 'utilities/requests';
import { getHomeUrl } from '@linen/utilities/home';
import { useJoinContext } from 'contexts/Join';
import { trackPageView } from 'utilities/ssr-metrics';

interface Props {
  currentCommunity: SerializedAccount;
  membersCount: number;
  permissions: Permissions;
}

export default function InvitePage({
  currentCommunity,
  membersCount,
  permissions,
}: Props) {
  const { startSignUp } = useJoinContext();
  async function joinCommunity(
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) {
    event.preventDefault();
    event.stopPropagation();
    try {
      await api.joinCommunity({ communityId: currentCommunity.id });
      window.location.href = getHomeUrl(currentCommunity);
    } catch (error) {
      Toast.info('Something went wrong, please try again');
    }
  }

  return (
    <BlankLayout className={styles.container}>
      <CommunityCard
        className={styles.community}
        community={currentCommunity}
      />
      <Card className={styles.card}>
        <p>
          You&apos;re invited to be part of
          <br />
          <strong>{currentCommunity.name}</strong>
          <br />
          <span className={styles.count}>
            <FiUsers /> {formatNumber(membersCount)}
          </span>
        </p>
        {permissions.auth ? (
          <Button
            color="blue"
            size="md"
            block
            rounded="md"
            onClick={joinCommunity}
          >
            Join Community
          </Button>
        ) : (
          <Button
            color="blue"
            size="md"
            block
            rounded="md"
            onClick={() => {
              startSignUp({
                communityId: currentCommunity.id,
                redirectUrl: getHomeUrl(currentCommunity),
              });
            }}
          >
            Join Community
          </Button>
        )}
      </Card>
    </BlankLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const community = await CommunityService.find(context.params);
  // we could show a page that allows you to create a community with this name
  if (!community) {
    return { notFound: true };
  }

  // we could show a better page, e.g. saying that you need to contact the admin
  // directly so they can contact you
  if (community.type === 'PRIVATE') {
    return { notFound: true };
  }

  const membersCount = await prisma.users.count({
    where: { accountsId: community.id, authsId: { not: null } },
  });
  const permissions = await PermissionsService.for(context);
  await trackPageView(context, permissions.auth?.email);

  return {
    props: {
      currentCommunity: serializeAccount(community),
      membersCount,
      permissions,
    },
  };
};
