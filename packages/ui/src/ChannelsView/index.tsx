import React, { useCallback } from 'react';
import Header from './Header';
import Toggle from '@/Toggle';
import NativeSelect from '@/NativeSelect';
import Toast from '@/Toast';
import TextField from '@/TextField';
import { SerializedAccount, SerializedChannel } from '@linen/types';
import { FiHash } from '@react-icons/all-files/fi/FiHash';
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
    (channel: SerializedChannel) =>
      api.updateChannel({
        accountId: currentCommunity.id,
        channelId: channel.id,
        channelName: channel.channelName,
        channelDefault: channel.default,
        channelPrivate: channel.type === 'PRIVATE',
        viewType: channel.viewType,
        landing: channel.landing,
        hidden: channel.hidden,
      }),
    [currentCommunity]
  );

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
              <tr key={channel.channelName}>
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
                  {!channel.hidden && (
                    <Toggle
                      checked={channel.default}
                      onChange={(checked) => {
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
                          const result = channels.map(
                            (c: SerializedChannel) => {
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
                            }
                          );

                          return result;
                        });
                      }}
                    />
                  )}
                </td>
                <td>
                  {!channel.hidden && channel.default && (
                    <Toggle
                      checked={channel.landing}
                      onChange={(checked) => {
                        if (!channel.default) {
                          return Toast.error(
                            'You need to set the channel as default first. Otherwise first time users will not see'
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
                  )}
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
