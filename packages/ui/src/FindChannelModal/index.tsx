import React, { useEffect, useState } from 'react';
import { SerializedAccount, SerializedChannel, patterns } from '@linen/types';
import type { ApiClient } from '@linen/api-client';
import H3 from '@/H3';
import Modal from '@/Modal';
import TextInput from '@/TextInput';
import Toast from '@/Toast';
import { FiPlus } from '@react-icons/all-files/fi/FiPlus';
import { FiHash } from '@react-icons/all-files/fi/FiHash';
import { FiX } from '@react-icons/all-files/fi/FiX';
import { FiLogOut } from '@react-icons/all-files/fi/FiLogOut';
import styles from './index.module.scss';

interface Props {
  currentCommunity: SerializedAccount;
  show: boolean;
  close(): void;
  api: ApiClient;
  channels: SerializedChannel[];
  CustomRouterPush({ path }: { path: string }): void;
}

export default function FindChannelModal({
  currentCommunity,
  show,
  close,
  api,
  CustomRouterPush,
  channels: initialChannels,
}: Props) {
  const [query, setQuery] = useState('');
  const visibleChannelIds = initialChannels.map(({ id }) => id);
  const [channels, setChannels] =
    useState<SerializedChannel[]>(initialChannels);

  useEffect(() => {
    let mounted = true;

    setTimeout(() => {
      api
        .getChannels({
          accountId: currentCommunity.id,
        })
        .then(({ channels }: { channels: SerializedChannel[] }) => {
          if (mounted) {
            setChannels(channels);
          }
        });
    }, 200);

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Modal open={show} close={close} position="top">
      <div className={styles.title}>
        <H3>Find a channel</H3>

        <div className={styles.close} onClick={close}>
          <FiX />
        </div>
      </div>
      <TextInput
        autoFocus
        id="channelName"
        required
        placeholder="e.g. javascript"
        pattern={patterns.channelName.source}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setQuery(event.target.value);
        }}
        icon={<FiHash />}
      />
      {channels.length > 0 && (
        <ul>
          {channels
            .filter((channel) => {
              if (query) {
                const name = channel.channelName;
                return name.includes(query);
              }
              return true;
            })
            .sort((channel) =>
              visibleChannelIds.includes(channel.id) ? 1 : -1
            )
            .map((channel) => {
              const { id } = channel;
              return (
                <li className={styles.li}>
                  <div className={styles.flex}>
                    <FiHash /> {channel.channelName}
                  </div>
                  {visibleChannelIds.includes(id) ? (
                    <div
                      className={styles.flex}
                      onClick={() => {
                        api
                          .leaveChannel({
                            accountId: currentCommunity.id,
                            channelId: channel.id,
                          })
                          .then(() => {
                            Toast.success(
                              `Leave #${channel.channelName} successful`
                            );

                            setTimeout(() => {
                              window.location.href =
                                window.location.href.replace(
                                  new RegExp(`/c/${channel.channelName}`, 'g'),
                                  ''
                                );
                            }, 1000);
                          })
                          .catch(() => {
                            Toast.error(
                              'Something went wrong. Please try again.'
                            );
                          });
                      }}
                    >
                      <FiLogOut />
                      <a>Leave</a>
                    </div>
                  ) : (
                    <div
                      className={styles.flex}
                      onClick={() => {
                        // TODO implement the api
                        api
                          .joinChannel({
                            accountId: currentCommunity.id,
                            channelId: channel.id,
                          })
                          .then(() => {
                            Toast.success(
                              `Join #${channel.channelName} successful`
                            );

                            close();
                          })
                          .catch(() => {
                            Toast.error(
                              'Something went wrong. Please try again.'
                            );
                          });
                      }}
                    >
                      <FiPlus />
                      <a>Join</a>
                    </div>
                  )}
                </li>
              );
            })}
        </ul>
      )}
    </Modal>
  );
}
