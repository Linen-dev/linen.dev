import { useEffect } from 'react';
import { ThreadState } from '@prisma/client';
import Header from './Header';
import Messages from './Messages';
import { SerializedMessage } from 'serializers/message';
import JoinChannelLink from 'components/Link/JoinChannelLink';
import type { Settings } from 'serializers/account/settings';
import { getThreadUrl } from 'components/Pages/ChannelsPage/utilities/url';
import MessageForm from 'components/MessageForm';
import { fetchMentions } from 'components/MessageForm/api';
import { Permissions } from 'types/shared';
import styles from './index.module.css';

export function Thread({
  id,
  channelId,
  channelName,
  messages,
  threadUrl,
  viewCount,
  isSubDomainRouting,
  settings,
  incrementId,
  slug,
  state,
  title,
  permissions,
  sendMessage,
  updateThread,
  onClose,
  onSend,
  onMount,
}: {
  id: string;
  channelId: string;
  channelName: string;
  messages: SerializedMessage[];
  threadUrl?: string | null;
  viewCount: number;
  isSubDomainRouting: boolean;
  settings: Settings;
  incrementId?: number;
  slug?: string | null;
  title: string | null;
  state: ThreadState;
  permissions: Permissions;
  sendMessage({
    message,
    channelId,
    threadId,
  }: {
    message: string;
    channelId: string;
    threadId: string;
  }): Promise<void>;
  updateThread({ state, title }: { state?: ThreadState; title?: string }): void;
  onClose?(): void;
  onSend?(): void;
  onMount?(): void;
}) {
  const threadLink = getThreadUrl({
    incrementId: incrementId!,
    isSubDomainRouting,
    settings,
    slug,
  });

  useEffect(() => {
    onMount?.();
  }, []);

  return (
    <>
      <Header
        title={title}
        channelName={channelName}
        onClose={onClose}
        onCloseThread={() => updateThread({ state: ThreadState.CLOSE })}
        onReopenThread={() => updateThread({ state: ThreadState.OPEN })}
        onSetTitle={(title) => updateThread({ title })}
        permissions={permissions}
        state={state}
      />
      <div className={styles.thread}>
        <Messages
          messages={messages}
          communityType={settings.communityType}
          threadLink={threadLink}
        />

        <div className={styles.footer}>
          <div className={styles.count}>
            <span className={styles.subtext}>View count:</span> {viewCount + 1}
          </div>
          {threadUrl && (
            <JoinChannelLink
              href={threadUrl}
              communityType={settings.communityType}
            />
          )}
        </div>
      </div>
      {permissions.chat && (
        <div className={styles.chat}>
          {state === ThreadState.OPEN ? (
            <MessageForm
              onSend={(message: string) => {
                onSend?.();
                return sendMessage({ message, channelId, threadId: id });
              }}
              onSendAndClose={(message: string) => {
                onSend?.();
                return Promise.all([
                  sendMessage({ message, channelId, threadId: id }),
                  updateThread({ state: ThreadState.CLOSE }),
                ]);
              }}
              fetchMentions={fetchMentions}
            />
          ) : (
            <MessageForm
              onSend={(message: string) => {
                onSend?.();
                return Promise.all([
                  sendMessage({ message, channelId, threadId: id }),
                  updateThread({ state: ThreadState.OPEN }),
                ]);
              }}
              fetchMentions={fetchMentions}
            />
          )}
        </div>
      )}
    </>
  );
}
