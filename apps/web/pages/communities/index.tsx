import React, { useState } from 'react';
import Link from 'next/link';
import Container from '@linen/ui/Container';
import TextInput from '@linen/ui/TextInput';
import styles from './index.module.scss';
import { FiSearch } from '@react-icons/all-files/fi/FiSearch';
import { serializeAccount } from '@linen/serializers/account';
import { SerializedAccount } from '@linen/types';
import { trackPageView } from 'utilities/ssr-metrics';
import CommunityCard from '@linen/ui/CommunityCard';
import { getHomeUrl } from '@linen/utilities/home';
import { getCommunitiesWithDescription } from 'services/accounts';

interface Props {
  communities: SerializedAccount[];
}

function CommunitiesList({
  communities,
  query,
}: {
  communities: SerializedAccount[];
  query: string;
}) {
  return (
    <div className={styles.cards}>
      {communities
        .filter((community) => {
          // naive way to filter out test communities created by users
          if (community.name?.toLowerCase()?.includes('test')) {
            return false;
          }

          if (!community.description) {
            return false;
          }

          if (getHomeUrl(community) === '/') {
            return false;
          }

          if (query) {
            return (
              community.name?.toLowerCase().includes(query.toLowerCase()) ||
              community.description?.toLowerCase().includes(query.toLowerCase())
            );
          }
          return true;
        })
        .map((community, index) => {
          return (
            <CommunityCard
              key={
                community.name
                  ? `${community.name}-${index}`
                  : `community-${index}`
              }
              community={community}
            />
          );
        })}
    </div>
  );
}

export default function Communities({ communities }: Props) {
  const [query, setQuery] = useState('');
  const communitiesWithLogo = communities.filter(
    (community) => community.logoUrl
  );
  const communitiesWithoutLogo = communities.filter(
    (community) => !community.logoUrl
  );
  return (
    <>
      <header className={styles.header}>
        <Container>
          <div className={styles.nav}>
            <Link href="/">
              <div className={styles.logo} />
            </Link>
            <ul>
              <li>
                <Link href="/signin">Sign In</Link>
              </li>
              <li>
                <Link href="/signup">Sign Up</Link>
              </li>
            </ul>
          </div>
        </Container>
      </header>
      <main className={styles.main}>
        <Container>
          <div className={styles.banner}>
            <h1 className={styles.h1}>
              Find Your <span className={styles.underscore}>Community</span>
            </h1>
            <div className={styles.search}>
              <TextInput
                id="communities-search"
                icon={<FiSearch />}
                placeholder="Search"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setQuery(event.target.value)
                }
                size="lg"
                rounded="full"
              />
            </div>
          </div>
          <CommunitiesList communities={communitiesWithLogo} query={query} />
          <CommunitiesList communities={communitiesWithoutLogo} query={query} />
        </Container>
      </main>
    </>
  );
}

export async function getServerSideProps(context: any) {
  const track = trackPageView(context);

  const communities = await getCommunitiesWithDescription();
  await track.flush();
  return {
    props: {
      communities: communities.map(serializeAccount),
    },
  };
}
