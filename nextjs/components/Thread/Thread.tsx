import styles from './index.module.css';
import { SerializedMessage } from 'serializers/message';
import JoinChannelLink from 'components/Link/JoinChannelLink';
import Row from 'components/Message/Row';
import { useState, useMemo } from 'react';
import { ThreadState } from '@prisma/client';
import type { Settings } from 'serializers/account/settings';
import { getThreadUrl } from 'components/Pages/ChannelsPage/utilities/url';
import MessageForm from 'components/MessageForm';
import { isFeedEnabled, isChatEnabled } from 'utilities/featureFlags';
import { Permissions } from 'types/shared';
import Button from 'components/Button';
import { toast } from 'components/Toast';

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
  state: initialState,
  title,
  permissions,
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
}) {
  const [state, setState] = useState<ThreadState>(initialState);
  const [messages, setMessages] =
    useState<SerializedMessage[]>(initialMessages);
  const closeThread = () => {
    return fetch(`/api/threads/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        state: ThreadState.CLOSE,
      }),
    })
      .then((response) => {
        if (response.ok) {
          toast.success('Successfully marked the thread as closed.');
          return setState(ThreadState.CLOSE);
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

  const elements = useMemo(() => {
    return messages.map((message, index) => {
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
  }, [messages]);

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
          return [...messages, message];
        });
      });
  };

  return (
    <div className={styles.thread}>
      {title ? <h2 className={styles.title}>{title}</h2> : <></>}
      <ul>{elements}</ul>

      <div className={styles.footer}>
        {threadUrl && (
          <JoinChannelLink
            href={threadUrl}
            communityType={settings.communityType}
          />
        )}
        <div className={styles.count}>
          <span className={styles.subtext}>View count:</span> {viewCount + 1}
        </div>
      </div>
      {/* TODO check if the user has permissions */}
      {state === ThreadState.OPEN && isFeedEnabled && (
        <div className="text-right">
          <Button onClick={closeThread} size="xs" rounded="full">
            Mark thread as Closed
          </Button>
        </div>
      )}
      {isChatEnabled && permissions.chat && (
        <div className="w-full">
          <MessageForm
            onSubmit={(message: string) =>
              sendMessage({ message, channelId, threadId: id })
            }
          />
        </div>
      )}
    </div>
  );
}
