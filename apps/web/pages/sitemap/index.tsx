import serializeAccount from 'serializers/account';
import { prisma } from '@linen/database';
import {
  AccountIntegration,
  AccountType,
  SerializedAccount,
} from '@linen/types';
import Layout from 'components/layout/CardLayout';
import H1 from 'components/H1';
import H2 from 'components/H2';
import Link from 'components/Link';
import List from '@linen/ui/List';

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

export async function getServerSideProps() {
  const communities = await prisma.accounts.findMany({
    where: {
      type: AccountType.PUBLIC,
      NOT: {
        name: null,
      },
      OR: [{ syncStatus: 'DONE' }, { integration: AccountIntegration.NONE }],
    },
    orderBy: {
      name: 'asc',
    },
  });

  return {
    props: {
      communities: communities.map(serializeAccount),
    },
  };
}
