import Row from '@/Row';
import Thread from '@/Thread';
import { SerializedAccount, SerializedThread, Settings } from '@linen/types';
import styles from './index.module.scss';
import React, { useEffect } from 'react';
import { getThreadUrl } from '@linen/utilities/url';
import Breadcrumb from '@/ThreadView/Content/Breadcrumb';

export function Hits({
  currentCommunity,
  hits,
  setPreview,
  preview,
  settings,
}: {
  currentCommunity: SerializedAccount;
  hits: any[];
  setPreview: React.Dispatch<
    React.SetStateAction<SerializedThread | undefined>
  >;
  preview: SerializedThread | undefined;
  settings: Settings;
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
            isSubDomainRouting: false,
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
                isSubDomainRouting={false}
                settings={settings}
                thread={thread}
                truncate
              />
            </a>
          );
        })}
      </div>
      <div className={styles.view}>
        {preview && (
          <Thread
            api={{ threadIncrementView: () => {} } as any}
            channelId={preview.channelId}
            channelName={preview.channel?.channelName!}
            currentCommunity={currentCommunity}
            currentUser={{} as any}
            fetchMentions={async () => []}
            isSubDomainRouting={false}
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
                isSubDomainRouting={false}
                settings={settings}
              />
            }
          />
        )}
      </div>
    </div>
  );
}
