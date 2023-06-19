import React, { useEffect, useState } from 'react';
import { SerializedAccount, SerializedChannel, patterns } from '@linen/types';
import type { ApiClient } from '@linen/api-client';
import H3 from '@/H3';
import Modal from '@/Modal';
import TextInput from '@/TextInput';
import Toast from '@/Toast';
import Spinner from '@/Spinner';
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
  onJoinChannel(channel: SerializedChannel): void;
  onLeaveChannel(channel: SerializedChannel): void;
  CustomRouterPush({ path }: { path: string }): void;
}

export default function FindChannelModal({
  currentCommunity,
  show,
  close,
  api,
  channels: initialChannels,
  CustomRouterPush,
  onJoinChannel,
  onLeaveChannel,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [channels, setChannels] = useState<SerializedChannel[]>([]);
  const visibleChannelIds = initialChannels.map(({ id }) => id);

  useEffect(() => {
    let mounted = true;

    setTimeout(() => {
      api
        .getChannels({
          accountId: currentCommunity.id,
        })
        .then((response: any) => {
          if (mounted) {
            setChannels(response.channels);
            setLoading(false);
          }
        })
        .catch(() => {
          if (mounted) {
            setLoading(false);
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
      {loading ? (
        <Spinner className={styles.spinner} />
      ) : (
        <>
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
                .map((channel) => {
                  const { id } = channel;
                  return (
                    <li className={styles.li} key={id}>
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
                                onLeaveChannel(channel);
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
                                onJoinChannel(channel);
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
        </>
      )}
    </Modal>
  );
}
