import React, { useCallback } from 'react';
import Header from './Header';
import Label from '@/Label';
import Toggle from '@/Toggle';
import Tooltip from '@/Tooltip';
import NativeSelect from '@/NativeSelect';
import LandingChannelRow from './LandingChannelRow';
import Toast from '@/Toast';
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
                Type
                <br />
                <small>Who can access this channel</small>
              </th>
              <th>
                View Type
                <br />
                <small>How members see this channel</small>
              </th>
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
            </tr>
          </thead>
          <tbody>
            {channels.map((channel) => (
              <tr key={channel.channelName}>
                <td>
                  <div className={styles.item}>
                    <FiHash /> {channel.channelName}
                  </div>
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
                      const type = event.target.value;
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
                      const viewType = event.target.value;
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
                <td>
                  <Toggle
                    checked={!channel.hidden}
                    onChange={(checked) => {
                      setChannels((channels: SerializedChannel[]) => {
                        const result = channels.map((c: SerializedChannel) => {
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

                        const hasDefault = result.find(
                          (channel) => channel.default
                        );

                        if (!hasDefault) {
                          Toast.error(
                            'You need at least one default channel. Select a different default channel first'
                          );
                          return channels;
                        }

                        const hasLanding = result.find(
                          (channel) => channel.landing
                        );

                        if (!hasLanding) {
                          Toast.error(
                            'You need to have a landing channel. Select a different landing channel first'
                          );
                          return channels;
                        }

                        return result;
                      });
                    }}
                  />
                </td>
                <td>
                  {!channel.hidden && (
                    <Toggle
                      checked={channel.default}
                      onChange={(checked) => {
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

                          const hasDefault = result.find(
                            (channel) => channel.default
                          );
                          if (!hasDefault) {
                            Toast.error(
                              'You need at least one default channel'
                            );
                            return channels;
                          }
                          const hasLanding = result.find(
                            (channel) => channel.landing
                          );
                          if (!hasLanding) {
                            Toast.error(
                              'You need to have a landing channel. Select a different landing channel first'
                            );
                            return channels;
                          }
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
                        setChannels((channels: SerializedChannel[]) => {
                          return channels.map((c: SerializedChannel) => {
                            if (c.landing && !checked) {
                              Toast.error(
                                'You need to have a landing channel. Select a different landing channel first'
                              );
                              return c;
                            }
                            if (checked) {
                              if (c.id === channel.id) {
                                if (!c.default) {
                                  Toast.error(
                                    'You need to set the channel as default first. Otherwise first time users will not see'
                                  );
                                  return c;
                                }
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
