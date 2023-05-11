import React, { useState } from 'react';
import Link from 'next/link';
import Container from '@linen/ui/Container';
import TextInput from '@linen/ui/TextInput';
import styles from './index.module.scss';
import { AiOutlineSearch } from '@react-icons/all-files/ai/AiOutlineSearch';
import { serializeAccount } from '@linen/serializers/account';
import { SerializedAccount } from '@linen/types';
import { trackPageView } from 'utilities/ssr-metrics';
import CommunityCard from '@linen/ui/CommunityCard';
import { getHomeUrl } from '@linen/utilities/home';
import { getCommunitiesWithDescription } from 'services/accounts';

interface Props {
  communities: SerializedAccount[];
}

export default function Communities({ communities }: Props) {
  const [query, setQuery] = useState('');
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
              Find your <span className={styles.underscore}>community</span>.
            </h1>
            <div className={styles.search}>
              <TextInput
                id="communities-search"
                icon={<AiOutlineSearch />}
                placeholder="Search"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setQuery(event.target.value)
                }
              />
            </div>
          </div>
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
                    community.name
                      ?.toLowerCase()
                      .includes(query.toLowerCase()) ||
                    community.description
                      ?.toLowerCase()
                      .includes(query.toLowerCase())
                  );
                }
                return true;
              })
              .sort((community) => {
                if (
                  community.description ||
                  community.logoSquareUrl ||
                  community.brandColor !== '#000000'
                ) {
                  return -1;
                }
                return 1;
              })
              .sort((community) => {
                return community.premium ? -1 : 1;
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
