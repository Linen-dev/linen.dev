import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  InstantSearch,
  Pagination,
  Stats,
  useInstantSearch,
} from 'react-instantsearch';
import styles from './index.module.scss';
import { SearchBox } from './SearchBox';
import { Hits } from './Hits';
import Modal from '@/Modal';
import TextInput from '@/TextInput';
import { FiSearch } from '@react-icons/all-files/fi/FiSearch';
import { FiX } from '@react-icons/all-files/fi/FiX';
import Icon from '@/Icon';
import { Settings } from '@linen/types';

export function TypesenseSearch({
  apiKey,
  indexName = 'threads',
  searchClient,
  settings,
  routing,
  middlewares,
  isSubDomainRouting,
}: {
  apiKey: string;
  indexName?: string;
  searchClient: (apiKey: string) => any;
  settings: Settings;
  routing?: any;
  middlewares?: any[];
  isSubDomainRouting: boolean;
}) {
  const [open, setOpen] = useState<boolean>(false);

  async function isSearchOngoing() {
    try {
      const url = new URL(window.location.toString());
      if (url.searchParams.has(`${indexName}[query]`)) {
        setOpen(true);
      }
    } catch (error) {}
  }

  useEffect(() => {
    isSearchOngoing();
  }, []);

  return (
    <div className={styles.container} key={indexName + apiKey}>
      <TextInput
        className={styles.input}
        id="search"
        icon={<FiSearch />}
        placeholder={'Search'}
        type="search"
        {...{
          onFocus: () => {
            setOpen(true);
          },
        }}
      />
      <Modal open={open} close={() => setOpen(false)} size="xl">
        <InstantSearch
          indexName={indexName}
          searchClient={searchClient(apiKey)}
          routing={routing}
        >
          {middlewares?.length && <Middleware middlewares={middlewares} />}
          <div className={styles.searchBar}>
            <SearchBox placeholder="Search" autoFocus />
            <div className={styles.x}>
              <Icon onClick={() => setOpen(false)}>
                <FiX />
              </Icon>
            </div>
          </div>
          <Stats
            classNames={{
              root: styles.stats,
            }}
          />
          <Hits settings={settings} isSubDomainRouting={isSubDomainRouting} />
          <Pagination
            classNames={{
              list: styles.list,
              selectedItem: styles.selected,
              link: styles.link,
            }}
          />
        </InstantSearch>
      </Modal>
    </div>
  );
}

function Middleware({ middlewares }: { middlewares: any[] }) {
  const { addMiddlewares } = useInstantSearch();

  useLayoutEffect(() => {
    return addMiddlewares(...middlewares);
  }, []);

  return null;
}
