import serializeAccount, { SerializedAccount } from 'serializers/account';
import prisma from 'client';
import { AccountType } from '@prisma/client';
import Layout from 'components/layout/CardLayout';
import H1 from 'components/H1';
import H2 from 'components/H2';
import Link from 'components/Link';
import List from 'components/List';

interface Props {
  communities: SerializedAccount[];
}

function getCommunityUrl(community: SerializedAccount) {
  if (community.premium && community.redirectDomain) {
    return `https://${community.redirectDomain}`;
  }
  if (community.discordDomain) {
    return `/d/${community.discordDomain}`;
  }
  if (community.slackDomain) {
    return `/s/${community.slackDomain}`;
  }
  return null;
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
            if (!href) {
              return null;
            }
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
      syncStatus: 'DONE',
      type: AccountType.PUBLIC,
      NOT: {
        name: null,
      },
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
