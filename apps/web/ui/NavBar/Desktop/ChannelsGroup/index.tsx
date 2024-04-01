import React, { useState } from 'react';
import classNames from 'classnames';
import Nav from '@/Nav';
import {
  Permissions,
  SerializedAccount,
  SerializedChannel,
  SerializedThread,
  SerializedTopic,
  SerializedUser,
} from '@linen/types';
import { Mode } from '@linen/hooks/mode';
import styles from './index.module.scss';
import NewChannelModal from '@/NewChannelModal';
import FindChannelModal from '@/FindChannelModal';
import type { ApiClient } from '@linen/api-client';
import { FiPlus } from '@react-icons/all-files/fi/FiPlus';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';
import { FiSearch } from '@react-icons/all-files/fi/FiSearch';
import { FiSettings } from '@react-icons/all-files/fi/FiSettings';
import { FiRadio } from '@react-icons/all-files/fi/FiRadio';
import { FiUsers } from '@react-icons/all-files/fi/FiUsers';
import { FiLogOut } from '@react-icons/all-files/fi/FiLogOut';
import { FiEdit } from '@react-icons/all-files/fi/FiEdit';
import RecentTopics from './RecentTopics';
import { ContextMenu, useContextMenu } from '@/ContextMenu';
import ConfirmationModal from '@/ConfirmationModal';
import IntegrationsModalUI from '@/IntegrationsModal';
import MembersModal from '@/MembersModal';
import Toast from '@/Toast';

interface Props {
  channelName?: string;
  channels: SerializedChannel[];
  currentUser: SerializedUser | null;
  currentCommunity: SerializedAccount;
  highlights: string[];
  mode: Mode;
  permissions: Permissions;
  threads?: SerializedThread[];
  topics?: SerializedTopic[];
  onChannelClick(channelId: string): void;
  onSettingsClick(channelId: string): void;
  onTopicClick?(topic: SerializedTopic): void;
  onJoinChannel(channel: SerializedChannel): void;
  onLeaveChannel(channel: SerializedChannel): void;
  onDrop?({
    source,
    target,
    from,
    to,
  }: {
    source: string;
    target: string;
    to: string;
    from: string;
  }): void;
  Link: (args: any) => JSX.Element;
  api: ApiClient;
  CustomRouterPush({ path }: { path: string }): void;
}

enum ModalView {
  NONE,
  MEMBERS,
  INTEGRATIONS,
  HIDE_CHANNEL,
  LEAVE_CHANNEL,
  NEW_CHANNEL,
  FIND_CHANNEL,
}

