import styles from './index.module.css';
import { SerializedMessage } from 'serializers/message';
import JoinChannelLink from 'components/Link/JoinChannelLink';
import Row from 'components/Message/Row';
import { useState, useEffect } from 'react';
import { ThreadState } from '@prisma/client';
import type { Settings } from 'serializers/account/settings';
import { getThreadUrl } from 'components/Pages/ChannelsPage/utilities/url';
import MessageForm from 'components/MessageForm';
import { isChatEnabled } from 'utilities/featureFlags';
import { Permissions } from 'types/shared';
import { Channel as PhoneixChannel, Socket } from 'phoenix';

export function Thread({
  id,
  channelId,
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
  onThreadUpdate,
}: {
  id: string;
  channelId: string;
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
  onThreadUpdate(state: ThreadState): void;
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
      <Row
        key={`${message.id}-${index}`}
        message={message}
        isPreviousMessageFromSameUser={isPreviousMessageFromSameUser}
        isNextMessageFromSameUser={isNextMessageFromSameUser}
        communityType={settings.communityType}
        threadLink={threadLink}
      />
    );
  });

  useEffect(() => {
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
              const index = messages.findIndex((t) => t.id === messageId);
              if (index >= 0) {
                return messages;
              }
              return [...messages, payload.body.message];
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
    return fetch(`/api/messages/thread`, {
      method: 'POST',
      body: JSON.stringify({
        body: message,
        channelId,
        threadId,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw 'Could not send a message';
      })
      .then((message: SerializedMessage) => {
        setMessages((messages) => {
          const messageId = message.id;
          const index = messages.findIndex((t) => t.id === messageId);
          if (index >= 0) {
            return messages;
          }
          return [...messages, message];
        });
      });
  };

  return (
    <div className={styles.thread}>
      {title ? <h2 className={styles.title}>{title}</h2> : <></>}
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
      {isChatEnabled && permissions.chat && (
        <div className="w-full">
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
    </div>
  );
}
