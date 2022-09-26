import { useState, useEffect } from 'react';
import { Channel as PhoneixChannel, Socket } from 'phoenix';
import { v4 as uuid } from 'uuid';
import { ThreadState, Roles } from '@prisma/client';
import debounce from 'awesome-debounce-promise';
import Header from './Header';
import { SerializedMessage } from 'serializers/message';
import JoinChannelLink from 'components/Link/JoinChannelLink';
import Row from 'components/Message/Row';
import type { Settings } from 'serializers/account/settings';
import { getThreadUrl } from 'components/Pages/ChannelsPage/utilities/url';
import MessageForm from 'components/MessageForm';
import { isChatEnabled } from 'utilities/featureFlags';
import { Permissions } from 'types/shared';
import { SerializedUser } from 'serializers/user';
import styles from './index.module.css';

const debouncedSendMessage = debounce(
  ({ message, channelId, threadId, imitationId }) => {
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
  100,
  { leading: true }
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
  onThreadUpdate,
  onClose,
  onSend,
  onMount,
}: {
  id: string;
  channelId: string;
  channelName: string;
  messages: SerializedMessage[];
  threadUrl: string | null;
  viewCount: number;
  isSubDomainRouting: boolean;
  settings: Settings;
  incrementId?: number;
  slug?: string;
  title: string | null;
  state: ThreadState;
  permissions: Permissions;
  currentUser?: SerializedUser;
  onThreadUpdate(state: ThreadState): void;
  onClose?(): void;
  onSend?(): void;
  onMount?(): void;
}) {
  const [channel, setChannel] = useState<PhoneixChannel>();
  const [messages, setMessages] =
    useState<SerializedMessage[]>(initialMessages);
  const updateThread = (state: ThreadState) => {
    return fetch(`/api/threads/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        state,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return onThreadUpdate(state);
        }
        throw new Error('Failed to close the thread.');
      })
      .catch((exception) => {
        // TODO better error handling and reporting
        alert(exception.message);
      });
  };
  const threadLink = getThreadUrl({
    incrementId: incrementId!,
    isSubDomainRouting,
    settings,
    slug,
  });

  const elements = messages.map((message, index) => {
    const previousMessage = messages[index - 1];
    const nextMessage = messages[index + 1];
    const isPreviousMessageFromSameUser =
      previousMessage && previousMessage.usersId === message.usersId;
    const isNextMessageFromSameUser =
      nextMessage && nextMessage.usersId === message.usersId;
    return (
      <div
        key={`${message.id}-${index}`}
        className={isNextMessageFromSameUser ? '' : 'pb-4'}
      >
        <Row
          message={message}
          isPreviousMessageFromSameUser={isPreviousMessageFromSameUser}
          communityType={settings.communityType}
          threadLink={threadLink}
        />
      </div>
    );
  });

  useEffect(() => {
    onMount?.();
    if (isChatEnabled) {
      //Set url instead of hard coding
      const socket = new Socket(
        `${process.env.NEXT_PUBLIC_PUSH_SERVICE_URL}/socket`
      );

      socket.connect();
      const channel = socket.channel(`room:lobby:${channelId}`, {});

      setChannel(channel);
      channel
        .join()
        .receive('ok', (resp: any) => {
          console.log('Joined successfully', resp);
        })
        .receive('error', (resp: any) => {
          console.log('Unable to join', resp);
        });
      channel.on('new_msg', (payload) => {
        try {
          if (payload.body.message) {
            setMessages((messages) => {
              const messageId = payload.body.message.id;
              const imitationId = payload.body.imitationId;
              const index = messages.findIndex((t) => t.id === messageId);
              if (index >= 0) {
                return messages;
              }
              return [
                ...messages.filter((message) => message.id !== imitationId),
                payload.body.message,
              ];
            });
          }
        } catch (e) {
          console.log(e);
        }
      });

      return () => {
        socket.disconnect();
      };
    }

    return () => {};
  }, []);
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
      mentions: [],
      attachments: [],
      reactions: [],
      threadId,
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
        role: Roles.MEMBER, // serialize or not?
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
      .then((response) => {
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
        onCloseThread={() => updateThread(ThreadState.CLOSE)}
        onReopenThread={() => updateThread(ThreadState.OPEN)}
        permissions={permissions}
        state={state}
      />
      <div className={styles.thread}>
        <ul>{elements}</ul>

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
      {isChatEnabled && currentUser && permissions.chat && (
        <div className={styles.chat}>
          {state === ThreadState.OPEN ? (
            <MessageForm
              onSend={(message: string) =>
                sendMessage({ message, channelId, threadId: id })
              }
              onSendAndClose={(message: string) => {
                return Promise.all([
                  sendMessage({ message, channelId, threadId: id }),
                  updateThread(ThreadState.CLOSE),
                ]);
              }}
            />
          ) : (
            <MessageForm
              onSend={(message: string) => {
                return Promise.all([
                  sendMessage({ message, channelId, threadId: id }),
                  updateThread(ThreadState.OPEN),
                ]);
              }}
            />
          )}
        </div>
      )}
    </>
  );
}
