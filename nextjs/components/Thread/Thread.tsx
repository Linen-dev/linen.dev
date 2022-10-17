import { useEffect } from 'react';
import { ThreadState } from '@prisma/client';
import Header from './Header';
import Messages from './Messages';
import JoinChannelLink from 'components/Link/JoinChannelLink';
import { SerializedThread } from 'serializers/thread';
import type { Settings } from 'serializers/account/settings';
import { getThreadUrl } from 'components/Pages/ChannelsPage/utilities/url';
import MessageForm from 'components/MessageForm';
import { fetchMentions } from 'components/MessageForm/api';
import { Permissions } from 'types/shared';
import styles from './index.module.css';

export function Thread({
  thread,
  channelId,
  channelName,
  threadUrl,
  isSubDomainRouting,
  settings,
  permissions,
  sendMessage,
  updateThread,
  onClose,
  onSend,
  onMount,
}: {
  thread: SerializedThread;
  channelId: string;
  channelName: string;
  threadUrl?: string | null;
  isSubDomainRouting: boolean;
  settings: Settings;
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
  const { id, messages, incrementId, slug, title, state, viewCount } = thread;
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
          {permissions.manage && state === ThreadState.OPEN ? (
            <MessageForm
              autoFocus
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
              fetchMentions={(term?: string) => {
                if (!term) return Promise.resolve([]);
                return fetchMentions(term, settings.communityId);
              }}
            />
          ) : (
            <MessageForm
              autoFocus
              onSend={(message: string) => {
                onSend?.();
                return Promise.all([
                  sendMessage({ message, channelId, threadId: id }),
                  permissions.manage &&
                    updateThread({ state: ThreadState.OPEN }),
                ]);
              }}
              fetchMentions={(term?: string) => {
                if (!term) return Promise.resolve([]);
                return fetchMentions(term, settings.communityId);
              }}
            />
          )}
        </div>
      )}
    </>
  );
}
