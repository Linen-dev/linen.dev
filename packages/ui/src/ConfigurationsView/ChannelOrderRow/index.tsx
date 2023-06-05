import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import { SerializedAccount, SerializedChannel } from '@linen/types';
import Label from '@/Label';
import styles from './index.module.scss';
import debounce from '@linen/utilities/debounce';
import type { ApiClient } from '@linen/api-client';
import { FiHash } from '@react-icons/all-files/fi/FiHash';

interface Props {
  onChange(channels: SerializedChannel[]): void;
  currentCommunity: SerializedAccount;
  channels: SerializedChannel[];
  api: ApiClient;
}

export default function ChannelOrderRow({
  currentCommunity,
  onChange,
  channels: initialChannels,
  api,
}: Props) {
  const debouncedReorderChannels = useCallback(
    debounce(api.reorderChannels),
    []
  );
  const [channels, setChannels] = useState<SerializedChannel[]>(
    initialChannels.sort((channel) => channel.displayOrder)
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
    setChannels((channels) => {
      const fromIndex = channels.findIndex((channel) => channel.id === from);
      const toIndex = channels.findIndex((channel) => channel.id === to);
      if (fromIndex >= 0 && toIndex >= 0) {
        const channelFrom = channels[fromIndex];
        const channelTo = channels[toIndex];
        const reorderedChannels = channels.map((channel, index) => {
          if (channel.id === from) {
            return {
              ...channelTo,
              displayOrder: index,
            };
          } else if (channel.id === to) {
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

        debouncedReorderChannels({
          accountId: currentCommunity.id,
          channels: reorderedChannels.map(
            ({ channelName, id, displayOrder }) => {
              console.log(channelName);
              return { id, displayOrder };
            }
          ),
        });

        return reorderedChannels;
      }
      return channels;
    });
  };

  return (
    <>
      <Label htmlFor="channels-order">
        Channels order
        <Label.Description>
          Default order of channels for new members.
        </Label.Description>
      </Label>
      <div className={styles.items}>
        {channels.map((channel) => {
          return (
            <div
              className={styles.item}
              data-id={channel.id}
              key={channel.id}
              draggable
              onDragStart={onDragStart}
              onDragEnter={onDragEnter}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDragEnd={onDragEnd}
              onDrop={onDrop}
            >
              <label className={classNames(styles.label)}>
                <FiHash />
                {channel.channelName}
              </label>
            </div>
          );
        })}
      </div>
    </>
  );
}
