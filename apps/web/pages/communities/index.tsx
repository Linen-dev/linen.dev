import React, { useState } from 'react';
import Link from 'next/link';
import { Container, TextInput } from '@linen/ui';
import styles from './index.module.scss';
import logo from 'public/images/logo/linen.svg';
import { AiOutlineSearch } from 'react-icons/ai';
import serializeAccount from 'serializers/account';
import prisma from 'client';
import {
  AccountIntegration,
  AccountType,
  SerializedAccount,
} from '@linen/types';
import { truncate } from '@linen/utilities/string';
import { pickTextColorBasedOnBgColor } from 'utilities/colors';
import { getHomeUrl } from 'utilities/home';

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
                <Link href="/signin">Sign Up</Link>
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
                    style={{
                      background: community.brandColor || '#fff',
                      color: pickTextColorBasedOnBgColor(
                        community.brandColor || '#fff',
                        'white',
                        'black'
                      ),
                    }}
                  >
                    {community.logoSquareUrl && (
                      <img
                        width={36}
                        height={36}
                        src={community.logoSquareUrl}
                      />
                    )}
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
