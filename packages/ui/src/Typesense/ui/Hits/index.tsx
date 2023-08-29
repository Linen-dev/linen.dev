import Row from '@/Row';
import Thread from '@/Thread';
import { SerializedThread, Settings } from '@linen/types';
import styles from './index.module.scss';
import React, { useEffect } from 'react';
import { getThreadUrl } from '@linen/utilities/url';
import Breadcrumb from '@/ThreadView/Content/Breadcrumb';
import classNames from 'classnames';

export function Hits({
  hits,
  setPreview,
  preview,
  settings,
  isSubDomainRouting,
}: {
  hits: any[];
  setPreview: React.Dispatch<
    React.SetStateAction<SerializedThread | undefined>
  >;
  preview: SerializedThread | undefined;
  settings: Settings;
  isSubDomainRouting: boolean;
}) {
  useEffect(() => {
    document
      ?.getElementById('scrollView')
      ?.scroll({ top: 0, behavior: 'smooth' });
  }, [hits]);

  return (
    <div className={styles.container}>
      <div id="scrollView" className={styles.view}>
        {hits.map((hit) => {
          const thread = JSON.parse((hit as any).thread);
          const url = getThreadUrl({
            isSubDomainRouting,
            settings,
            incrementId: thread.incrementId,
            slug: thread.slug,
            LINEN_URL:
              process.env.NODE_ENV === 'development'
                ? 'http://localhost:3000'
                : 'https://www.linen.dev',
          });

          return (
            <a
              onMouseOver={() => {
                setPreview(thread);
              }}
              key={hit.objectID}
              href={url}
            >
              <Row
                currentUser={undefined as any}
                isSubDomainRouting={isSubDomainRouting}
                settings={settings}
                thread={thread}
                truncate
              />
            </a>
          );
        })}
      </div>
      <div className={classNames(styles.view, styles.hideOnMobile)}>
        {preview && (
          <Thread
            api={{ threadIncrementView: () => {} } as any}
            channelId={preview.channelId}
            channelName={preview.channel?.channelName!}
            currentCommunity={{ communityInviteUrl: true } as any}
            currentUser={{} as any}
            fetchMentions={async () => []}
            isSubDomainRouting={isSubDomainRouting}
            onMessage={() => {}}
            permissions={{ chat: false } as any}
            sendMessage={async () => {}}
            settings={settings}
            thread={preview}
            token={null}
            updateThread={() => {}}
            useUsersContext={() => [[], () => {}]}
            expanded
            classContainer={styles.threadContainer}
            breadcrumb={
              <Breadcrumb
                thread={preview}
                isSubDomainRouting={isSubDomainRouting}
                settings={settings}
              />
            }
          />
        )}
      </div>
    </div>
  );
}
