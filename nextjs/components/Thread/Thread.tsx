import { useEffect } from 'react';
import { ThreadState } from '@prisma/client';
import Header from './Header';
import Messages from './Messages';
import JoinChannelLink from 'components/Link/JoinChannelLink';
import { SerializedThread } from 'serializers/thread';
import { SerializedUser } from 'serializers/user';
import type { Settings } from 'serializers/account/settings';
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
  currentUser,
  sendMessage,
  updateThread,
  onClose,
  onSend,
  onMount,
  onReaction,
}: {
  thread: SerializedThread;
  channelId: string;
  channelName: string;
  threadUrl?: string | null;
  isSubDomainRouting: boolean;
  settings: Settings;
  permissions: Permissions;
  currentUser: SerializedUser | null;
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
  onReaction?(threadId: string, messageId: string, type: string): void;
}) {
  const { id, title, state, viewCount } = thread;
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
          thread={thread}
          permissions={permissions}
          isSubDomainRouting={isSubDomainRouting}
          currentUser={currentUser}
          settings={settings}
          onReaction={onReaction}
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
