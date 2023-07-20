import React, { useCallback } from 'react';
import Header from './Header';
import Toggle from '@/Toggle';
import NativeSelect from '@/NativeSelect';
import Toast from '@/Toast';
import TextField from '@/TextField';
import { SerializedAccount, SerializedChannel } from '@linen/types';
import { FiHash } from '@react-icons/all-files/fi/FiHash';
import debounce from '@linen/utilities/debounce';
import type { ApiClient } from '@linen/api-client';
import styles from './index.module.scss';

interface Props {
  currentCommunity: SerializedAccount;
  channels: SerializedChannel[];
  setChannels: any;
  api: ApiClient;
}

export default function ChannelsView({
  currentCommunity,
  channels,
  setChannels,
  api,
}: Props) {
  const debouncedUpdateChannel = useCallback(
    debounce((channel: SerializedChannel) =>
      api.updateChannel({
        accountId: currentCommunity.id,
        channelId: channel.id,
        channelName: channel.channelName,
        channelDefault: channel.default,
        channelPrivate: channel.type === 'PRIVATE',
        viewType: channel.viewType,
        landing: channel.landing,
        hidden: channel.hidden,
      })
    ),
    [currentCommunity]
  );
  const debouncedReorderChannels = useCallback(
    debounce(api.reorderChannels),
    []
  );

  const onDragStart = (event: React.DragEvent) => {
    const node = event.target as HTMLDivElement;
    if (node) {
      const id = node.getAttribute('data-id');
      if (id) {
        event.dataTransfer.setData('text', id);
        node.classList.add(styles.dragged);
      }
    }
  };

  const onDragEnd = (event: React.DragEvent) => {
    const node = event.target as HTMLDivElement;
    node.classList.remove(styles.dragged);
  };

  function onDragOver(event: React.DragEvent) {
    event.preventDefault();
    return false;
  }

  function onDragEnter(event: React.DragEvent) {
    event.currentTarget.classList.add(styles.drop);
  }

  function onDragLeave(event: React.DragEvent) {
    if (
      event.relatedTarget &&
      event.currentTarget.contains(event.relatedTarget as HTMLDivElement)
    ) {
      return false;
    }
    event.currentTarget.classList.remove(styles.drop);
  }

  const onDrop = (event: React.DragEvent) => {
    const node = event.currentTarget;
    const from = event.dataTransfer.getData('text');
    const to = node.getAttribute('data-id');
    event.currentTarget.classList.remove(styles.drop);
    setChannels((channels: SerializedChannel[]) => {
      const reorderedChannels = reorderChannels(channels, from, to);
      debouncedReorderChannels({
        accountId: currentCommunity.id,
        channels: reorderedChannels.map(({ id, displayOrder }) => {
          return { id, displayOrder };
        }),
      });
      return reorderedChannels;
    });

    setUserChannels(from, to);
  };

  function reorderChannels(
    channels: SerializedChannel[],
    from: string,
    to: string | null
  ): SerializedChannel[] {
    const fromIndex = channels.findIndex((channel) => channel.id === from);
    const toIndex = channels.findIndex((channel) => channel.id === to);
    if (fromIndex >= 0 && toIndex >= 0) {
      const channelFrom = channels[fromIndex];
      const channelTo = channels[toIndex];
      return channels.map((channel, index) => {
        if (channelTo && channel.id === from) {
          return {
            ...channelTo,
            displayOrder: index,
          };
        } else if (channelFrom && channel.id === to) {
          return {
            ...channelFrom,
            displayOrder: index,
          };
        }
        return {
          ...channel,
          displayOrder: index,
        };
      });
    }
    return channels;
  }

  function setUserChannels(from: string, to: string | null) {
    setChannels(reorderChannels(channels, from, to));
  }

  return (
    <div className={styles.wrapper}>
      <Header />
      <div className={styles.content}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Channel Name</th>
              <th>
                Visibility <br />
                <small>Can members access this channel</small>
              </th>
              <th>
                Default
                <br />
                <small>Joined by new members</small>
              </th>
              <th>
                Landing
                <br />
                <small>First channel a new member sees</small>
              </th>
              <th>
                Type
                <br />
                <small>Who can access this channel</small>
              </th>
              <th>
                View Type
                <br />
                <small>How members see this channel</small>
              </th>
            </tr>
          </thead>
          <tbody>
            {channels.map((channel) => (
              <tr
                key={channel.channelName}
                data-id={channel.id}
                draggable
                onDragStart={onDragStart}
                onDragEnter={onDragEnter}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDragEnd={onDragEnd}
                onDrop={onDrop}
              >
                <td>
                  <div className={styles.item}>
                    <FiHash />{' '}
                    <TextField
                      id={`channel-${channel.id}-name}`}
                      defaultValue={channel.channelName}
                      onBlur={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        const channelName = event.target.value;
                        debouncedUpdateChannel({
                          ...channel,
                          channelName,
                        });
                        setChannels((channels: SerializedChannel[]) => {
                          return channels.map((c) => {
                            if (c.id === channel.id) {
                              return {
                                ...c,
                                channelName,
                              };
                            }
                            return c;
                          });
                        });
                      }}
                    />
                  </div>
                </td>
                <td>
                  <Toggle
                    checked={!channel.hidden}
                    onChange={(checked) => {
                      const hidden = !checked;
                      if (hidden && channel.landing) {
                        return Toast.error(
                          'You need to have a landing channel. Select a different landing channel first'
                        );
                      }
                      if (hidden && channel.default) {
                        return Toast.error(
                          'You cannot hide a default channel. Please unset it first.'
                        );
                      }
                      if (hidden) {
                        debouncedUpdateChannel({
                          ...channel,
                          hidden: true,
                          default: false,
                          landing: false,
                        });
                      } else {
                        debouncedUpdateChannel({
                          ...channel,
                          hidden: false,
                        });
                      }

                      setChannels((channels: SerializedChannel[]) => {
                        return channels.map((c: SerializedChannel) => {
                          if (c.id === channel.id) {
                            const hidden = !checked;
                            if (hidden) {
                              return {
                                ...c,
                                default: false,
                                landing: false,
                                hidden,
                              };
                            } else {
                              return {
                                ...c,
                                hidden,
                              };
                            }
                          }
                          return c;
                        });
                      });
                    }}
                  />
                </td>
                <td>
                  <Toggle
                    checked={channel.default}
                    onChange={(checked) => {
                      if (channel.hidden) {
                        return Toast.error(
                          'You need to make the channel visible first. Otherwise noone will be able to see it'
                        );
                      }
                      if (channel.landing) {
                        return Toast.error(
                          'You need to have a landing channel. Select a different landing channel first'
                        );
                      }
                      const hasDefault = channels
                        .filter(({ id }) => id !== channel.id)
                        .find((channel) => channel.default);
                      if (!hasDefault) {
                        Toast.error('You need at least one default channel');
                        return channels;
                      }
                      debouncedUpdateChannel({
                        ...channel,
                        default: checked,
                      });
                      setChannels((channels: SerializedChannel[]) => {
                        const result = channels.map((c: SerializedChannel) => {
                          if (c.id === channel.id) {
                            if (checked) {
                              return {
                                ...c,
                                default: true,
                              };
                            } else {
                              return {
                                ...c,
                                default: false,
                                landing: false,
                              };
                            }
                          }
                          return c;
                        });

                        return result;
                      });
                    }}
                  />
                </td>
                <td>
                  <Toggle
                    checked={channel.landing}
                    onChange={(checked) => {
                      if (channel.hidden) {
                        return Toast.error(
                          'You need to make the channel visible first. Otherwise noone will be able to see it'
                        );
                      }
                      if (!channel.default) {
                        return Toast.error(
                          'You need to set the channel as default first. Otherwise first time users will not see it'
                        );
                      }
                      if (channel.landing && !checked) {
                        return Toast.error(
                          'Please choose a different landing channel.'
                        );
                      }
                      debouncedUpdateChannel({
                        ...channel,
                        landing: checked,
                      });
                      setChannels((channels: SerializedChannel[]) => {
                        return channels.map((c: SerializedChannel) => {
                          if (checked) {
                            if (c.id === channel.id) {
                              return {
                                ...c,
                                landing: true,
                              };
                            }
                            return {
                              ...c,
                              landing: false,
                            };
                          }
                          return c;
                        });
                      });
                    }}
                  />
                </td>
                <td>
                  <NativeSelect
                    id={`channel-${channel.id}-type`}
                    options={[
                      { value: 'PUBLIC', label: 'Public' },
                      { value: 'PRIVATE', label: 'Private' },
                    ]}
                    defaultValue={channel.type || ''}
                    style={{ width: 'auto' }}
                    onChange={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      const type = event.target.value as 'PUBLIC' | 'PRIVATE';
                      debouncedUpdateChannel({
                        ...channel,
                        type,
                      });
                      setChannels((channels: SerializedChannel[]) => {
                        return channels.map((c: SerializedChannel) => {
                          if (c.id === channel.id) {
                            return {
                              ...c,
                              type,
                            };
                          }
                          return c;
                        });
                      });
                    }}
                  />
                </td>
                <td>
                  <NativeSelect
                    id={`channel-${channel.id}-view-type`}
                    options={[
                      { value: 'CHAT', label: 'Chat' },
                      { value: 'FORUM', label: 'Forum' },
                    ]}
                    defaultValue={channel.viewType || ''}
                    style={{ width: 'auto' }}
                    onChange={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      const viewType = event.target.value as 'CHAT' | 'FORUM';
                      debouncedUpdateChannel({
                        ...channel,
                        viewType,
                      });
                      setChannels((channels: SerializedChannel[]) => {
                        return channels.map((c: SerializedChannel) => {
                          if (c.id === channel.id) {
                            return {
                              ...c,
                              viewType,
                            };
                          }
                          return c;
                        });
                      });
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
