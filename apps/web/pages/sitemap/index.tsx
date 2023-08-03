import { serializeAccount } from '@linen/serializers/account';
import { SerializedAccount } from '@linen/types';
import Layout from '@linen/ui/CardLayout';
import H1 from '@linen/ui/H1';
import H2 from '@linen/ui/H2';
import Link from 'components/Link';
import List from '@linen/ui/List';
import { getCommunitiesWithName } from 'services/accounts';
import type { GetServerSideProps } from 'next/types';
import { trackPageView } from 'utilities/ssr-metrics';

interface Props {
  communities: SerializedAccount[];
}

function getCommunityUrl(community: SerializedAccount) {
  if (community.premium && community.redirectDomain) {
    return `https://${community.redirectDomain}`;
  }
  if (community.discordDomain) {
    return `/d/${encodeURIComponent(community.discordDomain)}`;
  }
  if (community.slackDomain) {
    return `/s/${encodeURIComponent(community.slackDomain)}`;
  }
}

export default function Sitemap({ communities }: Props) {
  return (
    <Layout>
      <H1>linen.dev sitemap</H1>
      <H2>Communities</H2>
      <List>
        {communities
          .map((community) => {
            const href = getCommunityUrl(community);
            if (!href) return <></>;
            return (
              <li key={href}>
                <Link href={href}>{community.name}</Link>
              </li>
            );
          })
          .filter(Boolean)}
      </List>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const communities = await getCommunitiesWithName();
  await trackPageView(context);
  return {
    props: {
      communities: communities.map(serializeAccount),
    },
  };
};
