import { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { ThreadState, Roles, MessageFormat } from '@prisma/client';
import debounce from 'utilities/debounce';
import Header from './Header';
import Messages from './Messages';
import { SerializedMessage } from 'serializers/message';
import JoinChannelLink from 'components/Link/JoinChannelLink';
import type { Settings } from 'serializers/account/settings';
import { getThreadUrl } from 'components/Pages/ChannelsPage/utilities/url';
import MessageForm from 'components/MessageForm';
import { fetchMentions } from 'components/MessageForm/api';
import { Permissions } from 'types/shared';
import { SerializedUser } from 'serializers/user';
import styles from './index.module.css';
import { useUsersContext } from 'contexts/Users';
import useWebsockets from 'hooks/websockets';

const debouncedSendMessage = debounce(
  ({ message, channelId, threadId, imitationId }: any) => {
    return fetch(`/api/messages/thread`, {
      method: 'POST',
      body: JSON.stringify({
        body: message,
        channelId,
        threadId,
        imitationId,
      }),
    });
  },
  100
);

export function Thread({
  id,
  channelId,
  channelName,
  messages: initialMessages,
  threadUrl,
  viewCount,
  isSubDomainRouting,
  settings,
  incrementId,
  slug,
  state,
  title,
  permissions,
  currentUser,
  updateThread,
  onClose,
  onSend,
  onMount,
  token,
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
  currentUser: SerializedUser | null;
  updateThread({ state, title }: { state?: ThreadState; title?: string }): void;
  onClose?(): void;
  onSend?(): void;
  onMount?(): void;
  token: string | null;
}) {
  const [allUsers] = useUsersContext();
  const [messages, setMessages] =
    useState<SerializedMessage[]>(initialMessages);
  const threadLink = getThreadUrl({
    incrementId: incrementId!,
    isSubDomainRouting,
    settings,
    slug,
  });

  useEffect(() => {
    onMount?.();
  }, []);

  useWebsockets({
    room: `room:topic:${id}`,
    token,
    permissions,
    onNewMessage(payload) {
      const currentThreadId = id;
      try {
        if (payload.is_reply && payload.thread_id === currentThreadId) {
          const messageId = payload.message_id;
          const imitationId = payload.imitation_id;
          fetch('/api/messages/' + messageId)
            .then((e) => e.json())
            .then((message) =>
              setMessages((messages) => [
                ...messages.filter(
                  ({ id }) => id !== imitationId && id !== messageId
                ),
                message,
              ])
            );
        }
      } catch (exception) {
        if (process.env.NODE_ENV === 'development') {
          console.log(exception);
        }
      }
    },
  });

  const sendMessage = async ({
    message,
    channelId,
    threadId,
  }: {
    message: string;
    channelId: string;
    threadId: string;
  }) => {
    if (!currentUser) {
      throw 'current user is required';
    }
    const imitation: SerializedMessage = {
      id: uuid(),
      body: message,
      sentAt: new Date().toString(),
      usersId: currentUser.id,
      mentions: allUsers,
      attachments: [],
      reactions: [],
      threadId,
      messageFormat: MessageFormat.LINEN,
      author: {
        id: currentUser.id,
        externalUserId: currentUser.externalUserId,
        displayName: currentUser.displayName,
        profileImageUrl: currentUser.profileImageUrl,
        isBot: false,
        isAdmin: false,
        anonymousAlias: null,
        accountsId: 'fake-account-id',
        authsId: null,
        role: Roles.MEMBER,
      },
    };

    setMessages((messages) => {
      return [...messages, imitation];
    });

    setTimeout(() => {
      onSend?.();
    }, 0);

    return debouncedSendMessage({
      message,
      channelId,
      threadId,
      imitationId: imitation.id,
    })
      .then((response: any) => {
        if (response.ok) {
          return response.json();
        }
        throw 'Could not send a message';
      })
      .then(
        ({
          message,
          imitationId,
        }: {
          message: SerializedMessage;
          imitationId: string;
        }) => {
          setMessages((messages) => {
            const messageId = message.id;
            const index = messages.findIndex((t) => t.id === messageId);
            if (index >= 0) {
              return messages;
            }
            return [
              ...messages.filter((message) => message.id !== imitationId),
              message,
            ];
          });
        }
      );
  };

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
              onSend={(message: string) =>
                sendMessage({ message, channelId, threadId: id })
              }
              onSendAndClose={(message: string) => {
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
