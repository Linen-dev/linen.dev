import React, { useState } from 'react';
import Link from 'next/link';
import Container from '@linen/ui/Container';
import TextInput from '@linen/ui/TextInput';
import styles from './index.module.scss';
import logo from 'public/images/logo/linen.svg';
import { AiOutlineSearch } from '@react-icons/all-files/ai/AiOutlineSearch';
import serializeAccount from 'serializers/account';
import { prisma } from '@linen/database';
import {
  AccountIntegration,
  AccountType,
  SerializedAccount,
} from '@linen/types';
import { truncate } from '@linen/utilities/string';
import { getHomeUrl } from 'utilities/home';
import { trackPageView } from 'utilities/ssr-metrics';
import CommunityLink from 'components/NavBar/Desktop/CommunityLink';

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
              <img className={styles.image} height={64} src={logo.src} />
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
                  <Link
                    key={
                      community.name
                        ? `${community.name}-${index}`
                        : `community-${index}`
                    }
                    href={getHomeUrl(community)}
                    className={styles.card}
                  >
                    <CommunityLink community={community} />
                    <div className={styles.content}>
                      <h2>{community.name}</h2>
                      {community.description && (
                        <p>{truncate(community.description, 160)}</p>
                      )}
                    </div>
                  </Link>
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

  const communities = await prisma.accounts.findMany({
    where: {
      type: AccountType.PUBLIC,
      channels: {
        some: {
          threads: {
            some: {
              messages: {
                some: {},
              },
            },
          },
        },
      },
      users: {
        some: {},
      },
      NOT: {
        name: null,
      },
      OR: [{ syncStatus: 'DONE' }, { integration: AccountIntegration.NONE }],
    },
    orderBy: {
      name: 'asc',
    },
  });
  await track.flush();
  return {
    props: {
      communities: communities.map(serializeAccount),
    },
  };
}