export default function ChannelsGroup({
  channelName,
  channels,
  currentUser,
  currentCommunity,
  highlights,
  mode,
  threads,
  topics,
  permissions,
  onChannelClick,
  onSettingsClick,
  onTopicClick,
  onDrop,
  onJoinChannel,
  onLeaveChannel,
  Link,
  api,
  CustomRouterPush,
}: Props) {
  const [show, toggle] = useState(true);
  const [modal, setModal] = useState<ModalView>(ModalView.NONE);
  const { clicked, setClicked, points, setPoints, setContext, context } =
    useContextMenu<SerializedChannel>();

  const items: {
    icon: JSX.Element;
    label: string;
    onClick: (context: SerializedChannel) => void;
  }[] = [
    ...(permissions.manage
      ? [
          {
            icon: <FiEdit />,
            label: 'Edit channel',
            onClick: (context: SerializedChannel) =>
              onSettingsClick(context.id),
          },
          {
            icon: <FiRadio />,
            label: 'Integrations',
            onClick: (context: SerializedChannel) => {
              setModal(ModalView.INTEGRATIONS);
            },
          },
          {
            icon: <FiUsers />,
            label: 'Members',
            onClick: (context: SerializedChannel) => {
              setModal(ModalView.MEMBERS);
            },
          },
        ]
      : []),
    ...(permissions.user
      ? [
          // {
          //   icon: <FiEyeOff />,
          //   label: 'Hide channel',
          //   onClick: (context: SerializedChannel) => {
          //     setModal(ModalView.HIDE_CHANNEL);
          //   },
          // },
          {
            icon: <FiLogOut />,
            label: 'Leave channel',
            onClick: (context: SerializedChannel) => {
              setModal(ModalView.LEAVE_CHANNEL);
            },
          },
        ]
      : []),
  ];

  return (
    <>
      <Nav.Group
        onClick={() => {
          toggle((show) => !show);
        }}
      >
        Channels
        <div className={styles.flex}>
          {currentUser && (
            <FiSearch
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setModal(ModalView.FIND_CHANNEL);
              }}
            />
          )}
          {currentUser &&
            !!permissions.channel_create &&
            !!permissions.accountId && (
              <FiPlus
                className={styles.cursorPointer}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setModal(ModalView.NEW_CHANNEL);
                }}
              />
            )}
          {show ? <FiChevronUp /> : <FiChevronDown />}
        </div>
      </Nav.Group>
      {show && (
        <>
          {channels.map((channel: SerializedChannel, index: number) => {
            const count = highlights.reduce((count: number, id: string) => {
              if (id === channel.id) {
                return count + 1;
              }
              return count;
            }, 0);

            function handleDrop(event: React.DragEvent) {
              const id = channel.id;
              const text = event.dataTransfer.getData('text');
              try {
                const data = JSON.parse(text);
                if (data.id === id) {
                  return event.stopPropagation();
                }
                return onDrop?.({
                  source: data.source,
                  target: 'channel',
                  from: data.id,
                  to: id,
                });
              } catch (exception) {
                return false;
              }
            }

            function handleDragEnter(event: React.DragEvent) {
              event.currentTarget.classList.add(styles.drop);
            }

            function handleDragLeave(event: React.DragEvent) {
              if (
                event.relatedTarget &&
                event.currentTarget.contains(
                  event.relatedTarget as HTMLDivElement
                )
              ) {
                return false;
              }
              event.currentTarget.classList.remove(styles.drop);
            }

            const active = channel.channelName === channelName;
            const highlighted = !active && count > 0;

            return (
              <div
                key={
                  topics
                    ? `${channel.channelName}-${index}-${topics.length}`
                    : `${channel.channelName}-${index}`
                }
                onContextMenu={(e: any) => {
                  e.preventDefault();
                  setClicked(true);
                  setPoints({
                    x: e.pageX,
                    y: e.pageY,
                  });
                  setContext(channel);
                }}
              >
                <Link
                  className={classNames(styles.link, {
                    [styles.dropzone]: mode === Mode.Drag,
                  })}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => onChannelClick(channel.id)}
                  href={`/c/${channel.channelName}`}
                >
                  <Nav.Item
                    className={styles.item}
                    active={active}
                    highlighted={highlighted}
                  >
                    <div
                      className={classNames(styles.channel, {
                        [styles.lock]: channel.type === 'PRIVATE',
                        [styles.hash]: channel.type === 'PUBLIC',
                      })}
                    >
                      <span
                        title={channel.channelName}
                        style={{ overflow: 'hidden' }}
                      >
                        {channel.channelName}
                      </span>
                    </div>
                    {currentUser && (
                      <FiSettings
                        className={styles.icon}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          setClicked(true);
                          setPoints({
                            x: event.pageX,
                            y: event.pageY,
                          });
                          setContext(channel);
                        }}
                      />
                    )}
                  </Nav.Item>
                </Link>

                {active &&
                  channel.viewType === 'TOPIC' &&
                  threads &&
                  topics && (
                    <RecentTopics
                      threads={threads}
                      topics={topics}
                      currentUser={currentUser}
                      onTopicClick={onTopicClick}
                    />
                  )}
              </div>
            );
          })}
        </>
      )}
      {currentUser && (
        <>
          {modal === ModalView.FIND_CHANNEL && (
            <FindChannelModal
              show
              currentCommunity={currentCommunity}
              close={() => setModal(ModalView.NONE)}
              CustomRouterPush={CustomRouterPush}
              api={api}
              onJoinChannel={onJoinChannel}
              onLeaveChannel={onLeaveChannel}
              channels={channels}
            />
          )}

          {modal === ModalView.NEW_CHANNEL && (
            <NewChannelModal
              show
              permissions={permissions}
              close={() => setModal(ModalView.NONE)}
              CustomRouterPush={CustomRouterPush}
              api={api}
            />
          )}
        </>
      )}

      {clicked && (
        <ContextMenu
          top={points.y}
          left={points.x}
          items={items}
          context={context}
        />
      )}
      {context && (
        <>
          <IntegrationsModalUI.IntegrationsModal
            permissions={permissions}
            open={modal === ModalView.INTEGRATIONS}
            close={() => setModal(ModalView.NONE)}
            api={api}
            channel={context}
          />
          <MembersModal
            permissions={permissions}
            open={modal === ModalView.MEMBERS}
            close={() => setModal(ModalView.NONE)}
            api={api}
            channel={context}
          />
          <ConfirmationModal
            open={modal === ModalView.HIDE_CHANNEL}
            close={() => setModal(ModalView.NONE)}
            title={`Hide #${context.channelName}`}
            description={`Are you sure you want to hide the #${context.channelName} channel? It won't be available to the members of your community anymore.`}
            onConfirm={() => {
              setModal(ModalView.NONE);

              api
                .hideChannel({
                  accountId: context.accountId!,
                  channelId: context.id,
                })
                .then(() => {
                  Toast.success(`#${context.channelName} is hidden`);

                  setTimeout(() => {
                    window.location.href = window.location.href.replace(
                      new RegExp(`/c/${context.channelName}`, 'g'),
                      ''
                    );
                  }, 1000);
                })
                .catch(() => {
                  Toast.error('Something went wrong. Please try again.');
                });
            }}
          />
          <ConfirmationModal
            open={modal === ModalView.LEAVE_CHANNEL}
            close={() => setModal(ModalView.NONE)}
            title={`Leave #${context.channelName}`}
            description={`Are you sure you want to leave the #${context.channelName} channel?`}
            onConfirm={() => {
              setModal(ModalView.NONE);
              api
                .leaveChannel({
                  accountId: context.accountId!,
                  channelId: context.id,
                })
                .then(() => {
                  Toast.success(`Leave #${context.channelName} successful`);

                  setTimeout(() => {
                    window.location.href = window.location.href.replace(
                      new RegExp(`/c/${context.channelName}`, 'g'),
                      ''
                    );
                  }, 1000);
                })
                .catch(() => {
                  Toast.error('Something went wrong. Please try again.');
                });
            }}
          />
        </>
      )}
    </>
  );
}
