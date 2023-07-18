import React from 'react';
import Header from './Header';
import Label from '@/Label';
import Toggle from '@/Toggle';
import NativeSelect from '@/NativeSelect';
import LandingChannelRow from './LandingChannelRow';
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
  const key = channels?.map(({ id }) => id).join();
  return (
    <div className={styles.wrapper}>
      <Header />
      <div className={styles.content}>
        <LandingChannelRow
          key={`landing-row-${key}`}
          channels={channels}
          currentCommunity={currentCommunity}
          api={api}
          onChange={(id: string) =>
            setChannels((channels: SerializedChannel[]) => {
              return channels.map((channel: SerializedChannel) => {
                if (channel.id === id) {
                  return { ...channel, landing: true };
                } else {
                  return { ...channel, landing: false };
                }
              });
            })
          }
        />
        <hr className={styles.my3} />
        <Label htmlFor="channels">
          Channels
          <Label.Description>
            Drag and drop channels to define the order, decide which ones are
            shown to new members or hidden to everyone.
          </Label.Description>
        </Label>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Channel Name</th>
              <th>Type</th>
              <th>View Type</th>
              <th>Default</th>
              <th>Visibility</th>
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
                    checked={channel.default}
                    onChange={(checked) => {
                      setChannels((channels: SerializedChannel[]) => {
                        return channels.map((c: SerializedChannel) => {
                          if (c.id === channel.id) {
                            return {
                              ...c,
                              default: checked,
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
                        return channels.map((c: SerializedChannel) => {
                          if (c.id === channel.id) {
                            return {
                              ...c,
                              hidden: !checked,
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
